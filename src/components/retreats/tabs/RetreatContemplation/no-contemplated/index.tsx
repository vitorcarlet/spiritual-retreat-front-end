"use client";

import React, { useState } from "react";
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
import { useModal } from "@/src/hooks/useModal";
import { enqueueSnackbar } from "notistack";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";
import LotteryModal from "../LotteryModal";
import ParticipantForm, { ParticipantFormValues } from "./ParticipantForm";
import {
  extractRegistrations,
  mapRegistrationToParticipant,
  getInitials,
  formatDateToBR,
} from "../shared";
import ParticipantPublicFormTabCreate from "./ParticipantPublicFormTabCreate";
import { DEFAULT_FILTERS_NO_CONTEMPLATED } from "./shared";
import { useContemplationPermissions } from "../hooks/useContemplationPermissions";
import { useMenuMode } from "@/src/contexts/users-context/MenuModeContext";

const getNoContemplated = async (
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
      skip,
      take: pageLimit,
      status: "NotSelected",
      category: "Guest",
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

    const response = await apiClient.get<Record<string, unknown>>(
      `/Registrations`,
      {
        params,
      }
    );

    const registrations = extractRegistrations(response.data).filter((item) => {
      // Filtrar apenas NotSelected e Guest
      return item.status === "NotSelected";
    });

    const rows = registrations.map((registration) =>
      mapRegistrationToParticipant(registration)
    );
    // const total = extractTotal(response.data, rows.length);
    const total = rows.length;
    return {
      rows,
      total,
      page,
      pageLimit,
      hasNextPage: skip + pageLimit < total,
      hasPrevPage: page > 1,
    };
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
    };
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
      const map: Partial<
        Record<
          ContemplatedParticipant["status"],
          { label: string; color: "success" | "default" }
        >
      > = {
        contemplated: { label: "Contemplado", color: "success" },
        not_contemplated: { label: "Não Contemplado", color: "default" },
      };
      const cfg = map[val] ?? { label: "Não Contemplado", color: "default" };
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
  {
    field: "registrationDate",
    headerName: "Data de Inscrição",
    width: 200,
    valueFormatter: (v: { value?: unknown }) => {
      if (typeof v?.value === "string") {
        return formatDateToBR(v.value);
      }
      return "";
    },
  },
];

export default function NonContemplatedTable({ id }: { id: string }) {
  const t = useTranslations();
  const modal = useModal();
  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<ContemplatedTableFiltersWithDates>>({
      defaultFilters: DEFAULT_FILTERS_NO_CONTEMPLATED,
      excludeFromCount: ["page", "pageLimit", "search"], // Don't count pagination in active filters
    });
  const {
    data: contemplatedData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["NonContemplated", id, filters],
    queryFn: () => getNoContemplated(filters, id),
    //staleTime: 5 * 60 * 1000, // 5 minutes,
  });
  const session = useSession();
  const { canEditRetreat } = useContemplationPermissions();
  const { menuMode } = useMenuMode();
  const menuModeBoolean = menuMode === "edit" ? true : false;

  const [selectedRows, setSelectedRows] = useState<
    GridRowSelectionModel | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);

  const filtersConfig = getFilters();

  // ✅ Helper para obter IDs selecionados
  // const selectedIds = useMemo(
  //   () =>
  //     getSelectedIdsFn<ContemplatedParticipant>({
  //       data: contemplatedData,
  //       selectedRows: selectedRows,
  //     }),
  //   [contemplatedData, selectedRows]
  // );

  const editParticipant = async (participant: ParticipantFormValues) => {
    try {
      await apiClient.put(`/Registrations/${participant.id}`, participant);
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

  const handleOpenParticipantModal = (participantId: string) => {
    modal.open({
      title: "Detalhes do Participante",
      size: "md",
      customRender: () => (
        <ParticipantForm
          participantId={participantId}
          onSubmit={editParticipant}
          retreatId={id}
          menuMode={menuMode}
        />
      ),
    });
  };

  const handleCreateNewParticipant = (retreatId: string) => {
    modal.open({
      title: "Criar Novo Participante",
      size: "md",
      customRender: () => (
        <ParticipantPublicFormTabCreate
          retreatId={retreatId}
          onSuccess={() => {
            modal.close?.();
            refetch();
          }}
        />
      ),
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
    setSelectedRows(undefined); // Reseta seleção
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
          height: { xs: 50, sm: 75, md: 100, lg: 400 },
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

  const handleContemplate = async (
    row: ContemplatedParticipant
  ): Promise<void> => {
    try {
      await apiClient.post(`/retreats/${id}/selections/${row.id}`);

      enqueueSnackbar(`Participante ${row.name} contemplado com sucesso!`, {
        variant: "success",
      });

      // Refetch data to update the list
      await refetch();
    } catch (error) {
      console.error("Erro ao contemplar participante:", error);
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao contemplar participante";

      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 5000,
      });
    }
  };

  const handleOpenLottery = () => {
    modal.open({
      title: "Loteria de Participantes",
      size: "xl",
      customRender: () => (
        <LotteryModal
          retreatId={id}
          onSuccess={() => {
            modal.close?.();
            // Refetch data to update the list
            refetch();
          }}
          onCancel={() => modal.close?.()}
        />
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
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 1, sm: 2 },
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 4px)", md: "initial" },
          }}
        >
          <Button
            fullWidth
            variant="contained"
            onClick={handleRefresh}
            disabled={loading}
            sx={{ height: 40 }}
          >
            {loading ? "Carregando..." : "Atualizar Dados"}
          </Button>
        </Box>

        <Box
          sx={{
            flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 4px)", md: "initial" },
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => handleCreateNewParticipant(id)}
            disabled={!canEditRetreat || !menuModeBoolean}
            sx={{ height: 40 }}
          >
            {t("contemplations.no-contemplated.create-new-participant")}
          </Button>
        </Box>

        <Box
          sx={{
            flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 4px)", md: "initial" },
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handleOpenLottery}
            disabled={!canEditRetreat || !menuModeBoolean}
            sx={{ height: 40 }}
          >
            Realizar Sorteio
          </Button>
        </Box>

        <Box
          sx={{
            flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 4px)", md: "initial" },
          }}
        >
          <FilterButton<
            TableDefaultFilters<ContemplatedTableFilters>,
            ContemplatedTableDateFilters
          >
            fullWidth
            filters={filtersConfig}
            defaultValues={filters}
            onApplyFilters={handleApplyFilters}
            onReset={resetFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </Box>

        <Box
          sx={{
            flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 4px)", md: "1 1 auto" },
          }}
        >
          <SearchField
            value={filters.search || ""}
            onChange={(e) => {
              updateFilters({ ...filters, search: e });
            }}
            placeholder="search-field"
          />
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, maxHeight: "90%" }}>
        <DataTable<ContemplatedParticipant, ContemplatedTableFiltersWithDates>
          rows={contemplatedDataArray}
          rowCount={contemplatedData?.total || 0}
          columns={columns}
          loading={isFetching || isLoading || loading}
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
          disableVirtualization={true}
          // Ações personalizadas
          actions={[
            {
              icon: "lucide:eye",
              label: "Ver Mais",
              onClick: (participant: ContemplatedParticipant) =>
                handleOpenParticipantModal(String(participant.id)),
              color: "primary" as const,
            },
            ...(canEditRetreat && menuModeBoolean
              ? [
                  {
                    icon: "lucide:check-circle",
                    label: "Contemplar",
                    onClick: handleContemplate,
                    color: "secondary" as const,
                  },
                ]
              : []),
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
