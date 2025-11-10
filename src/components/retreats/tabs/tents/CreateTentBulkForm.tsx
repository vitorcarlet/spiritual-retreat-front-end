"use client";

import {
  Box,
  TextField,
  Button,
  Stack,
  IconButton,
  Typography,
  Divider,
  Paper,
  MenuItem,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import apiClient from "@/src/lib/axiosClientInstance";
import { useSnackbar } from "notistack";
import Iconify from "@/src/components/Iconify";

interface CreateTentBulkFormProps {
  retreatId: string;
  onSuccess: () => void;
}

const tentItemSchema = z.object({
  number: z.coerce
    .number({ invalid_type_error: "Número deve ser um número" })
    .int("Número deve ser um número inteiro")
    .min(1, "Número é obrigatório"),
  category: z.enum(["Male", "Female"], {
    errorMap: () => ({ message: "Selecione um gênero válido" }),
  }),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacidade deve ser um número" })
    .int("Capacidade deve ser um número inteiro")
    .min(0, "Capacidade não pode ser negativa"),
  note: z.string().optional(),
});

const bulkSchema = z.object({
  items: z.array(tentItemSchema).min(1, "Adicione pelo menos uma barraca"),
});

type CreateTentBulkData = z.infer<typeof bulkSchema>;

export function CreateTentBulkForm({
  retreatId,
  onSuccess,
}: CreateTentBulkFormProps) {
  const t = useTranslations();
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTentBulkData>({
    resolver: zodResolver(bulkSchema),
    defaultValues: {
      items: [
        {
          number: 0,
          category: "Male",
          capacity: 0,
          note: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: CreateTentBulkData) => {
    try {
      await apiClient.post(`/retreats/${retreatId}/tents/tents/bulk`, {
        items: data.items.map((item) => ({
          ...item,
          number: String(item.number),
        })),
      });
      enqueueSnackbar(t("tents.bulk-form.success"), {
        variant: "success",
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(t("tents.bulk-form.error"), { variant: "error" });
    }
  };

  const handleAddTent = () => {
    append({
      number: 0,
      category: "Male",
      capacity: 0,
      note: "",
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
      <Stack spacing={2}>
        {fields.map((field, index) => (
          <Paper key={field.id} sx={{ p: 2, position: "relative" }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Barraca #{index + 1}
                </Typography>
                {fields.length > 1 && (
                  <IconButton
                    onClick={() => remove(index)}
                    size="small"
                    color="error"
                  >
                    <Iconify icon="mdi:delete" />
                  </IconButton>
                )}
              </Stack>

              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <Controller
                    name={`items.${index}.number`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t("tents.bulk-form.number")}
                        fullWidth
                        error={!!errors.items?.[index]?.number}
                        helperText={errors.items?.[index]?.number?.message}
                      />
                    )}
                  />

                  <Controller
                    name={`items.${index}.category`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t("tents.bulk-form.gender")}
                        select
                        fullWidth
                        error={!!errors.items?.[index]?.category}
                        helperText={errors.items?.[index]?.category?.message}
                      >
                        <MenuItem value="Male">{t("male")}</MenuItem>
                        <MenuItem value="Female">{t("female")}</MenuItem>
                      </TextField>
                    )}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Controller
                    name={`items.${index}.capacity`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t("tents.bulk-form.capacity")}
                        type="number"
                        fullWidth
                        error={!!errors.items?.[index]?.capacity}
                        helperText={errors.items?.[index]?.capacity?.message}
                      />
                    )}
                  />

                  <Controller
                    name={`items.${index}.note`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t("tents.bulk-form.note")}
                        fullWidth
                        multiline
                        rows={2}
                      />
                    )}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        ))}

        <Divider />

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={handleAddTent}
          >
            {t("tents.bulk-form.add-tent")}
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ ml: "auto" }}
          >
            {isSubmitting
              ? t("tents.bulk-form.creating")
              : t("tents.bulk-form.create-tents")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
