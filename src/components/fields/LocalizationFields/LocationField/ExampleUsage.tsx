"use client";

import React, { useState } from "react";
import { Box, Paper, Typography, Button, TextField, Grid } from "@mui/material";
import LocationField from ".";

const ExampleUsage: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: "",
    estado: "",
    cidade: "",
    endereco: "",
  });

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleStateChange = (state: string) => {
    setFormData((prev) => ({
      ...prev,
      estado: state,
      cidade: "", // Limpar cidade quando estado mudar
    }));
  };

  const handleCityChange = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      cidade: city,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Dados do formulário:", formData);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Exemplo: Campo Estado e Cidade
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Nome"
                variant="outlined"
                value={formData.nome}
                onChange={handleInputChange("nome")}
                required
              />
            </Grid>

            {/* ✅ Uso do componente StateField */}
            <Grid size={12}>
              <LocationField
                selectedState={formData.estado}
                selectedCity={formData.cidade}
                onStateChange={handleStateChange}
                onCityChange={handleCityChange}
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Endereço"
                variant="outlined"
                placeholder="Rua, número, bairro"
                value={formData.endereco}
                onChange={handleInputChange("endereco")}
                multiline
                rows={2}
              />
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() =>
                    setFormData({
                      nome: "",
                      estado: "",
                      cidade: "",
                      endereco: "",
                    })
                  }
                >
                  Limpar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Salvar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Preview dos dados */}
        <Box sx={{ mt: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Preview dos dados:
          </Typography>
          <pre style={{ fontSize: "0.875rem" }}>
            {JSON.stringify(formData, null, 2)}
          </pre>
        </Box>
      </Paper>
    </Box>
  );
};

export default ExampleUsage;
