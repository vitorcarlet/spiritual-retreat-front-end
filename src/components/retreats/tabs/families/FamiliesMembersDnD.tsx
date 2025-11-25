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
  renderMemberExtra?: (member: FamilyParticipant) => React.ReactNode;
}

export function FamilyMembersDnDColumn({
  family,
  onAddMember,
  addButtonLabel = "+ Membro",
  renderMemberExtra,
}: FamilyMembersDnDColumnProps) {
  const members: FamilyParticipant[] = Array.isArray(family.members)
    ? (family.members as FamilyParticipant[])
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
              key={m.registrationId}
              member={m}
              familyId={family.familyId}
              extra={renderMemberExtra?.(m)}
            />
          ))}
      </Stack>
      {onAddMember && (
        <Button
          variant="contained"
          size="small"
          onClick={() => onAddMember(family.familyId)}
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
  member: FamilyParticipant;
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
    isSorting,
  } = useSortable({
    id: String(member.registrationId),
    data: { type: "member", memberId: member.registrationId, familyId },
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

function getParticipantDisplayName(member: FamilyParticipant): string {
  if (member.name) return member.name;
  return String(member.registrationId);
}

export function MemberItem({
  member,
  style,
  color,
  extra,
}: {
  member: FamilyParticipant;
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
