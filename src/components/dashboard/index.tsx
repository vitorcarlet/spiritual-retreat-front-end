'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { enqueueSnackbar } from 'notistack';

import { Box, Grid, Paper, Typography } from '@mui/material';

import { AsynchronousAutoComplete } from '@/src/components/select-auto-complete/AsynchronousAutoComplete';
import apiClient from '@/src/lib/axiosClientInstance';
import { RetreatLite } from '@/src/types/retreats';

import Iconify from '../Iconify';
import ComplexPaymentsTimelineCard from './components/ComplexPaymentsTimelineCard';
import FamilySlideCardShow from './components/FamilySlideCardShow';
import GenderPieChartCard from './components/GenderPieChartCard';
import { MetricCard } from './components/MetricCard';
import ServiceTeamSlideCardShow from './components/ServiceTeamSlideCardShow';
import TopCitiesCard from './components/TopCitiesCard';
import { DashboardOverviewResponse } from './types';

type RetreatResponse = {
  items: RetreatLite[];
  totalCount: number;
  skip: number;
  take: number;
};

const fetchRetreats = async (): Promise<RetreatLite[]> => {
  try {
    const response = await apiClient.get<RetreatResponse>('/retreats');
    return response.data?.items ?? [];
  } catch (error) {
    console.error('Erro ao carregar retiros:', error);
    const message = axios.isAxiosError(error)
      ? ((error.response?.data as { error?: string })?.error ?? error.message)
      : 'Erro ao carregar retiros.';
    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 4000,
    });
    return [];
  }
};

// ---------- Fetch ----------
const fetchDashboardOverview = async (
  retreatId: string | undefined
): Promise<DashboardOverviewResponse> => {
  const response = await apiClient.get<DashboardOverviewResponse>(
    `/dashboards/overview?retreatId=${retreatId}`
  );
  return response.data;
};

//  const { data, isLoading, isError } = useQuery({
//     queryKey: ['dashboard-overview', retreatId],
//     queryFn: () => fetchDashboardOverview(retreatId),
//     enabled: !!retreatId,
//     staleTime: 5 * 60 * 1000,
//   });

// const fetchRetreatMetrics = async (
//   retreatId: number
// ): Promise<RetreatMetrics> => {
//   if (!retreatId) return Promise.reject('ID do retiro não fornecido');
//   try {
//     const response = await apiClient.get<RetreatMetrics>(
//       `/dashboards/${retreatId}/metrics`
//     );

//     return response.data as RetreatMetrics;
//   } catch (error) {
//     console.error('Erro ao requisitar as métricas:', error);
//     const message = axios.isAxiosError(error)
//       ? ((error.response?.data as { error?: string })?.error ?? error.message)
//       : 'Erro ao requisitar as métricas.';
//     enqueueSnackbar(message, {
//       variant: 'error',
//       autoHideDuration: 4000,
//     });
//     return {} as RetreatMetrics;
//   }
// };

