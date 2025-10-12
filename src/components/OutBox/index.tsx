"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ButtonProps } from "@mui/material/Button";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import axios from "axios";
import apiClient from "@/src/lib/axiosClientInstance";
import { useModal } from "@/src/hooks/useModal";
import { DataTable, DataTableColumn } from "@/src/components/table/DataTable";
import OutboxSummaryCards from "./OutboxSummaryCards";
import OutboxDetailView from "./OutboxDetail";
import { OutboxListResponse, OutboxMessage, OutboxSummary } from "./types";

type TableFilters = {
  page: number;
  pageLimit: number;
  processed: string;
  status: string;
  type: string;
  startDate: string;
  endDate: string;
};

const defaultFilters: TableFilters = {
  page: 1,
  pageLimit: 10,
  processed: "",
  status: "",
  type: "",
  startDate: "",
  endDate: "",
};

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendente" },
  { value: "processing", label: "Processando" },
  { value: "processed", label: "Processada" },
  { value: "failed", label: "Falhou" },
];

const processedOptions = [
  { value: "", label: "Todos" },
  { value: "true", label: "Processado" },
  { value: "false", label: "Não processado" },
];

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

const statusColorMap: Record<OutboxMessage["status"], ButtonProps["color"]> = {
  pending: "warning",
  processing: "info",
  processed: "success",
  failed: "error",
  queued: "info",
  unknown: "inherit",
};

