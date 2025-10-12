"use client";

import { Box, Button, Stack, Typography, Alert } from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import apiClient from "@/src/lib/axiosClientInstance";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

interface DeleteFamilyFormProps {
  retreatId: string;
  familyId: string;
  familyName?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function DeleteFamilyForm({
  retreatId,
  familyId,
  familyName,
  onSuccess,
  onCancel,
}: DeleteFamilyFormProps) {
  const t = useTranslations();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/retreats/${retreatId}/families/${familyId}`);

      enqueueSnackbar(
        t("family-deleted-successfully", { name: familyName || familyId }),
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
          {t("delete-family-warning", {
            name: familyName || familyId,
          })}
        </Typography>
      </Alert>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {t("delete-family-confirmation")}
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
          {isDeleting ? t("deleting") : t("delete-family")}
        </Button>
      </Stack>
    </Box>
  );
}
