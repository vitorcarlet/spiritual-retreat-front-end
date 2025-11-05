"use client";

import { Box, Button, Stack, Typography, Alert } from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import apiClient from "@/src/lib/axiosClientInstance";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

interface DeleteServiceTeamFormProps {
  retreatId: string;
  spaceId: string;
  spaceName?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function DeleteServiceTeamForm({
  retreatId,
  spaceId,
  spaceName,
  onSuccess,
  onCancel,
}: DeleteServiceTeamFormProps) {
  const t = useTranslations("service-team-details");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(
        `/retreats/${retreatId}/service/spaces/${spaceId}`
      );

      enqueueSnackbar(
        t("delete-service-team-success", { name: spaceName || spaceId }),
        {
          variant: "success",
        }
      );
      onSuccess();
    } catch (error) {
      console.error("Erro ao deletar equipe de serviço:", error);
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao deletar equipe de serviço.";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {t("delete-service-team-warning", {
            name: spaceName || spaceId,
          })}
        </Typography>
      </Alert>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {t("delete-service-team-confirmation")}
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={onCancel || onSuccess}
          disabled={isDeleting}
        >
          {t("cancel")}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? t("deleting") : t("delete-service-team")}
        </Button>
      </Stack>
    </Box>
  );
}
