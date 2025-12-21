'use client';

import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import GroupsRounded from '@mui/icons-material/GroupsRounded';
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import { DashboardOverviewResponse, ServiceSpaceDashboard } from '../types';

// ---------- Props ----------
interface ServiceTeamSlideCardShowProps {
  spaces: ServiceSpaceDashboard[] | undefined;
  kpis: DashboardOverviewResponse['service']['kpis'] | undefined;
  isLoading: boolean;
  isError: boolean;
}

// ---------- Component ----------
export default function ServiceTeamSlideCardShow({
  isLoading,
  isError,
  spaces,
  kpis,
}: ServiceTeamSlideCardShowProps) {
  if (isLoading) {
    return (
      <Card elevation={0} variant="outlined" sx={{ height: 300 }}>
        <CardContent>
          <Skeleton variant="text" width={180} height={28} />
          <Skeleton
            variant="rectangular"
            height={200}
            sx={{ mt: 2, borderRadius: 2 }}
          />
        </CardContent>
      </Card>
    );
  }

  if (isError || spaces?.length === 0 || !kpis || !spaces) {
    return (
      <Card
        elevation={0}
        variant="outlined"
        sx={{
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">
          Nenhuma equipe de serviço encontrada
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      variant="outlined"
      sx={{ height: 300, display: 'flex', flexDirection: 'column' }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header com KPIs gerais */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Equipes de Serviço ({spaces?.length})
          </Typography>
          {kpis && (
            <Stack direction="row" spacing={2}>
              <KpiChip label="Inscritos" value={kpis.submitted} color="info" />
              <KpiChip label="Alocados" value={kpis.assigned} color="success" />
              <KpiChip
                label="Confirmados"
                value={kpis.confirmed}
                color="primary"
              />
            </Stack>
          )}
        </Stack>

        <Box sx={{ flex: 1, position: 'relative' }}>
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={spaces.length > 1}
            slidesPerView={1}
            breakpoints={{
              600: { slidesPerView: 2, spaceBetween: 12 },
              900: { slidesPerView: 3, spaceBetween: 16 },
            }}
            spaceBetween={16}
            style={{ height: '100%' }}
          >
            {spaces.map((space, idx) => (
              <SwiperSlide key={space.label + idx}>
                <ServiceSpaceDashboardCard space={space} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </CardContent>
    </Card>
  );
}

// ---------- Service Space Card ----------
function ServiceSpaceDashboardCard({
  space,
}: {
  space: ServiceSpaceDashboard;
}) {
  const theme = useTheme();

  const getOccupancyColor = (percent: number) => {
    if (percent >= 80) return 'success';
    if (percent >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box
      sx={{
        height: '100%',
        p: 2,
        borderRadius: 2,
        bgcolor: theme.palette.action.hover,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <GroupsRounded color="primary" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {space.label}
        </Typography>
      </Stack>

      <Box sx={{ flex: 1 }}>
        <Stack direction="row" flexWrap="wrap" spacing={1.5} sx={{ mb: 1.5 }}>
          <StatItem label="Capacidade" value={space.capacity} />
          <StatItem label="Alocados" value={space.assigned} />
          <StatItem label="Confirmados" value={space.confirmed} />
        </Stack>

        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              Ocupação
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {space.occupancyPercent.toFixed(0)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(space.occupancyPercent, 100)}
            color={getOccupancyColor(space.occupancyPercent)}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Box>
      </Box>
    </Box>
  );
}

// ---------- Helpers ----------
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <Box sx={{ minWidth: 60 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}

function KpiChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'info' | 'success' | 'primary' | 'warning' | 'error';
}) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} color={`${color}.main`}>
        {value}
      </Typography>
    </Box>
  );
}
