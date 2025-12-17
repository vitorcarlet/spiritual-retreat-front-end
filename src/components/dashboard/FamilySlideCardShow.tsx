'use client';

import { useQuery } from '@tanstack/react-query';
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import FamilyRounded from '@mui/icons-material/FamilyRestroomRounded';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import apiClient from '@/src/lib/axiosClientInstance';

// ---------- Types ----------
export interface FamilyStats {
  family: string;
  confirmed: number;
  paid: number;
  pending: number;
  avgAge: number;
  femalePercent: number;
}

interface FamiliesResponse {
  total: number;
  items: FamilyStats[];
}

interface FamilySlideCardShowProps {
  retreatId: string | undefined;
}

// ---------- Fetch ----------
const fetchFamilies = async (
  retreatId: string | undefined
): Promise<FamiliesResponse> => {
  const response = await apiClient.get<FamiliesResponse>(
    `/dashboards/families?retreatId=${retreatId}`
  );
  return response.data;
};

// ---------- Component ----------
export default function FamilySlideCardShow({
  retreatId,
}: FamilySlideCardShowProps) {
  const theme = useTheme();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-families', retreatId],
    queryFn: () => fetchFamilies(retreatId),
    enabled: !!retreatId,
    staleTime: 5 * 60 * 1000,
  });

  const families = data?.items ?? [];

  if (isLoading) {
    return (
      <Card elevation={0} variant="outlined" sx={{ height: 260 }}>
        <CardContent>
          <Skeleton variant="text" width={140} height={28} />
          <Skeleton
            variant="rectangular"
            height={160}
            sx={{ mt: 2, borderRadius: 2 }}
          />
        </CardContent>
      </Card>
    );
  }

  if (isError || families.length === 0) {
    return (
      <Card
        elevation={0}
        variant="outlined"
        sx={{
          height: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">
          Nenhuma família encontrada
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      variant="outlined"
      sx={{ height: 260, display: 'flex', flexDirection: 'column' }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Famílias ({data?.total ?? 0})
        </Typography>

        <Box sx={{ flex: 1, position: 'relative' }}>
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={families.length > 1}
            spaceBetween={16}
            style={{ height: '100%' }}
          >
            {families.map((fam, idx) => (
              <SwiperSlide key={fam.family + idx}>
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
                    <FamilyRounded color="primary" />
                    <Typography variant="h6" noWrap>
                      {fam.family}
                    </Typography>
                  </Stack>

                  <Stack direction="row" flexWrap="wrap" spacing={2}>
                    <StatItem label="Confirmados" value={fam.confirmed} />
                    <StatItem label="Pagos" value={fam.paid} />
                    <StatItem label="Pendentes" value={fam.pending} />
                    <StatItem
                      label="Idade Média"
                      value={`${fam.avgAge.toFixed(1)} anos`}
                    />
                    <StatItem
                      label="% Feminino"
                      value={`${fam.femalePercent}%`}
                    />
                  </Stack>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </CardContent>
    </Card>
  );
}

// ---------- Helpers ----------
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <Box sx={{ minWidth: 70 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}
