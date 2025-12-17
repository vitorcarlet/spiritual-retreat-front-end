'use client';

import React, { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {
  Alert,
  Box,
  Button,
  Paper,
  Popover,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { LineChart } from '@mui/x-charts/LineChart';

import apiClient from '@/src/lib/axiosClientInstance';

// Tipo de dados da API
export type PaymentTimeSeriesData = {
  date: string;
  paid: number;
  pending: number;
};

type PaymentTimeSeriesResponse = PaymentTimeSeriesData[];

interface ComplexPaymentsTimelineCardProps {
  retreatId: string | undefined;
  startDate?: string;
  endDate?: string;
}

// Função para buscar dados da timeline de pagamentos
const fetchPaymentsTimeSeries = async (
  retreatId: string | undefined,
  from: string,
  to: string,
  interval: 'Daily' | 'Weekly'
): Promise<PaymentTimeSeriesResponse> => {
  if (!retreatId) return [];

  const response = await apiClient.get<PaymentTimeSeriesResponse>(
    `/dashboards/payments/timeseries`,
    {
      params: {
        retreatId,
        from,
        to,
        interval,
      },
    }
  );
  return response.data;
};

const currencyFormatter = (value: number | null) =>
  value !== null
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value)
    : 'R$ 0,00';

const dateFormatter = (dateString: string) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Valida se a data é válida
  if (isNaN(date.getTime())) {
    return dateString; // Retorna a string original se não for válida
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
};

export default function ComplexPaymentsTimelineCard({
  retreatId,
  startDate,
  endDate,
}: ComplexPaymentsTimelineCardProps) {
  const theme = useTheme();
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [interval, setInterval] = useState<'Daily' | 'Weekly'>('Daily');

  // State para o date picker popover
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // State para as datas customizadas
  const defaultFrom = useMemo(() => {
    const today = new Date();
    return (
      startDate ||
      format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd')
    );
  }, [startDate]);

  const defaultTo = useMemo(() => {
    const today = new Date();
    return (
      endDate ||
      format(
        new Date(today.getFullYear(), today.getMonth() + 1, 0),
        'yyyy-MM-dd'
      )
    );
  }, [endDate]);

  const [customFromDate, setCustomFromDate] = useState(defaultFrom);
  const [customToDate, setCustomToDate] = useState(defaultTo);

  // Datas aplicadas (usadas na query)
  const [appliedFromDate, setAppliedFromDate] = useState(defaultFrom);
  const [appliedToDate, setAppliedToDate] = useState(defaultTo);

  const dateRange = useMemo(() => {
    return {
      from: appliedFromDate,
      to: appliedToDate,
    };
  }, [appliedFromDate, appliedToDate]);

  // Query com TanStack Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      'payments-timeseries',
      retreatId,
      dateRange.from,
      dateRange.to,
      interval,
    ],
    queryFn: () =>
      fetchPaymentsTimeSeries(
        retreatId,
        dateRange.from,
        dateRange.to,
        interval
      ),
    enabled: !!retreatId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Configuração das Séries (compartilhada entre os tipos de gráfico)
  const seriesConfig = [
    {
      dataKey: 'paid',
      label: 'Pago',
      color: theme.palette.success.main, // Verde do seu tema
      valueFormatter: currencyFormatter,
      showMark: false, // Remove bolinhas na linha para ficar mais limpo se tiver muitos dados
      stack: chartType === 'bar' ? 'total' : undefined, // Empilha se for barra
    },
    {
      dataKey: 'pending',
      label: 'Pendente',
      color: theme.palette.warning.main, // Laranja/Amarelo do tema
      valueFormatter: currencyFormatter,
      showMark: false,
      stack: chartType === 'bar' ? 'total' : undefined,
    },
  ];

  // Configuração do Eixo X
  const xAxisConfig = [
    {
      dataKey: 'date',
      scaleType: 'band' as const, // 'band' é melhor para dias discretos do que 'time'
      valueFormatter: (value: string) => dateFormatter(value),
      // tickMinStep garante que não encavale se tiver muitos dias
    },
  ];

  const handleIntervalChange = (
    event: React.MouseEvent<HTMLElement>,
    newInterval: 'Daily' | 'Weekly' | null
  ) => {
    if (newInterval !== null) {
      setInterval(newInterval);
      // O refetch acontece automaticamente quando interval muda (está no queryKey)
    }
  };

  const handleOpenDatePicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDatePicker = () => {
    setAnchorEl(null);
  };

  const handleApplyDateRange = () => {
    setAppliedFromDate(customFromDate);
    setAppliedToDate(customToDate);
    handleCloseDatePicker();
  };

  const handleResetToDefault = () => {
    setCustomFromDate(defaultFrom);
    setCustomToDate(defaultTo);
    setAppliedFromDate(defaultFrom);
    setAppliedToDate(defaultTo);
    handleCloseDatePicker();
  };

  const open = Boolean(anchorEl);
  const datePickerLabel = useMemo(() => {
    const from = format(new Date(appliedFromDate), 'dd/MM/yy', {
      locale: ptBR,
    });
    const to = format(new Date(appliedToDate), 'dd/MM/yy', { locale: ptBR });
    return `${from} - ${to}`;
  }, [appliedFromDate, appliedToDate]);

  // Loading state
  if (isLoading) {
    return (
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: 3, borderRadius: 2, height: 450 }}
      >
        <Skeleton variant="text" width={250} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={350} />
      </Paper>
    );
  }

  // Error state
  if (isError) {
    return (
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: 3, borderRadius: 2, height: 450 }}
      >
        <Alert severity="error">
          Erro ao carregar dados:{' '}
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Alert>
      </Paper>
    );
  }

  const chartData = data || [];
  const hasData =
    chartData.length > 0 && chartData.some((d) => d.paid > 0 || d.pending > 0);

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
        height: 450,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cabeçalho com Filtros */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Fluxo de Pagamentos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Comparativo Pago vs. Pendente (
            {interval === 'Daily' ? 'Diário' : 'Semanal'})
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          {/* Botão de Date Range */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<CalendarMonthIcon />}
            onClick={handleOpenDatePicker}
            sx={{ textTransform: 'none' }}
          >
            {datePickerLabel}
          </Button>

          {/* Popover com date pickers */}
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleCloseDatePicker}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Box sx={{ p: 3, minWidth: 300 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selecionar Período
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                  label="Data Inicial"
                  type="date"
                  size="small"
                  value={customFromDate}
                  onChange={(e) => setCustomFromDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />

                <TextField
                  label="Data Final"
                  type="date"
                  size="small"
                  value={customToDate}
                  onChange={(e) => setCustomToDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetToDefault}
                    fullWidth
                  >
                    Resetar
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleApplyDateRange}
                    fullWidth
                  >
                    Aplicar
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Popover>

          {/* Toggle Diário/Semanal */}
          <ToggleButtonGroup
            value={interval}
            exclusive
            onChange={handleIntervalChange}
            size="small"
            color="primary"
          >
            <ToggleButton value="Daily">Diário</ToggleButton>
            <ToggleButton value="Weekly">Semanal</ToggleButton>
          </ToggleButtonGroup>

          {/* Toggle Tipo de Gráfico */}
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(_, newType) => newType && setChartType(newType)}
            size="small"
          >
            <ToggleButton value="line">
              <ShowChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="bar">
              <BarChartIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* Área do Gráfico */}
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        {hasData ? (
          chartType === 'line' ? (
            <LineChart
              dataset={chartData}
              xAxis={xAxisConfig}
              series={seriesConfig.map((s) => ({ ...s, area: true }))}
              grid={{ horizontal: true }}
              slotProps={{
                legend: { position: { vertical: 'top', horizontal: 'center' } },
              }}
              sx={{
                [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: {
                  transform: 'rotate(-45deg)',
                  dominantBaseline: 'hanging',
                  textAnchor: 'end',
                },
              }}
            />
          ) : (
            <BarChart
              dataset={chartData}
              xAxis={xAxisConfig}
              series={seriesConfig}
              grid={{ horizontal: true }}
              slotProps={{
                legend: { position: { vertical: 'top', horizontal: 'center' } },
              }}
            />
          )
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Nenhum dado de pagamento disponível para o período
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
