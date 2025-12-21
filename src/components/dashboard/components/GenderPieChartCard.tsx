'use client';

import { useQuery } from '@tanstack/react-query';

import FemaleRounded from '@mui/icons-material/FemaleRounded';
import MaleRounded from '@mui/icons-material/MaleRounded';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

import apiClient from '@/src/lib/axiosClientInstance';

import { DashboardOverviewResponse } from '../types';

// ---------- Props ----------
interface GenderPieChartCardProps {
  retreatId: string | undefined;
}

// ---------- Fetch ----------
const fetchDashboardOverview = async (
  retreatId: string | undefined
): Promise<DashboardOverviewResponse> => {
  const response = await apiClient.get<DashboardOverviewResponse>(
    `/dashboards/overview?retreatId=${retreatId}`
  );
  return response.data;
};

// ---------- Component ----------
export default function GenderPieChartCard({
  retreatId,
}: GenderPieChartCardProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-overview', retreatId],
    queryFn: () => fetchDashboardOverview(retreatId),
    enabled: !!retreatId,
    staleTime: 5 * 60 * 1000,
  });

  const gender = data?.gender;

  if (isLoading) {
    return (
      <Card elevation={0} variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width={140} height={24} />
          <Skeleton
            variant="circular"
            width={120}
            height={120}
            sx={{ mt: 2, mx: 'auto' }}
          />
        </CardContent>
      </Card>
    );
  }

  if (isError || !gender) {
    return (
      <Card
        elevation={0}
        variant="outlined"
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">
          Dados de gênero indisponíveis
        </Typography>
      </Card>
    );
  }

  const pieData = [
    { id: 0, value: gender.male, color: '#1976d2' },
    { id: 1, value: gender.female, color: '#e91e63' },
  ];

  return (
    <Card elevation={0} variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Distribuição por Gênero
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="center"
          spacing={3}
        >
          {/* Pie Chart */}
          <Box sx={{ position: 'relative' }}>
            <PieChart
              series={[
                {
                  data: pieData,
                  innerRadius: 40,
                  outerRadius: 70,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  highlightScope: { fade: 'global', highlight: 'item' },
                },
              ]}
              width={160}
              height={160}
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
            />
          </Box>

          {/* Legend com porcentagens */}
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'info.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaleRounded sx={{ color: '#1976d2', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  Homens
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: '#1976d2' }}
                >
                  {gender.male.toFixed(1)}%
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'rgba(136, 37, 70, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FemaleRounded sx={{ color: '#e91e63', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  Mulheres
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: '#e91e63' }}
                >
                  {gender.female.toFixed(1)}%
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
