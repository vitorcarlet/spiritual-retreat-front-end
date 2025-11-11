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
import { RetreatTentLite } from "./types";

interface LockTentsModalProps {
  retreatId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ServiceSpaceLockStatusEntry {
  id?: string;
  tenttId?: string;
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

// Helper para construir o mapa de locks das barracas
const buildTentLocks = async (
  retreatId: string
): Promise<{
  locks: Record<string, { name: string; isLocked: boolean }>;
  globalLock: boolean;
}> => {
  try {
    // Busca todas as barracas - cada uma já vem com isLocked
    const response = await apiClient.get<RetreatTentLite[]>(
      `/retreats/${retreatId}/tents`
    );

    const tents = response.data;

    // Constrói o mapa de locks usando o isLocked de cada barraca
    const locks: Record<string, { name: string; isLocked: boolean }> = {};

    tents.forEach((tent) => {
      locks[String(tent.tentId)] = {
        name: tent.number || `Tent ${tent.tentId}`,
        isLocked: tent.isLocked ?? false,
      };
    });

    // Verifica se todas estão bloqueadas para definir o globalLock
    const allLocked =
      tents.length > 0 && tents.every((tent) => tent.isLocked === true);

    return { locks, globalLock: allLocked };
  } catch (error) {
    console.error("Error building tent locks:", error);
    throw error;
  }
};

// const buildServiceSpaceLocks = (
//   payload: ServiceSpacesLockStatus | null | undefined,
//   serviceSpaces: ServiceSpace[]
// ): Record<string, boolean> => {
//   const locks: Record<string, boolean> = {};

//   const entries = payload?.spaces ?? payload?.serviceSpaces;

//   if (Array.isArray(entries)) {
//     entries.forEach((entry) => {
//       const key = entry.tenttId ?? entry.spaceId ?? entry.id;
//       if (key) {
//         // Verifica ambas as chaves: isLocked e locked
//         locks[String(key)] = Boolean(entry.isLocked);
//       }
//     });
//   }

//   serviceSpaces.forEach((space) => {
//     const key = String(space.spaceId);
//     if (!(key in locks)) {
//       locks[key] = false;
//     }
//   });

//   return locks;
// };

// const areAllServiceSpacesLocked = (
//   serviceSpaceLocks: Record<string, boolean>,
//   serviceSpaces: ServiceSpace[]
// ): boolean => {
//   return serviceSpaces.every((space) => {
//     const key = String(space.spaceId);
//     return serviceSpaceLocks[key] === true;
//   });
// };

export default function LockTentsModal({
  retreatId,
  onSuccess,
  onCancel,
}: LockTentsModalProps) {
  const t = useTranslations("service-team-details.lock");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [globalLock, setGlobalLock] = useState(false);
  const [serviceSpaceLocks, setServiceSpaceLocks] = useState<
    Record<string, { name: string; isLocked: boolean }>
  >({});

  useEffect(() => {
    const fetchTentDetails = async () => {
      try {
        setLoading(true);
        // Usa a nova função que verifica tentsLocked global e isLocked individual
        const { locks, globalLock: isGlobalLocked } =
          await buildTentLocks(retreatId);
        setServiceSpaceLocks(locks);
        setGlobalLock(isGlobalLocked);
      } catch (error) {
        console.error("Error fetching tent details:", error);
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ??
            error.message)
          : t("load-error");
        enqueueSnackbar(message, { variant: "error" });

        // Inicializa vazio em caso de erro
        setServiceSpaceLocks({});
        setGlobalLock(false);
      } finally {
        setLoading(false);
      }
    };

    fetchTentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retreatId]);

  const totalCount = Object.keys(serviceSpaceLocks).length;
  const lockedCount = useMemo(
    () =>
      Object.values(serviceSpaceLocks).filter((space) => space.isLocked).length,
    [serviceSpaceLocks]
  );

  // const allSpacesLocked = useMemo(
  //   () => areAllServiceSpacesLocked(serviceSpaceLocks, serviceSpaces),
  //   [serviceSpaceLocks, serviceSpaces]
  // );

  const handleGlobalLockToggle = async () => {
    const nextState = !globalLock;
    setSubmitting(true);

    try {
      // 1. Faz o POST para alterar o lock global
      await apiClient.post<ServiceSpacesLockStatus>(
        `/retreats/${retreatId}/tents/lock`,
        { lock: nextState }
      );

      // 2. Faz o GET para buscar o estado real do backend
      const { locks, globalLock: isGlobalLocked } =
        await buildTentLocks(retreatId);

      setServiceSpaceLocks(locks);
      setGlobalLock(isGlobalLocked);

      enqueueSnackbar(
        nextState
          ? t("messages.globalLocked", {
              defaultMessage: "All tents are now locked.",
            })
          : t("messages.globalUnlocked", {
              defaultMessage: "All tents are now unlocked.",
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

  const handleServiceSpaceToggle = async (tenttId: string) => {
    setSubmitting(true);
    const nextState = !serviceSpaceLocks[tenttId]?.isLocked;

    try {
      await apiClient.post<{ locked: boolean }>(
        `/retreats/${retreatId}/tents/${tenttId}/lock`,
        { lock: nextState }
      );

      setServiceSpaceLocks((prev) => ({
        ...prev,
        [tenttId]: {
          ...prev[tenttId],
          isLocked: nextState,
        },
      }));

      const space = serviceSpaceLocks[tenttId];

      enqueueSnackbar(
        nextState
          ? t("messages.spaceLocked", {
              defaultMessage: 'Tent "{name}" locked.',
              name: space?.name ?? tenttId,
            })
          : t("messages.spaceUnlocked", {
              defaultMessage: 'Tent "{name}" unlocked.',
              name: space?.name ?? tenttId,
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
            defaultMessage: "Lock tents to prevent changes during the event.",
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
                  "The global lock is active. You can still manage individual tents.",
              })}
            </Alert>
          )}

          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {Object.entries(serviceSpaceLocks).map(([spaceId, space]) => {
              const isLocked = Boolean(space.isLocked);

              return (
                <ListItem
                  key={spaceId}
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
                      count: 0,
                    })}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={isLocked}
                      onChange={() => handleServiceSpaceToggle(spaceId)}
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
