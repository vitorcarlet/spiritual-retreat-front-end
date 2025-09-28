"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
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

  const leaderEmail = useMemo(() => {
    if (familyState.contactEmail) return familyState.contactEmail;
    return familyState.members?.[0]?.email ?? null;
  }, [familyState]);

  const leaderPhone = useMemo(() => {
    if (familyState.contactPhone) return familyState.contactPhone;
    return familyState.members?.[0]?.phone ?? null;
  }, [familyState]);

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
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            {t("title", { family: familyState.name })}
          </Typography>
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

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
                <TextField
                  label={t("leader-label")}
                  fullWidth
                  value={formValues.contactName ?? ""}
                  onChange={handleChange("contactName")}
                />
              ) : (
                <InfoRow label={t("leader-label")} value={leaderName} />
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {isEditing ? (
                <TextField
                  label={t("email-label")}
                  fullWidth
                  value={formValues.contactEmail ?? ""}
                  onChange={handleChange("contactEmail")}
                />
              ) : (
                <InfoRow
                  label={t("email-label")}
                  value={leaderEmail ?? t("no-email")}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {isEditing ? (
                <TextField
                  label={t("phone-label")}
                  fullWidth
                  value={formValues.contactPhone ?? ""}
                  onChange={handleChange("contactPhone")}
                />
              ) : (
                <InfoRow
                  label={t("phone-label")}
                  value={leaderPhone ?? t("no-phone")}
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
                      <Stack spacing={0.5}>
                        {member.email && (
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        )}
                        {member.city && (
                          <Typography variant="caption" color="text.secondary">
                            {member.city}
                          </Typography>
                        )}
                        {member.phone && (
                          <Typography variant="caption" color="text.secondary">
                            {member.phone}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Divider />

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => onClose?.()}
            startIcon={<Iconify icon="solar:arrow-left-bold" />}
          >
            {t("close")}
          </Button>
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