export default function RetreatOutboxTab() {
  const t = useTranslations("retreat-outbox");
  const translate = useCallback(
    (key: string, defaultMessage: string) => t(key, { defaultMessage }),
    [t]
  );
  const modal = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const [filters, setFilters] = useState<TableFilters>(defaultFilters);

  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["admin-outbox-summary"],
    queryFn: async () => {
      const response = await apiClient.get<OutboxSummary>(
        "/admin/outbox/summary"
      );
      return response.data;
    },
  });

  const {
    data: tableData,
    isLoading: isTableLoading,
    refetch: refetchTable,
    isError: isTableError,
  } = useQuery({
    queryKey: ["admin-outbox", filters],
    queryFn: async () => {
      try {
        const params: Record<string, string | number | boolean> = {
          limit: filters.pageLimit,
          page: filters.page,
        };

        if (filters.processed) {
          params.processed = filters.processed === "true";
        }

        if (filters.status) {
          params.status = filters.status;
        }

        if (filters.type) {
          params.type = filters.type;
        }

        if (filters.startDate) {
          params.startDate = filters.startDate;
        }

        if (filters.endDate) {
          params.endDate = filters.endDate;
        }

        const response = await apiClient.get<OutboxListResponse>(
          "/admin/outbox",
          { params }
        );
        return response.data;
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ??
            error.message)
          : translate("fetch-error", "Não foi possível carregar o outbox.");
        enqueueSnackbar(message, {
          variant: "error",
          autoHideDuration: 4000,
        });
        throw error;
      }
    },
  });

  const rows = useMemo(() => tableData?.items ?? [], [tableData]);

  const columns = useMemo<DataTableColumn<OutboxMessage>[]>(
    () => [
      {
        field: "id",
        headerName: translate("columns.id", "ID"),
        flex: 1,
        minWidth: 180,
      },
      {
        field: "type",
        headerName: translate("columns.type", "Tipo"),
        flex: 1,
        minWidth: 160,
      },
      {
        field: "status",
        headerName: translate("columns.status", "Status"),
        flex: 0.8,
        minWidth: 130,
        renderCell: (params: { value?: unknown } | null) => {
          const status =
            (params?.value as OutboxMessage["status"]) ?? "unknown";
          const buttonColor: ButtonProps["color"] =
            statusColorMap[status] ?? "inherit";
          return (
            <Button
              variant="outlined"
              color={buttonColor}
              size="small"
              sx={{ pointerEvents: "none" }}
            >
              {status}
            </Button>
          );
        },
      },
      {
        field: "attempts",
        headerName: translate("columns.attempts", "Tentativas"),
        width: 120,
        valueFormatter: (params: { value?: unknown } | null) =>
          String(params?.value ?? 0),
      },
      {
        field: "createdAt",
        headerName: translate("columns.createdAt", "Criada em"),
        minWidth: 180,
        flex: 1,
        valueFormatter: (params: { value?: unknown } | null) =>
          formatDateTime((params?.value as string) ?? undefined),
      },
      {
        field: "processedAt",
        headerName: translate("columns.processedAt", "Processada em"),
        minWidth: 180,
        flex: 1,
        valueFormatter: (params: { value?: unknown } | null) =>
          formatDateTime((params?.value as string) ?? undefined),
      },
    ],
    [translate]
  );

  const handleFilterChange = useCallback(
    (key: keyof TableFilters, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: key === "page" ? Number(value) : 1,
      }));
    },
    []
  );

  const openDetail = useCallback(
    (record: OutboxMessage) => {
      modal.open({
        title: t("detail-modal-title", {
          id: record.id,
          defaultMessage: `Mensagem ${record.id}`,
        }),
        size: "lg",
        customRender: () => (
          <OutboxDetailView
            outboxId={record.id}
            onClose={() => modal.close?.()}
            onSuccess={() => {
              void Promise.all([refetchSummary(), refetchTable()]);
            }}
          />
        ),
      });
    },
    [modal, refetchSummary, refetchTable, t]
  );

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h5">
        {translate("page-title", "Fila de mensagens (Outbox)")}
      </Typography>

      <OutboxSummaryCards summary={summary} isLoading={isSummaryLoading} />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <TextField
          select
          label={translate("filters.status", "Status")}
          value={filters.status}
          onChange={(event) => handleFilterChange("status", event.target.value)}
          sx={{ minWidth: 180 }}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label={translate("filters.processed", "Processado")}
          value={filters.processed}
          onChange={(event) =>
            handleFilterChange("processed", event.target.value)
          }
          sx={{ minWidth: 180 }}
        >
          {processedOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label={translate("filters.type", "Tipo")}
          value={filters.type}
          onChange={(event) => handleFilterChange("type", event.target.value)}
          sx={{ minWidth: 200 }}
          placeholder={translate("filters.type-placeholder", "Ex: email, sms")}
        />

        <TextField
          label={translate("filters.startDate", "Data inicial")}
          type="date"
          value={filters.startDate}
          onChange={(event) =>
            handleFilterChange("startDate", event.target.value)
          }
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label={translate("filters.endDate", "Data final")}
          type="date"
          value={filters.endDate}
          onChange={(event) =>
            handleFilterChange("endDate", event.target.value)
          }
          InputLabelProps={{ shrink: true }}
        />

        <Button variant="text" color="inherit" onClick={handleResetFilters}>
          {translate("filters.reset", "Limpar filtros")}
        </Button>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataTable<OutboxMessage, TableFilters>
          rows={rows}
          rowCount={tableData?.total ?? 0}
          columns={columns}
          loading={isTableLoading}
          title={translate("table.title", "Mensagens na fila")}
          subtitle={translate(
            "table.subtitle",
            "Acompanhe o processamento de notificações."
          )}
          autoHeight={false}
          height="100%"
          pagination
          showToolbar={false}
          paginationMode="server"
          page={filters.page ? filters.page - 1 : 0}
          pageSize={filters.pageLimit}
          pageSizeOptions={[10, 25, 50, 100]}
          onPaginationModelChange={(model) => {
            setFilters((prev) => ({
              ...prev,
              page: model.page + 1,
              pageLimit: model.pageSize,
            }));
          }}
          serverFilters={filters}
          checkboxSelection={false}
          actions={[
            {
              icon: "lucide:scan-text",
              label: translate("table.actions.view", "Ver detalhes"),
              onClick: (row) => openDetail(row),
              color: "primary",
            },
          ]}
          noRowsOverlay={
            <Stack
              spacing={1}
              alignItems="center"
              justifyContent="center"
              sx={{ py: 4 }}
            >
              <Typography variant="body2" color="text.secondary">
                {isTableError
                  ? translate("table.error", "Erro ao carregar mensagens.")
                  : translate("table.empty", "Nenhuma mensagem encontrada.")}
              </Typography>
            </Stack>
          }
        />
      </Box>
    </Box>
  );
}
