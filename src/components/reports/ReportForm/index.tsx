"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { HexColorPicker } from "react-colorful";
import Iconify from "@/src/components/Iconify";
import IconSearchField from "../../fields/IconSearchField";
import { AsynchronousAutoComplete } from "../../select-auto-complete/AsynchronousAutoComplete";
import apiClient from "@/src/lib/axiosClientInstance";

interface RetreatOption {
  label: string;
  value: string;
  id: string;
}

interface ReportType {
  value: string;
  label: string;
}

const reportTypes: ReportType[] = [
  { value: "participant", label: "Participantes" },
  { value: "families", label: "Famílias" },
  { value: "fiveMinutesCard", label: "Cartões 5 Minutos" },
  { value: "botafora", label: "Bota Fora" },
  { value: "tents", label: "Barracas" },
  { value: "ribbons", label: "Fitas" },
];

const fetchRetreats = async (query: string): Promise<RetreatOption[]> => {
  try {
    const response = await apiClient.get("/Retreats", {
      params: {
        status: 1,
        skip: 0,
        take: 50,
        search: query || undefined,
      },
    });

    const retreats = response.data?.data || [];
    return retreats.map((retreat: { id: string; name?: string }) => ({
      label: retreat.name || `Retiro ${retreat.id}`,
      value: retreat.id,
      id: retreat.id,
    }));
  } catch (error) {
    console.error("Error fetching retreats:", error);
    return [];
  }
};

export default function ReportForm() {
  const [formValues, setFormValues] = useState({
    name: "",
    retreat: null as RetreatOption | null,
    reportType: "",
    icon: "mdi:file-document",
    iconColor: "#179B0B",
  });

  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const handleColorChange = (color: string) => {
    setFormValues({
      ...formValues,
      iconColor: color,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{ p: 4, bgcolor: "background.default", borderRadius: 2 }}
      >
        <Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
          <Iconify icon="solar:document-bold" width={24} height={24} />
          <Typography variant="h6" sx={{ ml: 1 }}>
            Novo Modelo de Relatório
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink sx={{ mb: 1, fontSize: "0.875rem" }}>
              Nome do Relatório
            </InputLabel>
            <TextField
              fullWidth
              value={formValues.name}
              onChange={(e) =>
                setFormValues({ ...formValues, name: e.target.value })
              }
              variant="outlined"
              size="small"
              placeholder="Ex: Camisetas, Lista de Presença"
              sx={{ bgcolor: "background.default" }}
            />
          </Grid>

          {/* Report Type */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink sx={{ mb: 1, fontSize: "0.875rem" }}>
              Tipo de Relatório
            </InputLabel>
            <FormControl fullWidth size="small">
              <Select
                value={formValues.reportType}
                onChange={(e) =>
                  setFormValues({ ...formValues, reportType: e.target.value })
                }
                displayEmpty
                sx={{ bgcolor: "background.default" }}
              >
                <MenuItem value="" disabled>
                  Selecione o tipo
                </MenuItem>
                {reportTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Retreat */}
          <Grid size={{ xs: 12 }}>
            <InputLabel shrink sx={{ mb: 1, fontSize: "0.875rem" }}>
              Retiro
            </InputLabel>
            <AsynchronousAutoComplete<RetreatOption>
              fetchOptions={fetchRetreats}
              value={formValues.retreat}
              onChange={(value) =>
                setFormValues({
                  ...formValues,
                  retreat: value as RetreatOption | null,
                })
              }
              label=""
              placeholder="Buscar retiro..."
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(a, b) => a.value === b.value}
              textFieldProps={{
                size: "small",
              }}
            />
          </Grid>

          {/* Icon */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink sx={{ mb: 1, fontSize: "0.875rem" }}>
              Ícone
            </InputLabel>
            <IconSearchField
              value={formValues.icon}
              onChange={(icon) => setFormValues({ ...formValues, icon })}
            />
          </Grid>

          {/* Icon Color */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink sx={{ mb: 1, fontSize: "0.875rem" }}>
              Cor do Ícone
            </InputLabel>
            <Box
              sx={{
                p: 2,
                border: "1px solid #ddd",
                borderRadius: 1,
                bgcolor: "background.default",
                position: "relative",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: formValues.iconColor,
                    borderRadius: 1,
                    mr: 1,
                  }}
                />
                <Typography variant="body2">
                  {formValues.iconColor.toUpperCase()}
                </Typography>
                <Button
                  size="small"
                  sx={{
                    ml: "auto",
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                  }}
                  onClick={() => setColorPickerOpen(!colorPickerOpen)}
                >
                  Editar Cor
                </Button>
              </Box>
              {colorPickerOpen && (
                <Box sx={{ mt: 2, position: "absolute", zIndex: 10 }}>
                  <HexColorPicker
                    color={formValues.iconColor}
                    onChange={handleColorChange}
                  />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Footer with buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 4,
          }}
        >
          <Button variant="outlined" color="inherit" sx={{ px: 3 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#FF9800",
              "&:hover": { bgcolor: "#F57C00" },
              px: 3,
            }}
          >
            Salvar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
