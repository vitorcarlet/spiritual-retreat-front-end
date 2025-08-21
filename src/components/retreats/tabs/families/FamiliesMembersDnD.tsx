"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Paper, Typography, Stack, Button } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

interface FamilyMembersDnDColumnProps {
  family: RetreatFamily;
  disabled: boolean;
  onAddMember?: (familyId: string | number) => void;
  addButtonLabel?: string;
  renderMemberExtra?: (member: Participant) => React.ReactNode;
}

//export const FAMILY_PREFIX = "family-";
//export const MEMBER_PREFIX = "member-";

export function FamilyMembersDnDColumn({
  family,
  disabled,
  onAddMember,
  addButtonLabel = "+ Membro",
  renderMemberExtra,
}: FamilyMembersDnDColumnProps) {
  const members: Participant[] = Array.isArray(family.members)
    ? (family.members as Participant[])
    : [];
  const isEmpty = members.length === 0;

  return (
    <Box
      sx={{
        //width: 300,
        //minHeight: 340,
        height: 210,
        overflowY: "auto",
        p: 1.5,
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        gap: 1.2,
        position: "relative",
      }}
    >
      <Stack spacing={1} sx={{ flex: 1, minHeight: 50 }}>
        {isEmpty && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              textAlign: "center",
              fontSize: 12,
              color: "text.secondary",
              borderStyle: "dashed",
              //backgroundColor: isOver ? "action.hover" : "transparent",
              backgroundColor: "transparent",
            }}
          >
            Solte membros aqui
          </Paper>
        )}
        {!isEmpty &&
          members.map((m) => (
            <MemberSortable
              key={m.id}
              member={m}
              familyId={family.id}
              extra={renderMemberExtra?.(m)}
            />
          ))}
      </Stack>
      {onAddMember && (
        <Button
          variant="contained"
          size="small"
          onClick={() => onAddMember(family.id)}
        >
          {addButtonLabel}
        </Button>
      )}
    </Box>
  );
}

export function MemberSortable({
  member,
  familyId,
  extra,
}: {
  member: Participant;
  familyId: string | number;
  extra?: React.ReactNode;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
    isSorting,
    over,
    overIndex,
  } = useSortable({
    id: String(member.id),
    data: { type: "member", memberId: member.id, familyId },
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isSorting ? 1000 : "auto",
    touchAction: "none",
    position: "relative",
    cursor: "grab",
  };
  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      sx={{
        p: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
        borderRadius: 1,
      }}
      style={style}
      {...attributes}
    >
      <DragIndicatorIcon {...listeners} fontSize="small" />
      <MemberItem member={member} extra={extra} />
    </Paper>
  );
}

function getParticipantDisplayName(member: Participant): string {
  if (member.name) return member.name;
  const combined = [member.firstName, member.lastName]
    .filter(Boolean)
    .join(" ");
  if (combined) return combined;
  return String(member.id);
}

export function MemberItem({
  member,
  style,
  color,
  extra,
}: {
  member: Participant;
  style?: { zIndex: number | undefined };
  color?: string;
  extra?: React.ReactNode;
}) {
  return (
    <Box sx={{ flex: 1, ...style }}>
      <Typography variant="body2" fontWeight={500} color={color}>
        {getParticipantDisplayName(member)}
      </Typography>
      {extra}
    </Box>
  );
}
