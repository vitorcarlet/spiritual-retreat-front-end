"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import Iconify from "@/src/components/Iconify";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";

interface TentDetailsProps {
  tent: RetreatTent;
  retreatId: string;
  canEdit: boolean;
  startInEdit?: boolean;
  onClose?: () => void;
  onUpdated?: (tent: RetreatTent) => void;
}

interface UpdateTentPayload {
  gender: "male" | "female";
  capacity: number;
  notes?: string;
}

export default function TentDetails({
  tent,
  retreatId,
  canEdit,
  startInEdit = false,
  onClose,
  onUpdated,
}: TentDetailsProps) {
  const t = useTranslations("tent-details");
  const [isEditing, setIsEditing] = useState(startInEdit && canEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tentState, setTentState] = useState<RetreatTent>(tent);
  const [formValues, setFormValues] = useState<UpdateTentPayload>({
    gender: tent.gender === "female" ? "female" : "male",
    capacity: tent.capacity,
    notes: tent.notes ?? "",
  });

  useEffect(() => {
    setTentState(tent);
    setFormValues({
      gender: tent.gender === "female" ? "female" : "male",
      capacity: tent.capacity,
      notes: tent.notes ?? "",
    });
    setIsEditing(startInEdit && canEdit);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [tent, startInEdit, canEdit]);

  const handleToggleEdit = () => {
    if (!canEdit) return;
    setIsEditing((prev) => !prev);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFormValues({
      gender: tentState.gender === "female" ? "female" : "male",
      capacity: tentState.capacity,
      notes: tentState.notes ?? "",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: UpdateTentPayload = {
        gender: formValues.gender,
        capacity: Number(formValues.capacity),
        notes: formValues.notes?.trim() || undefined,
      };

      const response = await handleApiResponse<RetreatTent>(
        await sendRequestServerVanilla.put(
          `/retreats/${retreatId}/tents/${tentState.id}`,
          payload
        )
      );

      if (!response?.success || !response.data) {
        throw new Error(response.error || t("update-error"));
      }

      const updatedTent = response.data;

      setTentState(updatedTent);
      setFormValues({
        gender: updatedTent.gender === "female" ? "female" : "male",
        capacity: updatedTent.capacity,
        notes: updatedTent.notes ?? "",
      });
      setSuccessMessage(t("update-success"));
      setIsEditing(false);
      onUpdated?.(updatedTent);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("update-error");
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const participants = tentState.participants ?? [];

  const initialsFromName = (name?: string | null) => {
    if (!name) return "?";

    const initials = name
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return initials || "?";
  };

  return (
    <Box sx={{ width: "100%", minHeight: 300 }}>
      <Stack spacing={1} mt={2}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            marginBottom={2}
          >
            {t("general-info")}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <InfoRow label={t("number-label")} value={tentState.number} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {isEditing ? (
                <FormControl fullWidth>
                  <InputLabel>{t("gender-label")}</InputLabel>
                  <Select
                    value={formValues.gender}
                    label={t("gender-label")}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        gender:
                          event.target.value === "female" ? "female" : "male",
                      }))
                    }
                  >
                    <MenuItem value="male">{t("gender.male")}</MenuItem>
                    <MenuItem value="female">{t("gender.female")}</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <InfoRow
                  label={t("gender-label")}
                  value={t(
                    formValues.gender === "female"
                      ? "gender.female"
                      : "gender.male"
                  )}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {isEditing ? (
                <TextField
                  label={t("capacity-label")}
                  type="number"
                  fullWidth
                  value={formValues.capacity}
                  inputProps={{ min: 1 }}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      capacity: Number(event.target.value) || 0,
                    }))
                  }
                  required
                />
              ) : (
                <InfoRow
                  label={t("capacity-label")}
                  value={String(formValues.capacity)}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12 }}>
              {isEditing ? (
                <TextField
                  label={t("notes-label")}
                  fullWidth
                  multiline
                  minRows={3}
                  value={formValues.notes ?? ""}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                />
              ) : (
                <InfoRow
                  label={t("notes-label")}
                  value={tentState.notes || t("no-notes")}
                />
              )}
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
            mb={1}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {t("participants-title")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("participant-count", { count: participants.length })}
            </Typography>
          </Stack>
          {participants.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("no-participants")}
            </Typography>
          ) : (
            <List disablePadding>
              {participants.map((participant) => (
                <ListItem
                  key={participant.id}
                  alignItems="flex-start"
                  disableGutters
                >
                  <ListItemAvatar>
                    <Avatar>{initialsFromName(participant.name)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={participant.name}
                    secondary={
                      <>
                        {participant.email && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {participant.email}
                          </Typography>
                        )}
                        {participant.city && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {participant.city}
                          </Typography>
                        )}
                        {participant.phone && (
                          <Typography variant="caption" color="text.secondary">
                            {participant.phone}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Divider />

        <Stack direction="row" justifyContent="flex-end" spacing={2} mb={2}>
          <Button
            variant="outlined"
            onClick={() => onClose?.()}
            startIcon={<Iconify icon="solar:arrow-left-bold" />}
          >
            {t("close")}
          </Button>
          {canEdit && (
            <Stack direction="row" spacing={1}>
              {isEditing && (
                <Button
                  variant="outlined"
                  onClick={handleToggleEdit}
                  startIcon={<Iconify icon="solar:close-circle-bold" />}
                  disabled={isSaving}
                >
                  {t("cancel-edit")}
                </Button>
              )}
              <Button
                variant="contained"
                color={isEditing ? "info" : "primary"}
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    handleToggleEdit();
                  }
                }}
                startIcon={
                  isSaving ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : isEditing ? (
                    <Iconify icon="solar:diskette-bold" />
                  ) : (
                    <Iconify icon="solar:pen-bold" />
                  )
                }
                disabled={isSaving || formValues.capacity < 1}
              >
                {isEditing ? t("save") : t("edit")}
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Stack>
  );
}
