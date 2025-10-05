"use client";

import { Box, TextField, Button, Stack, CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { MuiColorInput } from "mui-color-input";

interface CreateFamilyFormProps {
  retreatId: string;
  onSuccess: () => void;
}

const HEX_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

const createFamilySchema = z.object({
  name: z.string().min(1, "Nome da família é obrigatório"),
  color: z
    .string()
    .regex(HEX_REGEX, "Cor inválida"),
});

type CreateFamilyData = z.infer<typeof createFamilySchema>;

export default function CreateFamilyForm({
  retreatId,
  onSuccess,
}: CreateFamilyFormProps) {
  const t = useTranslations();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateFamilyData>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      name: "",
      color: "#1976d2",
    },
  });

  const onSubmit = async (data: CreateFamilyData) => {
    try {
      const response = await handleApiResponse(
        await sendRequestServerVanilla.post(
          `/retreats/${retreatId}/families`,
          data
        )
      );

      if (response.success) {
        reset();
        onSuccess();
      } else {
        console.error("Erro ao criar família:", response.error);
      }
    } catch (error) {
      console.error("Erro ao criar família:", error);
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
            name="color"
            control={control}
            render={({ field }) => (
              <MuiColorInput
                {...field}
                format="hex"
                label={t("family-color")}
                disableAlpha
                value={field.value ?? ""}
                onChange={(value: string) => field.onChange(value)}
                TextFieldProps={{
                  fullWidth: true,
                  required: true,
                  error: !!errors.color,
                  helperText: errors.color?.message,
                }}
              />
            )}
          />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t("family-name")}
                required
                placeholder="Ex: Família São Francisco"
                error={!!errors.name}
                helperText={errors.name?.message}
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
              {isSubmitting ? t("creating") : t("create-family")}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
