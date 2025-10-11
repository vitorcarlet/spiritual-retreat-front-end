"use client";

import React, { useState } from "react";
import { Avatar, Box, Button, Chip, Stack } from "@mui/material";
import { DataTable, DataTableColumn } from "@/src/components/table/DataTable";
import { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
//import ContemplatedummaryModal from "../ContemplatedummaryModal";
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
import { useModal } from "@/src/hooks/useModal";
import ParticipantForm from "../no-contemplated/ParticipantForm";
import { SendMessage } from "./SendMessage";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

type ContemplatedDataRequest = {
  rows: ContemplatedParticipant[];
  total: number;
  page: number;
  pageLimit: number;
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
  id: string
) => {
  try {
    const response = await apiClient.get<ContemplatedDataRequest>(
      `/retreats/${id}/contemplated`,
      {
        params: filters,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao resgatar contemplados:", error);
    const message = axios.isAxiosError(error)
      ? ((error.response?.data as { error?: string })?.error ?? error.message)
      : "Erro ao reenviar notificação.";
    enqueueSnackbar(message, {
      variant: "error",
      autoHideDuration: 4000,
    });
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

export default function ContemplatedTable({ id }: { id: string }) {
  const modal = useModal();
  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<ContemplatedTableFiltersWithDates>>({
      defaultFilters: {
        page: 1,
        pageLimit: 10,
      },
      excludeFromCount: ["page", "pageLimit", "search"], // Don't count pagination in active filters
    });
  const { data: contemplatedData, isLoading } = useQuery({
    queryKey: ["Contemplated", filters],
    queryFn: () => getContemplated(filters, id),
    staleTime: 5 * 60 * 1000, // 5 minutes,
  });
  const session = useSession();

  // ✅ CORREÇÃO: Usar o tipo correto
  const [selectedRows, setSelectedRows] = useState<
    GridRowSelectionModel | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const filtersConfig = getFilters();

  // ✅ Helper para obter IDs selecionados
  const getSelectedIds = (): GridRowId[] => {
    if (Array.isArray(selectedRows)) {
      return selectedRows;
    }
    if (typeof selectedRows === "object" && "ids" in selectedRows) {
      return Array.from(selectedRows.ids) || [];
    }
    return [];
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  // const handleFiltersChange = (
  //   newFilters: TableDefaultFilters<RetreatsCardTableFilters>
  // ) => {
  //   updateFilters({ ...filters, ...newFilters });
  // };

  const handleApplyFilters = (
    newFilters: Partial<TableDefaultFilters<Record<string, unknown>>>
  ) => {
    updateFilters({ ...filters, ...newFilters });
  };

  const contemplatedDataArray: ContemplatedParticipant[] | undefined =
    Array.isArray(contemplatedData?.rows)
      ? contemplatedData?.rows
      : ([contemplatedData?.rows] as unknown as ContemplatedParticipant[]);

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
          Carregando contemplados
        </Box>
        <Box sx={{ color: "text.secondary", fontSize: 14 }}>
          Aguarde enquanto os dados são carregados.
        </Box>
      </Box>
    );
  }
  function handleOpenMessagesComponent(selectedIds: GridRowId[] | "all"): void {
    const allParticipants = (contemplatedDataArray ?? []).map(
      (participant) => ({
        id: String(participant.id),
        name: participant.name,
      })
    );

    const isAll =
      selectedIds === "all" ||
      (Array.isArray(selectedIds) && selectedIds.length !== 1);

    const initialIds =
      Array.isArray(selectedIds) && !isAll ? [String(selectedIds[0])] : [];

    if (!isAll && initialIds.length) {
      const selectedArray = Array.isArray(selectedIds)
        ? selectedIds
        : [selectedIds];

      selectedArray.forEach((idValue) => {
        if (!allParticipants.find((p) => p.id === String(idValue))) {
          allParticipants.push({
            id: String(idValue),
            name: `Participante ${idValue}`,
          });
        }
      });
    }

    modal.open({
      title: "Enviar Mensagem",
      size: "xl",
      customRender: () => (
        <SendMessage
          retreatId={id}
          mode={isAll ? "all" : "single"}
          participants={allParticipants}
          initialParticipantIds={initialIds}
          onCancel={() => modal.close?.()}
          onSuccess={() => modal.close?.()}
        />
      ),
    });
  }

  const handleOpenParticipantForm = (
    participant: ContemplatedParticipant | null
  ) => {
    modal.open({
      title: "Participant Details",
      size: "md",
      customRender: () => (
        <ParticipantForm participant={participant} disabled retreatId={id} />
      ),
    });
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
        {getSelectedIds().length === 1 && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleOpenMessagesComponent(getSelectedIds())}
          >
            Enviar mensagem para o contemplado selecionado
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleOpenMessagesComponent("all")}
        >
          Enviar mensagens para todos os contemplados
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, maxHeight: "90%" }}>
        <DataTable<ContemplatedParticipant, ContemplatedTableFiltersWithDates>
          rows={contemplatedDataArray}
          rowCount={contemplatedData?.total || 0}
          columns={columns}
          loading={isLoading || loading}
          // Configurações de aparência
          title="Gerenciamento de Usuários"
          subtitle="Lista completa de usuários do sistema"
          autoWidth={true}
          autoHeight={true}
          rowHeight={200}
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
              icon: "lucide:trash-2",
              label: "Ver Mais",
              onClick: (participant) => handleOpenParticipantForm(participant),
              color: "primary",
              //disabled: (user) => user.role === "Admin", // Admins não podem ser deletados
            },
            {
              icon: "lucide:trash-2",
              label: "Enviar Mensagem",
              onClick: (participant) =>
                handleOpenMessagesComponent([participant.id]),
              color: "primary",
              //disabled: (user) => user.role === "Admin", // Admins não podem ser deletados
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
