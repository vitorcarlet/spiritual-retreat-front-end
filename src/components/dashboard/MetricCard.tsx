import {
  Card,
  CardContent,
  Box,
  Typography,
  Skeleton,
  LinearProgress,
} from "@mui/material";
import Iconify from "../Iconify";

export const MetricCard = ({
  title,
  value,
  total = null,
  icon,
  color,
  isLoading,
  suffix = "",
}: {
  title: string;
  value: number;
  total?: number | null;
  icon: string;
  color: string;
  isLoading: boolean;
  suffix?: string;
}) => (
  <Card elevation={0} variant="outlined" sx={{ height: "100%" }}>
    <CardContent sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          color: `${color}.main`,
          backgroundColor: `${color}.lighter`,
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Iconify icon={icon} size={24} />
      </Box>

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>

      {isLoading ? (
        <Skeleton variant="text" width="60%" height={40} />
      ) : (
        <Box sx={{ display: "flex", alignItems: "baseline" }}>
          <Typography variant="h4" component="span" fontWeight="bold">
            {value}
            {suffix && (
              <Typography component="span" variant="subtitle1">
                {" "}
                {suffix}
              </Typography>
            )}
          </Typography>

          {total !== null && (
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              / {total}
            </Typography>
          )}
        </Box>
      )}

      {total !== null && !isLoading && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={(value / total) * 100}
            sx={{
              height: 6,
              borderRadius: 1,
              bgcolor: `${color}.lighter`,
              "& .MuiLinearProgress-bar": {
                bgcolor: `${color}.main`,
              },
            }}
          />
        </Box>
      )}
    </CardContent>
  </Card>
);
