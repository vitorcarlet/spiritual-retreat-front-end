"use client";

import { Box, TextField, Button, Stack, CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import apiClient from "@/src/lib/axiosClientInstance";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

interface CreateTentFormProps {
  retreatId: string;
  onSuccess: () => void;
}

// Esquema Zod para validação
const createTentSchema = z.object({
  number: z
    .string()
    .min(1, "Número da barraca é obrigatório")
    .transform((val) => val.trim()),
  category: z
    .number()
    .int("Categoria deve ser um número inteiro")
    .min(0, "Categoria não pode ser negativa"),
  capacity: z
    .number()
    .int("Capacidade deve ser um número inteiro")
    .min(1, "Capacidade deve ser no mínimo 1"),
  notes: z.string().optional().default(""),
});

type CreateTentData = z.infer<typeof createTentSchema>;

export default function CreateTentForm({
  retreatId,
  onSuccess,
}: CreateTentFormProps) {
  const t = useTranslations();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTentData>({
    resolver: zodResolver(createTentSchema),
    defaultValues: {
      number: "",
      category: 0,
      capacity: 1,
      notes: "",
    },
  });

  const onSubmit = async (data: CreateTentData) => {
    try {
      const body = {
        number: data.number,
        category: data.category,
        capacity: data.capacity,
        notes: data.notes || undefined, // Envia undefined se vazio
      };

      const response = await apiClient.post(
        `/retreats/${retreatId}/tents`,
        body
      );

      if (response.data) {
        enqueueSnackbar("Barraca criada com sucesso!", {
          variant: "success",
        });
        reset();
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao criar barraca:", error);
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao criar barraca.";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 4000,
      });
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
        <Stack spacing={3}>
          <Controller
            name="number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t("tent-number", {
                  defaultMessage: "Número da Barraca",
                })}
                required
                placeholder="Ex: 1, 2, 3..."
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
                fullWidth
                type="number"
                label={t("tent-category", { defaultMessage: "Categoria" })}
                required
                placeholder="0"
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
                fullWidth
                type="number"
                label={t("tent-capacity", { defaultMessage: "Capacidade" })}
                required
                placeholder="Ex: 5"
                error={!!errors.capacity}
                helperText={errors.capacity?.message}
              />
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={3}
                label={t("tent-notes", { defaultMessage: "Notas" })}
                placeholder="Adicione observações sobre a barraca..."
                error={!!errors.notes}
                helperText={errors.notes?.message}
              />
            )}
          />

          <Stack
            sx={{ flex: 1 }}
            direction="row"
            spacing={2}
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              onClick={onSuccess}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? <CircularProgress size={16} /> : undefined
              }
            >
              {isSubmitting ? t("creating") : t("create-tent")}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
