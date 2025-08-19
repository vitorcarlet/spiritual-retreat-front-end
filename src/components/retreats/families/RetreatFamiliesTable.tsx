"use client";
import {
  useEffect,
  useMemo,
  useReducer,
  useState,
  createContext,
  useContext,
  useRef,
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
  Paper,
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
  DragOverEvent, // <--- add
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
import { FamilyMembersDnDColumn, MemberItem } from "./FamiliesMembersDnD";

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
    | {
        type: "MOVE_MEMBER";
        memberId: number | string;
        fromFamilyId: number | string;
        toFamilyId: number | string;
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
      case "MOVE_MEMBER": {
        const { memberId, fromFamilyId, toFamilyId, toIndex } = action;
        if (fromFamilyId === toFamilyId) return state;
        let moving: Participant | undefined;
        const updated = state.families.map((f) => {
          if (f.id === fromFamilyId) {
            const members = (f.members || []).filter((m) => {
              if (m.id === memberId) {
                moving = m;
                return false;
              }
              return true;
            });
            return { ...f, members };
          }
          return f;
        });
        if (!moving) return state;
        return {
          families: updated.map((f) => {
            if (f.id === toFamilyId) {
              const members = [...(f.members || [])];
              const safeIndex = Math.min(Math.max(0, toIndex), members.length);
              members.splice(safeIndex, 0, moving!);
              return { ...f, members };
            }
            return f;
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
  const lastOverId = useRef<UniqueIdentifier | null>(null); // <--- add
  const recentlyMovedToNewFamily = useRef(false); // <--- add

  // --- helper para obter lista de ids de famílias (string) ---
  const familyIdSet = useMemo(
    () => new Set(state.families.map((f) => String(f.id))),
    [state.families]
  );

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

  const isSortingContainer =
    activeId != null ? state.families[activeId as number] : null;

  const getMember = (memberId: UniqueIdentifier) => {
    console.log(memberId);
    for (const family of state.families) {
      const members = family.members || [];
      const index = members.findIndex((m) => m.id === Number(memberId));
      if (index !== -1) {
        return { memberId, index, member: members[index], familyId: family.id };
      }
    }
    return { memberId, index: -1, member: undefined };
  };

  const getItemStyles = ({
    index,
    overIndex,
    isDragging,
    containerId,
    isDragOverlay,
  }: {
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: number | UniqueIdentifier;
    isDragOverlay: boolean;
  }) => {
    console.log(containerId, " containerId", state.families);
    //const deck = state.families.find((f) => f.id === Number(containerId));
    return {
      zIndex: isDragOverlay ? undefined : isDragging ? 10 : 9,
    };
  };

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
                    <FamilyMembersDnDColumn
                      family={retreat}
                      disabled={isSortingContainer?.id === retreat.id}
                      key={retreat.id}
                      //id={retreat.id as UniqueIdentifier}
                      //index={index}
                      //handle={handle}
                      //style={getItemStyles}
                      //wrapperStyle={wrapperStyle}
                      //renderItem={renderItem}
                      //containerId={containerId}
                      //getIndex={getIndex}
                    />
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

  // ---------- NOVO: animação (reordenação otimista) enquanto arrasta membros ----------
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Se ativo ou alvo for família (container) ignorar aqui (famílias só ordenam no dragEnd)
    const activeIsFamily = familyIdSet.has(String(active.id));
    const overIsFamily = familyIdSet.has(String(over.id));
    if (activeIsFamily) return; // arrastando família: não fazer nada aqui

    const activeMemberPos = findMember(active.id);
    if (!activeMemberPos) return;

    // Identificar destino
    let targetFamilyId: string | number | null = null;
    let targetIndex: number | null = null;

    if (!overIsFamily) {
      // over é outro membro
      const overMemberPos = findMember(over.id);
      if (overMemberPos) {
        targetFamilyId = overMemberPos.familyId;

        // Calcular se cursor está abaixo da metade para inserir depois
        let insertIndex = overMemberPos.index;
        if (event.over?.rect && event.active.rect.current?.translated) {
          const activeTop = event.active.rect.current.translated.top;
          const overMiddle = event.over.rect.top + event.over.rect.height / 2;
          if (activeTop > overMiddle) {
            insertIndex = overMemberPos.index + 1;
          }
        }
        targetIndex = insertIndex;
      }
    } else {
      // over é família (área vazia)
      const fam = state.families.find((f) => String(f.id) === String(over.id));
      if (fam) {
        targetFamilyId = fam.id;
        targetIndex = (fam.members || []).length;
      }
    }

    if (targetFamilyId == null || targetIndex == null) return;

    // Mesmo family: reorder otimista
    if (targetFamilyId === activeMemberPos.familyId) {
      if (
        activeMemberPos.index === targetIndex ||
        activeMemberPos.index + 1 === targetIndex
      ) {
        // Nada a mudar (ou caso de inserir depois dele mesmo)
        return;
      }
      dispatch({
        type: "REORDER_MEMBERS",
        familyId: targetFamilyId,
        fromIndex: activeMemberPos.index,
        toIndex:
          targetIndex > activeMemberPos.index ? targetIndex - 1 : targetIndex,
      });
      return;
    }

    // Outra família: mover otimista
    recentlyMovedToNewFamily.current = true;
    dispatch({
      type: "MOVE_MEMBER",
      memberId: Number(active.id),
      fromFamilyId: activeMemberPos.familyId,
      toFamilyId: targetFamilyId,
      toIndex: targetIndex,
    });
  };

  // ---------- Ajuste do overlay de membro (visual consistente) ----------
  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    const { member } = getMember(id);
    if (!member) return null;
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 240,
          pointerEvents: "none",
        }}
      >
        <Box
          component={Paper}
          elevation={6}
          sx={{
            p: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderRadius: 1,
            bgcolor: "background.paper",
            opacity: 0.95,
          }}
        >
          <DragIndicatorIcon
            fontSize="small"
            sx={{ color: "text.secondary" }}
          />
          <MemberItem member={member} />
        </Box>
      </Box>
    );
  }

  // ---------- Overlay de container permanece igual (caso queira, pode estilizar mais) ----------
  function renderContainerDragOverlay(containerId: UniqueIdentifier) {
    const family = state.families.find(
      (f) => String(f.id) === String(containerId)
    );
    if (!family) return null;
    return (
      <Box
        sx={{
          width: 263,
          borderRadius: 2,
          border: "2px solid",
          borderColor: "primary.main",
          overflow: "hidden",
          boxShadow: 6,
          opacity: 0.9,
          cursor: "grabbing",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            height: 140,
            background:
              "linear-gradient(135deg,#1976d2 0%, #42a5f5 70%, #90caf9 100%)",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-end",
              p: 1.5,
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="common.white"
              noWrap
            >
              {family.name}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}
        >
          <Typography variant="caption" color="text.secondary">
            Membros: {family.members?.length ?? 0}
          </Typography>
        </Box>
      </Box>
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

  // Helper: localizar família e índice do membro
  function findMember(memberId: UniqueIdentifier): {
    familyId: number | string;
    index: number;
  } | null {
    for (const fam of state.families) {
      const members = fam.members || [];
      const idx = members.findIndex((m) => Number(m.id) === Number(memberId));
      if (idx !== -1) {
        return { familyId: fam.id, index: idx };
      }
    }
    return null;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    // 1. Tentar tratar como reorder de famílias
    const fromFamilyIndex = state.families.findIndex(
      (it) => it.id === Number(activeId)
    );
    const toFamilyIndex = state.families.findIndex(
      (it) => it.id === Number(overId)
    );

    const activeIsFamily = fromFamilyIndex !== -1;
    const overIsFamily = toFamilyIndex !== -1;

    if (activeIsFamily && overIsFamily) {
      if (fromFamilyIndex !== toFamilyIndex) {
        dispatch({
          type: "REORDER_FAMILIES",
          fromIndex: fromFamilyIndex,
          toIndex: toFamilyIndex,
        });
      }
      setActiveId(null);
      return;
    }

    // 2. Tratar como membros (active e over são membros ou over é família vazia)
    const activeMemberPos = findMember(activeId);
    if (!activeMemberPos) {
      setActiveId(null);
      return;
    }

    // Se over é família vazia (sem membros) ou card da família
    const overMemberPos = findMember(overId);

    // Se over não é membro, mas é uma família => drop no fim da família
    let dropFamilyId: string | number;
    let dropIndex: number;
    if (!overMemberPos) {
      // tentar identificar se é família
      const overFam = state.families.find((f) => f.id === Number(overId));
      if (!overFam) {
        setActiveId(null);
        return;
      }
      dropFamilyId = overFam.id;
      dropIndex = (overFam.members || []).length; // adiciona ao final
    } else {
      dropFamilyId = overMemberPos.familyId;
      dropIndex = overMemberPos.index;
    }

    // Mesmo container -> REORDER_MEMBERS
    if (dropFamilyId === activeMemberPos.familyId) {
      if (activeMemberPos.index !== dropIndex) {
        dispatch({
          type: "REORDER_MEMBERS",
          familyId: dropFamilyId,
          fromIndex: activeMemberPos.index,
          toIndex: dropIndex,
        });
      }
      setActiveId(null);
      return;
    }

    // Container diferente -> MOVE_MEMBER
    dispatch({
      type: "MOVE_MEMBER",
      memberId: Number(activeId),
      fromFamilyId: activeMemberPos.familyId,
      toFamilyId: dropFamilyId,
      toIndex: dropIndex,
    });

    setActiveId(null);
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
            lastOverId.current = null;
            recentlyMovedToNewFamily.current = false;
          }}
          onDragOver={handleDragOver} // <--- adiciona animação de empurrar
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
                <DragOverlay adjustScale dropAnimation={dropAnimation}>
                  {activeId
                    ? familyIdSet.has(String(activeId))
                      ? renderContainerDragOverlay(activeId)
                      : renderSortableItemDragOverlay(activeId)
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

//GitHub Copilot Sugestões práticas (impacto maior primeiro):

// Evitar dispatch em cada onDragOver
// Hoje cada movimento dispara REORDER/MOVE e recria todo o array.
// Use um ref (optimisticRef) para mutar só a estrutura leve (arrays de ids) durante o drag e faça 1 dispatch final no onDragEnd.
// Enquanto arrasta, derive a UI dessas estruturas em ref (sem setState). Isso reduz re-render frenético.
// Normalizar estado
// Armazene: familiesOrder: string[]; familiesById: Record<id, {id,name, members: string[]}>; membersById: Record<memberId, Participant>.
// Reordenar = trocar posições em familiesOrder ou arrays de ids (O(1) / splice) sem copiar objetos grandes.
// Índice direto (lookup O(1))
// Mantenha memberPosMap: Record<memberId, { familyId: string|number; index: number }> atualizado somente quando a ordem muda (dragEnd).
// Elimina loops findMember.
// Componentização + memo
// Extraia <FamilyCard/> e use React.memo com props mínimos (id, membersIds).
// Dentro, renderize membros usando membersIds.map(id => membersById[id]) evitando re-render de todas as famílias quando só uma muda.
// Estabilizar arrays para SortableContext
// Passe sempre a mesma referência se nada mudou (useMemo por family.membersIds).
// Com ref + derivação you can skip SortableContext remount.
// Evitar recriar funções/objetos em loops
// Listeners, handlers, styles memoizados; estilos estáticos movidos para sx vars ou objeto constante.
// Virtualização (se listas longas)
// react-window / react-virtuoso dentro da coluna de membros.
// Virtualize horizontalmente famílias se > ~30.
// Throttle / rAF em animação otimista
// Se ainda quiser feedback em tempo real: throttle onDragOver (requestAnimationFrame + flag) para no máximo 1 mutation por frame.
// Minimizar peso do overlay
// Renderize overlay simplificado (sem lógica pesada / hooks).
// Não use MemberItem completo se ele tem muitos cálculos; render minimal snapshot.
// Medição dnd-kit
// measuring.droppable.strategy: MeasuringStrategy.WhileDragging em vez de Always.
// Reduz layout thrashing.
// Evitar recomputar familyIdSet a cada render (já usando useMemo — ok); faça mesmo para memberId arrays.

// Debounce persistência / API

// useEffect com debounce 300ms após dragEnd para sync remoto; evita floods.
// Remover logs em produção
// console.log em hot path (findMember, onDragOver) penaliza.
// Suspender expensive renders durante drag
// useTransition / startTransition para commits grandes (se inevitáveis).
// Exemplo (núcleo) de refator normalizado + otimista (aplique incrementalmente):
