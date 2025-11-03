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
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import Iconify from "@/src/components/Iconify";
import apiClient from "@/src/lib/axiosClientInstance";

interface ServiceTeamDetailsProps {
  spaceId: string;
  retreatId: string;
  canEdit: boolean;
  startInEdit?: boolean;
  onClose?: () => void;
  onUpdated?: (space: ServiceSpaceDetail) => void;
}

interface ServiceSpaceDetail {
  version: number;
  space: {
    spaceId: string;
    name: string;
    description: string | null;
    isActive: boolean;
    isLocked: boolean;
    minPeople: number;
    maxPeople: number;
    hasCoordinator: boolean;
    hasVice: boolean;
    allocated: number;
  };
  totalMembers: number;
  page: number;
  pageSize: number;
  members: Array<{
    registrationId: string;
    name: string;
    email: string;
    cpf: string;
    role: "Coordinator" | "Vice" | "Member";
  }>;
}

interface ServiceSpaceFormState {
  name: string;
  description: string;
  minPeople: number;
  maxPeople: number;
  coordinatorId: string | null;
  viceCoordinatorId: string | null;
  memberIds: string[]; // IDs dos membros a manter
}

interface ServiceRosterMember {
  registrationId: string;
  name: string;
  role: number;
  position: number;
  city?: string;
}

interface ServiceRosterPayload {
  version: number;
  spaces: Array<{
    spaceId: string;
    name: string;
    description: string | null;
    minPeople: number;
    maxPeople: number;
    isLocked: boolean;
    isActive: boolean;
    members: ServiceRosterMember[];
  }>;
}

const roleStringToNumber = (role: string): number => {
  switch (role.toLowerCase()) {
    case "coordinator":
      return 1;
    case "vice":
      return 2;
    default:
      return 0;
  }
};

