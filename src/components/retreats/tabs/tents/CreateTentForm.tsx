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

interface CreateTentFormProps {
  retreatId: string;
  onSuccess: () => void;
}

const createTentSchema = z.object({
  number: z.string().min(1, "Número da barraca é obrigatório"),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacidade precisa ser um número" })
    .int("Capacidade deve ser um número inteiro")
    .min(1, "Capacidade mínima é 1"),
  gender: z.enum(["male", "female"], {
    required_error: "Selecione o tipo da barraca",
  }),
  notes: z.string().optional(),
});

type CreateTentData = z.infer<typeof createTentSchema>;

export default function CreateTentForm({
  retreatId,
  onSuccess,
}: CreateTentFormProps) {
  const t = useTranslations("tents");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTentData>({
    resolver: zodResolver(createTentSchema),
    defaultValues: {
      number: "",
      capacity: 6,
      gender: "male",
      notes: "",
    },
  });

  const onSubmit = async (data: CreateTentData) => {
    try {
      const response = await handleApiResponse(
        await sendRequestServerVanilla.post(
          `/retreats/${retreatId}/tents`,
          data
        )
      );

      if (response.success) {
        reset();
        onSuccess();
      } else {
        console.error("Erro ao criar barraca:", response.error);
      }
    } catch (error) {
      console.error("Erro ao criar barraca:", error);
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
                label={t("form.number")}
                required
                placeholder="Ex: 01"
                error={!!errors.number}
                helperText={errors.number?.message}
              />
            )}
          />

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.gender}>
                <InputLabel>{t("form.gender")}</InputLabel>
                <Select {...field} label={t("form.gender")}>
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
            name="capacity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                fullWidth
                label={t("form.capacity")}
                required
                inputProps={{ min: 1 }}
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
                minRows={3}
                label={t("form.notes")}
                placeholder={t("form.notesPlaceholder")}
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
              {t("form.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? <CircularProgress size={16} /> : undefined
              }
            >
              {isSubmitting ? t("form.submitting") : t("form.submit")}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
