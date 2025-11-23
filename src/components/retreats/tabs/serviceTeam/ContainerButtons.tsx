import React from "react";
import { Button, Stack } from "@mui/material";
import { UniqueIdentifier } from "@dnd-kit/core";
import Visibility from "@mui/icons-material/Visibility";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import { ValidationError } from "./hooks/useRulesValidations";
import ServiceTeamStatus from "./ContainerButtons/ServiceTeamStatus";

interface ContainerButtonsProps {
  onEdit: (id: UniqueIdentifier) => void;
  onView: (id: UniqueIdentifier) => void;
  onDelete: (id: UniqueIdentifier) => void;
  familyId: UniqueIdentifier;
  canEdit: boolean;
  reorderFlag: boolean;
  validationError?: ValidationError;
}

export default function ContainerButtons({
  onEdit,
  onView,
  onDelete,
  familyId,
  canEdit,
  reorderFlag,
  validationError,
}: ContainerButtonsProps) {
  return (
    <Stack sx={{ mt: 2 }} spacing={1}>
      {/* Status de validação */}
      <ServiceTeamStatus error={validationError} />

      {/* Botões de ação */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onView(familyId)}
          disabled={reorderFlag}
          fullWidth
          startIcon={<Visibility />}
        >
          Visualizar
        </Button>

        {canEdit && (
          <>
            <Button
              size="small"
              variant="contained"
              onClick={() => onEdit(familyId)}
              disabled={reorderFlag}
              fullWidth
              startIcon={<Edit />}
            >
              Editar
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => onDelete(familyId)}
              sx={{ minWidth: "auto" }}
            >
              Deletar
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
}
