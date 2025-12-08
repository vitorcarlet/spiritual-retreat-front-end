"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Items,
  RetreatTentsTableProps,
  MembersById,
  MemberToContainer,
} from "./types";
import { onDragEnd, onDragOver, PLACEHOLDER_ID, TRASH_ID } from "./shared";
import { LoadingScreen } from "@/src/components/loading-screen";

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

function cloneItems(source: Items): Items {
  return Object.fromEntries(
    Object.entries(source).map(([k, v]) => [k, [...v]])
  );
}

const genderColorMap: Record<string, string> = {
  Male: "#1976d2",
  Female: "#d81b60",
};

export default function RetreatTentsTable({
  adjustScale = false,
  cancelDrop,
  items: initialItems,
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
  setTentsReorderFlag,
  onSaveReorder,
  canEditTent,
  isEditMode,
}: RetreatTentsTableProps) {
  const t = useTranslations("tents");

  const [items, setItems] = useState<Items>({});
  const [membersById, setMembersById] = useState<MembersById>({});
  const [tentsById, setTentsById] = useState<
    Record<
      string,
      { number: string; category: string; capacity: number; color: string }
    >
  >({});
  const [memberToContainer, setMemberToContainer] = useState<MemberToContainer>(
    {}
  );

  useEffect(() => {
    const buildTentsStructure = () => {
      const nextItems: Items = {};
      const nextMembersById: MembersById = {};
      const nextTentsById: Record<
        string,
        { number: string; category: string; capacity: number; color: string }
      > = {};
      const nextMemberToContainer: MemberToContainer = {};

      initialItems?.forEach((tent) => {
        const tentId = String(tent.tentId);
        //const color = genderColorMap[tent.gender] ?? genderColorMap.male;
        nextTentsById[tentId] = {
          number: tent.number,
          category: tent.category,
          capacity: tent.capacity,
          color: genderColorMap[tent.category] ?? genderColorMap.male,
        };

        nextItems[tentId] =
          tent.members?.map((participant) => {
            const participantId = String(participant.registrationId);
            nextMembersById[participantId] = {
              id: participantId,
              name: participant.name ?? t("unknown-participant"),
              gender: participant.gender,
              city: participant.city,
            };
            nextMemberToContainer[participantId] = tentId;
            return participantId;
          }) ?? [];
      });

      setItems(nextItems);
      setMembersById(nextMembersById);
      setTentsById(nextTentsById);
      setMemberToContainer(nextMemberToContainer);
      setContainers(Object.keys(nextItems) as UniqueIdentifier[]);
      setSavedSnapshot({
        items: cloneItems(nextItems),
        memberToContainer: { ...nextMemberToContainer },
      });
    };

    buildTentsStructure();
  }, [initialItems, t]);

  const [containers, setContainers] = useState<UniqueIdentifier[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const [savedSnapshot, setSavedSnapshot] = useState<{
    items: Items;
    memberToContainer: MemberToContainer;
  } | null>(null);
  const [clonedItems, setClonedItems] = useState<Items | null>(null);

  const canEditTentInMode = canEditTent && isEditMode;

  useEffect(() => {
    if (!isEditMode) {
      setTentsReorderFlag?.(false);
    }
  }, [isEditMode, setTentsReorderFlag]);

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

      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        if (overId === TRASH_ID) {
          return intersections;
        }

        if (overId in items) {
          const containerItems = items[overId];

          if (containerItems.length > 0) {
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

      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items]
  );

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const getIndex = (id: UniqueIdentifier) => {
    const container = memberToContainer[id];
    if (!container) return -1;
    return items[container].indexOf(id);
  };

  const handleSaveReorder = useCallback(async () => {
    if (!onSaveReorder) return;

    try {
      await onSaveReorder(items);
      setSavedSnapshot({
        items: cloneItems(items),
        memberToContainer: { ...memberToContainer },
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving reorder:", error);

      if (savedSnapshot) {
        setItems(cloneItems(savedSnapshot.items));
        setMemberToContainer({ ...savedSnapshot.memberToContainer });
        setContainers(Object.keys(savedSnapshot.items) as UniqueIdentifier[]);
        setHasUnsavedChanges(false);
        setTentsReorderFlag(false);
      }
    }
  }, [
    items,
    onSaveReorder,
    memberToContainer,
    savedSnapshot,
    setTentsReorderFlag,
  ]);

  const onDragCancel = () => {
    if (clonedItems) {
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

  const page = filters.page || 1;
  const pageLimit = filters.pageLimit || 8;
  const totalItems = total ?? Object.keys(items).length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageLimit));

  const columnDefs: ColumnDef<UniqueIdentifier>[] = [
    {
      id: "card",
      cell: (row) => {
        const { original: containerId } = row.cell.row;
        const memberIds = items[containerId] || [];
        const tentMeta = tentsById[containerId];
        const label = tentMeta
          ? t("card-label", { number: tentMeta.number })
          : t("card-label", { number: containerId });

        return (
          <DroppableContainer
            key={containerId}
            id={containerId}
            label={minimal ? undefined : label}
            color={tentMeta?.color}
            items={memberIds}
            scrollable={scrollable}
            style={containerStyle}
            unstyled={minimal}
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
              onEdit={onEdit}
              onView={onView}
              onDelete={onDelete}
              tentId={containerId}
              canEdit={canEditTent}
              disableActions={!canEditTentInMode}
            />
            {tentMeta ? (
              <Stack spacing={0.5} mt={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {t("tent-info", {
                    gender: t(`gender.${tentMeta.category}` as const),
                    capacity: tentMeta.capacity,
                    current: memberIds.length,
                  })}
                </Typography>
              </Stack>
            ) : null}
          </DroppableContainer>
        );
      },
    },
  ];

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
          if (!canEditTentInMode) return;
          setActiveId(active.id);
          setClonedItems(items);
          setTentsReorderFlag?.(true);
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
          setHasUnsavedChanges(true);
        }}
        cancelDrop={cancelDrop}
        onDragCancel={() => {
          if (!canEditTentInMode) return;
          onDragCancel();
          setTentsReorderFlag?.(false);
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
            {filters.pageLimit || 8} {t("per-page")}
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
                  <ListItemText primary={`${n} ${t("per-page")}`} />
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
              {t("of-total", { total: total ?? 0 })}
            </Typography>
            <Pagination
              count={table.getPageCount()}
              page={table.getState().pagination.pageIndex + 1}
              onChange={(_, page) => onFiltersChange?.({ page })}
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

      <Fade in={hasUnsavedChanges}>
        <Fab
          color="primary"
          onClick={handleSaveReorder}
          disabled={!canEditTentInMode}
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
        wrapperStyle={wrapperStyle({ index: 0 })}
        dragOverlay
      >
        <MoreMenu />
      </Item>
    );
  }

  function renderContainerDragOverlay(containerId: UniqueIdentifier) {
    const memberIds = items[containerId] || [];
    const tentMeta = tentsById[containerId];
    const label = tentMeta
      ? t("card-label", { number: tentMeta.number })
      : t("card-label", { number: containerId });

    return (
      <Container
        label={label}
        columns={memberIds.length}
        style={{ height: "100%" }}
        shadow
        unstyled={false}
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
              wrapperStyle={wrapperStyle({ index })}
            />
          );
        })}
        <ContainerButtons
          onEdit={onEdit}
          onView={onView}
          tentId={containerId}
          canEdit={canEditTent}
          onDelete={onDelete}
          disableActions={!canEditTentInMode}
        />
      </Container>
    );
  }

  function getNextContainerId() {
    const containerIds = Object.keys(items);
    const lastContainerId = containerIds[containerIds.length - 1];

    return `${lastContainerId}-new`;
  }
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
  wrapperStyle({ index }: { index: number }): React.CSSProperties;
}

function SortableItem({
  disabled,
  id,
  index,
  handle,
  value,
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
  const computedStyle = style({
    index,
    value: id,
    isDragging,
    isSorting,
    overIndex: over ? getIndex(over.id) : overIndex,
    containerId,
    isDragOverlay: false,
  });
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
      style={computedStyle}
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
