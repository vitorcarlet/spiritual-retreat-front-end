"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  DndContext,
  DragOverlay,
  DropAnimation,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  UniqueIdentifier,
  useSensors,
  useSensor,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  AnimateLayoutChanges,
  SortableContext,
  useSortable,
  defaultAnimateLayoutChanges,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Container,
  ContainerProps,
  Item,
} from "@/src/components/dnd-kit/components";
import { coordinateGetter as multipleContainersCoordinateGetter } from "@/src/components/dnd-kit/multipleContainersKeyboardCoordinates";
import ContainerButtons from "./ContainerButtons";
import MoreMenu from "./MoreMenu";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  CellContext,
} from "@tanstack/react-table";
import { Box, Grid, Fab, Fade } from "@mui/material";
import Iconify from "@/src/components/Iconify";
import {
  Items,
  ServiceSpaceTableProps,
  MembersById,
  MemberToContainer,
} from "./types";
import { onDragEnd, onDragOver, PLACEHOLDER_ID, TRASH_ID } from "./shared";
import { LoadingScreen } from "@/src/components/loading-screen";
import { useServiceTeamValidation } from "./hooks/useRulesValidations";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  color,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  style?: React.CSSProperties;
}) {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: "container",
      children: items,
    },
    animateLayoutChanges,
  });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== "container") ||
      items.includes(over.id)
    : false;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      color={color}
      {...props}
    >
      {children}
    </Container>
  );
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

// Helper para clonar Items profundamente (arrays por container)
function cloneItems(source: Items): Items {
  return Object.fromEntries(
    Object.entries(source).map(([k, v]) => [k, [...v]])
  );
}

