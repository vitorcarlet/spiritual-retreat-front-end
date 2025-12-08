"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  FormHelperText,
  Avatar,
  Typography,
  Divider,
  Tabs,
  Tab,
  Grid,
  Chip,
  Tooltip,
} from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import apiClient from "@/src/lib/axiosClientInstance";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

import {
  participantSchema,
  PARTICIPANT_STATUS,
  defaultEmpty,
  ParticipantFormValues,
  mapParticipantToFormValues,
  getStatusColor,
  ParticipantReadOnlyDetails,
  ParticipantPhotoField,
  ParticipantFormTabView,
} from "./participant-form";
import { useContemplationPermissions } from "../hooks/useContemplationPermissions";

export type { ParticipantFormValues };

interface ParticipantFormProps {
  participantId: string | null;
  onSubmit?: (data: ParticipantFormValues) => Promise<void> | void;
  loading?: boolean;
  submitLabel?: string;
  disabled?: boolean;
  retreatId: string;
  menuMode?: "view" | "edit" | null;
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  participantId,
  onSubmit,
  loading = false,
  submitLabel = "Salvar",
  disabled = true,
  retreatId,
  menuMode = "view",
}) => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoadingParticipant, setIsLoadingParticipant] = useState(false);
  const hasParticipant = Boolean(participant?.id);
  const [tab, setTab] = useState<"details" | "form">("details");
  const [isEditing, setIsEditing] = useState(() => !disabled);
  const { canEditRetreat } = useContemplationPermissions();
  const menuModeBoolean = menuMode === "edit" ? true : false;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantSchema),
    defaultValues: defaultEmpty,
    mode: "onBlur",
  });

  useEffect(() => {
    if (!participantId) {
      setParticipant(null);
      reset(defaultEmpty);
      return;
    }

    const fetchParticipant = async () => {
      setIsLoadingParticipant(true);
      try {
        const response = await apiClient.get<Participant>(
          `/Registrations/${participantId}`
        );
        setParticipant(response.data);
        reset(mapParticipantToFormValues(response.data));
      } catch (error) {
        console.error("Erro ao resgatar participante:", error);
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ??
            error.message)
          : "Erro ao carregar dados do participante.";
        enqueueSnackbar(message, {
          variant: "error",
          autoHideDuration: 4000,
        });
      } finally {
        setIsLoadingParticipant(false);
      }
    };

    fetchParticipant();
  }, [participantId, reset]);

  useEffect(() => {
    setIsEditing(!disabled);
  }, [disabled]);

  useEffect(() => {
    if (!hasParticipant) {
      setTab("details");
    }
  }, [hasParticipant]);

  const submitting = loading || isSubmitting;
  const isFormLocked = !isEditing;

  const watchedPhoto = watch("photoUrl");

  const currentAvatarSrc = useMemo(() => {
    if (typeof watchedPhoto === "string" && watchedPhoto) {
      return watchedPhoto;
    }
    if (typeof participant?.photoUrl === "string" && participant.photoUrl) {
      return participant.photoUrl;
    }
    return undefined;
  }, [participant?.photoUrl, watchedPhoto]);

  const submit: SubmitHandler<ParticipantFormValues> = async (data) => {
    if (participant?.id && !data.id) {
      data.id = participant.id;
    }
    await onSubmit?.(data);
  };

  const hasAvatar = Boolean(currentAvatarSrc);

  const handleToggleEdit = useCallback(() => {
    if (isEditing && participant) {
      reset(mapParticipantToFormValues(participant));
    }
    setIsEditing((prev) => !prev);
  }, [isEditing, participant, reset]);

  if (isLoadingParticipant) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <Typography>Carregando dados do participante...</Typography>
      </Box>
    );
  }

  return (
    <Stack sx={{ margin: "0 auto", width: "100%" }} spacing={3}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={currentAvatarSrc}
            alt={participant?.name || "Participant"}
            sx={{ width: 64, height: 64 }}
          >
            {participant?.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {participant ? "Editar Participante" : "Novo Participante"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {participant
                ? "Atualize os dados necessários"
                : "Preencha os campos abaixo"}
            </Typography>
            {participant && (
              <Chip
                label={PARTICIPANT_STATUS[participant.status]}
                color={getStatusColor(participant.status)}
                size="small"
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
        </Stack>
        <Tooltip
          title={
            !canEditRetreat
              ? "Você não tem permissão para editar este participante"
              : !menuModeBoolean
                ? "Mude para modo de edição no retiro para editar"
                : ""
          }
          disableHoverListener={canEditRetreat && menuModeBoolean}
        >
          <span>
            <Button
              variant={isEditing ? "outlined" : "contained"}
              onClick={handleToggleEdit}
              disabled={
                loading || isSubmitting || !canEditRetreat || !menuModeBoolean
              }
            >
              {isEditing ? "Cancelar edição" : "Ativar edição"}
            </Button>
          </span>
        </Tooltip>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="fullWidth"
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Tab value="details" label="Dados do participante" />
        <Tab
          value="form"
          label="Formulário respondido"
          disabled={!hasParticipant}
        />
      </Tabs>

      {tab === "details" && (
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(submit)}
          sx={{ width: "100%" }}
        >
          <Stack spacing={3}>
            <Divider />

            <Typography variant="subtitle2" color="text.secondary">
              Dados Pessoais
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome"
                      required
                      fullWidth
                      disabled={submitting || isFormLocked}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="CPF"
                      required
                      fullWidth
                      disabled={submitting || isFormLocked}
                      error={!!errors.cpf}
                      helperText={errors.cpf?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="email"
                      label="Email"
                      required
                      fullWidth
                      disabled={submitting || isFormLocked}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telefone"
                      fullWidth
                      disabled={submitting || isFormLocked}
                      error={!!errors.phone}
                      helperText={errors.phone?.message || "Opcional"}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Cidade"
                      fullWidth
                      disabled={submitting || isFormLocked}
                      error={!!errors.city}
                      helperText={errors.city?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="profession"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Profissão/Atividade"
                      fullWidth
                      disabled={submitting || isFormLocked}
                      error={!!errors.profession}
                      helperText={errors.profession?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="subtitle2" color="text.secondary">
              Status e Controle
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.status}
                      disabled={submitting || isFormLocked}
                    >
                      <InputLabel>Status</InputLabel>
                      <Select
                        {...field}
                        label="Status"
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        {Object.entries(PARTICIPANT_STATUS).map(
                          ([key, label]) => (
                            <MenuItem key={key} value={key}>
                              {label}
                            </MenuItem>
                          )
                        )}
                      </Select>
                      <FormHelperText>{errors.status?.message}</FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="enabled"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          color="primary"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          disabled={submitting || isFormLocked}
                        />
                      }
                      label="Inscrição ativa"
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="subtitle2" color="text.secondary">
              Foto do Participante
            </Typography>

            <Controller
              name="photoUrl"
              control={control}
              render={({ field }) => (
                <ParticipantPhotoField
                  value={field.value}
                  onChange={field.onChange}
                  disabled={submitting || isFormLocked}
                  errorMessage={errors.photoUrl?.message}
                  helperText={
                    hasAvatar
                      ? "A foto atual pode ser substituída ao enviar uma nova imagem."
                      : "Opcional. Formatos sugeridos: PNG, JPG ou WEBP."
                  }
                  participantId={participant?.id}
                />
              )}
            />

            {participant && (
              <>
                <Divider />
                <ParticipantReadOnlyDetails participant={participant} />
              </>
            )}

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                type="button"
                disabled={submitting || !isDirty || isFormLocked}
                onClick={() =>
                  participant
                    ? reset(mapParticipantToFormValues(participant))
                    : reset(defaultEmpty)
                }
              >
                Descartar alterações
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={submitting || !isDirty || isFormLocked}
              >
                {submitting ? "Salvando..." : submitLabel}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      {tab === "form" && participant?.id && (
        <ParticipantFormTabView
          retreatId={retreatId}
          participantId={participant.id}
          participant={participant}
        />
      )}
    </Stack>
  );
};

export default ParticipantForm;
