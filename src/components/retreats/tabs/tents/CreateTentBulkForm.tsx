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
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";

interface CreateTentBulkFormProps {
  retreatId: string;
  onSuccess: () => void;
}

const bulkSchema = z.object({
  startingNumber: z.string().min(1, "Número inicial é obrigatório"),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantidade deve ser um número" })
    .int("Quantidade deve ser um número inteiro")
    .min(1, "Informe ao menos 1 barraca"),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacidade deve ser um número" })
    .int("Capacidade deve ser um número inteiro")
    .min(1, "Capacidade mínima é 1"),
  gender: z.enum(["male", "female"], {
    required_error: "Selecione o tipo",
  }),
  notes: z.string().optional(),
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
      startingNumber: "01",
      quantity: 5,
      capacity: 6,
      gender: "male",
      notes: "",
    },
  });

  const onSubmit = async (data: CreateTentBulkData) => {
    try {
      const response = await handleApiResponse(
        await sendRequestServerVanilla.post(
          `/retreats/${retreatId}/tents/bulk`,
          data
        )
      );

      if (response.success) {
        reset();
        onSuccess();
      } else {
        console.error("Erro ao criar barracas em lote:", response.error);
      }
    } catch (error) {
      console.error("Erro ao criar barracas em lote:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
      <Stack spacing={3}>
        <Controller
          name="startingNumber"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("bulkForm.startingNumber")}
              required
              error={!!errors.startingNumber}
              helperText={errors.startingNumber?.message}
            />
          )}
        />

        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              label={t("bulkForm.quantity")}
              required
              inputProps={{ min: 1 }}
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
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
              label={t("bulkForm.capacity")}
              required
              inputProps={{ min: 1 }}
              error={!!errors.capacity}
              helperText={errors.capacity?.message}
            />
          )}
        />

        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth required error={!!errors.gender}>
              <InputLabel>{t("bulkForm.gender")}</InputLabel>
              <Select {...field} label={t("bulkForm.gender")}>
                <MenuItem value="male">{t("gender.male")}</MenuItem>
                <MenuItem value="female">{t("gender.female")}</MenuItem>
              </Select>
              {errors.gender?.message ? (
                <Box
                  component="span"
                  sx={{ mt: 1, color: "error.main", fontSize: 12 }}
                >
                  {errors.gender.message}
                </Box>
              ) : null}
            </FormControl>
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              multiline
              minRows={3}
              label={t("bulkForm.notes")}
              placeholder={t("bulkForm.notesPlaceholder")}
            />
          )}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onSuccess}
            disabled={isSubmitting}
          >
            {t("bulkForm.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? <CircularProgress size={16} /> : undefined
            }
          >
            {isSubmitting ? t("bulkForm.submitting") : t("bulkForm.submit")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
