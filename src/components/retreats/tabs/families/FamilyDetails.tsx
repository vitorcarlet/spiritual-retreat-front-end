"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
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
import type { RequestResponse } from "@/src/lib/requestServer";

interface FamilyDetailsProps {
  family: RetreatFamily;
  retreatId: string;
  canEdit: boolean;
  startInEdit?: boolean;
  onClose?: () => void;
  onUpdated?: (family: RetreatFamily) => void;
}

interface UpdateFamilyPayload {
  name?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export default function FamilyDetails({
  family,
  retreatId,
  canEdit,
  startInEdit = false,
  onClose,
  onUpdated,
}: FamilyDetailsProps) {
  const t = useTranslations("family-details");
  const [isEditing, setIsEditing] = useState(startInEdit && canEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [familyState, setFamilyState] = useState<RetreatFamily>(family);
  const [formValues, setFormValues] = useState<UpdateFamilyPayload>({
    name: family.name,
    contactName: family.contactName ?? "",
    contactEmail: family.contactEmail ?? "",
    contactPhone: family.contactPhone ?? "",
  });

  useEffect(() => {
    setFamilyState(family);
    setFormValues({
      name: family.name,
      contactName: family.contactName ?? "",
      contactEmail: family.contactEmail ?? "",
      contactPhone: family.contactPhone ?? "",
    });
    setIsEditing(startInEdit && canEdit);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [family, startInEdit, canEdit]);

  const leaderName = useMemo(() => {
    if (familyState.contactName) return familyState.contactName;
    return familyState.members?.[0]?.name ?? t("no-leader");
  }, [familyState, t]);

  const handleToggleEdit = () => {
    if (!canEdit) return;
    setIsEditing((prev) => !prev);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFormValues({
      name: familyState.name,
      contactName: familyState.contactName ?? "",
      contactEmail: familyState.contactEmail ?? "",
      contactPhone: familyState.contactPhone ?? "",
    });
  };

  const handleChange =
    (field: keyof UpdateFamilyPayload) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormValues((prev) => ({ ...prev, [field]: value }));
    };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: UpdateFamilyPayload = {
        name: formValues.name?.trim(),
        contactName: formValues.contactName?.trim() || undefined,
        contactEmail: formValues.contactEmail?.trim() || undefined,
        contactPhone: formValues.contactPhone?.trim() || undefined,
      };

      const response = await handleApiResponse<RequestResponse<RetreatFamily>>(
        await sendRequestServerVanilla.put(
          `/retreats/${retreatId}/families/${familyState.id}`,
          payload
        )
      );

      if (!response?.success || !response.data?.data) {
        throw new Error(response.error || t("update-error"));
      }

      const updatedFamily = response.data.data;

      setFamilyState(updatedFamily);
      setFormValues({
        name: updatedFamily.name,
        contactName: updatedFamily.contactName ?? "",
        contactEmail: updatedFamily.contactEmail ?? "",
        contactPhone: updatedFamily.contactPhone ?? "",
      });
      setSuccessMessage(t("update-success"));
      setIsEditing(false);
      onUpdated?.(updatedFamily);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("update-error");
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const members = familyState.members ?? [];
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
            <Grid size={{ xs: 12, md: 6 }}>
              {isEditing ? (
                <TextField
                  label={t("name-label")}
                  fullWidth
                  value={formValues.name ?? ""}
                  onChange={handleChange("name")}
                  required
                />
              ) : (
                <InfoRow label={t("name-label")} value={familyState.name} />
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {isEditing ? (
                <Autocomplete
                  options={familyState.members ?? []}
                  value={
                    familyState.members?.find(
                      (member) =>
                        member.email === formValues.contactEmail &&
                        member.name === formValues.contactName
                    ) ?? null
                  }
                  getOptionLabel={(option) =>
                    option.email
                      ? `${option.name} (${option.email})`
                      : option.name
                  }
                  onChange={(_, newValue) => {
                    if (newValue) {
                      setFormValues((prev) => ({
                        ...prev,
                        contactName: newValue.name ?? "",
                        contactEmail: newValue.email ?? "",
                        contactPhone: newValue.phone ?? "",
                      }));
                    } else {
                      setFormValues((prev) => ({
                        ...prev,
                        contactName: "",
                        contactEmail: "",
                        contactPhone: "",
                      }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("leader-label")}
                      placeholder={t("search-participants")}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                        {initialsFromName(option.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {option.name ?? t("unknown-name")}
                        </Typography>
                        {option.email && (
                          <Typography variant="caption" color="text.secondary">
                            {option.email}
                          </Typography>
                        )}
                        {option.city && (
                          <Typography variant="caption" color="text.secondary">
                            {` • ${option.city}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  renderTags={(tagValue) =>
                    tagValue.map((option) => (
                      <Chip
                        key={option.id}
                        label={option.name}
                        avatar={
                          <Avatar>
                            {initialsFromName(option.name).charAt(0)}
                          </Avatar>
                        }
                      />
                    ))
                  }
                  disabled={!familyState.members?.length}
                  noOptionsText={t("no-participants-available")}
                />
              ) : (
                <InfoRow label={t("leader-label")} value={leaderName} />
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
              {t("members-title")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("member-count", { count: members.length })}
            </Typography>
          </Stack>
          {members.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("no-members")}
            </Typography>
          ) : (
            <List disablePadding>
              {members.map((member) => (
                <ListItem
                  key={member.id}
                  alignItems="flex-start"
                  disableGutters
                >
                  <ListItemAvatar>
                    <Avatar>{initialsFromName(member.name)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={
                      <>
                        {member.email && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display={"block"}
                          >
                            {member.email}
                          </Typography>
                        )}
                        {member.city && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display={"block"}
                          >
                            {member.city}
                          </Typography>
                        )}
                        {member.phone && (
                          <Typography variant="caption" color="text.secondary">
                            {member.phone}
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
                disabled={isSaving || !formValues.name?.trim()}
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
