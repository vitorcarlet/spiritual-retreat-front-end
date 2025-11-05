"use client";

import { Box, Button, Stack, Typography, Alert } from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import apiClient from "@/src/lib/axiosClientInstance";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

interface DeleteTentFormProps {
  retreatId: string;
  tentId: string;
  tentNumber?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function DeleteTentForm({
  retreatId,
  tentId,
  tentNumber,
  onSuccess,
  onCancel,
}: DeleteTentFormProps) {
  const t = useTranslations("tent");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/retreats/${retreatId}/tents/${tentId}`);

      enqueueSnackbar(
        t("tent-deleted-successfully", { number: tentNumber || tentId }),
        {
          variant: "success",
        }
      );
      onSuccess();
    } catch (error) {
      console.error("Erro ao deletar família:", error);
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao deletar família.";
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
          {t("delete-tent-warning", {
            name: tentNumber || tentId,
          })}
        </Typography>
      </Alert>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {t("delete-tent-confirmation")}
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
          {isDeleting ? t("deleting") : t("delete-tent")}
        </Button>
      </Stack>
    </Box>
  );
}
