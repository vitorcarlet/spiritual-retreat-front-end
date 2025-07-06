import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box, Typography } from "@mui/material";
interface FormSuccessProps {
  message?: string;
}

export const FormSuccess = ({ message }: FormSuccessProps) => {
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
        color: "rgb(16, 185, 129)",
      }}
    >
      <CheckCircleOutlineIcon sx={{ fontSize: "1rem" }} />
      <Typography>{message}</Typography>
    </Box>
  );
};
