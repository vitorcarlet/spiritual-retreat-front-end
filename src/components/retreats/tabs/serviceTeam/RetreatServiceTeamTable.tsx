/* eslint-disable @typescript-eslint/no-unused-vars */
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
import {
  Box,
  Button,
  Grid,
  ListItemText,
  MenuItem,
  MenuList,
  Pagination,
  Popover,
  Stack,
  Typography,
  Fab,
  Fade,
} from "@mui/material";
import Iconify from "@/src/components/Iconify";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import {
  Items,
  ServiceSpaceTableProps,
  MembersById,
  MemberToContainer,
} from "./types";
import {
  //findContainer,
  onDragEnd,
  onDragOver,
  PLACEHOLDER_ID,
  TRASH_ID,
} from "./shared";
import { LoadingScreen } from "@/src/components/loading-screen";

// export default {
//   title: "Presets/Sortable/Multiple Containers",
// };

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

function findDuplicateValues(values: Array<string | undefined>): string[] {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    if (!value) {
      return;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([value]) => value);
}

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
  total,
  setServiceTeamReorderFlag,
  reorderFlag,
  onSaveReorder,
  retreatId,
  canEditServiceTeam,
}: ServiceSpaceTableProps) {
  //const t = useTranslations();

  // NOVA ESTRUTURA: arrays só de IDs + mapas O(1)

  useEffect(() => {
    if (!retreatId) {
      return;
    }

    let isActive = true;

    return () => {
      isActive = false;
    };
  }, [retreatId]);

  const [stiliesStructure, setServiceTeamStructure] = useState<{
    items: Items;
    membersById: MembersById;
    memberToContainer: MemberToContainer;
    stiliesById: Record<string, { name: string; color: string }>;
  }>({
    items: {},
    membersById: {},
    memberToContainer: {},
    stiliesById: {},
  });

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
        const fid = String(st.id);
        stiliesById[fid] = { name: st.name, color: st.color };
        items[fid] =
          st.members?.map((m) => {
            const mid = String(m.id);
            membersById[mid] = {
              id: mid,
              name: m.name as string,
              gender: m.gender,
              role: m.role,
              //city: m.city,
              //realFamilyId: m.realFamilyId,
            };
            memberToContainer[mid] = fid;
            return mid;
          }) || [];
      });

      setServiceTeamStructure({
        items,
        membersById,
        memberToContainer,
        stiliesById,
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
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  //console.log({ items, containers });
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastOverId = useRef<UniqueIdentifier | null>(null);

  // Snapshot do estado "persistido" (inicial ou último sucesso)
  const [savedSnapshot, setSavedSnapshot] = useState<{
    items: Items;
    memberToContainer: MemberToContainer;
  } | null>(null);

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
  }, [items, onSaveReorder, memberToContainer, savedSnapshot]);

  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer =
    activeId != null ? containers.includes(activeId) : false;

  const handlePopoverOpen = (e: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);
  const handlePageLimitChange = (newPageLimit: number) => {
    onFiltersChange({ pageLimit: newPageLimit });
    handlePopoverClose();
  };
  const open = Boolean(anchorEl);

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

  // Ajuste: onde antes iterava objetos com {id,name}, agora ids
  const columnDefs: ColumnDef<UniqueIdentifier>[] = useMemo(
    () => [
      {
        id: "card",
        cell: (row) => {
          const { original: containerId } = row.cell.row;
          const memberIds = items[containerId] || [];
          const stilyName = stiliesById[containerId] || containerId;
          console.log({ stilyName });
          return (
            <DroppableContainer
              key={containerId}
              id={containerId}
              label={minimal ? undefined : `Família ${stilyName.name}`}
              color={stilyName.color}
              items={memberIds}
              scrollable={scrollable}
              style={containerStyle}
              unstyled={minimal}
              onRemove={() => handleRemove(containerId)}
            >
              <SortableContext items={memberIds} strategy={strategy}>
                {memberIds.map((memberId, index) => {
                  const meta = membersById[memberId];
                  return (
                    <SortableItem
                      disabled={isSortingContainer}
                      key={memberId}
                      id={memberId}
                      value={meta?.name || String(memberId)}
                      index={index}
                      handle={handle}
                      style={getItemStyles}
                      wrapperStyle={wrapperStyle}
                      containerId={containerId}
                      getIndex={getIndex}
                    />
                  );
                })}
              </SortableContext>
              <ContainerButtons
                reorderFlag={reorderFlag || false}
                onEdit={onEdit}
                onView={onView}
                familyId={containerId}
                canEdit={canEditServiceTeam}
              />
            </DroppableContainer>
          );
        },
      },
    ],
    [
      items,
      membersById,
      minimal,
      scrollable,
      containerStyle,
      handle,
      strategy,
      isSortingContainer,
      getItemStyles,
      wrapperStyle,
      onEdit,
      onView,
      canEditServiceTeam,
    ]
  );

  // getIndex agora trabalha só com IDs
  const getIndex = (id: UniqueIdentifier) => {
    const container = memberToContainer[id];
    if (!container) return -1;
    return items[container].indexOf(id);
  };

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
        position: "relative", // For absolute positioned save button
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
        {/* PAGINAÇÃO */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          mt={4}
        >
          <Button
            variant="outlined"
            size="small"
            endIcon={<Iconify icon="solar:alt-arrow-down-linear" />}
            onClick={handlePopoverOpen}
            sx={{ minWidth: 120 }}
          >
            {filters.pageLimit || 8} por página
          </Button>

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <MenuList>
              {[4, 8, 12, 16].map((n) => (
                <MenuItem key={n} onClick={() => handlePageLimitChange(n)}>
                  <ListItemText primary={`${n} por página`} />
                </MenuItem>
              ))}
            </MenuList>
          </Popover>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary" mr={2}>
              {table.getState().pagination.pageIndex + 1}-
              {Math.min(
                table.getState().pagination.pageIndex +
                  table.getState().pagination.pageSize,
                total ?? 0
              )}{" "}
              de {total ?? 0}
            </Typography>
            <Pagination
              count={table.getPageCount()}
              page={table.getState().pagination.pageIndex + 1}
              onChange={(_, page) => onFiltersChange?.({ page: page })}
              color="primary"
            />
          </Box>
        </Stack>

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
        label={`Família ${stilyName}`}
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
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  value: string;
  index: number;
  handle: boolean;
  disabled?: boolean;
  style(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;
  getIndex(id: UniqueIdentifier): number;
  renderItem?(): React.ReactElement;
  wrapperStyle({ index }: { index: number }): React.CSSProperties;
}

function SortableItem({
  disabled,
  id,
  index,
  handle,
  value,
  renderItem,
  style,
  containerId,
  getIndex,
  wrapperStyle,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
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
      // style={style({
      //   index,
      //   value: id,
      //   isDragging,
      //   isSorting,
      //   overIndex: over ? getIndex(over.id) : overIndex,
      //   containerId,
      // })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      //renderItem={renderItem}
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
