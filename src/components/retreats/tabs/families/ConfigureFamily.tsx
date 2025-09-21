"use client";

import {
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";

interface ConfigureFamilyProps {
  retreatId: string;
  onSuccess: () => void;
}

const configureFamilySchema = z
  .object({
    defaultFamilySize: z
      .number()
      .min(2, "Tamanho mínimo é 2")
      .max(20, "Tamanho máximo é 20"),
    maxFamilySize: z
      .number()
      .min(2, "Tamanho mínimo é 2")
      .max(20, "Tamanho máximo é 20"),
  })
  .refine((data) => data.maxFamilySize >= data.defaultFamilySize, {
    message: "Tamanho máximo deve ser maior ou igual ao tamanho padrão",
    path: ["maxFamilySize"],
  });

type ConfigureFamilyData = z.infer<typeof configureFamilySchema>;

interface FamilyConfiguration {
  defaultFamilySize: number;
  maxFamilySize: number;
  totalFamilies?: number;
  totalParticipants?: number;
}

export default function ConfigureFamily({
  retreatId,
  onSuccess,
}: ConfigureFamilyProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [currentConfig, setCurrentConfig] =
    useState<FamilyConfiguration | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ConfigureFamilyData>({
    resolver: zodResolver(configureFamilySchema),
    defaultValues: {
      defaultFamilySize: 6,
      maxFamilySize: 8,
    },
  });

  const defaultFamilySize = watch("defaultFamilySize");
  const maxFamilySize = watch("maxFamilySize");

  // Buscar configuração atual
  useEffect(() => {
    const fetchCurrentConfig = async () => {
      setLoading(true);
      try {
        const response = await handleApiResponse<{
          config: FamilyConfiguration;
        }>(
          await sendRequestServerVanilla.get(
            `/retreats/${retreatId}/families/config`
          )
        );

        if (response.success && response.data) {
          const config = response.data.config;
          setCurrentConfig(config);
          reset({
            defaultFamilySize: config.defaultFamilySize,
            maxFamilySize: config.maxFamilySize,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar configuração atual:", error);
        // Usar valores padrão em caso de erro
        setCurrentConfig({
          defaultFamilySize: 6,
          maxFamilySize: 8,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentConfig();
  }, [retreatId, reset]);

  const onSubmit = async (data: ConfigureFamilyData) => {
    try {
      const response = await handleApiResponse(
        await sendRequestServerVanilla.put(
          `/retreats/${retreatId}/families/config`,
          data
        )
      );

      if (response.success) {
        onSuccess();
      } else {
        console.error("Erro ao salvar configuração:", response.error);
      }
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t("family-config-description")}
          </Typography>

          {currentConfig && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>{t("current-config")}:</strong>
                <br />
                {t("current-families")}: {currentConfig.totalFamilies || 0}
                <br />
                {t("current-participants")}:{" "}
                {currentConfig.totalParticipants || 0}
              </Typography>
            </Alert>
          )}

          <Controller
            name="defaultFamilySize"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.defaultFamilySize}>
                <InputLabel>{t("default-family-size")}</InputLabel>
                <Select {...field} label={t("default-family-size")}>
                  {Array.from({ length: 19 }, (_, i) => i + 2).map((size) => (
                    <MenuItem key={size} value={size}>
                      {size} {t("members")}
                    </MenuItem>
                  ))}
                </Select>
                {errors.defaultFamilySize && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.defaultFamilySize.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="maxFamilySize"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.maxFamilySize}>
                <InputLabel>{t("max-family-size")}</InputLabel>
                <Select {...field} label={t("max-family-size")}>
                  {Array.from({ length: 19 }, (_, i) => i + 2).map((size) => (
                    <MenuItem key={size} value={size}>
                      {size} {t("members")}
                    </MenuItem>
                  ))}
                </Select>
                {errors.maxFamilySize && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.maxFamilySize.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t("preview-config")}:
            </Typography>
            <Typography variant="body2">
              • {t("default-size")}: {defaultFamilySize} {t("members")}
            </Typography>
            <Typography variant="body2">
              • {t("maximum-size")}: {maxFamilySize} {t("members")}
            </Typography>
            {currentConfig?.totalParticipants && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t("estimated-families")}: ~
                {Math.ceil(currentConfig.totalParticipants / defaultFamilySize)}
              </Typography>
            )}
          </Box>

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
              {isSubmitting ? t("saving") : t("save-configuration")}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
