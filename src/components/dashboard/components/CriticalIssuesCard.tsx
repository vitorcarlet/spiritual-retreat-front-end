import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import Iconify from '../../Iconify';

export const CriticalIssuesCard = ({
  issues,
  isLoading,
}: {
  issues: RetreatMetrics['criticalIssues'] | undefined;
  isLoading: boolean;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Tamanhos responsivos para ícones
  const headerIconSize = isMobile ? 4 : 8;
  const issueIconSize = isMobile ? 2 : isTablet ? 4 : 6;

  return (
    <Card
      elevation={0}
      variant="outlined"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardContent sx={{ pb: 1, px: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Header */}
        <Grid
          container
          alignItems="center"
          spacing={1}
          sx={{ mb: { xs: 1.5, sm: 2 } }}
        >
          <Grid size="auto">
            <Iconify
              icon="solar:danger-triangle-bold-duotone"
              color="warning.main"
              size={headerIconSize}
            />
          </Grid>
          <Grid size="grow">
            <Typography variant={isMobile ? 'subtitle1' : 'h6'}>
              Pendências Críticas
            </Typography>
            {!isLoading && issues && (
              <Grid size="auto">
                <Chip
                  label={issues.count}
                  size="small"
                  color="warning"
                  sx={{
                    height: { xs: 20, sm: 24 },
                    '& .MuiChip-label': {
                      px: { xs: 1, sm: 1.5 },
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    },
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />

        {/* Content */}
        {isLoading ? (
          <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
            {[...Array(3)].map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 12 }} key={i}>
                <Skeleton variant="text" width="100%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
              </Grid>
            ))}
          </Grid>
        ) : issues && issues.items.length > 0 ? (
          <Grid container spacing={{ xs: 1, sm: 1.5 }}>
            {issues.items.map((issue) => (
              <Grid size={{ xs: 12, sm: 6, md: 12, lg: 6 }} key={issue.id}>
                <Box
                  sx={{
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: 1,
                    bgcolor: 'background.default',
                    height: '100%',
                  }}
                >
                  <Grid container spacing={1} alignItems="flex-start">
                    <Grid size="auto">
                      <Iconify
                        icon={
                          issue.type === 'payment'
                            ? 'solar:card-bold-duotone'
                            : issue.type === 'team'
                              ? 'solar:home-bold-duotone'
                              : issue.type === 'family'
                                ? 'solar:users-group-rounded-bold-duotone'
                                : 'solar:users-group-bold-duotone'
                        }
                        color={
                          issue.type === 'payment'
                            ? 'error.main'
                            : issue.type === 'team'
                              ? 'warning.main'
                              : issue.type === 'family'
                                ? 'info.main'
                                : 'secondary.main'
                        }
                        size={issueIconSize}
                      />
                    </Grid>
                    <Grid size="grow">
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: {
                            xs: '0.75rem',
                            sm: '0.8rem',
                            md: '0.875rem',
                          },
                          lineHeight: 1.4,
                          wordBreak: 'break-word',
                        }}
                      >
                        {issue.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{
              py: { xs: 2, sm: 3 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            Nenhuma pendência crítica encontrada!
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
