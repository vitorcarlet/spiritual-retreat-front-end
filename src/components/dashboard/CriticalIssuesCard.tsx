import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Divider,
  Skeleton,
} from "@mui/material";
import Iconify from "../Iconify";
import { RetreatMetrics } from "./types";

export const CriticalIssuesCard = ({
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
