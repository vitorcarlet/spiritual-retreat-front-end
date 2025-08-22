"use client";

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PieChart } from '@mui/x-charts/PieChart';

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
  const response = await handleApiResponse<any>(await sendRequestServerVanilla.get("/retreats"));
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
  const response = await handleApiResponse<any>(await sendRequestServerVanilla.get(`/retreats/${retreatId}/metrics`));
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
import { LinearProgress } from "@mui/material";
import Iconify from "../Iconify";
import { handleApiResponse, sendRequestServerVanilla } from "@/src/lib/sendRequestServerVanilla";

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
  const [selectedRetreat, setSelectedRetreat] = useState<Retreat | null>(null);
  //const queryClient = useQueryClient();

  // Consulta para obter a lista de retiros
  const { data: retreats, isLoading: isLoadingRetreats } = useQuery({
    queryKey: ["retreats"],
    queryFn: fetchRetreats,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Consulta para obter métricas do retiro selecionado
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["retreatMetrics", selectedRetreat?.id],
    queryFn: () =>
      selectedRetreat
        ? fetchRetreatMetrics(selectedRetreat.id)
        : Promise.reject("Nenhum retiro selecionado"),
    enabled: !!selectedRetreat,
    staleTime: 60 * 1000, // 1 minuto
  });

  // Seleciona automaticamente o retiro ativo quando os dados são carregados
  useEffect(() => {
    if (retreats?.length) {
      const activeRetreat = retreats.find((retreat) => retreat.isActive);
      if (activeRetreat) {
        setSelectedRetreat(activeRetreat);
      } else {
        // Se não houver retiro ativo, seleciona o mais recente
        const sortedRetreats = [...retreats].sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        setSelectedRetreat(sortedRetreats[0]);
      }
    }
  }, [retreats]);

  // Formatação da data do retiro
  const formattedDate = selectedRetreat
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
        {/* Cabeçalho com seletor de retiro */}
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
                      {selectedRetreat.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formattedDate} • {selectedRetreat.location}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Autocomplete
                  options={retreats || []}
                  loading={isLoadingRetreats}
                  getOptionLabel={(option) => option.title}
                  value={selectedRetreat}
                  onChange={(_event, newValue) => setSelectedRetreat(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Selecionar Retiro"
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mr: 1,
                            }}
                          >
                            <Iconify
                              icon="solar:calendar-mark-bold-duotone"
                              size={20}
                            />
                          </Box>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body1">
                          {option.title}
                          {option.isActive && (
                            <Chip
                              label="Atual"
                              size="small"
                              color="success"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(option.startDate), "dd/MM/yyyy")}
                          {" - "}
                          {format(new Date(option.endDate), "dd/MM/yyyy")}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
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

        <Grid size={{xs: 12, md:6}}>
          <PieChart
  series={[
    {
      data: [
        { id: 0, value: 30, label: 'Homens' },
        { id: 1, value: 70, label: 'Mulheres' },
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
