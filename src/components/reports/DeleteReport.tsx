import { Box, Button, Typography } from "@mui/material";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import Iconify from "../Iconify";

interface DeleteReportProps {
  report: {
    id: string | number;
    name: string;
  };
  onConfirmDelete: (reportId: string | number) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function DeleteReport({
  report,
  onConfirmDelete,
  onClose,
  isLoading = false,
}: DeleteReportProps) {
  const handleDelete = async () => {
    try {
      const snackbarId = enqueueSnackbar("Deletando relatório...", {
        variant: "info",
        autoHideDuration: null,
      });

      onConfirmDelete(report.id);

      closeSnackbar(snackbarId);

      enqueueSnackbar(`Relatório "${report.name}" deletado com sucesso!`, {
        variant: "success",
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
      });

      setTimeout(onClose, 300);
    } catch (error) {
      enqueueSnackbar(
        `Erro ao deletar o relatório: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        {
          variant: "error",
          autoHideDuration: 5000,
          anchorOrigin: { horizontal: "right", vertical: "bottom" },
        }
      );
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Iconify
          icon="lucide:alert-triangle"
          sx={{ fontSize: 24, color: "warning.main" }}
        />
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Tem certeza que deseja deletar este relatório?
        </Typography>
      </Box>

      <Box
        sx={{
          p: 1.5,
          bgcolor: "warning.lighter",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "warning.light",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: "inherit" }}>
          Relatório: {report.name}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5 }}>
          Esta ação não pode ser desfeita.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={isLoading}
          startIcon={
            isLoading ? (
              <Iconify
                icon="lucide:loader"
                sx={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Iconify icon="lucide:trash-2" />
            )
          }
          sx={{
            "@keyframes spin": {
              from: { transform: "rotate(0deg)" },
              to: { transform: "rotate(360deg)" },
            },
          }}
        >
          {isLoading ? "Deletando..." : "Deletar"}
        </Button>
      </Box>
    </Box>
  );
}
