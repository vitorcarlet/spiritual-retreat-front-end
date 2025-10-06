import React from "react";
import { Button, Stack } from "@mui/material";
import { UniqueIdentifier } from "@dnd-kit/core";
import Iconify from "@/src/components/Iconify";
import { useTranslations } from "next-intl";

interface ContainerButtonsProps {
  tentId: UniqueIdentifier;
  onEdit: (tentId: UniqueIdentifier) => void;
  onView: (tentId: UniqueIdentifier) => void;
  canEdit: boolean;
}

export default function ContainerButtons({
  tentId,
  onEdit,
  onView,
  canEdit,
}: ContainerButtonsProps) {
  const t = useTranslations("tent-details");
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "center" }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="solar:eye-bold" />}
        onClick={() => onView(tentId)}
        sx={{ minWidth: "auto" }}
      >
        {t("view")}
      </Button>
      {canEdit && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="solar:pen-bold" />}
          onClick={() => onEdit(tentId)}
          sx={{ minWidth: "auto" }}
        >
          {t("edit")}
        </Button>
      )}
    </Stack>
  );
}
