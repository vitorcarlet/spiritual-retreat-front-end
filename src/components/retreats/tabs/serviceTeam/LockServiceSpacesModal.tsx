"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useTranslations } from "next-intl";

import apiClient from "@/src/lib/axiosClientInstance";

interface LockServiceSpacesModalProps {
  retreatId: string;
  serviceSpaces: ServiceSpace[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ServiceSpaceLockStatusEntry {
  id?: string;
  serviceSpaceId?: string;
  spaceId?: string;
  name?: string;
  isLocked: boolean;
}

interface ServiceSpacesLockStatus {
  version?: number;
  locked: boolean;
  spaces?: ServiceSpaceLockStatusEntry[];
  serviceSpaces?: ServiceSpaceLockStatusEntry[];
}

interface ServiceSpacesResponse {
  version?: number;
  spacesLocked?: boolean;
  serviceSpacesLocked?: boolean;
  spaces?: ServiceSpace[];
  serviceSpaces?: ServiceSpace[];
}

// Helper para construir o mapa de locks dos espaços de serviço
const buildServiceSpaceLocks = async (
  retreatId: string,
  serviceSpaces: ServiceSpace[]
): Promise<{
  locks: Record<string, boolean>;
  globalLock: boolean;
}> => {
  try {
    // 1. Primeiro, buscar a rota geral para verificar spacesLocked/serviceSpacesLocked
    const generalResponse = await apiClient.get<ServiceSpacesResponse>(
      `/retreats/${retreatId}/service/spaces`
    );

    const spacesLocked =
      generalResponse.data.spacesLocked ??
      generalResponse.data.serviceSpacesLocked ??
      false;

    // 2. Se spacesLocked for true, todos os espaços estão bloqueados
    if (spacesLocked) {
      const locks: Record<string, boolean> = {};
      serviceSpaces.forEach((space) => {
        locks[String(space.spaceId)] = true;
      });
      return { locks, globalLock: true };
    }

    // 3. Se não, verificar cada espaço individualmente
    const locks: Record<string, boolean> = {};

    // Usar Promise.all para buscar todos os espaços em paralelo
    const spacePromises = serviceSpaces.map(async (space) => {
      try {
        const spaceResponse = await apiClient.get<{
          space?: { isLocked?: boolean };
          serviceSpace?: { isLocked?: boolean };
        }>(`/retreats/${retreatId}/service/spaces/${space.spaceId}`);

        const isLocked =
          spaceResponse.data.space?.isLocked ??
          spaceResponse.data.serviceSpace?.isLocked ??
          false;
        return { spaceId: String(space.spaceId), isLocked };
      } catch (error) {
        console.error(
          `Error fetching lock status for space ${space.spaceId}:`,
          error
        );
        return { spaceId: String(space.spaceId), isLocked: false };
      }
    });

    const results = await Promise.all(spacePromises);
    results.forEach(({ spaceId, isLocked }) => {
      locks[spaceId] = isLocked;
    });

    // Verifica se todos estão bloqueados para definir o globalLock
    const allLocked = serviceSpaces.every((space) => {
      const key = String(space.spaceId);
      return locks[key] === true;
    });

    return { locks, globalLock: allLocked };
  } catch (error) {
    console.error("Error building service space locks:", error);
    // Em caso de erro, retorna todos desbloqueados
    const locks: Record<string, boolean> = {};
    serviceSpaces.forEach((space) => {
      locks[String(space.spaceId)] = false;
    });
    return { locks, globalLock: false };
  }
};

export default function LockServiceSpacesModal({
  retreatId,
  serviceSpaces,
  onSuccess,
  onCancel,
}: LockServiceSpacesModalProps) {
  const t = useTranslations("service-team-details.lock");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [globalLock, setGlobalLock] = useState(false);
  const [serviceSpaceLocks, setServiceSpaceLocks] = useState<
    Record<string, boolean>
  >({});

  const totalCount = serviceSpaces.length;
  const lockedCount = useMemo(
    () => Object.values(serviceSpaceLocks).filter(Boolean).length,
    [serviceSpaceLocks]
  );

  // const allSpacesLocked = useMemo(
  //   () => areAllServiceSpacesLocked(serviceSpaceLocks, serviceSpaces),
  //   [serviceSpaceLocks, serviceSpaces]
  // );

  useEffect(() => {
    const fetchLockStatus = async () => {
      try {
        setLoading(true);
        // Usa a nova função que verifica spacesLocked global e isLocked individual
        const { locks, globalLock: isGlobalLocked } =
          await buildServiceSpaceLocks(retreatId, serviceSpaces);
        setServiceSpaceLocks(locks);
        setGlobalLock(isGlobalLocked);
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ??
            error.message)
          : t("errors.fetch", {
              defaultMessage: "Unable to load lock status.",
            });
        enqueueSnackbar(message, { variant: "error" });

        // Inicializa com todos desbloqueados em caso de erro
        const fallbackLocks: Record<string, boolean> = {};
        serviceSpaces.forEach((space) => {
          fallbackLocks[String(space.spaceId)] = false;
        });
        setServiceSpaceLocks(fallbackLocks);
        setGlobalLock(false);
      } finally {
        setLoading(false);
      }
    };

    fetchLockStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retreatId, serviceSpaces]);

  const handleGlobalLockToggle = async () => {
    const nextState = !globalLock;
    setSubmitting(true);

    try {
      // 1. Faz o POST para alterar o lock global
      await apiClient.post<ServiceSpacesLockStatus>(
        `/retreats/${retreatId}/service/spaces/lock`,
        { lock: nextState }
      );

      // 2. Faz o GET para buscar o estado real do backend
      const { locks, globalLock: isGlobalLocked } =
        await buildServiceSpaceLocks(retreatId, serviceSpaces);

      setServiceSpaceLocks(locks);
      setGlobalLock(isGlobalLocked);

      enqueueSnackbar(
        nextState
          ? t("messages.globalLocked", {
              defaultMessage: "All service teams are now locked.",
            })
          : t("messages.globalUnlocked", {
              defaultMessage: "All service teams are now unlocked.",
            }),
        { variant: "success" }
      );
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : t("errors.global", {
            defaultMessage: "Unable to update global lock.",
          });
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleServiceSpaceToggle = async (serviceSpaceId: string) => {
    setSubmitting(true);
    const nextState = !serviceSpaceLocks[serviceSpaceId];

    try {
      await apiClient.post<{ locked: boolean }>(
        `/retreats/${retreatId}/service/spaces/${serviceSpaceId}/lock`,
        { lock: nextState }
      );

      setServiceSpaceLocks((prev) => ({
        ...prev,
        [serviceSpaceId]: Boolean(nextState),
      }));

      const space = serviceSpaces.find(
        (item) => String(item.spaceId) === serviceSpaceId
      );

      enqueueSnackbar(
        nextState
          ? t("messages.spaceLocked", {
              defaultMessage: 'Service team "{name}" locked.',
              name: space?.name ?? serviceSpaceId,
            })
          : t("messages.spaceUnlocked", {
              defaultMessage: 'Service team "{name}" unlocked.',
              name: space?.name ?? serviceSpaceId,
            }),
        { variant: "success" }
      );
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : t("errors.individual", {
            defaultMessage: "Unable to update the team lock.",
          });
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, minWidth: 500 }}>
      <Stack spacing={3}>
        <Alert severity="info">
          {t("alerts.intro", {
            defaultMessage:
              "Lock service teams to prevent changes during the event.",
          })}
        </Alert>

        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 2,
              bgcolor: globalLock ? "error.lighter" : "background.paper",
              borderRadius: 1,
            }}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                {t("global.title", { defaultMessage: "Global lock" })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {globalLock
                  ? t("global.active", {
                      defaultMessage: "All teams are currently locked.",
                    })
                  : t("global.inactive", {
                      defaultMessage: "Lock or unlock all teams at once.",
                    })}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={globalLock}
                  onChange={handleGlobalLockToggle}
                  disabled={submitting}
                  color={globalLock ? "error" : "primary"}
                />
              }
              label={
                globalLock
                  ? t("global.lockedLabel", { defaultMessage: "Locked" })
                  : t("global.unlockedLabel", { defaultMessage: "Unlocked" })
              }
            />
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h6">
              {t("individual.title", { defaultMessage: "Individual lock" })}
            </Typography>
            <Chip
              label={t("individual.summary", {
                defaultMessage: "{locked} / {total} locked",
                locked: lockedCount,
                total: totalCount,
              })}
              color={lockedCount > 0 ? "warning" : "default"}
              size="small"
            />
          </Stack>

          {globalLock && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t("alerts.globalActive", {
                defaultMessage:
                  "The global lock is active. You can still manage individual teams.",
              })}
            </Alert>
          )}

          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {serviceSpaces.map((space) => {
              const serviceSpaceId = String(space.spaceId);
              const isLocked = Boolean(serviceSpaceLocks[serviceSpaceId]);

              return (
                <ListItem
                  key={serviceSpaceId}
                  sx={{
                    bgcolor: isLocked ? "error.lighter" : "transparent",
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemText
                    primary={space.name}
                    secondary={t("individual.members", {
                      defaultMessage: "{count} members",
                      count: space.members?.length ?? 0,
                    })}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={isLocked}
                      onChange={() => handleServiceSpaceToggle(serviceSpaceId)}
                      disabled={submitting}
                      color={isLocked ? "error" : "primary"}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel} disabled={submitting} variant="outlined">
            {t("buttons.cancel", { defaultMessage: "Cancel" })}
          </Button>
          <Button onClick={onSuccess} disabled={submitting} variant="contained">
            {t("buttons.finish", { defaultMessage: "Done" })}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
