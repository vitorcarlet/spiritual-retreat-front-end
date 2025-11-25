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
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import Iconify from "@/src/components/Iconify";
import apiClient from "@/src/lib/axiosClientInstance";

interface TentDetailsProps {
  tentId: string;
  retreatId: string;
  tent: RetreatTentRoster;
  canEdit: boolean;
  startInEdit?: boolean;
  onClose?: () => void;
  onUpdated?: (tent: RetreatTentDetails) => void;
}

interface RetreatTentDetails {
  tentId: string;
  retreatId: string;
  number: string;
  category: number;
  capacity: number;
  isActive: boolean;
  isLocked: boolean;
  notes?: string;
  assignedCount: number;
  gender?: "Male" | "Female";
  members?: Array<{
    registrationId: string;
    name?: string;
    email?: string;
    city?: string;
    phone?: string;
  }>;
}

interface UpdateTentPayload {
  gender?: "Male" | "Female";
  capacity: number;
  notes?: string;
}

export default function TentDetails({
  tentId,
  tent: tentProp,
  retreatId,
  canEdit,
  startInEdit = false,
  onClose,
  onUpdated,
}: TentDetailsProps) {
  const t = useTranslations("tent-details");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(startInEdit && canEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tentState, setTentState] = useState<RetreatTentDetails | null>(null);
  const [formValues, setFormValues] = useState<UpdateTentPayload>({
    gender: "Male",
    capacity: 0,
    notes: "",
  });

  // Fetch tent details on component mount
  useEffect(() => {
    const fetchTentDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<RetreatTentDetails>(
          `/retreats/${retreatId}/tents/${tentId}`
        );

        const tent = response.data;
        setTentState({ ...tent, members: tentProp.members || [] });
        setFormValues({
          gender: tent.gender ?? "Male",
          capacity: tent.capacity,
          notes: tent.notes ?? "",
        });
        setIsEditing(startInEdit && canEdit);
        setErrorMessage(null);
        setSuccessMessage(null);
      } catch (error) {
        console.error("Error fetching tent details:", error);
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ??
            error.message)
          : t("load-error");
        setErrorMessage(message);
        enqueueSnackbar(message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchTentDetails();
  }, [tentId, retreatId, startInEdit, canEdit, t, tentProp.members]);

  const handleToggleEdit = () => {
    if (!canEdit || !tentState) return;
    setIsEditing((prev) => !prev);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isEditing) {
      // Resetting form when canceling edit
      setFormValues({
        gender: tentState.gender ?? "Male",
        capacity: tentState.capacity,
        notes: tentState.notes ?? "",
      });
    }
  };

  const handleSave = async () => {
    if (!tentState) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: UpdateTentPayload = {
        gender: formValues.gender,
        capacity: Number(formValues.capacity),
        notes: formValues.notes?.trim() || undefined,
      };

      const response = await apiClient.put<RetreatTentDetails>(
        `/retreats/${retreatId}/tents/${tentId}`,
        payload
      );

      const updatedTent = response.data;

      setTentState(updatedTent);
      setFormValues({
        gender: updatedTent.gender ?? "Male",
        capacity: updatedTent.capacity,
        notes: updatedTent.notes ?? "",
      });
      setSuccessMessage(t("update-success"));
      setIsEditing(false);
      onUpdated?.(updatedTent);

      enqueueSnackbar(t("update-success"), { variant: "success" });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : t("update-error");
      setErrorMessage(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleRemoveParticipant = async (
    participantId: string,
    participantName?: string
  ) => {
    const confirmed = confirm(
      `${t("confirm-remove-participant", { defaultMessage: "Remove participant?" })} "${participantName}"`
    );

    if (!confirmed) return;

    try {
      await apiClient.post(`/retreats/${retreatId}/tents/roster/unassign`, {
        registrationId: participantId,
      });

      // Remove participant immediately from state
      setTentState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: (prev.members ?? []).filter(
            (m) => m.registrationId !== participantId
          ),
          assignedCount: Math.max(0, (prev.assignedCount ?? 0) - 1),
        };
      });

      enqueueSnackbar(
        `${participantName} ${t("participant-removed", { defaultMessage: "removed from tent." })}`,
        { variant: "success" }
      );

      // Notify parent component to invalidate queries
      onUpdated?.(tentState!);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : t("remove-error", {
            defaultMessage: "Failed to remove participant.",
          });
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!tentState) {
    return (
      <Box sx={{ width: "100%", minHeight: 300 }}>
        <Alert severity="error">{t("load-error")}</Alert>
      </Box>
    );
  }

  const members = tentState.members ?? [];

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
                          event.target.value === "Female" ? "Female" : "Male",
                      }))
                    }
                  >
                    <MenuItem value="Male">{t("gender.male")}</MenuItem>
                    <MenuItem value="Female">{t("gender.female")}</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <InfoRow
                  label={t("gender-label")}
                  value={t(
                    formValues.gender === "Female"
                      ? "gender.Female"
                      : "gender.Male"
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
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoRow
                label={t("active-label", { defaultMessage: "Status" })}
                value={
                  tentState.isActive
                    ? t("active", { defaultMessage: "Active" })
                    : t("inactive", { defaultMessage: "Inactive" })
                }
              />
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
              {t("participant-count", { count: members.length })}
            </Typography>
          </Stack>
          {members.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("no-participants")}
            </Typography>
          ) : (
            <List disablePadding>
              {members.map((participant) => (
                <ListItem
                  key={participant.registrationId}
                  alignItems="flex-start"
                  disableGutters
                  secondaryAction={
                    canEdit &&
                    isEditing && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        }
                        onClick={() =>
                          handleRemoveParticipant(
                            participant.registrationId,
                            participant.name
                          )
                        }
                        sx={{ minWidth: "auto" }}
                      >
                        {t("remove")}
                      </Button>
                    )
                  }
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
