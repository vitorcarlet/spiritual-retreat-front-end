"use client";
import React, { useState, useCallback, useRef } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  MeasuringStrategy,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Paper, Typography, Stack, Button, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { nanoid } from "nanoid";

// Tipos
export interface FamilyMember {
  id: string;
  name: string;
  role?: string;
  gender?: string;
}

export interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
  warning?: string;
  stats?: {
    vacanciesLeft?: number;
    menPercent?: number;
  };
}

interface RetreatFamiliesTableProps {
  initialFamilies: Family[];
  onPersist?: (families: Family[]) => void;
}

type ActiveDrag =
  | { type: "column"; id: string; data: Family }
  | { type: "member"; id: string; member: FamilyMember; fromFamilyId: string };

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

function ColumnSortable({
  id,
  children,
}: {
  id: UniqueIdentifier;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    cursor: "grab",
  };
  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </Box>
  );
}

function MemberSortable({
  id,
  dragHandle,
  children,
}: {
  id: UniqueIdentifier;
  dragHandle?: boolean;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    cursor: "grab",
  };
  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...(dragHandle
        ? { ...attributes, ...listeners }
        : { ...attributes, ...listeners })}
    >
      {children}
    </Box>
  );
}

export default function RetreatFamiliesTable({
  initialFamilies,
  onPersist,
}: RetreatFamiliesTableProps) {
  const [families, setFamilies] = useState<Family[]>(initialFamilies);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const persistTimer = useRef<NodeJS.Timeout | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const schedulePersist = useCallback(
    (next: Family[]) => {
      setFamilies(next);
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        onPersist?.(next);
      }, 500);
    },
    [onPersist]
  );

  function handleAddMember(familyId: string) {
    schedulePersist(
      families.map((f) =>
        f.id === familyId
          ? {
              ...f,
              members: [
                ...f.members,
                { id: nanoid(), name: "Novo Membro", role: "Padrinho" },
              ],
            }
          : f
      )
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const column = families.find((f) => f.id === active.id);
    if (column) {
      setActiveDrag({ type: "column", id: column.id, data: column });
      return;
    }
    // Could be member
    for (const fam of families) {
      const mem = fam.members.find((m) => m.id === active.id);
      if (mem) {
        setActiveDrag({
          type: "member",
          id: mem.id,
          member: mem,
          fromFamilyId: fam.id,
        });
        return;
      }
    }
  }

  //   function handleDragOver(event: DragEndEvent) {
  //     // Optional: custom styling while over; not needed for basic behavior
  //   }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveDrag(null);
      return;
    }

    // Column reorder
    const activeFamilyIndex = families.findIndex((f) => f.id === active.id);
    const overFamilyIndex = families.findIndex((f) => f.id === over.id);
    if (
      activeFamilyIndex !== -1 &&
      overFamilyIndex !== -1 &&
      activeFamilyIndex !== overFamilyIndex
    ) {
      const reordered = arrayMove(families, activeFamilyIndex, overFamilyIndex);
      schedulePersist(reordered);
      setActiveDrag(null);
      return;
    }

    // Member reorder / transfer
    const originFamily = families.find((f) =>
      f.members.some((m) => m.id === active.id)
    );
    const targetFamily = families.find((f) =>
      f.members.some((m) => m.id === over.id)
    );

    const overIsColumn = families.some((f) => f.id === over.id);

    if (originFamily) {
      const member = originFamily.members.find((m) => m.id === active.id);
      if (!member) {
        setActiveDrag(null);
        return;
      }

      // Reorder inside same family
      if (originFamily && targetFamily && originFamily.id === targetFamily.id) {
        const fromIdx = originFamily.members.findIndex(
          (m) => m.id === active.id
        );
        const toIdx = originFamily.members.findIndex((m) => m.id === over.id);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
          const updatedFamilies = families.map((f) =>
            f.id === originFamily.id
              ? {
                  ...f,
                  members: arrayMove(f.members, fromIdx, toIdx),
                }
              : f
          );
          schedulePersist(updatedFamilies);
        }
        setActiveDrag(null);
        return;
      }

      // Transfer to another family (dropped over member)
      if (originFamily && targetFamily && originFamily.id !== targetFamily.id) {
        const updatedFamilies = families.map((f) => {
          if (f.id === originFamily.id) {
            return {
              ...f,
              members: f.members.filter((m) => m.id !== member.id),
            };
          }
          if (f.id === targetFamily.id) {
            // insert before target member index
            const targetIndex = f.members.findIndex((m) => m.id === over.id);
            const newMembers = [...f.members];
            if (targetIndex === -1) newMembers.push(member);
            else newMembers.splice(targetIndex, 0, member);
            return { ...f, members: newMembers };
          }
          return f;
        });
        schedulePersist(updatedFamilies);
        setActiveDrag(null);
        return;
      }

      // Transfer dropping over empty column body (over = column id)
      if (originFamily && overIsColumn) {
        const destination = families.find((f) => f.id === over.id);
        if (destination && destination.id !== originFamily.id) {
          const updatedFamilies = families.map((f) => {
            if (f.id === originFamily.id) {
              return {
                ...f,
                members: f.members.filter((m) => m.id !== member.id),
              };
            }
            if (f.id === destination.id) {
              return { ...f, members: [...f.members, member] };
            }
            return f;
          });
          schedulePersist(updatedFamilies);
        }
        setActiveDrag(null);
        return;
      }
    }

    setActiveDrag(null);
  }

  function createColumn() {
    schedulePersist([
      ...families,
      {
        id: nanoid(),
        name: "Nova Família",
        members: [],
      },
    ]);
  }

  return (
    <DndContext
      sensors={sensors}
      measuring={measuring}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      //onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={families.map((f) => f.id)}
        strategy={horizontalListSortingStrategy}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
            alignItems: "flex-start",
            overflowX: "auto",
            pb: 2,
            pr: 1,
          }}
        >
          {families.map((family) => (
            <ColumnSortable id={family.id} key={family.id}>
              <Paper
                variant="outlined"
                sx={{
                  width: 320,
                  minHeight: 360,
                  p: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  borderColor: "divider",
                  position: "relative",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ px: 0.5 }}
                >
                  <DragIndicatorIcon fontSize="small" />
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ flex: 1 }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const name = e.currentTarget.textContent || "Família";
                      schedulePersist(
                        families.map((f) =>
                          f.id === family.id ? { ...f, name } : f
                        )
                      );
                    }}
                  >
                    {family.name}
                  </Typography>
                </Stack>

                <Divider />

                <SortableContext
                  items={family.members.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack spacing={1} sx={{ flex: 1, minHeight: 60 }}>
                    {family.members.map((member) => (
                      <MemberSortable id={member.id} key={member.id}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            borderRadius: 1,
                          }}
                        >
                          <DragIndicatorIcon fontSize="small" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {member.name}
                            </Typography>
                            {member.role && (
                              <Typography
                                variant="caption"
                                color="warning.main"
                                sx={{ lineHeight: 1 }}
                              >
                                {member.role}
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      </MemberSortable>
                    ))}
                  </Stack>
                </SortableContext>

                <Stack direction="row" spacing={1} mt={1}>
                  <Button
                    onClick={() => handleAddMember(family.id)}
                    size="small"
                    startIcon={<AddIcon />}
                    variant="contained"
                    sx={{ flex: 1 }}
                  >
                    Membro
                  </Button>
                </Stack>

                {family.stats && (
                  <Box sx={{ mt: 1, px: 0.5 }}>
                    {family.stats.vacanciesLeft !== undefined && (
                      <Typography
                        variant="caption"
                        color={
                          family.stats.vacanciesLeft > 0
                            ? "warning.main"
                            : "success.main"
                        }
                        display="block"
                      >
                        Restam {family.stats.vacanciesLeft} vagas.
                      </Typography>
                    )}
                    {family.stats.menPercent !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        {family.stats.menPercent}% homens
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </ColumnSortable>
          ))}

          <Button
            variant="outlined"
            onClick={createColumn}
            sx={{ height: 48, alignSelf: "flex-start", whiteSpace: "nowrap" }}
          >
            + Nova Família
          </Button>
        </Box>
      </SortableContext>

      <DragOverlay>
        {activeDrag?.type === "column" && (
          <Paper
            sx={{
              width: 320,
              p: 1.5,
              opacity: 0.9,
              cursor: "grabbing",
            }}
            variant="outlined"
          >
            <Typography fontWeight={600}>{activeDrag.data.name}</Typography>
          </Paper>
        )}
        {activeDrag?.type === "member" && (
          <Paper
            sx={{
              p: 1,
              minWidth: 160,
              opacity: 0.85,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
            variant="outlined"
          >
            <DragIndicatorIcon fontSize="small" />
            <Typography variant="body2" fontWeight={500}>
              {activeDrag.member.name}
            </Typography>
          </Paper>
        )}
      </DragOverlay>
    </DndContext>
  );
}
