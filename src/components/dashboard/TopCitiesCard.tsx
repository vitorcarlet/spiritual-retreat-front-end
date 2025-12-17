'use client';

import React from 'react';

import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Skeleton,
  Typography,
} from '@mui/material';

import Iconify from '../Iconify';

interface TopCitiesCardProps {
  cities: Array<{ label: string; value: number }> | undefined;
  isLoading: boolean;
}

const TopCitiesCard: React.FC<TopCitiesCardProps> = ({ cities, isLoading }) => {
  if (isLoading) {
    return (
      <Card elevation={0} variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              sx={{ mr: 1 }}
            />
            <Skeleton variant="text" width={150} height={28} />
          </Box>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rectangular" height={8} sx={{ mt: 0.5 }} />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...(cities?.map((c) => c.value) || [1]));

  return (
    <Card elevation={0} variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              mr: 1,
            }}
          >
            <Iconify icon="solar:map-point-bold-duotone" size={20} />
          </Box>
          <Typography variant="h6">Top 5 Cidades</Typography>
        </Box>

        {cities && cities.length > 0 ? (
          <Box>
            {cities.map((city, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {city.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {city.value}{' '}
                    {city.value === 1 ? 'participante' : 'participantes'}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(city.value / maxValue) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'primary.main',
                      borderRadius: 1,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Nenhum dado disponível
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TopCitiesCard;
