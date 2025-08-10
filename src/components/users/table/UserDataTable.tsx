"use client";

import React, { Suspense, useState } from "react";
import { Box, Button, Chip } from "@mui/material";
import { DataTable, DataTableColumn } from "../../table/DataTable";
import { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useModal } from "@/src/hooks/useModal";
import UserSummaryModal from "../userSummaryModal";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { getFilters } from "./getFilters";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import { useQuery } from "@tanstack/react-query";
import FilterButton from "../../filters/FilterButton";
import dayjs from "dayjs";
import SearchField from "../../filters/SearchField";
import DeleteConfirmation from "../../confirmations/DeleteConfirmation";

type UserRequest = {
  rows: User[];
  total: number;
  page: number;
  pageLimit: number;
};

// Dados de exemplo
const getUsers = async (
  filters: TableDefaultFilters<UsersTableFiltersWithDates>
) => {
  const response = await handleApiResponse<UserRequest>(
    await sendRequestServerVanilla.get("/users", { params: filters })
  );

  if (!response || response.error) {
    throw new Error("Failed to fetch users");
  }
  console.log("Fetched users:", response);
  return response.data as UserRequest;
};

// Definir as colunas da tabela
const columns: DataTableColumn<User>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 70,
    type: "number",
  },
  {
    field: "name",
    headerName: "Nome",
    width: 200,
    flex: 1,
  },
  {
    field: "email",
    headerName: "Email",
    width: 250,
    flex: 1,
  },
  {
    field: "role",
    headerName: "Função",
    width: 120,
    type: "singleSelect",
    valueOptions: ["Admin", "Manager", "User"],
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value === "active" ? "Ativo" : "Inativo"}
        color={params.value === "active" ? "success" : "error"}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    field: "age",
    headerName: "Idade",
    width: 100,
    type: "number",
  },
  {
    field: "createdAt",
    headerName: "Criado em",
    width: 150,
    type: "date",
    valueGetter: (params: string | Date) => {
      console.log(params, "params");
      const v = params;
      if (v == null) return null;

      return new Date(v as string | number);
    },
    // Opcional: apenas para exibir formatado
    valueFormatter: (params: string | Date) =>
      params ? dayjs(params as Date).format("DD/MM/YYYY") : "",
  },
];

export default function UserDataTable() {
  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<UsersTableFiltersWithDates>>({
      defaultFilters: {
        page: 1,
        pageLimit: 10,
      },
      excludeFromCount: ["page", "pageLimit", "search"], // Don't count pagination in active filters
    });
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes,
  });
  // ✅ CORREÇÃO: Usar o tipo correto
  const [selectedRows, setSelectedRows] = useState<
    GridRowSelectionModel | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const modal = useModal();
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

  const handleEdit = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const handleDelete = (user: User) => {
    modal.open({
      title: "Confirm deletion",
      size: "sm",
      customRender: () => (
        <DeleteConfirmation
          title="Delete user"
          resourceName={user.name}
          description="This action cannot be undone and will permanently remove the user."
          requireCheckboxLabel="I understand the consequences."
          onConfirm={async () => {
            try {
              const res = await sendRequestServerVanilla.delete(
                `/users/${user.id}`
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
            } catch (err: any) {
              if (typeof window !== "undefined") {
                const { enqueueSnackbar } = await import("notistack");
                enqueueSnackbar(err.message || "Failed to delete user", {
                  variant: "errorMUI",
                });
              }
            }
          }}
        />
      ),
    });
  };

  const handleView = (user: User) => {
    modal.open({
      title: `Detalhes do Usuário: ${user.name}`,
      size: "xl",
      customRender: () => (
        <Suspense fallback={<div>Carregando detalhes do usuário...</div>}>
          <UserSummaryModal userId={user.id.toString()} />
        </Suspense>
      ),
    });
  };

  const handleBulkAction = () => {
    const selectedIds = getSelectedIds();
    console.log("Ação em lote para:", selectedIds);
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

  const usersDataArray: User[] | undefined = Array.isArray(usersData?.rows)
    ? usersData?.rows
    : ([usersData?.rows] as unknown as User[]);

  console.log("selectedRows:", selectedRows);

  if (isLoading) return <div>Carregando usuários...</div>;
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
          TableDefaultFilters<UsersTableFilters>,
          UsersTableDateFilters
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
        {getSelectedIds().length > 0 && (
          <Button variant="outlined" color="primary" onClick={handleBulkAction}>
            Ação em Lote ({getSelectedIds().length})
          </Button>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, maxHeight: "90%" }}>
        <DataTable<User, UsersTableFiltersWithDates>
          rows={usersDataArray}
          rowCount={usersData?.total || 0}
          columns={columns}
          loading={isLoading || loading}
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
              label: "Visualizar",
              onClick: handleView,
              color: "info",
            },
            {
              icon: "lucide:edit",
              label: "Editar",
              onClick: handleEdit,
              color: "primary",
            },
            {
              icon: "lucide:trash-2",
              label: "Deletar",
              onClick: handleDelete,
              color: "error",
              disabled: (user) => user.role === "Admin", // Admins não podem ser deletados
            },
          ]}
          // Eventos
          onRowClick={(params) => {
            console.log("Linha clicada:", params.row);
          }}
          onRowDoubleClick={(params) => {
            handleView(params.row);
          }}
        />
      </Box>
    </Box>
  );
}
