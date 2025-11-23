import React from "react";
import { Button, Stack } from "@mui/material";
import { UniqueIdentifier } from "@dnd-kit/core";
import Visibility from "@mui/icons-material/Visibility";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
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
        startIcon={<Visibility />}
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
            startIcon={<Edit />}
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
              startIcon={<Delete />}
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
