"use client";

import { useState, useCallback } from "react";
import { alpha } from "@mui/material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Chip,
  Alert,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import apiClient from "@/src/lib/axiosClientInstance";
import { getApiUrl } from "@/src/lib/apiConfig";

interface RetreatFamily {
  familyId: string;
  name: string;
  groupStatus: "None" | "Active" | "Inactive";
  groupLink?: string | null;
  groupExternalId?: string | null;
  groupChannel?: string | null;
  groupCreatedAt?: string | null;
  groupLastNotifiedAt?: string | null;
  groupVersion?: number;
}

interface CreateGroupsResponse {
  groupsCreated: number;
  familiesProcessed: number;
  errors?: Array<{
    familyId: string;
    error: string;
  }>;
}

interface CreateGroupsFormProps {
  retreatId: string;
  onSuccess?: () => void;
}

const fetchFamilies = async (retreatId: string): Promise<RetreatFamily[]> => {
  const response = await apiClient.get<{ items: RetreatFamily[] }>(
    `/admin/retreats/${retreatId}/groups`,
    { baseURL: getApiUrl("admin") }
  );
  return response.data?.items ?? [];
};

const createGroups = async (
  retreatId: string,
  forceRecreate: boolean,
  dryRun: boolean
): Promise<CreateGroupsResponse> => {
  const response = await apiClient.post<CreateGroupsResponse>(
    `/admin/retreats/${retreatId}/groups`,
    {
      retreatId,
      forceRecreate,
      dryRun,
    },
    { baseURL: getApiUrl("admin") }
  );
  return response.data;
};

const notifyFamily = async (
  retreatId: string,
  familyId: string,
  forceRecreate?: boolean
): Promise<void> => {
  await apiClient.post(
    `/admin/retreats/${retreatId}/groups/${familyId}/notify`,
    {
      retreatId,
      familyId,
      forceRecreate: forceRecreate ?? false,
    },
    { baseURL: getApiUrl("admin") }
  );
};

const getStatusColor = (
  status: "None" | "Active" | "Inactive"
): "default" | "success" | "error" | "warning" => {
  switch (status) {
    case "Active":
      return "success";
    case "Inactive":
      return "error";
    case "None":
    default:
      return "default";
  }
};

const getStatusLabel = (status: "None" | "Active" | "Inactive"): string => {
  switch (status) {
    case "Active":
      return "✅ Ativo";
    case "Inactive":
      return "❌ Inativo";
    case "None":
    default:
      return "⏳ Não criado";
  }
};

