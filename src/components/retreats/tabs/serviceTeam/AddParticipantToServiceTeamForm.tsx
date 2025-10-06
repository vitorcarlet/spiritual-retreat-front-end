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
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";

interface AddParticipantToServiceTeamFormProps {
  retreatId: string;
  serviceSpaces: ServiceSpace[];
  onSuccess: () => void;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  location?: string;
  isAssigned?: boolean;
}

const ROLE_VALUES = ["member", "support", "coordinator", "vice"] as const;

type ServiceTeamRole = (typeof ROLE_VALUES)[number];

const addParticipantSchema = z.object({
  serviceSpaceId: z.string().min(1, "Selecione uma equipe de serviço"),
  participantIds: z
    .array(z.string())
    .min(1, "Selecione pelo menos um participante"),
  role: z.enum(ROLE_VALUES).default("member"),
});

type AddParticipantData = z.infer<typeof addParticipantSchema>;

export default function AddParticipantToServiceTeamForm({
  retreatId,
  serviceSpaces,
  onSuccess,
}: AddParticipantToServiceTeamFormProps) {
  const t = useTranslations("service-team");
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<AddParticipantData>({
    resolver: zodResolver(addParticipantSchema),
    defaultValues: {
      serviceSpaceId: "",
      participantIds: [],
      role: "member",
    },
  });

  const serviceSpaceId = watch("serviceSpaceId");

  // Buscar participantes disponíveis
  useEffect(() => {
    const fetchParticipants = async () => {
      setLoadingParticipants(true);
      try {
        const response = await handleApiResponse<Participant[]>(
          await sendRequestServerVanilla.get(
            `/retreats/${retreatId}/participants/available`
          )
        );
        if (response.success && response.data) {
          const normalized = (response.data || []).map((participant) => ({
            ...participant,
            id: String(participant.id),
          }));
          setParticipants(normalized);
        }
      } catch (error) {
        console.error("Erro ao buscar participantes:", error);
        setParticipants([]);
      } finally {
        setLoadingParticipants(false);
      }
    };

    fetchParticipants();
  }, [retreatId]);

  const selectedServiceSpace = serviceSpaces.find(
    (space) => String(space.id) === serviceSpaceId
  );
  const availableParticipants = participants.filter((p) => !p.isAssigned);

  const onSubmit = async (data: AddParticipantData) => {
    try {
      const payload = {
        participantIds: data.participantIds,
        role: data.role,
      };

      const response = await handleApiResponse(
        await sendRequestServerVanilla.post(
          `/retreats/${retreatId}/service-spaces/${data.serviceSpaceId}/members`,
          payload
        )
      );

      if (response.success) {
        reset();
        onSuccess();
      } else {
        console.error("Erro ao adicionar participantes na equipe:", response.error);
      }
    } catch (error) {
      console.error("Erro ao adicionar participantes na equipe:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>
          {t("addParticipant.formTitle", {
            defaultMessage: "Add participants to a service team",
          })}
        </Typography>

        <Controller
          name="serviceSpaceId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth required error={!!errors.serviceSpaceId}>
              <InputLabel>
                {t("addParticipant.selectServiceSpace", {
                  defaultMessage: "Select a service space",
                })}
              </InputLabel>
              <Select
                {...field}
                label={t("addParticipant.selectServiceSpace", {
                  defaultMessage: "Select a service space",
                })}
              >
                {serviceSpaces.map((space) => (
                  <MenuItem key={space.id} value={String(space.id)}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography>{space.name}</Typography>
                      <Chip
                        size="small"
                        label={`${space.members?.length ?? 0}/${space.minMembers ?? ""}`}
                        color="primary"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {selectedServiceSpace && (
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {t("addParticipant.currentTeamSize", {
                    defaultMessage: "Current members: {count}",
                    count: selectedServiceSpace.members?.length ?? 0,
                  })}
                </Typography>
              )}
              {errors.serviceSpaceId && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.serviceSpaceId.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>
                {t("addParticipant.memberRole", {
                  defaultMessage: "Participant role",
                })}
              </InputLabel>
              <Select
                {...field}
                label={t("addParticipant.memberRole", {
                  defaultMessage: "Participant role",
                })}
              >
                <MenuItem value="member">
                  {t("roles.member", { defaultMessage: "Member" })}
                </MenuItem>
                <MenuItem value="support">
                  {t("roles.support", { defaultMessage: "Support" })}
                </MenuItem>
                <MenuItem value="coordinator">
                  {t("roles.coordinator", { defaultMessage: "Coordinator" })}
                </MenuItem>
                <MenuItem value="vice">
                  {t("roles.viceCoordinator", {
                    defaultMessage: "Vice Coordinator",
                  })}
                </MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t("addParticipant.selectParticipants", {
              defaultMessage: "Select participants",
            })}
            :
          </Typography>
          {loadingParticipants ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">
                {t("addParticipant.loadingParticipants", {
                  defaultMessage: "Loading participants",
                })}
              </Typography>
            </Box>
          ) : (
            <Controller
              name="participantIds"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={availableParticipants}
                  getOptionLabel={(option) =>
                    `${option.name} (${option.email})`
                  }
                  value={availableParticipants.filter((p) =>
                    field.value.includes(p.id)
                  )}
                  onChange={(_, newValue) =>
                    field.onChange(newValue.map((p) => p.id))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={t("addParticipant.searchPlaceholder", {
                        defaultMessage: "Search participants",
                      })}
                      helperText={
                        errors.participantIds?.message ||
                        t("addParticipant.helperText", {
                          defaultMessage:
                            "You can select multiple participants to add",
                        })
                      }
                      error={!!errors.participantIds}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                        {option.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                          {option.age &&
                            ` • ${option.age} anos • ${option.location ?? ""}`}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.name}
                        avatar={
                          <Avatar>{option.name.charAt(0).toUpperCase()}</Avatar>
                        }
                      />
                    ))
                  }
                  disabled={!serviceSpaceId}
                  noOptionsText={t("addParticipant.noParticipants", {
                    defaultMessage: "No participants available",
                  })}
                />
              )}
            />
          )}
        </Box>

        {selectedServiceSpace &&
          selectedServiceSpace.minMembers &&
          (selectedServiceSpace.members?.length ?? 0) <
            selectedServiceSpace.minMembers && (
            <Typography variant="body2" color="warning.main">
              ⚠️
              {t("addParticipant.minMembersWarning", {
                defaultMessage:
                  "This service space still needs at least {remaining} member(s) to reach the minimum",
                remaining:
                  Math.max(
                    0,
                    (selectedServiceSpace.minMembers ?? 0) -
                      (selectedServiceSpace.members?.length ?? 0)
                  ),
              })}
            </Typography>
          )}

        {selectedServiceSpace &&
          selectedServiceSpace.maxMembers &&
          (selectedServiceSpace.members?.length ?? 0) >=
            selectedServiceSpace.maxMembers && (
            <Typography variant="body2" color="warning.main">
              ⚠️
              {t("addParticipant.maxMembersWarning", {
                defaultMessage:
                  "This service space has reached its maximum capacity",
              })}
            </Typography>
          )}

        {!selectedServiceSpace && (
          <Typography variant="body2" color="text.secondary">
            {t("addParticipant.selectTeamHint", {
              defaultMessage:
                "Select a service space to see current members and limits",
            })}
          </Typography>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onSuccess}
            disabled={isSubmitting}
          >
            {t("actions.cancel", { defaultMessage: "Cancel" })}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || loadingParticipants}
            startIcon={
              isSubmitting ? <CircularProgress size={16} /> : undefined
            }
          >
            {isSubmitting
              ? t("addParticipant.submitting", {
                  defaultMessage: "Adding...",
                })
              : t("addParticipant.submit", {
                  defaultMessage: "Add participants",
                })}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
