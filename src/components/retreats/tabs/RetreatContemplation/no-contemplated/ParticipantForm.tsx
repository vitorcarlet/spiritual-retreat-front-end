"use client";

import React from "react";
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
} from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type ParticipantFormValues = z.infer<typeof participantSchema>;

interface ParticipantFormProps {
  participant?: ContemplatedParticipant | null;
  onSubmit?: (data: ParticipantFormValues) => Promise<void> | void;
  loading?: boolean;
  submitLabel?: string;
}

const defaultEmpty: ParticipantFormValues = {
  name: "",
  email: "",
  phone: "",
  status: "not_contemplated",
  activity: "",
  paymentStatus: "pending",
  participation: false,
  photoUrl: "",
};

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  participant,
  onSubmit,
  loading = false,
  submitLabel = "Salvar",
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantSchema),
    defaultValues: participant
      ? {
          ...participant,
          photoUrl: participant.photoUrl ?? "",
        }
      : defaultEmpty,
    mode: "onBlur",
  });

  const submitting = loading || isSubmitting;

  const submit: SubmitHandler<ParticipantFormValues> = async (data) => {
    // Preserve id if coming as prop but absent in data (optional)
    if (participant?.id && !data.id) {
      data.id = participant.id;
    }
    await onSubmit?.(data);
  };

  const hasAvatar = !!participant?.photoUrl;

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(submit)}
      sx={{ width: "100%", maxWidth: 640 }}
    >
      <Stack spacing={3}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={participant?.photoUrl}
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
        </Stack>

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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
                disabled={submitting}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  {...field}
                  label="Status"
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <MenuItem value="contemplated">Contemplado</MenuItem>
                  <MenuItem value="not_contemplated">Não contemplado</MenuItem>
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
                disabled={submitting}
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
                <FormHelperText>{errors.paymentStatus?.message}</FormHelperText>
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
                  disabled={submitting}
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
            <TextField
              {...field}
              label="URL da Foto"
              fullWidth
              disabled={submitting}
              error={!!errors.photoUrl}
              helperText={
                errors.photoUrl?.message ||
                (hasAvatar
                  ? "Foto atual pode ser substituída"
                  : "Opcional (URL)")
              }
            />
          )}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            type="button"
            disabled={submitting || !isDirty}
            onClick={() =>
              reset(
                participant
                  ? { ...participant, photoUrl: participant.photoUrl ?? "" }
                  : defaultEmpty
              )
            }
          >
            Resetar
          </Button>
          <Button variant="contained" type="submit" disabled={submitting}>
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ParticipantForm;
