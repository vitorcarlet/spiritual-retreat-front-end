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

interface ServiceTeamDetailsProps {
  space: ServiceSpace;
  retreatId: string;
  canEdit: boolean;
  startInEdit?: boolean;
  onClose?: () => void;
  onUpdated?: (space: ServiceSpace) => void;
}

interface UpdateServiceSpacePayload {
  name?: string;
  description?: string;
  minMembers?: number;
  coordinator?: ServiceSpaceMember | null;
  viceCoordinator?: ServiceSpaceMember | null;
}

interface ServiceSpaceFormState {
  name: string;
  description: string;
  minMembers: string;
  coordinatorId: string | null;
  viceCoordinatorId: string | null;
}

export default function ServiceTeamDetails({
  space,
  retreatId,
  canEdit,
  startInEdit = false,
  onClose,
  onUpdated,
}: ServiceTeamDetailsProps) {
  const t = useTranslations("service-team-details");
  const [isEditing, setIsEditing] = useState(startInEdit && canEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [spaceState, setSpaceState] = useState<ServiceSpace>(space);
  const [formValues, setFormValues] = useState<ServiceSpaceFormState>(() => ({
    name: space.name,
    description: space.description ?? "",
    minMembers: String(space.minMembers ?? 1),
    coordinatorId: space.coordinator?.id ?? null,
    viceCoordinatorId: space.viceCoordinator?.id ?? null,
  }));

  useEffect(() => {
    setSpaceState(space);
    setFormValues({
      name: space.name,
      description: space.description ?? "",
      minMembers: String(space.minMembers ?? 1),
      coordinatorId: space.coordinator?.id ?? null,
      viceCoordinatorId: space.viceCoordinator?.id ?? null,
    });
    setIsEditing(startInEdit && canEdit);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [space, startInEdit, canEdit]);

  const members = useMemo(() => spaceState.members ?? [], [spaceState.members]);
  const membersById = useMemo(() => {
    const map = new Map<string, ServiceSpaceMember>();
    members.forEach((member) => map.set(member.id, member));
    return map;
  }, [members]);

  const coordinatorName = useMemo(() => {
    return (
      spaceState.coordinator?.name ??
      t("coordinator.unassigned", { defaultMessage: "Not assigned" })
    );
  }, [spaceState.coordinator, t]);

  const viceCoordinatorName = useMemo(() => {
    return (
      spaceState.viceCoordinator?.name ??
      t("viceCoordinator.unassigned", { defaultMessage: "Not assigned" })
    );
  }, [spaceState.viceCoordinator, t]);

  const handleToggleEdit = () => {
    if (!canEdit) return;
    setIsEditing((prev) => !prev);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFormValues({
      name: spaceState.name,
      description: spaceState.description ?? "",
      minMembers: String(spaceState.minMembers ?? 1),
      coordinatorId: spaceState.coordinator?.id ?? null,
      viceCoordinatorId: spaceState.viceCoordinator?.id ?? null,
    });
  };

  const handleTextChange =
    (field: keyof ServiceSpaceFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormValues((prev) => ({ ...prev, [field]: value }));
    };

  const handleCoordinatorChange = (
    field: "coordinatorId" | "viceCoordinatorId",
    member: ServiceSpaceMember | null
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: member?.id ?? null }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: UpdateServiceSpacePayload = {
        name: formValues.name.trim(),
        description: formValues.description.trim(),
      };

      const minMembersNumber = Number(formValues.minMembers);
      if (!Number.isNaN(minMembersNumber) && minMembersNumber > 0) {
        payload.minMembers = minMembersNumber;
      }

      if (formValues.coordinatorId !== undefined) {
        payload.coordinator = formValues.coordinatorId
          ? (membersById.get(formValues.coordinatorId) ?? null)
          : null;
      }

      if (formValues.viceCoordinatorId !== undefined) {
        payload.viceCoordinator = formValues.viceCoordinatorId
          ? (membersById.get(formValues.viceCoordinatorId) ?? null)
          : null;
      }

      const response = await handleApiResponse<RequestResponse<ServiceSpace>>(
        await sendRequestServerVanilla.put(
          `/retreats/${retreatId}/service-spaces/${spaceState.id}`,
          payload
        )
      );

      if (!response?.success || !response.data?.data) {
        throw new Error(
          response.error ||
            t("errors.update", {
              defaultMessage: "Unable to update service space",
            })
        );
      }

      const updatedSpace = response.data.data;

      setSpaceState(updatedSpace);
      setFormValues({
        name: updatedSpace.name,
        description: updatedSpace.description ?? "",
        minMembers: String(updatedSpace.minMembers ?? 1),
        coordinatorId: updatedSpace.coordinator?.id ?? null,
        viceCoordinatorId: updatedSpace.viceCoordinator?.id ?? null,
      });
      setSuccessMessage(
        t("messages.updateSuccess", {
          defaultMessage: "Service space updated successfully",
        })
      );
      setIsEditing(false);
      onUpdated?.(updatedSpace);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("errors.update", {
              defaultMessage: "Unable to update service space",
            });
      setErrorMessage(message);
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
            {t("sections.general", { defaultMessage: "General information" })}
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box flex={1}>
              {isEditing ? (
                <TextField
                  label={t("fields.name", {
                    defaultMessage: "Service space name",
                  })}
                  fullWidth
                  value={formValues.name}
                  onChange={handleTextChange("name")}
                  required
                />
              ) : (
                <InfoRow
                  label={t("fields.name", {
                    defaultMessage: "Service space name",
                  })}
                  value={spaceState.name}
                />
              )}
            </Box>
            <Box flex={1}>
              {isEditing ? (
                <TextField
                  label={t("fields.minMembers", {
                    defaultMessage: "Minimum members",
                  })}
                  fullWidth
                  inputProps={{ inputMode: "numeric", pattern: "\\d*", min: 1 }}
                  value={formValues.minMembers}
                  onChange={handleTextChange("minMembers")}
                />
              ) : (
                <InfoRow
                  label={t("fields.minMembers", {
                    defaultMessage: "Minimum members",
                  })}
                  value={String(spaceState.minMembers ?? 1)}
                />
              )}
            </Box>
          </Stack>
          <Box mt={2}>
            {isEditing ? (
              <TextField
                label={t("fields.description", {
                  defaultMessage: "Description",
                })}
                fullWidth
                multiline
                minRows={3}
                value={formValues.description}
                onChange={handleTextChange("description")}
              />
            ) : (
              <InfoRow
                label={t("fields.description", {
                  defaultMessage: "Description",
                })}
                value={
                  spaceState.description ||
                  t("messages.noDescription", {
                    defaultMessage: "No description provided",
                  })
                }
              />
            )}
          </Box>
        </Box>

        <Divider />

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t("sections.coordinator", { defaultMessage: "Coordinator" })}
            </Typography>
            {isEditing ? (
              <Autocomplete
                options={members}
                getOptionLabel={(option) => option.name}
                value={
                  members.find(
                    (member) => member.id === formValues.coordinatorId
                  ) ?? null
                }
                isOptionEqualToValue={(option, value) =>
                  value ? option.id === value.id : false
                }
                onChange={(_, member) =>
                  handleCoordinatorChange("coordinatorId", member)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t("placeholders.selectMember", {
                      defaultMessage: "Select a member",
                    })}
                  />
                )}
                noOptionsText={t("messages.noMembers", {
                  defaultMessage: "No members available",
                })}
              />
            ) : (
              <InfoRow
                label={t("fields.coordinator", {
                  defaultMessage: "Coordinator",
                })}
                value={coordinatorName}
              />
            )}
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t("sections.viceCoordinator", {
                defaultMessage: "Vice coordinator",
              })}
            </Typography>
            {isEditing ? (
              <Autocomplete
                options={members}
                getOptionLabel={(option) => option.name}
                value={
                  members.find(
                    (member) => member.id === formValues.viceCoordinatorId
                  ) ?? null
                }
                isOptionEqualToValue={(option, value) =>
                  value ? option.id === value.id : false
                }
                onChange={(_, member) =>
                  handleCoordinatorChange("viceCoordinatorId", member)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t("placeholders.selectMember", {
                      defaultMessage: "Select a member",
                    })}
                  />
                )}
                noOptionsText={t("messages.noMembers", {
                  defaultMessage: "No members available",
                })}
              />
            ) : (
              <InfoRow
                label={t("fields.viceCoordinator", {
                  defaultMessage: "Vice coordinator",
                })}
                value={viceCoordinatorName}
              />
            )}
          </Box>
        </Stack>

        <Divider />

        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
            mb={1}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {t("sections.members", { defaultMessage: "Members" })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("labels.memberCount", {
                defaultMessage: "{count} members",
                count: members.length,
              })}
            </Typography>
          </Stack>
          {members.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("messages.noMembers", {
                defaultMessage: "No members assigned yet",
              })}
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
                        {member.phone && (
                          <Typography variant="caption" color="text.secondary">
                            {member.phone}
                          </Typography>
                        )}
                        {member.role && (
                          <Chip
                            label={t(`roles.${member.role}`, {
                              defaultMessage:
                                member.role === "support"
                                  ? "Support"
                                  : member.role === "vice"
                                    ? "Vice coordinator"
                                    : member.role === "coordinator"
                                      ? "Coordinator"
                                      : "Member",
                            })}
                            size="small"
                          />
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

        <Stack direction="row" justifyContent="flex-end" spacing={2} mb={2}>
          <Button
            variant="outlined"
            onClick={() => onClose?.()}
            startIcon={<Iconify icon="solar:arrow-left-bold" />}
          >
            {t("actions.close", { defaultMessage: "Close" })}
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
                  {t("actions.cancel", { defaultMessage: "Cancel" })}
                </Button>
              )}
              <Button
                variant="contained"
                color={isEditing ? "primary" : "info"}
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
                disabled={isSaving || formValues.name.trim().length === 0}
              >
                {isEditing
                  ? t("actions.save", { defaultMessage: "Save" })
                  : t("actions.edit", { defaultMessage: "Edit" })}
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
