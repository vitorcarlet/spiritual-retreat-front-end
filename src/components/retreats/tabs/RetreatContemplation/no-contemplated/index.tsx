"use client";

import React, { useMemo, useState } from "react";
import { Avatar, Box, Button, Chip, Stack } from "@mui/material";
import { DataTable, DataTableColumn } from "@/src/components/table/DataTable";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { getFilters } from "./getFilters";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import { useQuery } from "@tanstack/react-query";
import FilterButton from "@/src/components/filters/FilterButton";
import SearchField from "@/src/components/filters/SearchField";
import { useSession } from "next-auth/react";
import {
  ContemplatedTableDateFilters,
  ContemplatedTableFilters,
  ContemplatedTableFiltersWithDates,
} from "../types";
import { useTranslations } from "next-intl";
import { getSelectedIds as getSelectedIdsFn } from "@/src/components/table/shared";
import DeleteConfirmation from "@/src/components/confirmations/DeleteConfirmation";
import { useModal } from "@/src/hooks/useModal";
import ParticipantForm, { ParticipantFormValues } from "./ParticipantForm";
import { enqueueSnackbar } from "notistack";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";

type ContemplatedDataRequest = {
  rows: ContemplatedParticipant[];
  total: number;
  page: number;
  pageLimit: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
};

type RegistrationMeta = {
  totalItems?: number;
  itemCount?: number;
};

type RegistrationDTO = {
  id?: string | number | null;
  status?: number | string | null;
  participantName?: string | null;
  participantEmail?: string | null;
  participantPhone?: string | null;
  photoUrl?: string | null;
  avatarUrl?: string | null;
  activity?: string | null;
  paymentStatus?: string | null;
  participation?: boolean | number | string | null;
  attendance?: boolean | number | string | null;
  participant?: {
    id?: string | number | null;
    fullName?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    photoUrl?: string | null;
    activity?: string | null;
  } | null;
  registrationStatus?: number | string | null;
};

type RegistrationApiResponse = {
  data?: RegistrationDTO[];
  items?: RegistrationDTO[];
  rows?: RegistrationDTO[];
  result?: RegistrationDTO[];
  registrations?: RegistrationDTO[];
  total?: number;
  totalCount?: number;
  count?: number;
  meta?: RegistrationMeta;
};

const normalizePaymentStatus = (
  value: unknown
): ContemplatedParticipant["paymentStatus"] => {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (
      ["paid", "pago", "completed"].some((item) => normalized.includes(item))
    ) {
      return "paid";
    }
    if (
      ["overdue", "late", "atrasado"].some((item) => normalized.includes(item))
    ) {
      return "overdue";
    }
    if (
      ["pending", "pendente", "waiting"].some((item) =>
        normalized.includes(item)
      )
    ) {
      return "pending";
    }
  }
  return "pending";
};

const normalizeParticipation = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value === 1;
  }
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return ["true", "1", "yes", "presente", "present"].includes(normalized);
  }
  return false;
};

const getDisplayName = (registration: RegistrationDTO): string => {
  const nested = registration.participant ?? {};
  return (
    nested.fullName ||
    nested.name ||
    registration.participantName ||
    "Participante sem nome"
  );
};

const getDisplayEmail = (registration: RegistrationDTO): string => {
  const nested = registration.participant ?? {};
  return (
    nested.email ||
    registration.participantEmail ||
    registration.participant?.email ||
    ""
  );
};

const getDisplayPhone = (registration: RegistrationDTO): string | undefined => {
  const nested = registration.participant ?? {};
  return nested.phone || registration.participantPhone || undefined;
};

const getActivity = (registration: RegistrationDTO): string => {
  const nested = registration.participant ?? {};
  return (
    (typeof nested.activity === "string" && nested.activity) ||
    (typeof registration.activity === "string" && registration.activity) ||
    "Participante"
  );
};

const getPhotoUrl = (registration: RegistrationDTO): string | undefined => {
  const nested = registration.participant ?? {};
  const value =
    nested.avatarUrl ||
    nested.photoUrl ||
    registration.avatarUrl ||
    registration.photoUrl ||
    undefined;
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
};

