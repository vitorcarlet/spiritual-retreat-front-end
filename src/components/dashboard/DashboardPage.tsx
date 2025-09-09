"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  Card,
  CardContent,
  Skeleton,
  Chip,
  Divider,
  LinearProgress,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PieChart } from "@mui/x-charts/PieChart";

// Tipos

interface RetreatMetrics {
  payments: {
    pending: number;
    confirmed: number;
    total: number;
  };
  families: {
    formed: number;
    total: number;
  };
  accommodations: {
    occupied: number;
    total: number;
  };
  teams: {
    complete: number;
    total: number;
  };
  messages: {
    sent: number;
  };
  criticalIssues: {
    count: number;
    items: Array<{
      id: string;
      description: string;
      type: "payment" | "accommodation" | "family" | "team";
    }>;
  };
}

// Serviços para buscar dados
const fetchRetreats = async (): Promise<Retreat[]> => {
  // Em produção, substitua por chamada real à API
  const response = await handleApiResponse<any>(
    await sendRequestServerVanilla.get("/retreats?selectAutocomplete=true")
  );
  if (!response.success) {
    throw new Error("Falha ao carregar retiros");
  }
  return response.data;
};

const fetchRetreatMetrics = async (
  retreatId: number
): Promise<RetreatMetrics> => {
  if (!retreatId) return Promise.reject("ID do retiro não fornecido");

  // Em produção, substitua por chamada real à API
  const response = await handleApiResponse<any>(
    await sendRequestServerVanilla.get(`/retreats/${retreatId}/metrics`)
  );
  if (!response.success) {
    throw new Error("Falha ao carregar métricas do retiro");
  }
  return response.data;
};

// Componentes de métricas
const MetricCard = ({
  title,
  value,
  total = null,
  icon,
  color,
  isLoading,
  suffix = "",
}: {
  title: string;
  value: number;
  total?: number | null;
  icon: string;
  color: string;
  isLoading: boolean;
  suffix?: string;
}) => (
  <Card elevation={0} variant="outlined" sx={{ height: "100%" }}>
    <CardContent sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          color: `${color}.main`,
          backgroundColor: `${color}.lighter`,
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Iconify icon={icon} size={24} />
      </Box>

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>

      {isLoading ? (
        <Skeleton variant="text" width="60%" height={40} />
      ) : (
        <Box sx={{ display: "flex", alignItems: "baseline" }}>
          <Typography variant="h4" component="span" fontWeight="bold">
            {value}
            {suffix && (
              <Typography component="span" variant="subtitle1">
                {" "}
                {suffix}
              </Typography>
            )}
          </Typography>

          {total !== null && (
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              / {total}
            </Typography>
          )}
        </Box>
      )}

      {total !== null && !isLoading && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={(value / total) * 100}
            sx={{
              height: 6,
              borderRadius: 1,
              bgcolor: `${color}.lighter`,
              "& .MuiLinearProgress-bar": {
                bgcolor: `${color}.main`,
              },
            }}
          />
        </Box>
      )}
    </CardContent>
  </Card>
);

// Importação do LinearProgress que faltou
import Iconify from "../Iconify";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { Retreat } from "@/src/types/retreats";
import {
  AsynchronousAutoComplete,
  AsyncOption,
} from "@/src/components/select-auto-complete/AsynchronousAutoComplete";
// Remova imports não usados do Autocomplete/TextField se não forem necessários

// Tipo auxiliar para o autocomplete assíncrono
type RetreatOption = { options: AsyncOption[]; total: number };

// Tipo vindo do endpoint (value/label + metadados)
type RetreatLite = AsyncOption & {
  startDate?: string;
  endDate?: string;
  location?: string;
};

