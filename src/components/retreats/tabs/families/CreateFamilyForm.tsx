"use client";

import { Box, TextField, Button, Stack, CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MuiColorInput } from "mui-color-input";
import apiClient from "@/src/lib/axiosClientInstance";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import { useCallback } from "react"; // Importado
import { ParticipantWithoutFamily, DrawFamiliesResponse } from "./DrawFamilies"; // Ajuste o caminho se necessário
import { AsynchronousAutoComplete } from "@/src/components/select-auto-complete/AsynchronousAutoComplete";

interface CreateFamilyFormProps {
  retreatId: string;
  onSuccess: () => void;
}

const HEX_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

// Nova função de fetch para o autocomplete
// Ela assume que sua API /unassigned aceita um parâmetro de query 'q'
const fetchUnassignedForAutocomplete = async (
  retreatId: string,
  query: string,
  signal?: AbortSignal
): Promise<ParticipantWithoutFamily[]> => {
  const response = await apiClient.get<DrawFamiliesResponse>(
    `/retreats/${retreatId}/families/unassigned`,
    {
      params: { q: query || undefined }, // Envia 'q' se houver query
      signal,
    }
  );
  return response.data?.items ?? [];
};

// Esquema Zod para validar o participante (usado no array)
const participantSchema = z
  .object({
    registrationId: z.string(),
    name: z.string(),
    email: z.string().optional(),
    gender: z.string().optional(),
    city: z.string().optional(),
  })
  .passthrough(); // Permite outros campos

// Esquema Zod atualizado para incluir 'members'
const createFamilySchema = z.object({
  name: z.string().min(1, "Nome da família é obrigatório"),
  color: z.string().regex(HEX_REGEX, "Cor inválida"),
  members: z.array(participantSchema).default([]), // Novo campo
});

type CreateFamilyData = z.infer<typeof createFamilySchema>;

export default function CreateFamilyForm({
  retreatId,
  onSuccess,
}: CreateFamilyFormProps) {
  const t = useTranslations();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateFamilyData>({
    // @ts-ignore
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      name: "",
      color: "#1976d2",
      members: [], // Valor padrão para o novo campo
    },
  });

  // Criamos uma função de fetch "amarrada" ao retreatId
  // para passar ao AsynchronousAutoComplete
  const boundFetchOptions = useCallback(
    (query: string, signal?: AbortSignal) => {
      return fetchUnassignedForAutocomplete(retreatId, query, signal);
    },
    [retreatId]
  );

  const onSubmit = async (data: CreateFamilyData) => {
    try {
      const body = {
        name: data.name,
        // color: data.color, // Adicionado (parecia faltar no seu original)
        memberIds: data.members.map((p) => p.registrationId), // Mapeia os IDs
        ignoreWarnings: true,
      };

      const response = await apiClient.post(
        `/retreats/${retreatId}/create/families`,
        body
      );

      if (response.data) {
        enqueueSnackbar("Família criada com sucesso!", {
          variant: "success",
        });
        reset();
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao criar família:", error);
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao criar família.";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 4000,
      });
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
      }}
    >
      {/* @ts-ignore */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
        <Stack spacing={3}>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <MuiColorInput
                {...field}
                format="hex"
                label={t("family-color")}
                disableAlpha
                value={field.value ?? ""}
                onChange={(value: string) => field.onChange(value)}
                TextFieldProps={{
                  fullWidth: true,
                  required: true,
                  error: !!errors.color,
                  helperText: errors.color?.message,
                }}
              />
            )}
          />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t("family-name")}
                required
                placeholder="Ex: Família São Francisco"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          {/* NOVO COMPONENTE AUTOCPLETE */}
          <Controller
            name="members"
            control={control}
            render={({ field }) => (
              <AsynchronousAutoComplete<ParticipantWithoutFamily>
                multiple
                label={t("add-participants")}
                placeholder={t("search-by-name-or-email")}
                value={field.value ?? []} // Garante que o valor seja sempre um array
                //@ts-ignore
                onChange={(newValue) => {
                  field.onChange(newValue ?? []); // Garante que o onChange envie um array
                }}
                fetchOptions={boundFetchOptions}
                //@ts-ignore
                getOptionLabel={(option) => option.name} // Pega o nome do participante
                //@ts-ignore
                isOptionEqualToValue={(opt, val) =>
                  opt.registrationId === val.registrationId
                }
                //@ts-ignore
                renderOption={(props, option) => (
                  <li {...props} key={option.registrationId}>
                    {option.name}
                  </li>
                )}
                textFieldProps={{
                  //@ts-ignore
                  error: !!errors.members,
                  helperText: (errors.members as any)?.message, // Helper para erros de array
                }}
              />
            )}
          />

          <Stack
            sx={{ flex: 1 }}
            direction="row"
            spacing={2}
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              onClick={onSuccess}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? <CircularProgress size={16} /> : undefined
              }
            >
              {isSubmitting ? t("creating") : t("create-family")}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
