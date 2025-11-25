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
  Paper,
  Divider,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import Iconify from "@/src/components/Iconify";

interface AddMemberToServiceTeamFormProps {
  retreatId: string;
  serviceSpaces: ServiceSpace[];
  onSuccess: () => void;
}

interface UnassignedMember {
  registrationId: string;
  name: string;
  city: string;
  email: string;
  cpf: string;
  preferredSpaceId: string;
  preferredSpaceName: string;
}

interface UnassignedMembersResponse {
  version: number;
  items: UnassignedMember[];
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

const addMemberSchema = z.object({
  spaceId: z.string().min(1, "Selecione uma equipe de serviço"),
  memberIds: z.array(z.string()).min(1, "Selecione pelo menos um membro"),
  role: z.enum(["0", "1", "2"], {
    errorMap: () => ({ message: "Selecione uma função válida" }),
  }),
});

type AddMemberData = z.infer<typeof addMemberSchema>;

export default function AddMemberToServiceTeamForm({
  retreatId,
  serviceSpaces,
  onSuccess,
}: AddMemberToServiceTeamFormProps) {
  const t = useTranslations("service-team-details");
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [members, setMembers] = useState<UnassignedMember[]>([]);
  const [loadingSpaceDetails, setLoadingSpaceDetails] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<AddMemberData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      spaceId: "",
      memberIds: [],
      role: "0",
    },
  });

  const spaceId = watch("spaceId");
  const memberIds = watch("memberIds");

  // Buscar membros não atribuídos
  useEffect(() => {
    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const response = await apiClient.get<UnassignedMembersResponse>(
          `/retreats/${retreatId}/service/registrations/roster/unassigned`
        );
        setMembers(response.data.items || []);
      } catch (error) {
        console.error("Erro ao buscar membros:", error);
        if (axios.isAxiosError(error)) {
          enqueueSnackbar(
            error.response?.data?.message ||
              t("errors.load-members", {
                defaultMessage: "Erro ao carregar membros",
              }),
            { variant: "error" }
          );
        }
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [retreatId, t]);

  const selectedSpace = serviceSpaces.find(
    (s) => String(s.spaceId) === spaceId
  );

  const selectedMembers = members.filter((m) =>
    memberIds.includes(m.registrationId)
  );

  const getRoleName = (role: string) => {
    switch (role) {
      case "1":
        return t("roles.coordinator", { defaultMessage: "Coordenador" });
      case "2":
        return t("roles.viceCoordinator", {
          defaultMessage: "Vice-coordenador",
        });
      default:
        return t("roles.member", { defaultMessage: "Membro" });
    }
  };

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

  const onSubmit = async (data: AddMemberData) => {
    try {
      setLoadingSpaceDetails(true);

      // GET detalhes completos da equipe
      const spaceDetailsResponse = await apiClient.get<ServiceSpaceDetail>(
        `/retreats/${retreatId}/service/spaces/${data.spaceId}`
      );

      const spaceDetails = spaceDetailsResponse.data;
      const roleNumber = parseInt(data.role, 10);

      // Mapear membros existentes para o formato correto
      const existingMembers = spaceDetails.members.map((member, index) => ({
        registrationId: member.registrationId,
        name: member.name,
        role: roleStringToNumber(member.role),
        position: index,
        city: member.cpf ? undefined : member.name, // Manter compatibilidade
      }));

      // Adicionar novos membros
      const newMembers = selectedMembers.map((member, index) => ({
        registrationId: member.registrationId,
        name: member.name,
        role: roleNumber,
        position: existingMembers.length + index,
        city: member.city,
      }));

      // Combinar membros existentes + novos
      const allMembers = [...existingMembers, ...newMembers];

      const payload = {
        version: spaceDetails.version,
        spaces: [
          {
            spaceId: data.spaceId,
            name: spaceDetails.space.name,
            description: spaceDetails.space.description,
            minPeople: spaceDetails.space.minPeople,
            maxPeople: spaceDetails.space.maxPeople,
            isLocked: spaceDetails.space.isLocked,
            isActive: spaceDetails.space.isActive,
            members: allMembers,
          },
        ],
      };

      //console.log("Payload to send:", payload);

      await apiClient.put(`/retreats/${retreatId}/service/roster`, payload);

      enqueueSnackbar(
        t("messages.members-added-successfully", {
          defaultMessage: "Membros adicionados com sucesso",
        }),
        { variant: "success" }
      );

      reset();
      onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar membros:", error);
      if (axios.isAxiosError(error)) {
        enqueueSnackbar(
          error.response?.data?.message ||
            t("errors.add-members", {
              defaultMessage: "Erro ao adicionar membros",
            }),
          { variant: "error" }
        );
      }
    } finally {
      setLoadingSpaceDetails(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>
          {t("sections.add-members", {
            defaultMessage: "Adicionar membros à equipe de serviço",
          })}
        </Typography>

        {/* Select Equipe de Serviço */}
        <Controller
          name="spaceId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth required error={!!errors.spaceId}>
              <InputLabel>
                {t("fields.select-team", {
                  defaultMessage: "Selecione uma equipe",
                })}
              </InputLabel>
              <Select
                {...field}
                label={t("fields.select-team", {
                  defaultMessage: "Selecione uma equipe",
                })}
              >
                {serviceSpaces.map((space) => (
                  <MenuItem key={space.spaceId} value={space.spaceId}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        gap: 2,
                      }}
                    >
                      <Typography>{space.name}</Typography>
                      <Chip
                        size="small"
                        label={`${space.members?.length || 0} ${t("labels.members", { defaultMessage: "membros" })}`}
                        color="default"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.spaceId && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.spaceId.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        {/* Select Função */}
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth required disabled={!spaceId}>
              <InputLabel>
                {t("fields.role", { defaultMessage: "Função" })}
              </InputLabel>
              <Select
                {...field}
                label={t("fields.role", { defaultMessage: "Função" })}
              >
                <MenuItem value="0">
                  {t("roles.member", { defaultMessage: "Membro" })}
                </MenuItem>
                <MenuItem value="1">
                  {t("roles.coordinator", { defaultMessage: "Coordenador" })}
                </MenuItem>
                <MenuItem value="2">
                  {t("roles.viceCoordinator", {
                    defaultMessage: "Vice-coordenador",
                  })}
                </MenuItem>
              </Select>
            </FormControl>
          )}
        />

        {/* Autocomplete Membros */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t("fields.select-members", {
              defaultMessage: "Selecione os membros:",
            })}
          </Typography>
          {loadingMembers ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">
                {t("messages.loading-members", {
                  defaultMessage: "Carregando membros...",
                })}
              </Typography>
            </Box>
          ) : (
            <Controller
              name="memberIds"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={members}
                  getOptionLabel={(option) => `${option.name}`}
                  value={members.filter((m) =>
                    field.value.includes(m.registrationId)
                  )}
                  onChange={(_, newValue) =>
                    field.onChange(newValue.map((m) => m.registrationId))
                  }
                  disabled={!spaceId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={t("placeholders.search-members", {
                        defaultMessage: "Procure por nome ou email...",
                      })}
                      helperText={
                        errors.memberIds?.message ||
                        t("helpers.select-members", {
                          defaultMessage: "Selecione um ou mais membros",
                        })
                      }
                      error={!!errors.memberIds}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Avatar
                        sx={{
                          mr: 2,
                          width: 32,
                          height: 32,
                          bgcolor: "primary.main",
                        }}
                      >
                        {option.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                          {option.city && ` • ${option.city}`}
                        </Typography>
                        <Typography variant="caption" color="primary.main">
                          {option.preferredSpaceName}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.registrationId}
                        label={option.name}
                        avatar={
                          <Avatar>{option.name.charAt(0).toUpperCase()}</Avatar>
                        }
                      />
                    ))
                  }
                  noOptionsText={t("messages.no-members-available", {
                    defaultMessage: "Nenhum membro disponível",
                  })}
                />
              )}
            />
          )}
        </Box>

        {/* Resumo dos membros selecionados */}
        {selectedMembers.length > 0 && (
          <Paper sx={{ p: 2, bgcolor: "background.default" }}>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              📋 {t("sections.summary", { defaultMessage: "Resumo" })}
            </Typography>

            <Stack spacing={1} divider={<Divider />}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("fields.team", { defaultMessage: "Equipe" })}:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedSpace?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Membros atuais: {selectedSpace?.members?.length || 0}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("fields.role", { defaultMessage: "Função" })}:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {getRoleName(watch("role"))}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("labels.members-to-add", {
                    defaultMessage: "Membros a adicionar",
                  })}{" "}
                  ({selectedMembers.length}):
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {selectedMembers.map((member) => (
                    <Box
                      key={member.registrationId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                      }}
                    >
                      <Avatar sx={{ width: 28, height: 28 }}>
                        {member.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{member.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={member.city}
                        variant="outlined"
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Botões de ação */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onSuccess}
            disabled={isSubmitting || loadingSpaceDetails}
            startIcon={<Iconify icon="solar:close-circle-bold" />}
          >
            {t("actions.cancel", { defaultMessage: "Cancelar" })}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              isSubmitting ||
              loadingMembers ||
              loadingSpaceDetails ||
              selectedMembers.length === 0
            }
            startIcon={
              isSubmitting || loadingSpaceDetails ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Iconify icon="solar:add-circle-bold" />
              )
            }
          >
            {isSubmitting || loadingSpaceDetails
              ? t("messages.adding", { defaultMessage: "Adicionando..." })
              : t("actions.add-members", {
                  defaultMessage: "Adicionar membros",
                })}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
