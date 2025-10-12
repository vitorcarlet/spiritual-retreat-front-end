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
} from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ParticipantPublicFormTab from "./ParticipantPublicFormTab";
import SingleImageUpload from "@/src/components/fields/ImageUpload/SingleImageUpload";
import apiClient from "@/src/lib/axiosClientInstance";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,/;

/* Zod schema */
const participantSchema = z.object({
  id: z.number().optional(), // read-only in form if present
  name: z.string().min(2, "Name too short").max(120, "Name too long"),
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[+0-9 ()-]{8,20}$/.test(v), "Invalid phone format"),
  status: z.enum(["contemplated", "not_contemplated"], {
    required_error: "Status required",
  }),
  activity: z.string().min(1, "Activity required").max(120),
  paymentStatus: z.enum(["paid", "pending", "overdue"], {
    required_error: "Payment status required",
  }),
  participation: z.boolean(),
  photoUrl: z
    .union([
      z.string().url("Invalid URL"),
      z.string().regex(dataUrlRegex, "Imagem inválida"),
    ])
    .optional()
    .or(z.literal("").transform(() => undefined))
    .or(z.null()),
});

export type ParticipantFormValues = z.infer<typeof participantSchema>;

interface ParticipantFormProps {
  participantId: string | null;
  onSubmit?: (data: ParticipantFormValues) => Promise<void> | void;
  loading?: boolean;
  submitLabel?: string;
  disabled?: boolean;
  retreatId: string;
}

const defaultEmpty: ParticipantFormValues = {
  name: "",
  email: "",
  phone: "",
  status: "not_contemplated",
  activity: "",
  paymentStatus: "pending",
  participation: false,
  photoUrl: null,
};

const getRetreatParticipant = async (
  participantId: string
): Promise<ContemplatedParticipant | undefined> => {
  try {
    const response = await apiClient.get<ContemplatedParticipant>(
      `/api/Registrations/${participantId}`
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao resgatar participante:", error);
    const message = axios.isAxiosError(error)
      ? ((error.response?.data as { error?: string })?.error ?? error.message)
      : "Erro ao carregar dados do participante.";
    enqueueSnackbar(message, {
      variant: "error",
      autoHideDuration: 4000,
    });
    return undefined;
  }
};

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  participantId,
  onSubmit,
  loading = false,
  submitLabel = "Salvar",
  disabled = true,
  retreatId,
}) => {
  const [participant, setParticipant] =
    useState<ContemplatedParticipant | null>(null);
  const [isLoadingParticipant, setIsLoadingParticipant] = useState(false);
  const hasParticipant = Boolean(participant?.id);
  const [tab, setTab] = useState<"details" | "form">("details");
  const [isEditing, setIsEditing] = useState(() => !disabled);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantSchema),
    defaultValues: participant
      ? {
          ...participant,
          photoUrl: participant.photoUrl ?? null,
        }
      : defaultEmpty,
    mode: "onBlur",
  });

  // Fetch participant data when participantId changes
  useEffect(() => {
    if (participantId) {
      setIsLoadingParticipant(true);
      getRetreatParticipant(participantId)
        .then((data) => {
          if (data) {
            setParticipant(data);
          }
        })
        .finally(() => {
          setIsLoadingParticipant(false);
        });
    } else {
      setParticipant(null);
    }
  }, [participantId]);

  useEffect(() => {
    reset(
      participant
        ? {
            ...participant,
            photoUrl: participant.photoUrl ?? null,
          }
        : defaultEmpty
    );
  }, [participant, reset]);
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
    // Preserve id if coming as prop but absent in data (optional)
    if (participant?.id && !data.id) {
      data.id = participant.id;
    }
    await onSubmit?.(data);
  };

  const hasAvatar = Boolean(currentAvatarSrc);

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
          </Box>
        </Stack>
        <Button
          variant={isEditing ? "outlined" : "contained"}
          onClick={() => {
            if (isSubmitting || loading) return;
            if (isEditing) {
              reset(
                participant
                  ? {
                      ...participant,
                      photoUrl: participant.photoUrl ?? null,
                    }
                  : defaultEmpty
              );
            }
            setIsEditing((prev) => !prev);
          }}
          disabled={loading || isSubmitting}
        >
          {isEditing ? "Cancelar edição" : "Ativar edição"}
        </Button>
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

            {/* Name */}
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

            {/* Email */}
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

            {/* Phone */}
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

            {/* Activity */}
            <Controller
              name="activity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Atividade"
                  required
                  fullWidth
                  disabled={submitting || isFormLocked}
                  error={!!errors.activity}
                  helperText={errors.activity?.message}
                />
              )}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {/* Status */}
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
                      <MenuItem value="contemplated">Contemplado</MenuItem>
                      <MenuItem value="not_contemplated">
                        Não contemplado
                      </MenuItem>
                    </Select>
                    <FormHelperText>{errors.status?.message}</FormHelperText>
                  </FormControl>
                )}
              />

              {/* Payment Status */}
              <Controller
                name="paymentStatus"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.paymentStatus}
                    disabled={submitting || isFormLocked}
                  >
                    <InputLabel>Pagamento</InputLabel>
                    <Select
                      {...field}
                      label="Pagamento"
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <MenuItem value="paid">Pago</MenuItem>
                      <MenuItem value="pending">Pendente</MenuItem>
                      <MenuItem value="overdue">Atrasado</MenuItem>
                    </Select>
                    <FormHelperText>
                      {errors.paymentStatus?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Stack>

            {/* Participation */}
            <Controller
              name="participation"
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
                  label="Participação confirmada"
                />
              )}
            />
            {errors.participation && (
              <Typography variant="caption" color="error">
                {errors.participation.message?.toString()}
              </Typography>
            )}

            {/* Photo URL */}
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
                />
              )}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                type="button"
                disabled={submitting || !isDirty || isFormLocked}
                onClick={() =>
                  reset(
                    participant
                      ? {
                          ...participant,
                          photoUrl: participant.photoUrl ?? null,
                        }
                      : defaultEmpty
                  )
                }
              >
                Resetar
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={submitting || isFormLocked}
              >
                {submitLabel}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      {tab === "form" && participant?.id && (
        <ParticipantPublicFormTab
          retreatId={retreatId}
          participantId={participant.id}
        />
      )}
    </Stack>
  );
};

