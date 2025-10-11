"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";
import { useSnackbar } from "notistack";

interface RetreatGroup {
  familyId: string;
  name: string;
  groupStatus: string;
  groupLink?: string | null;
  groupExternalId?: string | null;
  groupChannel?: string | null;
  groupCreatedAt?: string | null;
  groupLastNotifiedAt?: string | null;
  groupVersion?: number | null;
}

interface RetreatGroupListResponse {
  items: RetreatGroup[];
}

interface GroupStatusSummary {
  totalFamilies: number;
  none: number;
  creating: number;
  active: number;
  failed: number;
}

const statusOptions: Array<{ value: string; label: string }> = [
  { value: "", label: "Todos" },
  { value: "none", label: "Sem grupo" },
  { value: "creating", label: "Criando" },
  { value: "active", label: "Ativo" },
  { value: "failed", label: "Falhou" },
];

export default function FamilyGroupsManager({
  retreatId,
}: {
  retreatId: string;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [statusFilter, setStatusFilter] = useState<string>("");

  const formatDateTime = useCallback((value?: string | null) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  }, []);

  const queryKey = useMemo(
    () => ["retreat-groups", retreatId, statusFilter],
    [retreatId, statusFilter]
  );

  const {
    data: groupsResponse,
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
    refetch: refetchGroups,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = statusFilter ? { status: statusFilter } : undefined;
      const response = await apiClient.get<RetreatGroupListResponse>(
        `/admin/retreats/${retreatId}/groups`,
        { params }
      );
      return response.data;
    },
  });

  const {
    data: summary,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["retreat-groups-status", retreatId],
    queryFn: async () => {
      const response = await apiClient.get<GroupStatusSummary>(
        `/admin/retreats/${retreatId}/groups/status`
      );
      return response.data;
    },
  });

  const handleResend = async (familyId: string) => {
    try {
      await apiClient.post(
        `/admin/retreats/${retreatId}/groups/${familyId}/resend`
      );
      enqueueSnackbar("Notificação reenviada com sucesso.", {
        variant: "success",
        autoHideDuration: 3000,
      });
      await Promise.all([refetchGroups(), refetchSummary()]);
    } catch (error) {
      console.error("Erro ao reenviar notificação:", error);
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao reenviar notificação.";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 4000,
      });
    }
  };

  const handleRetryFailed = async () => {
    try {
      await apiClient.post(`/admin/retreats/${retreatId}/groups/retry-failed`);
      enqueueSnackbar("Reenvio de grupos falhos enfileirado.", {
        variant: "info",
        autoHideDuration: 3000,
      });
      await Promise.all([refetchGroups(), refetchSummary()]);
    } catch (error) {
      console.error("Erro ao reenfileirar grupos falhos:", error);
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao reenfileirar grupos falhos.";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 4000,
      });
    }
  };

  const items = groupsResponse?.items ?? [];

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Typography variant="h6">Status dos grupos</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  refetchSummary();
                  refetchGroups();
                }}
              >
                Atualizar
              </Button>
              <Button
                variant="contained"
                size="small"
                color="warning"
                onClick={handleRetryFailed}
              >
                Reenviar falhos
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {isLoadingSummary ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={20} />
              <Typography>Carregando status...</Typography>
            </Stack>
          ) : summary ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Chip label={`Total: ${summary.totalFamilies}`} />
              <Chip label={`Sem grupo: ${summary.none}`} color="default" />
              <Chip label={`Criando: ${summary.creating}`} color="info" />
              <Chip label={`Ativo: ${summary.active}`} color="success" />
              <Chip label={`Falhou: ${summary.failed}`} color="error" />
            </Stack>
          ) : (
            <Typography>Não foi possível carregar o status.</Typography>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            mb={2}
          >
            <Typography variant="h6">Grupos de família</Typography>
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              sx={{ width: 200 }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {isLoadingGroups ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={20} />
              <Typography>Carregando grupos...</Typography>
            </Stack>
          ) : isErrorGroups ? (
            <Typography color="error">
              Não foi possível carregar os grupos de família.
            </Typography>
          ) : items.length === 0 ? (
            <Typography>
              Nenhum grupo encontrado para os filtros atuais.
            </Typography>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Família</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Canal</TableCell>
                    <TableCell>ID externo</TableCell>
                    <TableCell>Criado em</TableCell>
                    <TableCell>Última notificação</TableCell>
                    <TableCell>Link</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((group) => (
                    <TableRow key={group.familyId} hover>
                      <TableCell>{group.name}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={group.groupStatus || "Desconhecido"}
                          color={
                            group.groupStatus === "active"
                              ? "success"
                              : group.groupStatus === "failed"
                                ? "error"
                                : group.groupStatus === "creating"
                                  ? "info"
                                  : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>{group.groupChannel ?? "-"}</TableCell>
                      <TableCell>{group.groupExternalId ?? "-"}</TableCell>
                      <TableCell>
                        {formatDateTime(group.groupCreatedAt)}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(group.groupLastNotifiedAt)}
                      </TableCell>
                      <TableCell>
                        {group.groupLink ? (
                          <Button
                            component="a"
                            href={group.groupLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                          >
                            Abrir
                          </Button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleResend(group.familyId)}
                        >
                          Reenviar link
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
