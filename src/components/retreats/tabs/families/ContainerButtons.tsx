import React from "react";
import { Button, Stack } from "@mui/material";
import { UniqueIdentifier } from "@dnd-kit/core";
import Iconify from "@/src/components/Iconify";
import { useTranslations } from "next-intl";

interface ContainerButtonsProps {
  familyId: UniqueIdentifier;
  onEdit: (familyId: UniqueIdentifier) => void;
  onView: (familyId: UniqueIdentifier) => void;
  onDelete?: (familyId: UniqueIdentifier) => void;
  canEdit: boolean;
}

export default function ContainerButtons({
  familyId,
  onEdit,
  onView,
  onDelete,
  canEdit,
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
      >
        {t("view")}
      </Button>
      {canEdit && (
        <>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={() => onEdit(familyId)}
            sx={{ minWidth: "auto" }}
          >
            {t("edit")}
          </Button>
          {onDelete && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => onDelete(familyId)}
              sx={{ minWidth: "auto" }}
            >
              {t("delete")}
            </Button>
          )}
        </>
      )}
    </Stack>
  );
}
