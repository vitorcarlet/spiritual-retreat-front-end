"use client";

import React, { useMemo, useState } from "react";
import { Avatar, Box, Button, Chip, Stack } from "@mui/material";
import { DataTable, DataTableColumn } from "@/src/components/table/DataTable";
import { GridRowSelectionModel } from "@mui/x-data-grid";
//import ContemplatedummaryModal from "../ContemplatedummaryModal";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
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
import { RetreatsCardTableFilters } from "@/src/components/public/retreats/types";
import { getSelectedIds as getSelectedIdsFn } from "@/src/components/table/shared";
import DeleteConfirmation from "@/src/components/confirmations/DeleteConfirmation";
import { useModal } from "@/src/hooks/useModal";
import ParticipantForm, { ParticipantFormValues } from "./ParticipantForm";
import requestServer from "@/src/lib/requestServer";
import { enqueueSnackbar } from "notistack";
import { DefaultResponse } from "@/src/auth/types";

type ContemplatedDataRequest = {
  rows: ContemplatedParticipant[];
  total: number;
  page: number;
  pageLimit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
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
  const response = await handleApiResponse<ContemplatedDataRequest>(
    await sendRequestServerVanilla.get(`/retreats/${id}/non-contemplated`, {
      params: filters,
    })
  );

  if (!response || response.error) {
    throw new Error("Failed to fetch Non-Contemplated");
  }
  return response.data as ContemplatedDataRequest;
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
  const selectedIds = useMemo(
    () =>
      getSelectedIdsFn<ContemplatedParticipant>({
        data: contemplatedData,
        selectedRows: selectedRows,
      }),
    [contemplatedData, selectedRows]
  );

  //console.log(getSelectedIds, "getSelectedIds");

  const submitNewParticipant = async (participant: ParticipantFormValues) => {
    // Lógica para enviar o novo participante ao servidor
    try {
      const data = await requestServer.post<ContemplatedParticipant>(
        `/no-contemplated`,
        participant
      );
      if (data.success) {
        enqueueSnackbar((data as DefaultResponse).message, {
          variant: "success",
          preventDuplicate: true,
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro na requisição";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 8000,
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
    } finally {
      modal.close();
    }
    // Aqui você pode fazer uma chamada API para salvar o participante
  };

  const editParticipant = async (participant: ParticipantFormValues) => {
    // Lógica para editar o participante no servidor
    try {
      const data = await requestServer.put<ContemplatedParticipant>(
        `/no-contemplated/${participant.id}`,
        participant
      );
      if (data.success) {
        enqueueSnackbar((data as DefaultResponse).message, {
          variant: "success",
          preventDuplicate: true,
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro na requisição";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 8000,
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
    } finally {
      modal.close();
    }
  };

  const handleOpenParticipantForm = (
    participant: ContemplatedParticipant | null
  ) => {
    modal.open({
      title: "Participant Details",
      size: "md",
      customRender: () => (
        <ParticipantForm
          participant={participant}
          onSubmit={
            participant == null ? submitNewParticipant : editParticipant
          }
          retreatId={id}
        />
      ),
    });
  };

  const handleDeleteParticipant = (participant: ContemplatedParticipant) => {
    modal.open({
      title: "Confirm deletion",
      size: "sm",
      customRender: () => (
        <DeleteConfirmation
          title="Delete participant"
          resourceName={participant.name}
          description="This action cannot be undone and will permanently remove the participant."
          requireCheckboxLabel="I understand the consequences."
          onConfirm={async () => {
            try {
              const res = await sendRequestServerVanilla.delete(
                `/Contemplated/${participant.id}`
              );
              const result = await handleApiResponse(res);
              if (result.error) {
                throw new Error(result.error || "Server error");
              }
              // Optionally trigger a refetch outside
              if (typeof window !== "undefined") {
                const { enqueueSnackbar } = await import("notistack");
                enqueueSnackbar("User deleted successfully", {
                  variant: "success",
                });
              }
            } catch (err: unknown) {
              if (typeof window !== "undefined") {
                const { enqueueSnackbar } = await import("notistack");
                const message =
                  err instanceof Error ? err.message : "Failed to delete user";
                enqueueSnackbar(message, {
                  variant: "errorMUI",
                });
              }
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
    newFilters: Partial<TableDefaultFilters<RetreatsCardTableFilters>>
  ) => {
    updateFilters({ ...filters, ...newFilters });
  };

  const contemplatedDataArray: ContemplatedParticipant[] | undefined =
    Array.isArray(contemplatedData?.rows)
      ? contemplatedData?.rows
      : ([contemplatedData?.rows] as unknown as ContemplatedParticipant[]);

  if (isLoading || session.status === "loading" || !session.data?.user) {
    return <div>Carregando usuários...</div>;
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
              icon: "lucide:trash-2",
              label: "Ver Mais",
              onClick: (participant) => handleOpenParticipantForm(participant),
              color: "primary",
              //disabled: (user) => user.role === "Admin", // Admins não podem ser deletados
            },
            {
              icon: "lucide:trash-2",
              label: "Contemplar",
              onClick: handleContemplate,
              color: "secondary",
              //disabled: (user) => user.role === "Admin", // Admins não podem ser deletados
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
