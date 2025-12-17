'use client';

import React from 'react';

import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

interface PaymentsTimelineCardProps {
  timeSeries:
    | Array<{ date: string; paid: number; pending: number }>
    | undefined;
  isLoading: boolean;
}

const PaymentsTimelineCard: React.FC<PaymentsTimelineCardProps> = ({
  timeSeries,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card elevation={0} variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={250} />
        </CardContent>
      </Card>
    );
  }

  const hasData =
    timeSeries &&
    timeSeries.length > 0 &&
    timeSeries.some((d) => d.paid > 0 || d.pending > 0);

  const xAxisData = timeSeries?.map((d) => new Date(d.date)) || [];
  const paidData = timeSeries?.map((d) => d.paid) || [];
  const pendingData = timeSeries?.map((d) => d.pending) || [];

  return (
    <Card elevation={0} variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Evolução de Pagamentos
        </Typography>

        {hasData ? (
          <Box sx={{ width: '100%', height: 250 }}>
            <LineChart
              xAxis={[
                {
                  data: xAxisData,
                  scaleType: 'time',
                  valueFormatter: (date) =>
                    new Date(date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    }),
                },
              ]}
              series={[
                {
                  data: paidData,
                  label: 'Pagos',
                  color: '#4caf50',
                  curve: 'monotoneX',
                },
                {
                  data: pendingData,
                  label: 'Pendentes',
                  color: '#ff9800',
                  curve: 'monotoneX',
                },
              ]}
              height={250}
              margin={{ left: 40, right: 10, top: 20, bottom: 30 }}
              sx={{
                '& .MuiChartsAxis-tickLabel': {
                  fontSize: '0.75rem',
                },
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              height: 250,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Nenhum dado de pagamento disponível
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentsTimelineCard;