const DashboardPage = () => {
  const [selectedRetreat, setSelectedRetreat] = useState<RetreatLite | null>(
    null
  );

  // Query original ainda usada para auto-selecionar o retiro ativo ao montar
  const { data: retreats, isLoading: isLoadingRetreats } = useQuery({
    queryKey: ['retreats'],
    queryFn: fetchRetreats,
    staleTime: 5 * 60 * 1000,
  });

  // Função assíncrona para o componente (busca incremental)
  const fetchRetreatOptions = useCallback(
    async (q: string): Promise<RetreatLite[]> => {
      try {
        const response = await apiClient.get<RetreatResponse>(
          `/retreats?${q ? `&search=${encodeURIComponent(q)}` : ''}`
        );
        return response.data?.items ?? [];
      } catch (error) {
        console.error('Erro ao buscar retiros:', error);
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ??
            error.message)
          : 'Erro ao buscar retiros.';
        enqueueSnackbar(message, {
          variant: 'error',
          autoHideDuration: 4000,
        });
        return [];
      }
    },
    []
  );

  const {
    data: metrics,
    isLoading: isLoadingMetrics,
    isError: isErrorMetrics,
  } = useQuery({
    queryKey: ['dashboard-overview', selectedRetreat?.id],
    queryFn: () =>
      selectedRetreat
        ? fetchDashboardOverview(selectedRetreat.id)
        : Promise.reject('Nenhum retiro selecionado'),
    enabled: !!selectedRetreat?.id,
    staleTime: 60 * 1000,
  });

  const serviceSpaces = metrics?.service?.spaces ?? [];
  const totalServiceTeams = serviceSpaces.length;
  const completeServiceTeams = serviceSpaces.filter(
    (s) => s.capacity > 0 && s.assigned >= s.capacity
  ).length;

  // Seleciona automaticamente o retiro ativo quando os dados são carregados
  useEffect(() => {
    if (retreats && retreats.length > 0 && !selectedRetreat) {
      const activeRetreat = retreats[0];
      if (activeRetreat) {
        setSelectedRetreat({
          name: activeRetreat.name,
          id: activeRetreat.id,
          startDate: activeRetreat.startDate,
          edition: activeRetreat.edition,
          //isActive: activeRetreat.isActive,
          endDate: activeRetreat.endDate,
          //location: activeRetreat.location,
        });
      } else {
        const sorted = [...retreats].sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        if (sorted[0])
          setSelectedRetreat({
            name: sorted[0].name,
            id: sorted[0].id,
            //isActive: sorted[0].isActive,
            startDate: sorted[0].startDate,
            edition: sorted[0].edition,
            endDate: sorted[0].endDate,
            // location: sorted[0].location,
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
      : '';

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
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h5" gutterBottom>
                  Dashboard do Retiro
                </Typography>
                {selectedRetreat && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {selectedRetreat.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formattedDate}
                      {/* {selectedRetreat.location
                        ? ` • ${selectedRetreat.location}`
                        : ""} */}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
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
                  getOptionLabel={(o) => o.name}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  showRefresh
                  textFieldProps={{
                    InputProps: {
                      startAdornment: (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mr: 1 }}
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
            value={metrics?.kpis.totalPaid || 0}
            total={metrics?.kpis.totalConfirmed || 0}
            icon="solar:card-bold-duotone"
            color="success"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Famílias Formadas"
            value={metrics?.families.count || 0}
            total={metrics?.families.count || 0}
            icon="solar:users-group-rounded-bold-duotone"
            color="info"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Barracas Ocupadas"
            value={metrics?.tents.occupied || 0}
            total={metrics?.tents.total || 0}
            icon="solar:home-bold-duotone"
            color="warning"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Equipes Completas"
            value={completeServiceTeams}
            total={totalServiceTeams}
            icon="solar:users-group-bold-duotone"
            color="secondary"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        {/* Segunda linha de métricas */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Pagamentos Pendentes"
            value={metrics?.kpis.totalPending || 0}
            icon="solar:wallet-money-bold-duotone"
            color="error"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Ocupação do Retiro"
            value={metrics?.kpis.totalConfirmed || 0}
            total={metrics?.kpis.capacity || 0}
            icon="solar:users-group-two-rounded-bold-duotone"
            color="primary"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Inscrições Submetidas"
            value={metrics?.service.kpis.submitted || 0}
            icon="solar:document-add-bold-duotone"
            color="info"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Equipe Confirmada"
            value={metrics?.service.kpis.confirmed || 0}
            total={metrics?.service.kpis.assigned || 0}
            icon="solar:check-circle-bold-duotone"
            color="success"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Equipe Pagou"
            value={metrics?.service.kpis.paid || 0}
            total={metrics?.service.kpis.assigned || 0}
            icon="solar:wallet-check-bold-duotone"
            color="success"
            isLoading={isLoadingMetrics}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FamilySlideCardShow retreatId={selectedRetreat?.id} />
        </Grid>
        {/* Payments Timeline */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ComplexPaymentsTimelineCard
            retreatId={selectedRetreat?.id}
            startDate={selectedRetreat?.startDate}
            endDate={selectedRetreat?.endDate}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GenderPieChartCard retreatId={selectedRetreat?.id} />
        </Grid>

        {/* Top Cities */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TopCitiesCard
            cities={metrics?.citiesTop}
            isLoading={isLoadingMetrics}
          />
        </Grid>

        {/* Equipes de Serviço */}
        <Grid size={{ xs: 12 }}>
          <ServiceTeamSlideCardShow
            isLoading={isLoadingMetrics}
            isError={isErrorMetrics}
            kpis={metrics?.service.kpis}
            spaces={metrics?.service.spaces}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
