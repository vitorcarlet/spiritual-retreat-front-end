"use client";

import {
  Box,
  TextField,
  Button,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
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
  notes: z.string().default(""),
});

type CreateTentData = z.input<typeof createTentSchema>;

export default function CreateTentForm({
  retreatId,
  onSuccess,
}: CreateTentFormProps) {
  const t = useTranslations("create-tent-form");

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
        enqueueSnackbar(t("success"), {
          variant: "success",
        });
        reset();
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao criar barraca:", error);
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : t("error");
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
                label={t("tent-number")}
                required
                placeholder={t("tent-number-placeholder")}
                error={!!errors.number}
                helperText={errors.number?.message}
              />
            )}
          />

          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel id="category-label" required>
                  {t("tent-category")}
                </InputLabel>
                <Select
                  {...field}
                  labelId="category-label"
                  label={t("tent-category")}
                >
                  <MenuItem value={0}>{t("category-male")}</MenuItem>
                  <MenuItem value={1}>{t("category-female")}</MenuItem>
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="capacity"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                value={value}
                onChange={(e) => onChange(Number(e.target.value) || 0)}
                fullWidth
                type="number"
                label={t("tent-capacity")}
                required
                placeholder={t("tent-capacity-placeholder")}
                error={!!errors.capacity}
                helperText={errors.capacity?.message}
                inputProps={{ min: 1 }}
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
                label={t("tent-notes")}
                placeholder={t("tent-notes-placeholder")}
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