export default ParticipantForm;

type ParticipantPhotoFieldProps = {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  errorMessage?: string;
  helperText?: string;
};

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Não foi possível processar o arquivo selecionado."));
    };
    reader.onerror = () => {
      reject(new Error("Falha ao ler a imagem. Tente novamente."));
    };
    reader.readAsDataURL(file);
  });
};

const ParticipantPhotoField: React.FC<ParticipantPhotoFieldProps> = ({
  value,
  onChange,
  disabled,
  errorMessage,
  helperText,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const existingImage = useMemo(() => {
    if (typeof value === "string" && value) {
      return { url: value };
    }
    return undefined;
  }, [value]);

  const effectiveHelperText = useMemo(() => {
    if (errorMessage || localError) {
      return undefined;
    }
    return helperText;
  }, [errorMessage, helperText, localError]);

  const effectiveErrorText = useMemo(() => {
    return errorMessage ?? localError ?? undefined;
  }, [errorMessage, localError]);

  const handleFileChange = useCallback(
    async (nextFile: File | null) => {
      if (!nextFile) {
        setLocalError(null);
        onChange(null);
        return;
      }

      setIsProcessing(true);
      try {
        const dataUrl = await readFileAsDataUrl(nextFile);
        setLocalError(null);
        onChange(dataUrl);
      } catch (error) {
        console.error(error);
        setLocalError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a imagem selecionada."
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [onChange]
  );

  const handleRemoveExisting = useCallback(() => {
    setLocalError(null);
    onChange(null);
  }, [onChange]);

  return (
    <SingleImageUpload
      label="Foto do participante"
      variant="avatar"
      size={120}
      value={null}
      existing={existingImage}
      onChange={handleFileChange}
      onRemoveExisting={
        existingImage ? () => handleRemoveExisting() : undefined
      }
      disabled={disabled || isProcessing}
      helperText={effectiveHelperText ?? undefined}
      errorText={effectiveErrorText}
      accept={{ "image/*": [] }}
    />
  );
};