const CriticalIssuesCard = ({
  issues,
  isLoading,
}: {
  issues: RetreatMetrics["criticalIssues"] | undefined;
  isLoading: boolean;
}) => (
  <Card
    elevation={0}
    variant="outlined"
    sx={{ height: "100%", display: "flex", flexDirection: "column" }}
  >
    <CardContent sx={{ pb: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Iconify
          icon="solar:danger-triangle-bold-duotone"
          color="warning.main"
          size={24}
        />
        <Typography variant="h6" sx={{ ml: 1 }}>
          Pendências Críticas
        </Typography>
        {!isLoading && issues && (
          <Chip
            label={issues.count}
            size="small"
            color="warning"
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {isLoading ? (
        [...Array(3)].map((_, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton variant="text" width="100%" height={24} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
        ))
      ) : issues && issues.items.length > 0 ? (
        issues.items.map((issue) => (
          <Box
            key={issue.id}
            sx={{
              mb: 1.5,
              p: 1,
              borderRadius: 1,
              bgcolor: "background.default",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Iconify
                icon={
                  issue.type === "payment"
                    ? "solar:card-bold-duotone"
                    : issue.type === "accommodation"
                      ? "solar:home-bold-duotone"
                      : issue.type === "family"
                        ? "solar:users-group-rounded-bold-duotone"
                        : "solar:users-group-bold-duotone"
                }
                color={
                  issue.type === "payment"
                    ? "error.main"
                    : issue.type === "accommodation"
                      ? "warning.main"
                      : issue.type === "family"
                        ? "info.main"
                        : "secondary.main"
                }
                size={18}
                sx={{ mr: 1 }}
              />
              <Typography variant="body2">{issue.description}</Typography>
            </Box>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Nenhuma pendência crítica encontrada!
        </Typography>
      )}
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const [selectedRetreat, setSelectedRetreat] = useState<RetreatLite | null>(
    null
  );

  // Query original ainda usada para auto-selecionar o retiro ativo ao montar
  const { data: retreats, isLoading: isLoadingRetreats } = useQuery({
    queryKey: ["retreats"],
    queryFn: fetchRetreats,
    staleTime: 5 * 60 * 1000,
  });

  // Função assíncrona para o componente (busca incremental)
  const fetchRetreatOptions = useCallback(
    async (q: string): Promise<RetreatLite[]> => {
      const ep = `/retreats?selectAutocomplete=true${
        q ? `&search=${encodeURIComponent(q)}` : ""
      }`;
      const resp = await handleApiResponse<RetreatOption>(
        await sendRequestServerVanilla.get(ep)
      );
      if (!resp.success) throw new Error("Erro ao buscar retiros");
      const list = resp.data!.options || [];
      console.log(list, "lista");
      return list;
    },
    []
  );

  // Opção derivada controlada
  // const selectedRetreatOption: AsyncOption | null = selectedRetreat
  //   ? {
  //       label: selectedRetreat.label,
  //       value: selectedRetreat.value,
  //       raw: selectedRetreat,
  //     }
  //   : null;

  // Consulta para obter métricas do retiro selecionado
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    // Use o id correto (value) no cache key
    queryKey: ["retreatMetrics", selectedRetreat?.value],
    queryFn: () =>
      selectedRetreat
        ? fetchRetreatMetrics(Number(selectedRetreat.value))
        : Promise.reject("Nenhum retiro selecionado"),
    enabled: !!selectedRetreat?.value,
    staleTime: 60 * 1000,
  });

  // Seleciona automaticamente o retiro ativo quando os dados são carregados
  useEffect(() => {
    if (retreats?.length && !selectedRetreat) {
      const activeRetreat = retreats.find((r) => r.isActive);
      if (activeRetreat) {
        setSelectedRetreat({
          label: activeRetreat.title,
          value: activeRetreat.id,
          startDate: activeRetreat.startDate,
          endDate: activeRetreat.endDate,
          location: activeRetreat.location,
        });
      } else {
        const sorted = [...retreats].sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        if (sorted[0])
          setSelectedRetreat({
            label: sorted[0].title,
            value: sorted[0].id,
            startDate: sorted[0].startDate,
            endDate: sorted[0].endDate,
            location: sorted[0].location,
          });
      }
    }
  }, [retreats, selectedRetreat]);

  // Formatação da data do retiro
  const formattedDate =
    selectedRetreat?.startDate && selectedRetreat?.endDate
      ? `${format(new Date(selectedRetreat.startDate), "dd 'de' MMMM", {
          locale: ptBR,
        })} - ${format(
          new Date(selectedRetreat.endDate),
          "dd 'de' MMMM 'de' yyyy",
          { locale: ptBR }
        )}`
      : "";

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Cabeçalho */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{ p: 2, mb: 3, borderRadius: 2 }}
          >
            <Grid container alignItems="center" spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h5" gutterBottom>
                  Dashboard do Retiro
                </Typography>
                {selectedRetreat && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {selectedRetreat.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formattedDate}
                      {selectedRetreat.location
                        ? ` • ${selectedRetreat.location}`
                        : ""}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                {/* Substituição do Autocomplete antigo */}
                <AsynchronousAutoComplete<RetreatLite>
                  label="Selecionar Retiro"
                  placeholder="Buscar retiro..."
                  value={selectedRetreat}
                  fetchOptions={fetchRetreatOptions}
                  debounceMs={400}
                  onChange={(val) => {
                    setSelectedRetreat((val as RetreatLite) || null);
                  }}
                  getOptionLabel={(o) => o.label}
                  isOptionEqualToValue={(a, b) => a.value === b.value}
                  showRefresh
                  textFieldProps={{
                    InputProps: {
                      startAdornment: (
                        <Box
                          sx={{ display: "flex", alignItems: "center", mr: 1 }}
                        >
                          <Iconify
                            icon="solar:calendar-mark-bold-duotone"
                            size={20}
                          />
                        </Box>
                      ),
                    },
                  }}
                />
                {/* Loader visual opcional enquanto ainda buscamos a lista inicial para auto-seleção */}
                {isLoadingRetreats && !selectedRetreat && (
                  <Typography variant="caption" color="text.secondary">
                    Carregando lista inicial...
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Métricas principais */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Pagamentos Confirmados"
            value={metrics?.payments.confirmed || 0}
            total={metrics?.payments.total || 0}
            icon="solar:card-bold-duotone"
            color="success"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Famílias Formadas"
            value={metrics?.families.formed || 0}
            total={metrics?.families.total || 0}
            icon="solar:users-group-rounded-bold-duotone"
            color="info"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Barracas Ocupadas"
            value={metrics?.accommodations.occupied || 0}
            total={metrics?.accommodations.total || 0}
            icon="solar:home-bold-duotone"
            color="warning"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Equipes Completas"
            value={metrics?.teams.complete || 0}
            total={metrics?.teams.total || 0}
            icon="solar:users-group-bold-duotone"
            color="secondary"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        {/* Segunda linha de métricas */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Pagamentos Pendentes"
            value={metrics?.payments.pending || 0}
            icon="solar:wallet-money-bold-duotone"
            color="error"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Mensagens Enviadas"
            value={metrics?.messages.sent || 0}
            icon="solar:chat-round-dots-bold-duotone"
            color="primary"
            isLoading={isLoadingMetrics}
            suffix="msgs"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <PieChart
            series={[
              {
                data: [
                  { id: 0, value: 30, label: "Homens" },
                  { id: 1, value: 70, label: "Mulheres" },
                ],
              },
            ]}
            width={200}
            height={200}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 6 }}>
          <CriticalIssuesCard
            issues={metrics?.criticalIssues}
            isLoading={isLoadingMetrics}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
