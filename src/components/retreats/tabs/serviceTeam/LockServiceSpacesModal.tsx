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

const buildServiceSpaceLocks = (
  payload: ServiceSpacesLockStatus | null | undefined,
  serviceSpaces: ServiceSpace[]
): Record<string, boolean> => {
  const locks: Record<string, boolean> = {};

  const entries = payload?.spaces ?? payload?.serviceSpaces;

  if (Array.isArray(entries)) {
    entries.forEach((entry) => {
      const key = entry.serviceSpaceId ?? entry.spaceId ?? entry.id;
      if (key) {
        // Verifica ambas as chaves: isLocked e locked
        locks[String(key)] = Boolean(entry.isLocked);
      }
    });
  }

  serviceSpaces.forEach((space) => {
    const key = String(space.spaceId);
    if (!(key in locks)) {
      locks[key] = false;
    }
  });

  return locks;
};

const areAllServiceSpacesLocked = (
  serviceSpaceLocks: Record<string, boolean>,
  serviceSpaces: ServiceSpace[]
): boolean => {
  return serviceSpaces.every((space) => {
    const key = String(space.spaceId);
    return serviceSpaceLocks[key] === true;
  });
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

        // Determina o estado do lock global verificando se todos estão bloqueados
        const locks = buildServiceSpaceLocks(undefined, serviceSpaces);
        const isGloballyLocked = areAllServiceSpacesLocked(
          locks,
          serviceSpaces
        );

        setGlobalLock(isGloballyLocked);
        setServiceSpaceLocks(locks);
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ??
            error.message)
          : t("errors.fetch", {
              defaultMessage: "Unable to load lock status.",
            });
        enqueueSnackbar(message, { variant: "error" });
        setServiceSpaceLocks(buildServiceSpaceLocks(undefined, serviceSpaces));
      } finally {
        setLoading(false);
      }
    };

    fetchLockStatus();
  }, [retreatId, serviceSpaces, t]);

  const handleGlobalLockToggle = async () => {
    const nextState = !globalLock;
    setSubmitting(true);

    try {
      const { data } = await apiClient.post<ServiceSpacesLockStatus>(
        `/retreats/${retreatId}/service/spaces/lock`,
        { lock: nextState }
      );

      setGlobalLock(Boolean(data.locked));
      const newLocks = Object.fromEntries(
        serviceSpaces.map((space) => [String(space.spaceId), nextState])
      );
      setServiceSpaceLocks(newLocks);
      setGlobalLock(nextState);

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
    if (globalLock) {
      enqueueSnackbar(
        t("messages.disableGlobal", {
          defaultMessage: "Disable the global lock to manage individual teams.",
        }),
        { variant: "warning" }
      );
      return;
    }

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
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t("alerts.globalActive", {
                defaultMessage:
                  "The global lock is active. Disable it to manage teams individually.",
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
                      disabled={submitting || globalLock}
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
