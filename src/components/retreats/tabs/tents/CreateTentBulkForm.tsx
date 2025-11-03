"use client";

import { Box, TextField, Button, Stack, CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import apiClient from "@/src/lib/axiosClientInstance";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

interface CreateTentBulkFormProps {
  retreatId: string;
  onSuccess: () => void;
}

const bulkSchema = z.object({
  number: z.string().min(1, "Número é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacidade deve ser um número" })
    .int("Capacidade deve ser um número inteiro")
    .min(0, "Capacidade não pode ser negativa"),
  note: z.string().optional(),
});

type CreateTentBulkData = z.infer<typeof bulkSchema>;

export default function CreateTentBulkForm({
  retreatId,
  onSuccess,
}: CreateTentBulkFormProps) {
  const t = useTranslations("tents");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTentBulkData>({
    resolver: zodResolver(bulkSchema),
    defaultValues: {
      number: "",
      category: "0",
      capacity: 0,
      note: "",
    },
  });

  const onSubmit = async (data: CreateTentBulkData) => {
    try {
      const body = {
        number: data.number,
        category: data.category,
        capacity: data.capacity,
        note: data.note || undefined,
      };

      const response = await apiClient.post(
        `/retreats/${retreatId}/tents/bulk`,
        body
      );

      if (response.data) {
        enqueueSnackbar("Barraca em lote criada com sucesso!", {
          variant: "success",
        });
        reset();
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao criar barraca em lote:", error);
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao criar barraca em lote.";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 4000,
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
      <Stack spacing={3}>
        <Controller
          name="number"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("bulkForm.number", { defaultMessage: "Número" })}
              required
              error={!!errors.number}
              helperText={errors.number?.message}
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("bulkForm.category", { defaultMessage: "Categoria" })}
              required
              error={!!errors.category}
              helperText={errors.category?.message}
            />
          )}
        />

        <Controller
          name="capacity"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              label={t("bulkForm.capacity", { defaultMessage: "Capacidade" })}
              required
              inputProps={{ min: 0 }}
              error={!!errors.capacity}
              helperText={errors.capacity?.message}
            />
          )}
        />

        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              multiline
              minRows={3}
              label={t("bulkForm.note", { defaultMessage: "Notas" })}
              placeholder={t("bulkForm.notePlaceholder", {
                defaultMessage: "Adicione observações sobre a barraca...",
              })}
            />
          )}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onSuccess}
            disabled={isSubmitting}
          >
            {t("bulkForm.cancel", { defaultMessage: "Cancelar" })}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? <CircularProgress size={16} /> : undefined
            }
          >
            {isSubmitting
              ? t("bulkForm.submitting", { defaultMessage: "Criando..." })
              : t("bulkForm.submit", { defaultMessage: "Criar" })}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
