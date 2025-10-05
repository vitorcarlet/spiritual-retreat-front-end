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
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";

interface AddParticipantToFamilyFormProps {
  retreatId: string;
  families: RetreatFamily[];
  onSuccess: () => void;
}

interface Participant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  location?: string;
  isAssigned?: boolean;
}

const addParticipantSchema = z.object({
  familyId: z.string().min(1, "Selecione uma família"),
  participantIds: z
    .array(z.number())
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
      familyId: "",
      participantIds: [],
      role: "member",
    },
  });

  const familyId = watch("familyId");

  // Buscar participantes disponíveis
  useEffect(() => {
    const fetchParticipants = async () => {
      setLoadingParticipants(true);
      try {
        const response = await handleApiResponse<Participant[]>(
          await sendRequestServerVanilla.get(
            `/retreats/${retreatId}/participants/available`
          )
        );
        if (response.success && response.data) {
          setParticipants(response.data || []);
        }
      } catch (error) {
        console.error("Erro ao buscar participantes:", error);
        setParticipants([]);
      } finally {
        setLoadingParticipants(false);
      }
    };

    fetchParticipants();
  }, [retreatId]);

  const selectedFamily = families.find((f) => String(f.id) === familyId);
  const availableParticipants = participants.filter((p) => !p.isAssigned);

  const onSubmit = async (data: AddParticipantData) => {
    try {
      const payload = {
        familyId: data.familyId,
        participantIds: data.participantIds,
        role: data.role,
      };

      const response = await handleApiResponse(
        await sendRequestServerVanilla.post(
          `/retreats/${retreatId}/families/add-participants`,
          payload
        )
      );

      if (response.success) {
        reset();
        onSuccess();
      } else {
        console.error("Erro ao adicionar participantes:", response.error);
      }
    } catch (error) {
      console.error("Erro ao adicionar participantes:", error);
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
                  options={availableParticipants}
                  getOptionLabel={(option) =>
                    `${option.name} (${option.email})`
                  }
                  value={availableParticipants.filter((p) =>
                    field.value.includes(p.id)
                  )}
                  onChange={(_, newValue) =>
                    field.onChange(newValue.map((p) => p.id))
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
                          {option.age &&
                            ` • ${option.age} anos •` &&
                            option.location}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
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
