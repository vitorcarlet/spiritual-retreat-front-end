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
  tentsDataArray: RetreatTentRoster[];
  onSuccess: () => void;
}

interface ParticipantRequest {
  retreatId: string;
  items: Participant[];
}

interface Participant {
  registrationId: string;
  name: string;
  gender: "Male" | "Female";
  city: string;
}

interface TentRosterResponse {
  version: number;
  tents: Array<{
    tentId: string;
    number: string;
    category: string;
    capacity: number;
    isLocked: boolean;
    members: Array<{
      registrationId: string;
      name: string;
      gender: string;
      city: string;
      position: number;
    }>;
  }>;
}

const addParticipantSchema = z.object({
  tentId: z.string().min(1, "Selecione uma barraca"),
  participantIds: z
    .array(z.string())
    .min(1, "Selecione pelo menos um participante"),
});

type AddParticipantData = z.infer<typeof addParticipantSchema>;

export default function AddParticipantToFamilyForm({
  retreatId,
  tentsDataArray: tents,
  onSuccess,
}: AddParticipantToFamilyFormProps) {
  const t = useTranslations();
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<AddParticipantData>({
    resolver: zodResolver(addParticipantSchema),
    defaultValues: {
      tentId: "",
      participantIds: [],
    },
  });

  const tentId = watch("tentId");

  // Buscar participantes disponíveis
  useEffect(() => {
    const fetchParticipants = async () => {
      setLoadingParticipants(true);
      try {
        const response = await apiClient.get<ParticipantRequest>(
          `/retreats/${retreatId}/tents/roster/unassigned`
        );

        setParticipants(response.data.items || []);
      } catch (error) {
        console.error("Erro ao buscar participantes:", error);
        setParticipants([]);
      } finally {
        setLoadingParticipants(false);
      }
    };

    fetchParticipants();
  }, [retreatId]);

  const selectedTent = tents.find((f) => String(f.tentId) === tentId);
  const availableParticipants = participants;

  const onSubmit = async (data: AddParticipantData) => {
    try {
      // Fetch current tent roster to get existing members
      const rosterResponse = await apiClient.get<TentRosterResponse>(
        `/retreats/${retreatId}/tents/roster`
      );

      const tentData = rosterResponse.data.tents.find(
        (tent) => String(tent.tentId) === data.tentId
      );

      if (!tentData) {
        enqueueSnackbar("Barraca não encontrada", { variant: "error" });
        return;
      }

      // Combine existing members with new participant IDs
      const existingMembers = tentData.members.map((member) => ({
        registrationId: member.registrationId,
        position: member.position,
      }));

      const newMembers = data.participantIds
        .filter((id) => !existingMembers.some((m) => m.registrationId === id))
        .map((registrationId, index) => ({
          registrationId,
          position: existingMembers.length + index,
        }));

      const allMembers = [...existingMembers, ...newMembers];

      const payload = {
        retreatId,
        version: rosterResponse.data.version,
        tents: [
          {
            tentId: data.tentId,
            members: allMembers,
          },
        ],
      };

      await apiClient.put(`/retreats/${retreatId}/tents/roster`, payload);

      enqueueSnackbar("Participantes adicionados com sucesso!", {
        variant: "success",
      });

      reset();
      onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar participantes:", error);
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao adicionar participantes.";
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>
          {t("add-participant-description")}
        </Typography>

        <Controller
          name="tentId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth required error={!!errors.tentId}>
              <InputLabel>{t("select-tent")}</InputLabel>
              <Select {...field} label={t("select-tent")}>
                {tents.map((tent) => (
                  <MenuItem key={tent.tentId} value={String(tent.tentId)}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography>{tent.number}</Typography>
                      <Chip
                        size="small"
                        label={`${tent.members?.length || 0}/6`}
                        color={
                          (tent.members?.length || 0) >= 6 ? "error" : "default"
                        }
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {selectedTent && (
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {t("tent-current-members")}:{" "}
                  {selectedTent.members?.length || 0} / 6
                </Typography>
              )}
              {errors.tentId && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.tentId.message}
                </Typography>
              )}
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
                  options={availableParticipants}
                  getOptionLabel={(option) =>
                    `${option.name} (${option.gender})`
                  }
                  value={availableParticipants.filter((p) =>
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
                          {option.gender}
                          {option.city}
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
                  disabled={!tentId}
                  noOptionsText={t("no-participants-available")}
                />
              )}
            />
          )}
        </Box>

        {selectedTent && (selectedTent.members?.length || 0) >= 6 && (
          <Typography variant="body2" color="warning.main">
            ⚠️ {t("tent-full-warning")}
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
