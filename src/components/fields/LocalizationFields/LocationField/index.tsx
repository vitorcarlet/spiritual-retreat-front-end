"use client";

import React, { useState, useEffect } from "react";
import {
  Grid,
  CircularProgress,
  Box,
  Autocomplete,
  TextField,
} from "@mui/material";
import Iconify from "../../../Iconify";
import { Estado, Cidade, StateFieldProps, FALLBACK_STATES } from "../types";

const LocationField: React.FC<StateFieldProps> = ({
  selectedState = "",
  selectedCity = "",
  onStateChange,
  onCityChange,
  disabled = false,
  required = false,
  size = "medium",
  variant = "outlined",
  error = false,
  helperText,
}) => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Carregar estados na inicialização
  useEffect(() => {
    const fetchEstados = async () => {
      setLoadingStates(true);
      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
        );
        const data: Estado[] = await response.json();
        setEstados(data);
      } catch (error) {
        console.error("Erro ao carregar estados:", error);
        // Fallback com alguns estados principais
        setEstados(FALLBACK_STATES);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchEstados();
  }, []);

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    if (selectedState) {
      const estado = estados.find((e) => e.sigla === selectedState);
      if (estado) {
        const fetchCidades = async () => {
          setLoadingCities(true);
          try {
            const response = await fetch(
              `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.id}/municipios?orderBy=nome`
            );
            const data: Cidade[] = await response.json();
            setCidades(data);
          } catch (error) {
            console.error("Erro ao carregar cidades:", error);
            setCidades([]);
          } finally {
            setLoadingCities(false);
          }
        };

        fetchCidades();
      }
    } else {
      setCidades([]);
      if (selectedCity && onCityChange) {
        onCityChange("");
      }
    }
  }, [selectedState, estados, selectedCity, onCityChange]);

  const handleStateChange = (_event: any, newValue: Estado | null) => {
    const newState = newValue?.sigla || "";
    if (onStateChange) {
      onStateChange(newState);
    }
    // Limpar cidade selecionada quando estado mudar
    if (selectedCity && onCityChange) {
      onCityChange("");
    }
  };

  const handleCityChange = (_event: any, newValue: Cidade | null) => {
    const newCity = newValue?.nome || "";
    if (onCityChange) {
      onCityChange(newCity);
    }
  };

  // Encontrar o objeto Estado baseado na sigla selecionada
  const selectedStateObject =
    estados.find((estado) => estado.sigla === selectedState) || null;

  // Encontrar o objeto Cidade baseado no nome selecionado
  const selectedCityObject =
    cidades.find((cidade) => cidade.nome === selectedCity) || null;

  return (
    <Grid container spacing={2}>
      {/* Campo de Estado */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Autocomplete
          fullWidth
          disabled={disabled}
          loading={loadingStates}
          options={estados}
          value={selectedStateObject}
          onChange={handleStateChange}
          getOptionLabel={(option) => `${option.nome} (${option.sigla})`}
          isOptionEqualToValue={(option, value) => option.sigla === value.sigla}
          renderInput={(params) => (
            <TextField
              {...params}
              //   label={
              //     <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              //       <Iconify icon="solar:map-point-bold" size={1.1} />
              //       Estado
              //     </Box>
              //   }
              label="Estado"
              variant={variant}
              size={size}
              required={required}
              error={error}
              helperText={helperText}
              slotProps={{
                input: {
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingStates && (
                        <CircularProgress color="inherit" size={20} />
                      )}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
          renderOption={({ key, ...restProps }, option) => (
            <Box component="li" key={key} {...restProps}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Iconify icon="solar:map-bold" size={1} />
                {option.nome} ({option.sigla})
              </Box>
            </Box>
          )}
          noOptionsText={
            loadingStates ? "Carregando estados..." : "Nenhum estado encontrado"
          }
          loadingText="Carregando estados..."
          clearOnEscape
          selectOnFocus
          handleHomeEndKeys
        />
      </Grid>

      {/* Campo de Cidade */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Autocomplete
          fullWidth
          disabled={disabled || !selectedState}
          loading={loadingCities}
          options={cidades}
          value={selectedCityObject}
          onChange={handleCityChange}
          getOptionLabel={(option) => option.nome}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              //   label={
              //     <>
              //       <Iconify icon="solar:city-bold" size={1.1} />
              //       <Typography>Cidade</Typography>
              //     </>
              //   }
              label="Cidade"
              variant={variant}
              size={size}
              required={required}
              error={error}
              helperText={
                !selectedState ? "Selecione um estado primeiro" : helperText
              }
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <Box
                      sx={{ display: "flex", alignItems: "center", mr: 0.5 }}
                    >
                      <Iconify
                        icon="solar:city-bold"
                        size={1.1}
                        sx={{ color: "text.secondary" }}
                      />
                    </Box>
                  ),
                  endAdornment: (
                    <>
                      {loadingCities && (
                        <CircularProgress color="inherit" size={20} />
                      )}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
          renderOption={({ key, ...restProps }, option) => (
            <Box component="li" key={key} {...restProps}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Iconify icon="solar:buildings-bold" size={1} />
                {option.nome}
              </Box>
            </Box>
          )}
          noOptionsText={
            !selectedState
              ? "Primeiro selecione um estado"
              : loadingCities
              ? "Carregando cidades..."
              : "Nenhuma cidade encontrada"
          }
          loadingText="Carregando cidades..."
          clearOnEscape
          selectOnFocus
          handleHomeEndKeys
          filterOptions={(options, { inputValue }) => {
            // Filtro customizado para busca mais flexível
            const filterValue = inputValue.toLowerCase();
            return options.filter((option) =>
              option.nome.toLowerCase().includes(filterValue)
            );
          }}
        />
      </Grid>
    </Grid>
  );
};

export default LocationField;
