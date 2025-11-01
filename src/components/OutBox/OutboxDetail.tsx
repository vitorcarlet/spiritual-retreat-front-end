"use client";

import { useCallback } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";
import { useSnackbar } from "notistack";
import { OutboxDetail } from "./types";
import { useTranslations } from "next-intl";
import { getApiUrl } from "@/src/lib/apiConfig";

interface OutboxDetailProps {
  outboxId: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export function OutboxDetailView({
  outboxId,
  onClose,
  onSuccess,
}: OutboxDetailProps) {
  const t = useTranslations("retreat-outbox");
  const translate = useCallback(
    (key: string, defaultMessage: string, values?: Record<string, unknown>) =>
      t(key, { defaultMessage, ...values }),
    [t]
  );
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: detail,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-outbox-detail", outboxId],
    queryFn: async () => {
      const response = await apiClient.get<OutboxDetail>(
        `/admin/outbox/${outboxId}`,
        { baseURL: getApiUrl("admin") }
      );
      return response.data;
    },
    enabled: Boolean(outboxId),
  });

  const requeueMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/admin/outbox/${outboxId}/requeue`, {
        baseURL: getApiUrl("admin"),
      });
    },
    onSuccess: async () => {
      enqueueSnackbar(translate("requeue-success", "Mensagem reenfileirada."), {
        variant: "success",
        autoHideDuration: 3000,
      });
      await refetch();
      onSuccess?.();
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : translate(
            "requeue-error",
            "Não foi possível reenfileirar a mensagem."
          );
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 4000,
      });
    },
  });

  const renderJson = useCallback((value: unknown) => {
    if (value === null || value === undefined) {
      return "-";
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, []);

  if (isLoading || !detail) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{ py: 6, minHeight: 240 }}
      >
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">
          {translate("loading-detail", "Carregando detalhes da mensagem...")}
        </Typography>
      </Stack>
    );
  }

  const history = detail.history ?? [];

  return (
    <Stack spacing={3} sx={{ minWidth: { xs: "100%", md: 520 } }}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h6">
            {translate("detail-title", `Mensagem ${detail.id}`, {
              id: detail.id,
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {translate(
              "detail-subtitle",
              `Status ${detail.status} • ${detail.attempts} tentativa(s)`,
              {
                status: detail.status,
                attempts: detail.attempts,
              }
            )}
          </Typography>
        </Box>
        <LoadingButton
          variant="contained"
          color="warning"
          loading={requeueMutation.isPending}
          onClick={() => requeueMutation.mutate()}
        >
          {translate("requeue", "Reenfileirar")}
        </LoadingButton>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip
          label={`${translate("status", "Status")}: ${detail.status}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`${translate("type", "Tipo")}: ${detail.type}`}
          variant="outlined"
        />
        <Chip
          label={`${translate("attempts", "Tentativas")}: ${detail.attempts}`}
          variant="outlined"
        />
        {detail.maxAttempts !== undefined && detail.maxAttempts !== null && (
          <Chip
            label={`${translate("max-attempts", "Máx. tentativas")}: ${detail.maxAttempts}`}
            variant="outlined"
          />
        )}
        <Chip
          label={`${translate("created-at", "Criada em")}: ${formatDateTime(detail.createdAt)}`}
          variant="outlined"
        />
        <Chip
          label={`${translate("processed-at", "Processada em")}: ${formatDateTime(detail.processedAt ?? null)}`}
          variant="outlined"
        />
      </Stack>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {translate("payload", "Payload")}
        </Typography>
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: "background.default",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            maxHeight: 260,
            overflow: "auto",
          }}
        >
          {renderJson(detail.payload)}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {translate("last-error", "Último erro")}
        </Typography>
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 1,
            border: "1px solid",
            borderColor: detail.lastError ? "error.main" : "divider",
            color: detail.lastError ? "error.main" : "text.secondary",
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          {detail.lastError
            ? detail.lastError
            : translate("no-error", "Nenhum erro registrado.")}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {translate("history", "Histórico")}
        </Typography>
        {history.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {translate("no-history", "Nenhum evento registrado.")}
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {history.map((entry) => (
              <Box
                key={entry.id}
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle2">{entry.status}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(entry.timestamp)}
                  </Typography>
                </Stack>
                {entry.message && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {entry.message}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Divider />

      <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
        <LoadingButton variant="outlined" onClick={onClose}>
          {translate("close", "Fechar")}
        </LoadingButton>
      </Stack>
    </Stack>
  );
}

export default OutboxDetailView;
