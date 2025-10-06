import React from "react";
import { Button, Stack } from "@mui/material";
import { UniqueIdentifier } from "@dnd-kit/core";
import Iconify from "@/src/components/Iconify";
import { useTranslations } from "next-intl";

interface ContainerButtonsProps {
  familyId: UniqueIdentifier;
  reorderFlag: boolean;
  onEdit: (familyId: UniqueIdentifier) => void;
  onView: (familyId: UniqueIdentifier) => void;
  canEdit: boolean;
}

export default function ContainerButtons({
  familyId,
  onEdit,
  onView,
  canEdit,
  reorderFlag,
}: ContainerButtonsProps) {
  const t = useTranslations("family-details");
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "center" }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="solar:eye-bold" />}
        onClick={() => onView(familyId)}
        sx={{ minWidth: "auto" }}
        disabled={canEdit || reorderFlag}
      >
        {t("view")}
      </Button>
      {canEdit && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="solar:pen-bold" />}
          onClick={() => onEdit(familyId)}
          sx={{ minWidth: "auto" }}
          disabled={canEdit || reorderFlag}
        >
          {t("edit")}
        </Button>
      )}
    </Stack>
  );
}
