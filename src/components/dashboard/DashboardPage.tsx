"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Grid, Box, Paper, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PieChart } from "@mui/x-charts/PieChart";
import Iconify from "../Iconify";
import { AsynchronousAutoComplete } from "@/src/components/select-auto-complete/AsynchronousAutoComplete";
import { RetreatLite, RetreatMetrics, RetreatOption } from "./types";
import { MetricCard } from "./MetricCard";
import { CriticalIssuesCard } from "./CriticalIssuesCard";
import apiClient from "@/src/lib/axiosClientInstance";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

const fetchRetreats = async (): Promise<RetreatLite[]> => {
  try {
    const response = await apiClient.get<RetreatOption>(
      "/unhandled/retreats?selectAutocomplete=true"
    );
    return response.data?.options ?? [];
  } catch (error) {
    console.error("Erro ao carregar retiros:", error);
    const message = axios.isAxiosError(error)
      ? ((error.response?.data as { error?: string })?.error ?? error.message)
      : "Erro ao carregar retiros.";
    enqueueSnackbar(message, {
      variant: "error",
      autoHideDuration: 4000,
    });
    return [];
  }
};

const fetchRetreatMetrics = async (
  retreatId: number
): Promise<RetreatMetrics> => {
  if (!retreatId) return Promise.reject("ID do retiro não fornecido");
  try {
    const response = await apiClient.get<RetreatMetrics>(
      `/retreats/${retreatId}/metrics`
    );

    return response.data as RetreatMetrics;
  } catch (error) {
    console.error("Erro ao requisitar as métricas:", error);
    const message = axios.isAxiosError(error)
      ? ((error.response?.data as { error?: string })?.error ?? error.message)
      : "Erro ao requisitar as métricas.";
    enqueueSnackbar(message, {
      variant: "error",
      autoHideDuration: 4000,
    });
    return {} as RetreatMetrics;
  }
};

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
      try {
        const response = await apiClient.get<RetreatOption>(
          `/unhandled/retreats?selectAutocomplete=true${q ? `&search=${encodeURIComponent(q)}` : ""}`
        );
        return response.data?.options ?? [];
      } catch (error) {
        console.error("Erro ao buscar retiros:", error);
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ??
            error.message)
          : "Erro ao buscar retiros.";
        enqueueSnackbar(message, {
          variant: "error",
          autoHideDuration: 4000,
        });
        return [];
      }
    },
    []
  );

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
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
    if (retreats && retreats.length > 0 && !selectedRetreat) {
      const activeRetreat = retreats.find((r) => r.isActive);
      if (activeRetreat) {
        setSelectedRetreat({
          label: activeRetreat.label,
          value: activeRetreat.value,
          startDate: activeRetreat.startDate,
          isActive: activeRetreat.isActive,
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
            label: sorted[0].label,
            value: sorted[0].value,
            isActive: sorted[0].isActive,
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
