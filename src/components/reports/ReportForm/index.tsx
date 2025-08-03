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
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
} from "@mui/material";
import { HexColorPicker } from "react-colorful";
import Iconify from "@/src/components/Iconify";
import IconSearchField from "../../fields/IconSearchField";

// For the multiselect with chips
interface ChipOption {
  key: string;
  label: string;
}

const reportDataOptions: ChipOption[] = [
  { key: "usuario", label: "Usuário" },
  { key: "contemplado", label: "Contemplado" },
  { key: "participante", label: "Participante" },
  { key: "pagamento", label: "Pagamento" },
];

const customFieldOptions: ChipOption[] = [
  { key: "conhecidos", label: "Conhecidos" },
  { key: "animal_preferido", label: "Animal Preferido" },
  { key: "hobby", label: "Hobby" },
  { key: "comida_favorita", label: "Comida Favorita" },
];

export default function ReportForm() {
  // State for form values
  const [formValues, setFormValues] = useState({
    name: "Camisetas",
    retreat: "Retiro Frai 2025",
    icon: "mdi:tshirt-crew",
    iconColor: "#179B0B",
    period: "current-month",
    reportData: ["usuario", "contemplado"],
    customFields: ["conhecidos", "animal_preferido"],
  });

  // State for color picker open/close
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // Handle period button changes
  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: string | null
  ) => {
    if (newPeriod !== null) {
      setFormValues({ ...formValues, period: newPeriod });
    }
  };

  // Handle multi-select changes
  const handleMultiSelectChange = (field: string) => (event: any) => {
    setFormValues({
      ...formValues,
      [field]: event.target.value,
    });
  };

  // Handle text input changes
  const handleInputChange = (field: string) => (event: any) => {
    setFormValues({
      ...formValues,
      [field]: event.target.value,
    });
  };

  // Handle color change
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
            Novo Modelo
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Name and Retreat fields */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink sx={{ mb: 1, fontSize: "0.875rem" }}>
              Nome
            </InputLabel>
            <TextField
              fullWidth
              value={formValues.name}
              onChange={handleInputChange("name")}
              variant="outlined"
              size="small"
              sx={{ bgcolor: "background.default" }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink sx={{ mb: 1, fontSize: "0.875rem" }}>
              Retiro
            </InputLabel>
            <TextField
              fullWidth
              value={formValues.retreat}
              onChange={handleInputChange("retreat")}
              variant="outlined"
              size="small"
              sx={{ bgcolor: "background.default" }}
            />
          </Grid>

          {/* Icon and Color fields */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink sx={{ mb: 1, fontSize: "0.875rem" }}>
              Ícone
            </InputLabel>
            <IconSearchField
              value={formValues.icon}
              onChange={(icon) => setFormValues({ ...formValues, icon })}
            />
          </Grid>
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
                  Edite a cor do ícone
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

          {/* Period selector */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Período
            </Typography>
            <ToggleButtonGroup
              value={formValues.period}
              exclusive
              onChange={handlePeriodChange}
              aria-label="period selection"
              fullWidth
              sx={{
                bgcolor: "background.default",
                "& .MuiToggleButton-root": {
                  border: "1px solid #ddd",
                  borderRadius: "0 !important",
                  textTransform: "none",
                  py: 1.5,
                },
              }}
            >
              <ToggleButton value="previous-month" aria-label="previous month">
                Mês Anterior
              </ToggleButton>
              <ToggleButton value="previous-day" aria-label="previous day">
                Dia Anterior
              </ToggleButton>
              <ToggleButton value="current-day" aria-label="current day">
                Dia Atual
              </ToggleButton>
              <ToggleButton value="current-month" aria-label="current month">
                Mês Atual
              </ToggleButton>
              <ToggleButton
                value="current-month-2"
                aria-label="current month 2"
              >
                Mês Atual
              </ToggleButton>
              <ToggleButton value="select" aria-label="select custom">
                Selecionar
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Report Data section */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Dados do Relatório
            </Typography>
            <FormControl
              fullWidth
              sx={{ bgcolor: "background.default" }}
              size="small"
            >
              <InputLabel
                shrink
                sx={{
                  position: "absolute",
                  top: -6,
                  left: 8,
                  bgcolor: "background.default",
                  px: 0.5,
                  fontSize: "0.75rem",
                }}
              >
                Label
              </InputLabel>
              <Select
                multiple
                value={formValues.reportData}
                onChange={handleMultiSelectChange("reportData")}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const option = reportDataOptions.find(
                        (opt) => opt.key === value
                      );
                      return (
                        <Chip
                          key={value}
                          label={option ? option.label : value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {reportDataOptions.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Custom Fields section */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Campos Personalizados
            </Typography>
            <FormControl
              fullWidth
              sx={{ bgcolor: "background.default" }}
              size="small"
            >
              <InputLabel
                shrink
                sx={{
                  position: "absolute",
                  top: -6,
                  left: 8,
                  bgcolor: "background.default",
                  px: 0.5,
                  fontSize: "0.75rem",
                }}
              >
                Label
              </InputLabel>
              <Select
                multiple
                value={formValues.customFields}
                onChange={handleMultiSelectChange("customFields")}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const option = customFieldOptions.find(
                        (opt) => opt.key === value
                      );
                      return (
                        <Chip
                          key={value}
                          label={option ? option.label : value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {customFieldOptions.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