export default function ServiceTeamDetails({
  spaceId,
  retreatId,
  canEdit,
  startInEdit = false,
  onClose,
  onUpdated,
}: ServiceTeamDetailsProps) {
  const t = useTranslations("service-team-details");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [spaceState, setSpaceState] = useState<ServiceSpaceDetail | null>(null);
  const [formValues, setFormValues] = useState<ServiceSpaceFormState>({
    name: "",
    description: "",
    minPeople: 0,
    maxPeople: 0,
    coordinatorId: null,
    viceCoordinatorId: null,
    memberIds: [],
  });

  // Fetch space details on mount
  useEffect(() => {
    const fetchSpaceDetails = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await apiClient.get<ServiceSpaceDetail>(
          `/retreats/${retreatId}/service/spaces/${spaceId}`
        );

        const space = response.data;
        setSpaceState(space);

        // Inicializar form com dados da API
        const coordinator = space.members.find((m) => m.role === "Coordinator");
        const viceCoordinator = space.members.find((m) => m.role === "Vice");

        setFormValues({
          name: space.space.name,
          description: space.space.description ?? "",
          minPeople: space.space.minPeople ?? 0,
          maxPeople: space.space.maxPeople ?? 0,
          coordinatorId: coordinator?.registrationId ?? null,
          viceCoordinatorId: viceCoordinator?.registrationId ?? null,
          memberIds: space.members.map((m) => m.registrationId),
        });

        setIsEditing(startInEdit && canEdit);
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ??
            error.message)
          : error instanceof Error
            ? error.message
            : t("errors.load", {
                defaultMessage: "Erro ao carregar equipe de serviço",
              });

        setErrorMessage(message);
        enqueueSnackbar(message, { variant: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpaceDetails();
  }, [spaceId, retreatId, startInEdit, canEdit, t]);

  const members = useMemo(
    () => spaceState?.members ?? [],
    [spaceState?.members]
  );

  // Filtrar membros baseado no state de memberIds
  const activeMembers = useMemo(
    () =>
      members.filter((m) => formValues.memberIds.includes(m.registrationId)),
    [members, formValues.memberIds]
  );

  const coordinatorName = useMemo(() => {
    const coordinator = activeMembers.find((m) => m.role === "Coordinator");
    return (
      coordinator?.name ??
      t("coordinator.unassigned", { defaultMessage: "Não atribuído" })
    );
  }, [activeMembers, t]);

  const viceCoordinatorName = useMemo(() => {
    const viceCoordinator = activeMembers.find((m) => m.role === "Vice");
    return (
      viceCoordinator?.name ??
      t("viceCoordinator.unassigned", { defaultMessage: "Não atribuído" })
    );
  }, [activeMembers, t]);

  const handleToggleEdit = () => {
    if (!canEdit || !spaceState) return;
    setIsEditing((prev) => !prev);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isEditing) {
      // Reset form ao cancelar edição
      const coordinator = members.find((m) => m.role === "Coordinator");
      const viceCoordinator = members.find((m) => m.role === "Vice");

      setFormValues({
        name: spaceState.space.name,
        description: spaceState.space.description ?? "",
        minPeople: spaceState.space.minPeople ?? 0,
        maxPeople: spaceState.space.maxPeople ?? 0,
        coordinatorId: coordinator?.registrationId ?? null,
        viceCoordinatorId: viceCoordinator?.registrationId ?? null,
        memberIds: members.map((m) => m.registrationId),
      });
    }
  };

  const handleTextChange =
    (field: keyof ServiceSpaceFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;

      // Para campos numéricos, converter para número
      if (field === "minPeople" || field === "maxPeople") {
        setFormValues((prev) => ({
          ...prev,
          [field]: Number(value) || 0,
        }));
      } else {
        setFormValues((prev) => ({ ...prev, [field]: value }));
      }
    };

  const handleCoordinatorChange = (
    field: "coordinatorId" | "viceCoordinatorId",
    member: (typeof members)[0] | null
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: member?.registrationId ?? null,
    }));
  };

  const handleRemoveMember = (memberId: string) => {
    setFormValues((prev) => ({
      ...prev,
      memberIds: prev.memberIds.filter((id) => id !== memberId),
      // Remover coordenador se for removido
      coordinatorId:
        prev.coordinatorId === memberId ? null : prev.coordinatorId,
      // Remover vice-coordenador se for removido
      viceCoordinatorId:
        prev.viceCoordinatorId === memberId ? null : prev.viceCoordinatorId,
    }));
  };

  const handleSave = async () => {
    if (!spaceState) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Validar que maxPeople >= minPeople
      if (formValues.maxPeople < formValues.minPeople) {
        setErrorMessage(
          t("errors.maxLessThanMin", {
            defaultMessage: "Máximo de pessoas não pode ser menor que o mínimo",
          })
        );
        setIsSaving(false);
        return;
      }

      // Construir payload com os dados atualizados
      const updatedMembers: ServiceRosterMember[] = activeMembers.map(
        (member, index) => {
          let role = roleStringToNumber(member.role); // Converter string para número

          // Atualizar role baseado na seleção
          if (member.registrationId === formValues.coordinatorId) {
            role = 1; // Coordenador
          } else if (member.registrationId === formValues.viceCoordinatorId) {
            role = 2; // Vice-coordenador
          } else {
            role = 0; // Membro normal
          }

          return {
            registrationId: member.registrationId,
            name: member.name,
            role,
            position: index,
            city: undefined,
          };
        }
      );

      const payload: ServiceRosterPayload = {
        version: spaceState.version,
        spaces: [
          {
            spaceId: spaceState.space.spaceId,
            name: formValues.name.trim(),
            description: formValues.description.trim() || null,
            minPeople: formValues.minPeople,
            maxPeople: formValues.maxPeople,
            isLocked: spaceState.space.isLocked,
            isActive: spaceState.space.isActive,
            members: updatedMembers,
          },
        ],
      };

      const response = await apiClient.put<any>(
        `/retreats/${retreatId}/service/roster`,
        payload
      );

      if (!response.data) {
        throw new Error(
          t("errors.update", {
            defaultMessage: "Erro ao atualizar equipe de serviço",
          })
        );
      }

      // Atualizar estado local
      const updatedSpace: ServiceSpaceDetail = {
        ...spaceState,
        version: response.data.version ?? spaceState.version,
        space: {
          ...spaceState.space,
          name: formValues.name.trim(),
          description: formValues.description.trim() || null,
          minPeople: formValues.minPeople,
          maxPeople: formValues.maxPeople,
          hasCoordinator: updatedMembers.some((m) => m.role === 1),
          hasVice: updatedMembers.some((m) => m.role === 2),
        },
        members: activeMembers.map((member) => ({
          ...member,
          role:
            member.registrationId === formValues.coordinatorId
              ? "Coordinator"
              : member.registrationId === formValues.viceCoordinatorId
                ? "Vice"
                : "Member",
        })),
      };

      setSpaceState(updatedSpace);

      const coordinator = updatedSpace.members.find(
        (m) => m.role === "Coordinator"
      );
      const viceCoordinator = updatedSpace.members.find(
        (m) => m.role === "Vice"
      );

      setFormValues({
        name: updatedSpace.space.name,
        description: updatedSpace.space.description ?? "",
        minPeople: updatedSpace.space.minPeople,
        maxPeople: updatedSpace.space.maxPeople,
        coordinatorId: coordinator?.registrationId ?? null,
        viceCoordinatorId: viceCoordinator?.registrationId ?? null,
        memberIds: updatedSpace.members.map((m) => m.registrationId),
      });

      setSuccessMessage(
        t("messages.updateSuccess", {
          defaultMessage: "Equipe de serviço atualizada com sucesso",
        })
      );
      setIsEditing(false);
      onUpdated?.(updatedSpace);

      enqueueSnackbar(
        t("messages.updateSuccess", {
          defaultMessage: "Equipe de serviço atualizada com sucesso",
        }),
        { variant: "success" }
      );
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : error instanceof Error
          ? error.message
          : t("errors.update", {
              defaultMessage: "Erro ao atualizar equipe de serviço",
            });

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

  const getRoleName = (role: "Coordinator" | "Vice" | "Member") => {
    switch (role) {
      case "Coordinator":
        return t("roles.coordinator", { defaultMessage: "Coordenador" });
      case "Vice":
        return t("roles.viceCoordinator", {
          defaultMessage: "Vice-coordenador",
        });
      default:
        return t("roles.member", { defaultMessage: "Membro" });
    }
  };

  if (isLoading) {
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

  if (!spaceState) {
    return (
      <Box sx={{ width: "100%", minHeight: 300 }}>
        <Alert severity="error">
          {errorMessage ||
            t("errors.load", {
              defaultMessage: "Erro ao carregar equipe de serviço",
            })}
        </Alert>
      </Box>
    );
  }

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
            {t("sections.general", { defaultMessage: "Informações gerais" })}
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box flex={1}>
              {isEditing ? (
                <TextField
                  label={t("fields.name", {
                    defaultMessage: "Nome da equipe de serviço",
                  })}
                  fullWidth
                  value={formValues.name}
                  onChange={handleTextChange("name")}
                  required
                />
              ) : (
                <InfoRow
                  label={t("fields.name", {
                    defaultMessage: "Nome da equipe de serviço",
                  })}
                  value={spaceState.space.name}
                />
              )}
            </Box>
            <Box flex={1}>
              {isEditing ? (
                <TextField
                  label={t("fields.minPeople", {
                    defaultMessage: "Pessoas mínimas",
                  })}
                  fullWidth
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formValues.minPeople}
                  onChange={handleTextChange("minPeople")}
                />
              ) : (
                <InfoRow
                  label={t("fields.minPeople", {
                    defaultMessage: "Pessoas mínimas",
                  })}
                  value={String(spaceState.space.minPeople ?? 0)}
                />
              )}
            </Box>
            <Box flex={1}>
              {isEditing ? (
                <TextField
                  label={t("fields.maxPeople", {
                    defaultMessage: "Pessoas máximas",
                  })}
                  fullWidth
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formValues.maxPeople}
                  onChange={handleTextChange("maxPeople")}
                />
              ) : (
                <InfoRow
                  label={t("fields.maxPeople", {
                    defaultMessage: "Pessoas máximas",
                  })}
                  value={String(spaceState.space.maxPeople ?? 0)}
                />
              )}
            </Box>
          </Stack>
          <Box mt={2}>
            {isEditing ? (
              <TextField
                label={t("fields.description", {
                  defaultMessage: "Descrição",
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
                  defaultMessage: "Descrição",
                })}
                value={
                  spaceState.space.description ||
                  t("messages.noDescription", {
                    defaultMessage: "Nenhuma descrição fornecida",
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
              {t("sections.coordinator", { defaultMessage: "Coordenador" })}
            </Typography>
            {isEditing ? (
              <Autocomplete
                options={activeMembers}
                getOptionLabel={(option) => option.name}
                value={
                  activeMembers.find(
                    (member) =>
                      member.registrationId === formValues.coordinatorId
                  ) ?? null
                }
                isOptionEqualToValue={(option, value) =>
                  value ? option.registrationId === value.registrationId : false
                }
                onChange={(_, member) =>
                  handleCoordinatorChange("coordinatorId", member)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t("placeholders.selectMember", {
                      defaultMessage: "Selecione um membro",
                    })}
                  />
                )}
                noOptionsText={t("messages.noMembers", {
                  defaultMessage: "Nenhum membro disponível",
                })}
              />
            ) : (
              <InfoRow
                label={t("fields.coordinator", {
                  defaultMessage: "Coordenador",
                })}
                value={coordinatorName}
              />
            )}
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t("sections.viceCoordinator", {
                defaultMessage: "Vice-coordenador",
              })}
            </Typography>
            {isEditing ? (
              <Autocomplete
                options={activeMembers}
                getOptionLabel={(option) => option.name}
                value={
                  activeMembers.find(
                    (member) =>
                      member.registrationId === formValues.viceCoordinatorId
                  ) ?? null
                }
                isOptionEqualToValue={(option, value) =>
                  value ? option.registrationId === value.registrationId : false
                }
                onChange={(_, member) =>
                  handleCoordinatorChange("viceCoordinatorId", member)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t("placeholders.selectMember", {
                      defaultMessage: "Selecione um membro",
                    })}
                  />
                )}
                noOptionsText={t("messages.noMembers", {
                  defaultMessage: "Nenhum membro disponível",
                })}
              />
            ) : (
              <InfoRow
                label={t("fields.viceCoordinator", {
                  defaultMessage: "Vice-coordenador",
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
              {t("sections.members", { defaultMessage: "Membros" })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("labels.memberCount", {
                defaultMessage: "{count} membros",
                count: activeMembers.length,
              })}
            </Typography>
          </Stack>
          {activeMembers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("messages.noMembers", {
                defaultMessage: "Nenhum membro atribuído",
              })}
            </Typography>
          ) : (
            <List disablePadding>
              {activeMembers.map((member) => (
                <ListItem
                  key={member.registrationId}
                  alignItems="flex-start"
                  disableGutters
                  secondaryAction={
                    isEditing ? (
                      <Tooltip
                        title={t("actions.remove-member", {
                          defaultMessage: "Remover membro",
                        })}
                      >
                        <IconButton
                          edge="end"
                          color="error"
                          size="small"
                          onClick={() =>
                            handleRemoveMember(member.registrationId)
                          }
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    ) : undefined
                  }
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
                        {member.cpf && (
                          <Typography variant="caption" color="text.secondary">
                            CPF: {member.cpf}
                          </Typography>
                        )}
                        <Chip
                          label={getRoleName(member.role)}
                          size="small"
                          color={
                            member.role === "Coordinator"
                              ? "primary"
                              : member.role === "Vice"
                                ? "secondary"
                                : "default"
                          }
                        />
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
            {t("actions.close", { defaultMessage: "Fechar" })}
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
                  {t("actions.cancel", { defaultMessage: "Cancelar" })}
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
                  ? t("actions.save", { defaultMessage: "Salvar" })
                  : t("actions.edit", { defaultMessage: "Editar" })}
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
