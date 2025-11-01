"use client";

import { useState, useEffect, useMemo } from "react";
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
  familiesLocked?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FamilyLockStatus {
  familyId: string;
  familyName?: string;
  name?: string;
  locked?: boolean;
  isLocked?: boolean;
}

interface RetreatLockStatus {
  version?: number;
  locked?: boolean;
  isLocked?: boolean;
  families?: FamilyLockStatus[];
}

// Helper para construir o mapa de locks das famílias
const buildFamilyLocks = (
  payload: RetreatLockStatus | null | undefined,
  families: RetreatFamily[]
): Record<string, boolean> => {
  const locks: Record<string, boolean> = {};

  if (payload?.families && Array.isArray(payload.families)) {
    payload.families.forEach((family) => {
      const key = String(family.familyId);
      locks[key] = Boolean(family.locked ?? family.isLocked);
    });
  }

  // Inicializa famílias não encontradas como desbloqueadas
  families.forEach((family) => {
    const key = String(family.familyId);
    if (!(key in locks)) {
      locks[key] = false;
    }
  });

  return locks;
};

// Helper para verificar se todas as famílias estão bloqueadas
const areAllFamiliesLocked = (
  familyLocks: Record<string, boolean>,
  families: RetreatFamily[]
): boolean => {
  return families.every((family) => {
    const key = String(family.familyId);
    return familyLocks[key] === true;
  });
};

export default function LockFamiliesModal({
  retreatId,
  families,
  familiesLocked,
  onSuccess,
  onCancel,
}: LockFamiliesModalProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [familyLocks, setFamilyLocks] = useState<Record<string, boolean>>({});

  const totalCount = families.length;
  const lockedCount = useMemo(
    () => Object.values(familyLocks).filter(Boolean).length,
    [familyLocks]
  );

  // Verifica se todas as famílias estão bloqueadas
  const allFamiliesLocked = useMemo(
    () => areAllFamiliesLocked(familyLocks, families),
    [familyLocks, families]
  );

  // Fetch current lock status
  useEffect(() => {
    const fetchLockStatus = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<RetreatLockStatus>(
          `/retreats/${retreatId}/families/lock`
        );

        // Constrói o mapa de locks baseado na resposta
        const locks = buildFamilyLocks(response.data, families);
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

        // Inicializa com todas desbloqueadas em caso de erro
        setFamilyLocks(buildFamilyLocks(undefined, families));
      } finally {
        setLoading(false);
      }
    };

    fetchLockStatus();
  }, [retreatId, families]);

  const handleGlobalLockToggle = async () => {
    setSubmitting(true);
    try {
      const nextState = !allFamiliesLocked;

      // Usa a rota de lock global das famílias
      const { data } = await apiClient.post<RetreatLockStatus>(
        `/retreats/${retreatId}/families/lock`,
        { lock: nextState }
      );

      // Atualiza o estado local com base no novo estado
      const newLocks = Object.fromEntries(
        families.map((family) => [String(family.familyId), nextState])
      );
      setFamilyLocks(newLocks);

      enqueueSnackbar(
        nextState
          ? "Todas as famílias foram bloqueadas"
          : "Todas as famílias foram desbloqueadas",
        { variant: "success" }
      );
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao alterar bloqueio global.";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFamilyLockToggle = async (familyId: string) => {
    // Não permite alterar bloqueios individuais se o global está ativo
    if (allFamiliesLocked) {
      enqueueSnackbar(
        "Desative o bloqueio global para alterar famílias individuais",
        { variant: "warning" }
      );
      return;
    }

    setSubmitting(true);
    const nextState = !familyLocks[familyId];

    try {
      await apiClient.post(`/retreats/${retreatId}/families/${familyId}/lock`, {
        lock: nextState,
      });

      setFamilyLocks((prev) => ({
        ...prev,
        [familyId]: nextState,
      }));

      // Verifica se todas agora estão bloqueadas (para atualizar o global)
      const updatedLocks = {
        ...familyLocks,
        [familyId]: nextState,
      };
      const allNowLocked = areAllFamiliesLocked(updatedLocks, families);

      // Se todas estão bloqueadas, atualiza o estado visual
      if (allNowLocked) {
        // Pode fazer uma chamada à API para sincronizar o estado global se necessário
      }

      const family = families.find((f) => String(f.familyId) === familyId);
      enqueueSnackbar(
        `Família "${family?.name || familyId}" ${nextState ? "bloqueada" : "desbloqueada"}`,
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
              bgcolor: allFamiliesLocked ? "error.lighter" : "background.paper",
              borderRadius: 1,
            }}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                Bloqueio Global
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {allFamiliesLocked
                  ? "Todas as famílias estão bloqueadas para edição"
                  : "Bloquear todas as famílias de uma vez"}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={allFamiliesLocked}
                  onChange={handleGlobalLockToggle}
                  disabled={submitting}
                  color={allFamiliesLocked ? "error" : "primary"}
                />
              }
              label={allFamiliesLocked ? "Bloqueado" : "Desbloqueado"}
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

          {allFamiliesLocked && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              O bloqueio global está ativo. Desative-o para gerenciar famílias
              individualmente.
            </Alert>
          )}

          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {families.map((family) => {
              const familyId = String(family.familyId);
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
                      disabled={submitting || allFamiliesLocked}
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
