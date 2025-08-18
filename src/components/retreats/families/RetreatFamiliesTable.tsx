"use client";
import {
  useEffect,
  useMemo,
  useReducer,
  useState,
  createContext,
  useContext,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Box,
  Typography,
  Button,
  Grid,
  Pagination,
  Stack,
  Popover,
  MenuList,
  MenuItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import Iconify from "../../Iconify";
import { RetreatsCardTableFilters } from "../types";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { dropAnimation } from "./dnd-kit/shared";

interface RetreatsCardTableProps {
  data?: RetreatFamily[];
  total?: number;
  filters: TableDefaultFilters<RetreatsCardTableFilters>;
  onEdit?: (retreat: RetreatFamily) => void;
  onView?: (retreat: RetreatFamily) => void;
  onFiltersChange: (
    filters: TableDefaultFilters<RetreatsCardTableFilters>
  ) => void;
}

export default function RetreatFamiliesTable2({
  data,
  total,
  filters,
  onEdit,
  onView,
  onFiltersChange,
}: RetreatsCardTableProps) {
  interface FamiliesState {
    families: RetreatFamily[];
  }
  type FamiliesAction =
    | { type: "INIT"; payload: RetreatFamily[] }
    | { type: "ADD_FAMILY"; payload: RetreatFamily }
    | { type: "REORDER_FAMILIES"; fromIndex: number; toIndex: number }
    | {
        type: "REORDER_MEMBERS";
        familyId: string | number;
        fromIndex: number;
        toIndex: number;
      }
    | { type: "SET_FAMILIES"; payload: RetreatFamily[] };

  function familiesReducer(
    state: FamiliesState,
    action: FamiliesAction
  ): FamiliesState {
    switch (action.type) {
      case "INIT":
        return { families: action.payload };
      case "ADD_FAMILY":
        return { families: [...state.families, action.payload] };
      case "REORDER_FAMILIES": {
        if (action.fromIndex === action.toIndex) return state;
        return {
          families: arrayMove(state.families, action.fromIndex, action.toIndex),
        };
      }
      case "REORDER_MEMBERS": {
        const { familyId, fromIndex, toIndex } = action;
        if (fromIndex === toIndex) return state;
        return {
          families: state.families.map((family) => {
            if (family.id !== familyId) return family;
            return {
              ...family,
              members: arrayMove(
                family.members || ([] as Participant[]),
                fromIndex,
                toIndex
              ),
            };
          }),
        };
      }
      default:
        return state;
    }
  }
  const [state, dispatch] = useReducer(familiesReducer, {
    families: data ?? [],
  });

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [clonedItems, setClonedItems] = useState<RetreatFamily[] | null>(null);

  useEffect(() => {
    dispatch({ type: "INIT", payload: data ?? [] });
  }, [data]);

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      dispatch({ type: "SET_FAMILIES", payload: clonedItems });
    }

    setActiveId(null);
    setClonedItems(null);
  };

  const getMember = (memberId: UniqueIdentifier) =>
    state.families
      .flatMap((f) => f.members || [])
      .find((m) => m.id === memberId) || ({} as Participant);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handlePopoverOpen = (e: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);
  const handlePageLimitChange = (newPageLimit: number) => {
    onFiltersChange({ pageLimit: newPageLimit });
    handlePopoverClose();
  };
  const open = Boolean(anchorEl);

  const columns: ColumnDef<RetreatFamily>[] = useMemo(
    () => [
      {
        id: "card",
        cell: (row) => {
          const { original: retreat } = row.cell.row;

          // 👉 o conteúdo do card fica igual ao seu
          return (
            <Box
              sx={{
                width: 263,
                borderRadius: "8px",
                borderColor: "divider",
                borderStyle: "solid",
                borderWidth: 2,
                overflow: "hidden",
                cursor: "default",
                position: "relative",
              }}
            >
              <CardDragHandle />
              <Box
                sx={{
                  height: 304,
                  position: "relative",
                  borderColor: "divider",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  backgroundImage: `url(public/images/retreats/retreat-1.jpg)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 0,
                    borderRadius: "8px 8px 0 0",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.55) 5%, rgba(255, 255, 255, 0) 100%)",
                    zIndex: 1,
                  }}
                />
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 2,
                    p: 2,
                    color: "common.white",
                  }}
                >
                  <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 1 }}>
                    {/* <FamiliesMembersDnD
                      family={retreat}
                      onAddMember={retreat.onAddMember}
                      onEditMember={retreat.onEditMember}
                      onRemoveMember={retreat.onRemoveMember}
                      renderMemberExtra={retreat.renderMemberExtra}
                    /> */}
                  </Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    {retreat.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Iconify
                      icon="solar:map-point-bold"
                      sx={{ color: "common.white", mr: 0.5 }}
                    />
                    <Typography variant="body2" color="common.white">
                      {retreat.membersCount}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  pb: 1,
                  borderRadius: "0 0 8px 8px",
                  backgroundColor: "background.paper",
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  size="medium"
                  variant="outlined"
                  sx={{
                    width: 100,
                    backgroundColor: "primary.main",
                    color: "white",
                    borderColor: "primary.main",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                      borderColor: "primary.dark",
                    },
                  }}
                  onClick={() => onView?.(retreat)}
                >
                  <Iconify icon="icomoon-free:plus" />
                </Button>
                <Button
                  sx={{ width: 100 }}
                  size="medium"
                  variant="outlined"
                  onClick={() => onEdit?.(retreat)}
                >
                  <Iconify icon="ic:baseline-mode-edit" />
                </Button>
              </Box>
            </Box>
          );
        },
      },
    ],
    [onEdit, onView]
  );

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    const member = getMember(id);
    return (
      <MemberItem
        value={id}
        style={getItemStyles({
          containerId: findContainer(id) as UniqueIdentifier,
          overIndex: -1,
          index: getIndex(id),
          value: id,
          isSorting: true,
          isDragging: true,
          isDragOverlay: true,
        })}
        color={getColor(id)}
        wrapperStyle={wrapperStyle({ index: 0 })}
        renderItem={renderItem}
        dragOverlay
      />
    );
  }

  function renderContainerDragOverlay(containerId: UniqueIdentifier) {
    return (
      <Container
        label={`Column ${containerId}`}
        columns={columns}
        style={{
          height: "100%",
        }}
        shadow
        unstyled={false}
      >
        {items[containerId].map((item, index) => (
          <Item
            key={item}
            value={item}
            handle={handle}
            style={getItemStyles({
              containerId,
              overIndex: -1,
              index: getIndex(item),
              value: item,
              isDragging: false,
              isSorting: false,
              isDragOverlay: false,
            })}
            color={getColor(item)}
            wrapperStyle={wrapperStyle({ index })}
            renderItem={renderItem}
          />
        ))}
      </Container>
    );
  }

  const page = filters.page || 1; // 1-based
  const pageLimit = filters.pageLimit || 8;
  const totalItems = total ?? state.families.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageLimit));

  const table = useReactTable({
    data: state.families || [],
    columns,
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

  // Sensores (mouse/touch/teclado)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // IDs dos itens na ordem atual (usamos algo estável; idealmente um `retreat.id`)
  const sortableIds = useMemo(
    () => state.families.map((r) => String(r.id)),
    [state.families]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = state.families.findIndex(
      (it) => it.id === Number(active.id)
    );
    const toIndex = state.families.findIndex((it) => it.id === Number(over.id));
    if (fromIndex === -1 || toIndex === -1) return;
    dispatch({ type: "REORDER_FAMILIES", fromIndex, toIndex });
  };

  const [familyMemberIds, setFamilyMemberIds] = useState<
    Record<string | number, UniqueIdentifier[]>
  >({});
  useEffect(() => {
    const map: Record<string | number, UniqueIdentifier[]> = {};
    for (const f of state.families) {
      map[f.id] = (f.members || []).map((m) => m.id as UniqueIdentifier);
    }
    setFamilyMemberIds(map);
  }, [state.families]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {/* GRID DE CARDS + DND */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          pr: 0.5,
          pb: 2,
        }}
      >
        <DndContext
          sensors={sensors}
          onDragStart={({ active }) => {
            setActiveId(active.id);
            setClonedItems(state.families);
          }}
          onDragEnd={handleDragEnd}
          onDragCancel={onDragCancel}
        >
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            <Grid container spacing={3}>
              {table.getRowModel().rows.map((row) => {
                const retreat = row.original as RetreatFamily;
                const id = String(retreat.id ?? row.id);

                return (
                  <SortableGridItem
                    key={id}
                    id={id}
                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    display="flex"
                    justifyContent="center"
                  >
                    <SortableContext
                      items={familyMemberIds[retreat.id] || []}
                      strategy={verticalListSortingStrategy}
                    >
                      {flexRender(
                        row.getVisibleCells()[0].column.columnDef.cell,
                        row.getVisibleCells()[0].getContext()
                      )}
                    </SortableContext>
                  </SortableGridItem>
                );
              })}
              {createPortal(
                <DragOverlay adjustScale={true} dropAnimation={dropAnimation}>
                  {activeId
                    ? familyMemberIds[activeId]
                      ? renderSortableItemDragOverlay(activeId)
                      : renderContainerDragOverlay(activeId)
                    : null}
                </DragOverlay>,
                document.body
              )}
            </Grid>
          </SortableContext>
        </DndContext>
      </Box>

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
              state.families?.length ?? 0
            )}{" "}
            de {state.families?.length ?? 0}
          </Typography>
          <Pagination
            count={table.getPageCount()}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(_, page) => onFiltersChange?.({ page: page })}
            color="primary"
          />
        </Box>
      </Stack>
    </Box>
  );
}

/** ---------- Componente sortável que envolve cada card ---------- */
function SortableGridItem({
  id,
  children,
  ...gridProps
}: {
  id: string | number;
  children: React.ReactNode;
} & React.ComponentProps<typeof Grid>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <DragHandleContext.Provider
      value={{ listeners, setActivatorNodeRef, isDragging }}
    >
      <Grid
        ref={setNodeRef}
        {...gridProps}
        // Mantém atributos de acessibilidade mas remove listeners de pointer do container para o  drag icon
        {...attributes}
        style={{
          ...(gridProps.style as React.CSSProperties),
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.9 : 1,
          zIndex: isDragging ? 2 : "auto",
          touchAction: "none",
          position: "relative",
        }}
      >
        {children}
      </Grid>
    </DragHandleContext.Provider>
  );
}

interface DragHandleContextValue {
  listeners?: {
    onPointerDown?: React.PointerEventHandler;
    onMouseDown?: React.MouseEventHandler;
    onTouchStart?: React.TouchEventHandler;
    onKeyDown?: React.KeyboardEventHandler;
  };
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  isDragging: boolean;
}
const DragHandleContext = createContext<DragHandleContextValue | null>(null);
function CardDragHandle() {
  const ctx = useContext(DragHandleContext);
  if (!ctx) return null;
  return (
    <IconButton
      size="small"
      ref={ctx.setActivatorNodeRef}
      {...ctx.listeners}
      sx={{
        cursor: "grab",
        bgcolor: "background.paper",
        boxShadow: 1,
        "&:hover": { bgcolor: "background.default" },
        "&:active": { cursor: "grabbing" },
        width: 28,
        height: 28,
        position: "absolute",
        top: 4,
        left: 4,
        zIndex: 10,
      }}
    >
      <DragIndicatorIcon fontSize="small" />
    </IconButton>
  );
}