const mapRegistrationToParticipant = (
  registration: RegistrationDTO
): ContemplatedParticipant => {
  const rawId = registration.id ?? registration.participant?.id ?? 0;
  const parsedId = Number(rawId);
  const statusValue =
    typeof registration.status === "number"
      ? registration.status
      : typeof registration.status === "string"
        ? Number.parseInt(registration.status, 10)
        : typeof registration.registrationStatus === "number"
          ? registration.registrationStatus
          : typeof registration.registrationStatus === "string"
            ? Number.parseInt(registration.registrationStatus, 10)
            : undefined;

  return {
    id: Number.isFinite(parsedId) ? parsedId : 0,
    name: getDisplayName(registration),
    email: getDisplayEmail(registration),
    phone: getDisplayPhone(registration),
    status: statusValue === 0 ? "not_contemplated" : "contemplated",
    photoUrl: getPhotoUrl(registration),
    activity: getActivity(registration),
    paymentStatus: normalizePaymentStatus(registration.paymentStatus),
    participation: normalizeParticipation(
      registration.participation ?? registration.attendance
    ),
  };
};

const extractRegistrations = (
  payload: RegistrationApiResponse
): RegistrationDTO[] => {
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.result)) return payload.result;
  if (Array.isArray(payload.registrations)) return payload.registrations;
  return [];
};

const extractTotal = (
  payload: RegistrationApiResponse,
  fallback: number
): number => {
  if (typeof payload.total === "number") return payload.total;
  if (typeof payload.totalCount === "number") return payload.totalCount;
  if (typeof payload.count === "number") return payload.count;
  if (payload.meta) {
    if (typeof payload.meta.totalItems === "number") {
      return payload.meta.totalItems;
    }
    if (typeof payload.meta.itemCount === "number") {
      return payload.meta.itemCount;
    }
  }
  return fallback;
};

// Helper para iniciais (caso não haja foto)
const getInitials = (name?: string) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

const getContemplated = async (
  filters: TableDefaultFilters<ContemplatedTableFiltersWithDates>,
  retreatId: string
) => {
  try {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageLimit =
      filters.pageLimit && filters.pageLimit > 0 ? filters.pageLimit : 10;
    const skip = (page - 1) * pageLimit;

    const params: Record<string, unknown> = {
      retreatId,
      status: 0,
      skip,
      take: pageLimit,
    };

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.city) {
      params.region = filters.city;
    }

    if (filters.state) {
      params.state = filters.state;
    }

    if (filters.periodStart) {
      params.periodStart = filters.periodStart;
    }

    if (filters.periodEnd) {
      params.periodEnd = filters.periodEnd;
    }

    const response = await apiClient.get<RegistrationApiResponse>(
      `/api/Registrations`,
      {
        params,
      }
    );

    const registrations = extractRegistrations(response.data).filter((item) => {
      const statusValue =
        typeof item.status === "number"
          ? item.status
          : typeof item.status === "string"
            ? Number.parseInt(item.status, 10)
            : typeof item.registrationStatus === "number"
              ? item.registrationStatus
              : typeof item.registrationStatus === "string"
                ? Number.parseInt(item.registrationStatus, 10)
                : undefined;
      return statusValue === 0;
    });

    const rows = registrations.map(mapRegistrationToParticipant);
    const total = extractTotal(response.data, rows.length);

    return {
      rows,
      total,
      page,
      pageLimit,
      hasNextPage: skip + pageLimit < total,
      hasPrevPage: page > 1,
    } satisfies ContemplatedDataRequest;
  } catch (error) {
    console.error("Erro ao resgatar não contemplados:", error);
    const message = axios.isAxiosError(error)
      ? ((error.response?.data as { error?: string })?.error ?? error.message)
      : "Erro ao carregar inscrições não contempladas.";
    enqueueSnackbar(message, {
      variant: "error",
      autoHideDuration: 4000,
    });
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageLimit =
      filters.pageLimit && filters.pageLimit > 0 ? filters.pageLimit : 10;
    return {
      rows: [],
      total: 0,
      page,
      pageLimit,
      hasNextPage: false,
      hasPrevPage: false,
    } satisfies ContemplatedDataRequest;
  }
};

