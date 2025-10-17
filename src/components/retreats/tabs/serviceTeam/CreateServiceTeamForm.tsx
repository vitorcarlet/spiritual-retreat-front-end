"use client";

import {
  Box,
  TextField,
  Button,
  Stack,
  CircularProgress,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import { MuiColorInput } from "mui-color-input";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

interface CreateServiceTeamFormProps {
  retreatId: string;
  onSuccess: () => void;
}

const HEX_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

const createServiceTeamSchema = z
  .object({
    name: z.string().min(1, "O nome da equipe é obrigatório"),
    description: z.string().max(500, "Descrição muito longa").optional(),
    minMembers: z.coerce
      .number({ invalid_type_error: "Informe um número válido" })
      .min(0, "O mínimo precisa ser positivo"),
    maxMembers: z.coerce
      .number({ invalid_type_error: "Informe um número válido" })
      .min(0, "O máximo precisa ser positivo")
      .optional(),
    isActive: z.boolean({
      required_error: "Informe se a equipe está ativa",
    }),
    color: z.string().regex(HEX_REGEX, "Cor inválida").optional(),
  })
  .refine(
    (data) =>
      data.maxMembers === undefined || data.maxMembers >= data.minMembers,
    {
      path: ["maxMembers"],
      message: "O máximo deve ser maior ou igual ao mínimo",
    }
  );

type CreateServiceTeamData = z.infer<typeof createServiceTeamSchema>;

export default function CreateServiceTeamForm({
  retreatId,
  onSuccess,
}: CreateServiceTeamFormProps) {
  const t = useTranslations("service-team-details");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceTeamData>({
    resolver: zodResolver(createServiceTeamSchema),
    defaultValues: {
      name: "",
      description: "",
      minMembers: 1,
      maxMembers: undefined,
      isActive: true,
      color: "#1976d2",
    },
  });

  const onSubmit = async (formData: CreateServiceTeamData) => {
    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim()?.length
        ? formData.description.trim()
        : null,
      minPeople: formData.minMembers,
      maxPeople: formData.maxMembers ?? null,
      isActive: formData.isActive,
      color: formData.color,
    };

    try {
      await apiClient.post(
        `/api/retreats/${retreatId}/service/spaces`,
        payload
      );

      reset();
      enqueueSnackbar(
        t("messages.createSuccess", {
          defaultMessage: "Service space created successfully!",
        }),
        { variant: "success" }
      );
      onSuccess();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : t("errors.create", {
            defaultMessage: "Unable to create the service space",
          });
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
        <Stack spacing={3}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label={t("fields.name", {
                  defaultMessage: "Service team name",
                })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={3}
                label={t("fields.description", {
                  defaultMessage: "Description",
                })}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Controller
              name="minMembers"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label={t("fields.minMembers", {
                    defaultMessage: "Minimum members",
                  })}
                  inputProps={{ min: 0 }}
                  error={!!errors.minMembers}
                  helperText={errors.minMembers?.message}
                />
              )}
            />

            <Controller
              name="maxMembers"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label={t("fields.maxMembers", {
                    defaultMessage: "Maximum members",
                  })}
                  inputProps={{ min: 0 }}
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                  error={!!errors.maxMembers}
                  helperText={errors.maxMembers?.message}
                />
              )}
            />
          </Stack>

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                }
                label={t("fields.isActive", {
                  defaultMessage: "Active",
                })}
              />
            )}
          />

          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <MuiColorInput
                {...field}
                format="hex"
                label={t("fields.color", {
                  defaultMessage: "Tag color",
                })}
                disableAlpha
                value={field.value ?? ""}
                onChange={(value: string) => field.onChange(value)}
                TextFieldProps={{
                  fullWidth: true,
                  error: !!errors.color,
                  helperText: errors.color?.message,
                }}
              />
            )}
          />

          <Typography variant="body2" color="text.secondary">
            {t("hints.memberLimit", {
              defaultMessage:
                "Use minimum and maximum values to control the team size.",
            })}
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={onSuccess}
              disabled={isSubmitting}
            >
              {t("actions.cancel", { defaultMessage: "Cancel" })}
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
                ? t("loading", { defaultMessage: "Saving..." })
                : t("createSpace.cta", {
                    defaultMessage: "Create new team",
                  })}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
