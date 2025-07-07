import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { Box, Typography } from "@mui/material";

interface FormErrorProps {
  message?: string;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <Box
      sx={{
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        padding: 3,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        gap: 2,
        fontSize: "0.875rem",
        color: "primary.success",
      }}
    >
      <ReportProblemIcon sx={{ fontSize: "1rem" }} />
      <Typography>{message}</Typography>
    </Box>
  );
};
