"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";

interface LockFamiliesModalProps {
  retreatId: string;
  families: RetreatFamily[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FamilyLockStatus {
  familyId: string;
  familyName: string;
  locked: boolean;
}

interface RetreatLockStatus {
  version: number;
  locked: boolean;
  families?: FamilyLockStatus[];
}

export default function LockFamiliesModal({
  retreatId,
  families,
  onSuccess,
  onCancel,
}: LockFamiliesModalProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [globalLock, setGlobalLock] = useState(false);
  const [familyLocks, setFamilyLocks] = useState<Record<string, boolean>>({});

  // Fetch current lock status
  useEffect(() => {
    const fetchLockStatus = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<RetreatLockStatus>(
          `/retreats/${retreatId}/families/lock`
        );

        setGlobalLock(response.data.locked);

        // Initialize family locks from response or from families prop
        const locks: Record<string, boolean> = {};
        if (response.data.families) {
          response.data.families.forEach((family) => {
            locks[family.familyId] = family.locked;
          });
        } else {
          // Initialize all families as unlocked
          families.forEach((family) => {
            locks[String(family.id)] = false;
          });
        }
        setFamilyLocks(locks);
      } catch (error) {
        console.error("Error fetching lock status:", error);
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ??
            error.message)
          : "Erro ao carregar status de bloqueio.";
        enqueueSnackbar(message, {
          variant: "error",
        });

        // Initialize with unlocked state on error
        const locks: Record<string, boolean> = {};
        families.forEach((family) => {
          locks[String(family.id)] = false;
        });
        setFamilyLocks(locks);
      } finally {
        setLoading(false);
      }
    };

    fetchLockStatus();
  }, [retreatId, families]);

  const handleGlobalLockToggle = async () => {
    setSubmitting(true);
    try {
      const newLockState = !globalLock;

      const response = await apiClient.post<RetreatLockStatus>(
        `/retreats/${retreatId}/families/lock`,
        { lock: newLockState }
      );

      setGlobalLock(response.data.locked);

      // If locking globally, lock all families
      if (response.data.locked) {
        const allLocked: Record<string, boolean> = {};
        families.forEach((family) => {
          allLocked[String(family.id)] = true;
        });
        setFamilyLocks(allLocked);
      }

      enqueueSnackbar(
        newLockState
          ? "Todas as famílias foram bloqueadas"
          : "Todas as famílias foram desbloqueadas",
        { variant: "success" }
      );
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao alterar bloqueio global.";
      enqueueSnackbar(message, {
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFamilyLockToggle = async (familyId: string) => {
    // Don't allow individual lock changes if global lock is enabled
    if (globalLock) {
      enqueueSnackbar(
        "Desative o bloqueio global para alterar famílias individuais",
        { variant: "warning" }
      );
      return;
    }

    setSubmitting(true);
    try {
      const newLockState = !familyLocks[familyId];

      const response = await apiClient.post<{
        version: number;
        locked: boolean;
      }>(`/retreats/${retreatId}/families/${familyId}/lock`, {
        lock: newLockState,
      });

      setFamilyLocks((prev) => ({
        ...prev,
        [familyId]: response.data.locked,
      }));

      const family = families.find((f) => String(f.id) === familyId);
      enqueueSnackbar(
        `Família "${family?.name || familyId}" ${newLockState ? "bloqueada" : "desbloqueada"}`,
        { variant: "success" }
      );
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao alterar bloqueio da família.";
      enqueueSnackbar(message, {
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onSuccess?.();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const lockedCount = Object.values(familyLocks).filter(Boolean).length;
  const totalCount = families.length;

  return (
    <Box sx={{ p: 2, minWidth: 500 }}>
      <Stack spacing={3}>
        <Alert severity="info">
          Bloqueie a edição das famílias para prevenir alterações durante o
          evento ou após a formação final.
        </Alert>

        {/* Global Lock Section */}
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
                Bloqueio Global
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {globalLock
                  ? "Todas as famílias estão bloqueadas para edição"
                  : "Bloquear todas as famílias de uma vez"}
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
              label={globalLock ? "Bloqueado" : "Desbloqueado"}
            />
          </Stack>
        </Box>

        <Divider />

        {/* Individual Family Locks */}
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h6">Bloqueio Individual</Typography>
            <Chip
              label={`${lockedCount} / ${totalCount} bloqueadas`}
              color={lockedCount > 0 ? "warning" : "default"}
              size="small"
            />
          </Stack>

          {globalLock && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              O bloqueio global está ativo. Desative-o para gerenciar famílias
              individualmente.
            </Alert>
          )}

          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {families.map((family) => {
              const familyId = String(family.id);
              const isLocked = familyLocks[familyId];

              return (
                <ListItem
                  key={familyId}
                  sx={{
                    bgcolor: isLocked ? "error.lighter" : "transparent",
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemText
                    primary={family.name}
                    secondary={`${family.members?.length || 0} membros`}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={isLocked}
                      onChange={() => handleFamilyLockToggle(familyId)}
                      disabled={submitting || globalLock}
                      color={isLocked ? "error" : "primary"}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel} disabled={submitting} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleClose}
            disabled={submitting}
            variant="contained"
          >
            Concluir
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