export default function CreateGroupsForm({
  retreatId,
  onSuccess,
}: CreateGroupsFormProps) {
  const queryClient = useQueryClient();
  const [forceRecreate, setForceRecreate] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingNotify, setLoadingNotify] = useState(false);
  const [selectedFamilies, setSelectedFamilies] = useState<Set<string>>(
    new Set()
  );
  const [createResult, setCreateResult] = useState<CreateGroupsResponse | null>(
    null
  );

  // Fetch families
  const { data: families = [], isLoading: familiesLoading } = useQuery({
    queryKey: ["retreat-groups", retreatId],
    queryFn: () => fetchFamilies(retreatId),
  });

  // Handle create groups
  const handleCreateGroups = useCallback(async () => {
    try {
      setLoadingCreate(true);
      const result = await createGroups(retreatId, forceRecreate, dryRun);
      setCreateResult(result);

      if (dryRun) {
        enqueueSnackbar(
          `Simulação: ${result.groupsCreated} grupos seriam criados`,
          {
            variant: "info",
          }
        );
      } else {
        enqueueSnackbar(`${result.groupsCreated} grupos criados com sucesso!`, {
          variant: "success",
        });
        queryClient.invalidateQueries({
          queryKey: ["retreat-groups", retreatId],
        });
        onSuccess?.();
      }

      if (result.errors && result.errors.length > 0) {
        enqueueSnackbar(`${result.errors.length} erro(s) ao criar grupos`, {
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error creating groups:", error);
      enqueueSnackbar("Erro ao criar grupos", { variant: "error" });
    } finally {
      setLoadingCreate(false);
    }
  }, [retreatId, forceRecreate, dryRun, queryClient, onSuccess]);

  // Handle notify families
  const handleNotifyFamilies = useCallback(async () => {
    if (selectedFamilies.size === 0) {
      enqueueSnackbar("Selecione pelo menos uma família", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoadingNotify(true);
      let successCount = 0;
      let errorCount = 0;

      for (const familyId of selectedFamilies) {
        try {
          await notifyFamily(retreatId, familyId);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error notifying family ${familyId}:`, error);
        }
      }

      if (successCount > 0) {
        enqueueSnackbar(`Convites enviados para ${successCount} família(s)!`, {
          variant: "success",
        });
      }

      if (errorCount > 0) {
        enqueueSnackbar(`Erro ao enviar para ${errorCount} família(s)`, {
          variant: "error",
        });
      }

      setSelectedFamilies(new Set());
      queryClient.invalidateQueries({
        queryKey: ["retreat-groups", retreatId],
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error notifying families:", error);
      enqueueSnackbar("Erro ao enviar convites", { variant: "error" });
    } finally {
      setLoadingNotify(false);
    }
  }, [selectedFamilies, retreatId, queryClient, onSuccess]);

  // Handle select all
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedFamilies(new Set(families.map((f) => f.familyId)));
      } else {
        setSelectedFamilies(new Set());
      }
    },
    [families]
  );

  // Handle select single
  const handleSelectFamily = useCallback((familyId: string) => {
    setSelectedFamilies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(familyId)) {
        newSet.delete(familyId);
      } else {
        newSet.add(familyId);
      }
      return newSet;
    });
  }, []);

  const isAllSelected =
    families.length > 0 && selectedFamilies.size === families.length;

  return (
    <Stack spacing={3}>
      {/* Seção 1: Criar Grupos */}
      <Card>
        <CardHeader title="Criar Grupos de Famílias" />
        <CardContent>
          <Stack spacing={2}>
            <Alert severity="info">
              Configure as opções abaixo e clique em "Criar Grupos" para
              processar as famílias.
            </Alert>

            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={forceRecreate}
                    onChange={(e) => setForceRecreate(e.target.checked)}
                  />
                }
                label="Recriar grupos existentes"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                  />
                }
                label="Modo simulação (apenas visualizar, não criar)"
              />
            </Stack>

            <Button
              variant="contained"
              onClick={handleCreateGroups}
              disabled={loadingCreate}
              startIcon={
                loadingCreate ? <CircularProgress size={20} /> : undefined
              }
            >
              {loadingCreate ? "Processando..." : "Criar Grupos"}
            </Button>

            {createResult && (
              <Alert severity="success">
                <Typography variant="subtitle2">
                  ✅ Grupos criados: {createResult.groupsCreated}
                </Typography>
                <Typography variant="subtitle2">
                  📊 Famílias processadas: {createResult.familiesProcessed}
                </Typography>
                {createResult.errors && createResult.errors.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" color="error">
                      ⚠️ Erros: {createResult.errors.length}
                    </Typography>
                    {createResult.errors.map((err) => (
                      <Typography
                        key={err.familyId}
                        variant="caption"
                        display="block"
                        color="error"
                      >
                        • {err.familyId}: {err.error}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Seção 2: Enviar Convites */}
      <Card>
        <CardHeader
          title="Enviar Convites de Grupos"
          subheader={`${selectedFamilies.size} família(s) selecionada(s)`}
        />
        <CardContent>
          <Stack spacing={2}>
            <Alert severity="info">
              Selecione as famílias que deseja notificar sobre seus grupos via
              WhatsApp.
            </Alert>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "background.paper" }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>Nome da Família</TableCell>
                    <TableCell>Status do Grupo</TableCell>
                    <TableCell>Canal</TableCell>
                    <TableCell>Data de Criação</TableCell>
                    <TableCell>Link do Grupo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {familiesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : families.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="textSecondary">
                          Nenhuma família encontrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    families.map((family) => (
                      <TableRow
                        key={family.familyId}
                        hover
                        sx={{
                          backgroundColor: (theme) =>
                            selectedFamilies.has(family.familyId)
                              ? alpha(theme.palette.primary.main, 0.15)
                              : "transparent",
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedFamilies.has(family.familyId)}
                            onChange={() => handleSelectFamily(family.familyId)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {family.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(family.groupStatus)}
                            color={getStatusColor(family.groupStatus)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {family.groupChannel ? (
                            <Chip
                              label={family.groupChannel.toUpperCase()}
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {family.groupCreatedAt ? (
                            <Typography variant="caption">
                              {new Date(
                                family.groupCreatedAt
                              ).toLocaleDateString("pt-BR")}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {family.groupLink ? (
                            <Button
                              size="small"
                              href={family.groupLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Abrir Grupo
                            </Button>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="contained"
              color="primary"
              onClick={handleNotifyFamilies}
              disabled={loadingNotify || selectedFamilies.size === 0}
              startIcon={
                loadingNotify ? <CircularProgress size={20} /> : undefined
              }
            >
              {loadingNotify
                ? `Enviando (${selectedFamilies.size})...`
                : `Enviar Convites (${selectedFamilies.size})`}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