// Definir as colunas da tabela
const columns: DataTableColumn<ContemplatedParticipant>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 70,
    type: "number",
  },
  {
    field: "photo",
    headerName: "Foto",
    flex: 1,
    minWidth: 250,
    renderCell: (params) => (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ minWidth: 0 }}
      >
        <Avatar
          src={params.row.photoUrl}
          alt={params.row.name}
          sx={{ width: 200, height: 200 }}
        >
          {!params.row.photoUrl && getInitials(params.row.name)}
        </Avatar>
      </Stack>
    ),
  },
  {
    field: "name",
    headerName: "Nome",
    flex: 1,
    minWidth: 180,
  },
  {
    field: "email",
    headerName: "Email",
    flex: 1,
    minWidth: 220,
  },
  {
    field: "phone",
    headerName: "Telefone",
    width: 140,
    valueFormatter: (v: { value?: unknown }) =>
      v?.value ? String(v.value) : "",
  },
  {
    field: "activity",
    headerName: "Atividade",
    flex: 1,
    minWidth: 160,
  },
  {
    field: "status",
    headerName: "Status",
    width: 140,
    renderCell: (params) => {
      const val = params.value as ContemplatedParticipant["status"];
      const map: Record<
        ContemplatedParticipant["status"],
        { label: string; color: "success" | "default" }
      > = {
        contemplated: { label: "Contemplado", color: "success" },
        not_contemplated: { label: "Não Contemplado", color: "default" },
      };
      const cfg = map[val] || map.not_contemplated;
      return (
        <Chip
          label={cfg.label}
          color={cfg.color}
          size="small"
          variant="outlined"
        />
      );
    },
  },
  {
    field: "paymentStatus",
    headerName: "Pagamento",
    width: 150,
    renderCell: (params) => {
      const val = params.value as ContemplatedParticipant["paymentStatus"];
      const map: Record<
        ContemplatedParticipant["paymentStatus"],
        { label: string; color: "success" | "warning" | "error" }
      > = {
        paid: { label: "Pago", color: "success" },
        pending: { label: "Pendente", color: "warning" },
        overdue: { label: "Atrasado", color: "error" },
      };
      const cfg = map[val] || map.pending;
      return (
        <Chip
          label={cfg.label}
          color={cfg.color}
          size="small"
          variant="outlined"
        />
      );
    },
  },
  {
    field: "participation",
    headerName: "Participação",
    width: 150,
    type: "boolean",
    renderCell: (params) => (
      <Chip
        label={params.value ? "Presente" : "Ausente"}
        color={params.value ? "primary" : "default"}
        size="small"
        variant="outlined"
      />
    ),
  },
];

