import React from "react";
import { Button, Stack } from "@mui/material";
import { UniqueIdentifier } from "@dnd-kit/core";
import Iconify from "@/src/components/Iconify";

interface ContainerButtonsProps {
  familyId: UniqueIdentifier;
  onEdit: (familyId: UniqueIdentifier) => void;
  onView: (familyId: UniqueIdentifier) => void;
}

export default function ContainerButtons({
  familyId,
  onEdit,
  onView,
}: ContainerButtonsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "center" }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="solar:eye-bold" />}
        onClick={() => onView(familyId)}
        sx={{ minWidth: "auto" }}
      >
        Ver
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="solar:pen-bold" />}
        onClick={() => onEdit(familyId)}
        sx={{ minWidth: "auto" }}
      >
        Editar
      </Button>
    </Stack>
  );
}
