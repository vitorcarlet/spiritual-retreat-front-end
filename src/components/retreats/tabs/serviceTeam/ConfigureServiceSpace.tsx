"use client";

import {
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
  TextField,
  Alert,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";

interface ConfigureServiceSpaceProps {
  retreatId: string;
  onSuccess: () => void;
}

interface ServiceSpaceCapacityItem {
  spaceId: string;
  name?: string;
  minPeople: number;
  maxPeople: number;
}

interface ServiceSpaceCapacityConfig {
  applyToAll: boolean;
  minPeople: number;
  maxPeople: number;
  items?: ServiceSpaceCapacityItem[];
}

interface ServiceSpace {
  spaceId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  isLocked: boolean;
  minPeople: number;
  maxPeople: number;
  allocated: number;
}

const configureServiceSpaceSchema = z
  .object({
    applyToAll: z.boolean().default(false),
    minPeople: z
      .number()
      .min(0, "Mínimo deve ser 0 ou maior")
      .max(100, "Máximo é 100"),
    maxPeople: z
      .number()
      .min(0, "Máximo deve ser 0 ou maior")
      .max(100, "Máximo é 100"),
  })
  .refine((data) => data.maxPeople >= data.minPeople, {
    message: "Capacidade máxima deve ser maior ou igual à mínima",
    path: ["maxPeople"],
  });

type ConfigureServiceSpaceData = z.infer<typeof configureServiceSpaceSchema>;

export default function ConfigureServiceSpace({
  retreatId,
  onSuccess,
}: ConfigureServiceSpaceProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serviceSpaces, setServiceSpaces] = useState<ServiceSpace[]>([]);
  //   const [currentConfig, setCurrentConfig] =
  //     useState<ServiceSpaceCapacityConfig | null>(null);
  const [originalConfigs, setOriginalConfigs] = useState<
    Map<string, { min: number; max: number }>
  >(new Map());
  const [individualConfigs, setIndividualConfigs] = useState<
    Map<string, { min: number; max: number }>
  >(new Map());

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ConfigureServiceSpaceData>({
    resolver: zodResolver(configureServiceSpaceSchema),
    defaultValues: {
      applyToAll: false,
      minPeople: 0,
      maxPeople: 0,
    },
  });

  const applyToAll = watch("applyToAll");
  const minPeople = watch("minPeople");
  const maxPeople = watch("maxPeople");

  // Buscar espaços de serviço e configuração atual
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar espaços de serviço
        const spacesResponse = await apiClient.get<{
          items: ServiceSpace[];
        }>(`/retreats/${retreatId}/service/spaces`);

        const spaces = spacesResponse.data?.items || [];
        setServiceSpaces(spaces);

        // Criar mapa com valores atuais dos espaços
        const configMap = new Map<string, { min: number; max: number }>();
        spaces.forEach((space) => {
          configMap.set(space.spaceId, {
            min: space.minPeople,
            max: space.maxPeople,
          });
        });
        setOriginalConfigs(new Map(configMap));
        setIndividualConfigs(new Map(configMap));
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ??
            error.message)
          : "Erro ao carregar configurações";
        enqueueSnackbar(message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [retreatId, reset]);

  const handleIndividualChange = (
    spaceId: string,
    field: "min" | "max",
    value: number
  ) => {
    const current = individualConfigs.get(spaceId) || { min: 0, max: 0 };
    setIndividualConfigs(
      new Map(individualConfigs).set(spaceId, {
        ...current,
        [field === "min" ? "min" : "max"]: value,
      })
    );
  };

  const onSubmit = async (data: ConfigureServiceSpaceData) => {
    setSubmitting(true);
    try {
      const payload: ServiceSpaceCapacityConfig = {
        applyToAll: data.applyToAll,
        minPeople: data.minPeople,
        maxPeople: data.maxPeople,
      };

      if (data.applyToAll) {
        // Se aplicar a todos, enviar todos os itens com novos valores
        payload.items = serviceSpaces.map((space) => ({
          spaceId: space.spaceId,
          name: space.name,
          minPeople: data.minPeople,
          maxPeople: data.maxPeople,
        }));
      } else {
        // Se não aplicar a todos, enviar apenas os itens que foram modificados
        const modifiedItems: ServiceSpaceCapacityItem[] = [];

        individualConfigs.forEach((config, spaceId) => {
          const original = originalConfigs.get(spaceId);
          const space = serviceSpaces.find((s) => s.spaceId === spaceId);

          // Verifica se algo foi modificado
          if (
            space &&
            (config.min !== original?.min || config.max !== original?.max)
          ) {
            modifiedItems.push({
              spaceId: space.spaceId,
              name: space.name,
              minPeople: config.min,
              maxPeople: config.max,
            });
          }
        });

        payload.items = modifiedItems;

        if (modifiedItems.length === 0) {
          enqueueSnackbar("Nenhuma alteração foi feita", {
            variant: "info",
          });
          return;
        }
      }

      await apiClient.post(
        `/retreats/${retreatId}/service/spaces/capacity`,
        payload
      );

      enqueueSnackbar("Configurações atualizadas com sucesso!", {
        variant: "success",
      });

      // Atualizar mapa de originais após sucesso
      setOriginalConfigs(new Map(individualConfigs));

      onSuccess();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao salvar configurações";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Configure a capacidade mínima e máxima de pessoas por equipe de
            serviço.
          </Typography>

          {/* {currentConfig && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Equipes configuradas:</strong> {serviceSpaces.length}
              </Typography>
            </Alert>
          )} */}

          {/* Toggle Aplicar a Todos */}
          <Controller
            name="applyToAll"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="Aplicar configuração a todos os espaços de serviço"
              />
            )}
          />

          <Divider />

          {applyToAll ? (
            // Modo: Aplicar a Todos
            <Stack spacing={2}>
              <Typography variant="subtitle2" gutterBottom>
                Configuração Global
              </Typography>

              <Controller
                name="minPeople"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Capacidade Mínima"
                    fullWidth
                    inputProps={{ min: 0, max: 100 }}
                    error={!!errors.minPeople}
                    helperText={errors.minPeople?.message}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 0)
                    }
                  />
                )}
              />

              <Controller
                name="maxPeople"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Capacidade Máxima"
                    fullWidth
                    inputProps={{ min: 0, max: 100 }}
                    error={!!errors.maxPeople}
                    helperText={errors.maxPeople?.message}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 0)
                    }
                  />
                )}
              />

              <Box
                sx={{ bgcolor: "background.default", p: 2, borderRadius: 1 }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Preview:
                </Typography>
                <Typography variant="body2">
                  • Mínimo: {minPeople} pessoas
                </Typography>
                <Typography variant="body2">
                  • Máximo: {maxPeople} pessoas
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Será aplicado a {serviceSpaces.length} espaço(s) de serviço
                </Typography>
              </Box>
            </Stack>
          ) : (
            // Modo: Configuração Individual
            <Stack spacing={2}>
              <Typography variant="subtitle2" gutterBottom>
                Configuração Individual por Espaço
              </Typography>

              <List
                sx={{
                  maxHeight: 400,
                  overflow: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                {serviceSpaces.map((space, index) => {
                  const config = individualConfigs.get(space.spaceId) || {
                    min: 0,
                    max: 0,
                  };
                  const original = originalConfigs.get(space.spaceId) || {
                    min: 0,
                    max: 0,
                  };
                  const isModified =
                    config.min !== original.min || config.max !== original.max;

                  return (
                    <Box key={space.spaceId}>
                      <ListItem
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                          alignItems: "flex-start",
                          bgcolor: isModified
                            ? "warning.lighter"
                            : "transparent",
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 150 }}>
                          <ListItemText
                            primary={space.name}
                            secondary={`ID: ${space.spaceId}`}
                          />
                          {isModified && (
                            <Typography variant="caption" color="warning.main">
                              ✏️ Modificado
                            </Typography>
                          )}
                        </Box>

                        <TextField
                          type="number"
                          label="Mín."
                          size="small"
                          inputProps={{ min: 0, max: 100 }}
                          value={config.min}
                          onChange={(e) =>
                            handleIndividualChange(
                              space.spaceId,
                              "min",
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          sx={{ width: 80 }}
                        />

                        <TextField
                          type="number"
                          label="Máx."
                          size="small"
                          inputProps={{ min: 0, max: 100 }}
                          value={config.max}
                          onChange={(e) =>
                            handleIndividualChange(
                              space.spaceId,
                              "max",
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          sx={{ width: 80 }}
                        />
                      </ListItem>
                      {index < serviceSpaces.length - 1 && <Divider />}
                    </Box>
                  );
                })}
              </List>
            </Stack>
          )}

          <Stack
            sx={{ flex: 1 }}
            direction="row"
            spacing={2}
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              onClick={onSuccess}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={
                submitting ? <CircularProgress size={16} /> : undefined
              }
            >
              {submitting ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
