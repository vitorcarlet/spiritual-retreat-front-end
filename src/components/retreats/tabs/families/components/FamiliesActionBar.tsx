"use client";

import { Button, Stack } from "@mui/material";
import { useTranslations } from "next-intl";

interface FamiliesActionBarProps {
  hasCreatePermission: boolean;
  isReordering: boolean;
  isEditMode: boolean;
  onCreateFamily: () => void;
  onSendMessage: () => void;
  onAddParticipant: () => void;
  onConfigure: () => void;
  onDraw: () => void;
  onLock: () => void;
  onReset: () => void;
}

export default function FamiliesActionBar({
  hasCreatePermission,
  isReordering,
  isEditMode,
  onCreateFamily,
  onSendMessage,
  onAddParticipant,
  onConfigure,
  onDraw,
  onLock,
  onReset,
}: FamiliesActionBarProps) {
  const t = useTranslations();

  if (!hasCreatePermission) return null;

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      mb={3}
      flexWrap="wrap"
    >
      <Button
        variant="contained"
        onClick={onCreateFamily}
        disabled={isReordering || !isEditMode}
      >
        {t("create-new-family")}
      </Button>
      <Button
        variant="contained"
        onClick={onSendMessage}
        disabled={isReordering || !isEditMode}
      >
        {t("send-messages")}
      </Button>
      <Button
        variant="contained"
        onClick={onAddParticipant}
        disabled={isReordering || !isEditMode}
      >
        {t("add-participant-in-family")}
      </Button>
      <Button
        variant="contained"
        onClick={onConfigure}
        disabled={isReordering || !isEditMode}
      >
        {t("family-config")}
      </Button>
      <Button
        variant="contained"
        onClick={onDraw}
        disabled={isReordering || !isEditMode}
      >
        {t("draw-the-families")}
      </Button>
      <Button
        variant="contained"
        onClick={onLock}
        disabled={isReordering || !isEditMode}
      >
        {t("lock-families")}
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={onReset}
        disabled={isReordering || !isEditMode}
      >
        {t("reset-families")}
      </Button>
    </Stack>
  );
}
