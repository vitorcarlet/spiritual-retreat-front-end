import React from "react";
import { Button, Stack } from "@mui/material";
import Iconify from "@/src/components/Iconify";
import { UniqueIdentifier } from "@dnd-kit/core";
import { ValidationError } from "./hooks/useRulesValidations";
import ServiceTeamStatus from "./ContainerButtons/ServiceTeamStatus";

interface ContainerButtonsProps {
  onEdit: (id: UniqueIdentifier) => void;
  onView: (id: UniqueIdentifier) => void;
  familyId: UniqueIdentifier;
  canEdit: boolean;
  reorderFlag: boolean;
  validationError?: ValidationError;
}

export default function ContainerButtons({
  onEdit,
  onView,
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
          startIcon={<Iconify icon="solar:eye-bold" />}
        >
          Visualizar
        </Button>

        {canEdit && (
          <Button
            size="small"
            variant="contained"
            onClick={() => onEdit(familyId)}
            disabled={reorderFlag}
            fullWidth
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Editar
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
