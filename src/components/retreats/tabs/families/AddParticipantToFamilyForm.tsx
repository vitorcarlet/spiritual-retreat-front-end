"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Autocomplete,
  Chip,
  Avatar,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

interface AddParticipantToFamilyFormProps {
  retreatId: string;
  families: RetreatFamily[];
  onSuccess: () => void;
}

interface UnassignedParticipant {
  registrationId: string;
  name: string;
  gender: string;
  city: string;
  email: string;
}

interface UnassignedParticipantsResponse {
  items: UnassignedParticipant[];
}

const addParticipantSchema = z.object({
  familyId: z.string().min(1, "Selecione uma família"),
  participantIds: z
    .array(z.string())
    .min(1, "Selecione pelo menos um participante"),
  role: z.enum(["leader", "member"]),
});

type AddParticipantData = z.infer<typeof addParticipantSchema>;

export default function AddParticipantToFamilyForm({
  retreatId,
  families,
  onSuccess,
}: AddParticipantToFamilyFormProps) {
  const t = useTranslations();
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participants, setParticipants] = useState<UnassignedParticipant[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<AddParticipantData>({
    resolver: zodResolver(addParticipantSchema),
    defaultValues: {
      familyId: "",
      participantIds: [],
      role: "member",
    },
  });

  const familyId = watch("familyId");

  // Buscar participantes não atribuídos
  useEffect(() => {
    const fetchParticipants = async () => {
      setLoadingParticipants(true);
      try {
        const response = await apiClient.get<UnassignedParticipantsResponse>(
          `/api/retreats/${retreatId}/families/unassigned`
        );
        setParticipants(response.data.items || []);
      } catch (error) {
        console.error("Erro ao buscar participantes:", error);
        if (axios.isAxiosError(error)) {
          enqueueSnackbar(
            error.response?.data?.message || t("error-loading-participants"),
            { variant: "error" }
          );
        }
        setParticipants([]);
      } finally {
        setLoadingParticipants(false);
      }
    };

    fetchParticipants();
  }, [retreatId, t]);

  const selectedFamily = families.find((f) => String(f.id) === familyId);

  const onSubmit = async (data: AddParticipantData) => {
    try {
      const payload = {
        familyId: data.familyId,
        participantIds: data.participantIds,
        role: data.role,
      };

      await apiClient.post(
        `/api/retreats/${retreatId}/families/add-participants`,
        payload
      );

      enqueueSnackbar(t("participants-added-successfully"), {
        variant: "success",
      });
      reset();
      onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar participantes:", error);
      if (axios.isAxiosError(error)) {
        enqueueSnackbar(
          error.response?.data?.message || t("error-adding-participants"),
          { variant: "error" }
        );
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>
          {t("add-participant-description")}
        </Typography>

        <Controller
          name="familyId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth required error={!!errors.familyId}>
              <InputLabel>{t("select-family")}</InputLabel>
              <Select {...field} label={t("select-family")}>
                {families.map((family) => (
                  <MenuItem key={family.id} value={String(family.id)}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography>{family.name}</Typography>
                      <Chip
                        size="small"
                        label={`${family.members?.length || 0}/6`}
                        color={
                          (family.members?.length || 0) >= 6
                            ? "error"
                            : "default"
                        }
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {selectedFamily && (
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {t("family-current-members")}:{" "}
                  {selectedFamily.members?.length || 0} / 6
                </Typography>
              )}
              {errors.familyId && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.familyId.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>{t("participant-role")}</InputLabel>
              <Select {...field} label={t("participant-role")}>
                <MenuItem value="member">{t("member")}</MenuItem>
                <MenuItem value="leader">{t("leader")}</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t("select-participants")}:
          </Typography>
          {loadingParticipants ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">
                {t("loading-participants")}
              </Typography>
            </Box>
          ) : (
            <Controller
              name="participantIds"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={participants}
                  getOptionLabel={(option) =>
                    `${option.name} (${option.email})`
                  }
                  value={participants.filter((p) =>
                    field.value.includes(p.registrationId)
                  )}
                  onChange={(_, newValue) =>
                    field.onChange(newValue.map((p) => p.registrationId))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={t("search-participants")}
                      helperText={
                        errors.participantIds?.message ||
                        t("participants-helper-text")
                      }
                      error={!!errors.participantIds}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                        {option.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                          {option.city && ` • ${option.city}`}
                          {option.gender && ` • ${option.gender}`}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.registrationId}
                        label={option.name}
                        avatar={
                          <Avatar>{option.name.charAt(0).toUpperCase()}</Avatar>
                        }
                      />
                    ))
                  }
                  disabled={!familyId}
                  noOptionsText={t("no-participants-available")}
                />
              )}
            />
          )}
        </Box>

        {selectedFamily && (selectedFamily.members?.length || 0) >= 6 && (
          <Typography variant="body2" color="warning.main">
            ⚠️ {t("family-full-warning")}
          </Typography>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
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
            disabled={isSubmitting || loadingParticipants}
            startIcon={
              isSubmitting ? <CircularProgress size={16} /> : undefined
            }
          >
            {isSubmitting ? t("adding") : t("add-participants")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