export default function NonContemplatedTable({ id }: { id: string }) {
  const t = useTranslations();
  const modal = useModal();
  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<ContemplatedTableFiltersWithDates>>({
      defaultFilters: {
        page: 1,
        pageLimit: 10,
      },
      excludeFromCount: ["page", "pageLimit", "search"], // Don't count pagination in active filters
    });
  const {
    data: contemplatedData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["NonContemplated", id, filters],
    queryFn: () => getContemplated(filters, id),
    staleTime: 5 * 60 * 1000, // 5 minutes,
  });
  const session = useSession();

  const [selectedRows, setSelectedRows] = useState<
    GridRowSelectionModel | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const filtersConfig = getFilters();

  // ✅ Helper para obter IDs selecionados
  const selectedIds = useMemo(
    () =>
      getSelectedIdsFn<ContemplatedParticipant>({
        data: contemplatedData,
        selectedRows: selectedRows,
      }),
    [contemplatedData, selectedRows]
  );

  const submitNewParticipant = async (participant: ParticipantFormValues) => {
    try {
      await apiClient.post(`/api/Registrations`, {
        ...participant,
        retreatId: id,
      });
      enqueueSnackbar("Participante criado com sucesso", {
        variant: "success",
        preventDuplicate: true,
      });
      await refetch();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Ocorreu um erro ao criar o participante";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 8000,
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
    } finally {
      modal.close();
    }
  };

  const editParticipant = async (participant: ParticipantFormValues) => {
    try {
      await apiClient.put(`/api/Registrations/${participant.id}`, participant);
      enqueueSnackbar("Participante atualizado com sucesso", {
        variant: "success",
        preventDuplicate: true,
      });
      await refetch();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Ocorreu um erro ao atualizar o participante";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 8000,
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
    } finally {
      modal.close();
    }
  };

  const handleOpenParticipantForm = (participantId: string | null) => {
    modal.open({
      title: "Detalhes do Participante",
      size: "md",
      customRender: () => (
        <ParticipantForm
          participantId={participantId}
          onSubmit={
            participantId == null ? submitNewParticipant : editParticipant
          }
          retreatId={id}
        />
      ),
    });
  };

  const handleDeleteParticipant = (participant: ContemplatedParticipant) => {
    modal.open({
      title: "Confirmar exclusão",
      size: "sm",
      customRender: () => (
        <DeleteConfirmation
          title="Excluir participante"
          resourceName={participant.name}
          description="Esta ação não pode ser desfeita e removerá permanentemente o participante."
          requireCheckboxLabel="Eu entendo as consequências."
          onConfirm={async () => {
            try {
              await apiClient.delete(`/api/Registrations/${participant.id}`);
              enqueueSnackbar("Participante excluído com sucesso", {
                variant: "success",
              });
              await refetch();
            } catch (error: unknown) {
              const message = axios.isAxiosError(error)
                ? ((error.response?.data as { error?: string })?.error ??
                  error.message)
                : "Falha ao excluir participante";
              enqueueSnackbar(message, {
                variant: "error",
              });
            } finally {
              modal.close();
            }
          }}
        />
      ),
    });
  };

  const handleBulkAction = () => {
    if (!selectedIds.length) {
      return;
    }
    enqueueSnackbar("Ação em lote ainda não implementada.", {
      variant: "info",
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refetch({ throwOnError: false });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (
    newFilters: Partial<TableDefaultFilters<ContemplatedTableFilters>>
  ) => {
    updateFilters({ ...filters, ...newFilters });
  };

  const contemplatedDataArray: ContemplatedParticipant[] =
    Array.isArray(contemplatedData?.rows) && contemplatedData.rows.length > 0
      ? contemplatedData.rows
      : [];

  if (isLoading || session.status === "loading" || !session.data?.user) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 400,
          width: "100%",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 56,
            height: 56,
            mb: 2,
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: 32,
              fontWeight: 700,
              color: "white",
            }}
          >
            ...
          </Box>
        </Avatar>
        <Box sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
          Carregando participantes não contemplados
        </Box>
        <Box sx={{ color: "text.secondary", fontSize: 14 }}>
          Aguarde enquanto os dados são carregados.
        </Box>
      </Box>
    );
  }

  const handleContemplate = (row: ContemplatedParticipant): void => {
    enqueueSnackbar(
      `Participante ${row.name} marcado para contemplação (em breve).`,
      {
        variant: "info",
      }
    );
  };

  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        minWidth: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: "100%",
        overflowY: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{ mb: 2, display: "flex", gap: 2, height: "10%", minHeight: 40 }}
      >
        <Button variant="contained" onClick={handleRefresh} disabled={loading}>
          {loading ? "Carregando..." : "Atualizar Dados"}
        </Button>

        <FilterButton<
          TableDefaultFilters<ContemplatedTableFilters>,
          ContemplatedTableDateFilters
        >
          filters={filtersConfig}
          defaultValues={filters}
          onApplyFilters={handleApplyFilters}
          onReset={resetFilters}
          activeFiltersCount={activeFiltersCount}
        />

        <SearchField
          sx={{
            height: "100%",
            minWidth: "120px",
            width: "max-content",
            flexShrink: 0,
          }}
          value={filters.search || ""}
          onChange={(e) => {
            updateFilters({ ...filters, search: e });
          }}
          placeholder="search-field"
        />

        {/* ✅ CORREÇÃO: Usar helper para contar */}
        {selectedIds.length > 0 && (
          <Button variant="outlined" color="primary" onClick={handleBulkAction}>
            Contemplar em lote ({selectedIds.length})
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenParticipantForm(null)}
        >
          {t("contemplations.no-contemplated.create-new-participant")}
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, maxHeight: "90%" }}>
        <DataTable<ContemplatedParticipant, ContemplatedTableFiltersWithDates>
          rows={contemplatedDataArray}
          rowCount={contemplatedData?.total || 0}
          columns={columns}
          loading={isLoading || loading}
          rowHeight={200}
          // Configurações de aparência
          title="Gerenciamento de Usuários"
          subtitle="Lista completa de usuários do sistema"
          autoWidth={true}
          autoHeight={true}
          // Paginação
          width={1200}
          height={600}
          pagination={true}
          showToolbar={false}
          paginationMode="server"
          page={filters.page ? filters.page - 1 : 0}
          pageSize={filters.pageLimit || 10}
          pageSizeOptions={[10, 25, 50, 100]}
          onPaginationModelChange={(newModel) => {
            updateFilters({
              ...filters,
              page: newModel.page + 1,
              pageLimit: newModel.pageSize,
            });
          }}
          serverFilters={filters}
          // Seleção
          checkboxSelection={true}
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={setSelectedRows}
          // Virtualização otimizada
          rowBuffer={500}
          columnBuffer={2}
          // Ações personalizadas
          actions={[
            {
              icon: "lucide:eye",
              label: "Ver Mais",
              onClick: (participant) =>
                handleOpenParticipantForm(String(participant.id)),
              color: "primary",
            },
            {
              icon: "lucide:check-circle",
              label: "Contemplar",
              onClick: handleContemplate,
              color: "secondary",
            },
            {
              icon: "lucide:trash-2",
              label: "Excluir participante",
              onClick: handleDeleteParticipant,
              color: "error",
            },
          ]}
          // Eventos
          // onRowDoubleClick={(params) => {
          //   handleView(params.row);
          // }}
        />
      </Box>
    </Box>
  );
}