export default function RetreatServiceTeamTable({
  adjustScale = false,
  cancelDrop,
  items: InitialItems,
  handle = true,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
  scrollable,
  onFiltersChange,
  filters,
  onView,
  onEdit,
  onDelete,
  total,
  setServiceTeamReorderFlag,
  reorderFlag,
  onSaveReorder,
  canEditServiceTeam,
}: ServiceSpaceTableProps) {
  const t = useTranslations("service-team");

  const [items, setItems] = useState<Items>({});
  const [membersById, setMembersById] = useState<MembersById>({});
  const [stiliesById, setServiceTeamById] = useState<
    Record<string, { name: string; color: string }>
  >({});
  const [memberToContainer, setMemberToContainer] = useState<MemberToContainer>(
    {}
  );

  useEffect(() => {
    const buildServiceTeamStructure = () => {
      const items: Items = {};
      const membersById: MembersById = {};
      const stiliesById: Record<string, { name: string; color: string }> = {};
      const memberToContainer: MemberToContainer = {};

      InitialItems?.forEach((st) => {
        const fid = String(st.spaceId);
        stiliesById[fid] = { name: st.name, color: st.color };
        items[fid] =
          st.members?.map((m) => {
            const mid = String(m.registrationId);
            membersById[mid] = {
              registrationId: mid,
              name: m.name as string,
              gender: m.gender,
              role: m.role,
            };
            memberToContainer[mid] = fid;
            return mid;
          }) || [];
      });

      setItems(items);
      setMembersById(membersById);
      setServiceTeamById(stiliesById);
      setMemberToContainer(memberToContainer);
      setContainers(Object.keys(items) as UniqueIdentifier[]);

      // Salva snapshot inicial (clonado)
      setSavedSnapshot({
        items: cloneItems(items),
        memberToContainer: { ...memberToContainer },
      });
    };
    buildServiceTeamStructure();
  }, [InitialItems]);

  const [containers, setContainers] = useState<UniqueIdentifier[]>([]);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastOverId = useRef<UniqueIdentifier | null>(null);

  // Snapshot do estado "persistido" (inicial ou último sucesso)
  const [savedSnapshot, setSavedSnapshot] = useState<{
    items: Items;
    memberToContainer: MemberToContainer;
  } | null>(null);

  const validation = useServiceTeamValidation(InitialItems, membersById);

  const handleSaveReorder = useCallback(async () => {
    if (!onSaveReorder) return;

    try {
      await onSaveReorder(items);
      // Atualiza snapshot para o estado recém-salvo
      setSavedSnapshot({
        items: cloneItems(items),
        memberToContainer: { ...memberToContainer },
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving reorder:", error);

      // Reverte para o snapshot salvo (inicial ou último sucesso)
      if (savedSnapshot) {
        setItems(cloneItems(savedSnapshot.items));
        setMemberToContainer({ ...savedSnapshot.memberToContainer });
        setContainers(Object.keys(savedSnapshot.items) as UniqueIdentifier[]);
        setHasUnsavedChanges(false);
        setServiceTeamReorderFlag(false);
      }
    }
  }, [
    items,
    onSaveReorder,
    memberToContainer,
    savedSnapshot,
    setServiceTeamReorderFlag,
  ]);

  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer =
    activeId != null ? containers.includes(activeId) : false;

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        if (overId === TRASH_ID) {
          // If the intersecting droppable is the trash, return early
          // Remove this if you're not using trashable functionality in your app
          return intersections;
        }

        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.indexOf(container.id) !== -1
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items]
  );
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  // getIndex agora trabalha só com IDs
  const getIndex = useCallback(
    (id: UniqueIdentifier) => {
      const container = memberToContainer[id];
      if (!container) return -1;
      return items[container].indexOf(id);
    },
    [items, memberToContainer]
  );

  // Ajuste: onde antes iterava objetos com {id,name}, agora ids
  const handleDeleteDefault = useCallback(() => {
    console.warn("Delete not implemented");
  }, []);

  const columnDefs: ColumnDef<UniqueIdentifier>[] = useMemo(
    () => [
      {
        id: "card",
        cell: (row) => {
          const { original: containerId } = row.cell.row;
          const memberIds = items[containerId] || [];
          const stilyName = stiliesById[containerId] || containerId;

          // Encontrar erro de validação para este container
          const validationError = validation.errors.find(
            (e) => e.spaceId === String(containerId)
          );

          return (
            <DroppableContainer
              key={containerId}
              id={containerId}
              label={
                minimal
                  ? undefined
                  : t("team-label", {
                      defaultMessage: "Service team {name}",
                      name: stilyName.name,
                    })
              }
              color={stilyName.color}
              items={memberIds}
              scrollable={scrollable}
              style={containerStyle}
              unstyled={minimal}
              onRemove={() => handleRemove(containerId)}
            >
              <SortableContext items={memberIds} strategy={strategy}>
                {memberIds.length > 0 ? (
                  memberIds.map((memberId, index) => {
                    const meta = membersById[memberId];
                    return (
                      <SortableItem
                        disabled={isSortingContainer}
                        key={memberId}
                        id={memberId}
                        value={meta?.name || String(memberId)}
                        index={index}
                        handle={handle}
                        wrapperStyle={wrapperStyle}
                      />
                    );
                  })
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      textAlign: "center",
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >
                    {t("no-members", {
                      defaultMessage: "No members assigned",
                    })}
                  </Box>
                )}
              </SortableContext>
              <ContainerButtons
                reorderFlag={reorderFlag || false}
                onEdit={onEdit}
                onView={onView}
                onDelete={onDelete || handleDeleteDefault}
                familyId={containerId}
                canEdit={canEditServiceTeam}
                validationError={validationError}
              />
            </DroppableContainer>
          );
        },
      },
    ],
    [
      items,
      stiliesById,
      validation.errors,
      minimal,
      t,
      scrollable,
      containerStyle,
      strategy,
      reorderFlag,
      onEdit,
      onView,
      onDelete,
      handleDeleteDefault,
      canEditServiceTeam,
      membersById,
      isSortingContainer,
      handle,
      wrapperStyle,
    ]
  );

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  const page = filters.page || 1; // 1-based
  const pageLimit = filters.pageLimit || 8;
  const totalItems = total ?? items.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageLimit));

  const table = useReactTable({
    data: containers || [],
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: pageLimit,
      },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({
              pageIndex: page - 1,
              pageSize: pageLimit,
            })
          : updater;

      onFiltersChange({
        ...filters,
        page: next.pageIndex + 1,
        pageLimit: next.pageSize,
      });
    },
  });

  if (Object.keys(items).length === 0) return <LoadingScreen />;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        position: "relative",
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={({ active }) => {
          setActiveId(active.id);
          setClonedItems(items);
          // Set reorder flag to true when drag starts
          setServiceTeamReorderFlag?.(true);
        }}
        onDragOver={({ active, over }) =>
          onDragOver({
            active,
            over,
            items,
            setItems,
            recentlyMovedToNewContainer,
            memberToContainer,
            setMemberToContainer,
          })
        }
        onDragEnd={({ active, over }) => {
          onDragEnd({
            active,
            over,
            items,
            activeId,
            setItems,
            setActiveId,
            setContainers,
            getNextContainerId,
            memberToContainer,
            setMemberToContainer,
          });
          // Mark changes as unsaved and reset reorder flag
          setHasUnsavedChanges(true);
        }}
        cancelDrop={cancelDrop}
        onDragCancel={() => {
          onDragCancel();
          // Reset reorder flag when drag is cancelled
          setServiceTeamReorderFlag?.(false);
        }}
        modifiers={modifiers}
      >
        <SortableContext
          items={[...containers, PLACEHOLDER_ID]}
          strategy={
            vertical
              ? verticalListSortingStrategy
              : horizontalListSortingStrategy
          }
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              pr: 0.5,
              pb: 2,
            }}
          >
            <Grid container spacing={2}>
              {containers.map((containerId) => (
                <Grid key={containerId} size={{ xs: 12, md: 6, lg: 4 }}>
                  {flexRender(table.getAllColumns()[0].columnDef.cell!, {
                    row: { original: containerId },
                    cell: { row: { original: containerId } },
                  } as CellContext<UniqueIdentifier, unknown>)}
                </Grid>
              ))}
            </Grid>
          </Box>
        </SortableContext>

        {createPortal(
          <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
            {activeId
              ? containers.includes(activeId)
                ? renderContainerDragOverlay(activeId)
                : renderSortableItemDragOverlay(activeId)
              : null}
          </DragOverlay>,
          document.body
        )}
        {trashable && activeId && !containers.includes(activeId) ? (
          <Trash id={TRASH_ID} />
        ) : null}
      </DndContext>

      {/* Floating Save Button */}
      <Fade in={hasUnsavedChanges}>
        <Fab
          color="primary"
          onClick={handleSaveReorder}
          sx={{
            position: "absolute",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
          title={t("save-reorder", { defaultMessage: "Save reorder" })}
        >
          <Iconify icon="solar:diskette-bold" />
        </Fab>
      </Fade>
    </Box>
  );

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    const meta = membersById[id];
    return (
      <Item
        value={meta?.name || String(id)}
        handle={handle}
        style={getItemStyles({
          containerId: memberToContainer[id],
          overIndex: -1,
          index: getIndex(id),
          value: meta?.name,
          isSorting: true,
          isDragging: true,
          isDragOverlay: true,
        })}
        color={getColor(id)}
        wrapperStyle={wrapperStyle({ index: 0 })}
        dragOverlay
      >
        <MoreMenu />
      </Item>
    );
  }

  function renderContainerDragOverlay(containerId: UniqueIdentifier) {
    const memberIds = items[containerId] || [];
    const stilyName = stiliesById[containerId] || containerId;
    return (
      <Container
        label={t("team-label", {
          defaultMessage: "Service team {name}",
          name: stilyName.name,
        })}
        columns={memberIds.length}
        style={{ height: "100%" }}
        shadow
        unstyled={false}
        sx={{}}
      >
        {memberIds.map((memberId, index) => {
          const meta = membersById[memberId];
          return (
            <Item
              key={memberId}
              value={meta?.name || String(memberId)}
              handle={handle}
              style={getItemStyles({
                containerId,
                overIndex: -1,
                index: getIndex(memberId),
                value: meta?.name,
                isDragging: false,
                isSorting: false,
                isDragOverlay: false,
              })}
              color={getColor(memberId)}
              wrapperStyle={wrapperStyle({ index })}
            />
          );
        })}
        <ContainerButtons
          onEdit={onEdit}
          onView={onView}
          familyId={containerId}
          canEdit={canEditServiceTeam}
          reorderFlag={reorderFlag || false}
          onDelete={onDelete || handleDeleteDefault}
        />
      </Container>
    );
  }

  function handleRemove(containerID: UniqueIdentifier) {
    setContainers((containers) =>
      containers.filter((id) => id !== containerID)
    );
  }

  function getNextContainerId() {
    const containerIds = Object.keys(items);
    const lastContainerId = containerIds[containerIds.length - 1];

    return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
  }
}

function getColor(id: UniqueIdentifier) {
  switch (String(id)[0]) {
    case "A":
      return "#7193f1";
    case "B":
      return "#ffda6c";
    case "C":
      return "#00bcd4";
    case "D":
      return "#ef769f";
  }

  return undefined;
}

function Trash({ id }: { id: UniqueIdentifier }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        left: "50%",
        marginLeft: -150,
        bottom: 20,
        width: 300,
        height: 60,
        borderRadius: 5,
        border: "1px solid",
        borderColor: isOver ? "red" : "#DDD",
      }}
    >
      Drop here to delete
    </div>
  );
}

interface SortableItemProps {
  id: UniqueIdentifier;
  value: string;
  index: number;
  handle: boolean;
  disabled?: boolean;
  wrapperStyle({ index }: { index: number }): React.CSSProperties;
}

function SortableItem({
  disabled,
  id,
  index,
  handle,
  value,
  wrapperStyle,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;
  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      value={value}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      index={index}
      wrapperStyle={wrapperStyle({ index })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
    />
  );
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
