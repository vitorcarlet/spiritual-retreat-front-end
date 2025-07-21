"use client";

import React, { useState } from "react";
import { Box, Button, Chip } from "@mui/material";
import { DataTable, DataTableColumn } from "./DataTable";
import { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

// Tipo de exemplo para usuários
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt: Date;
  age: number;
}

// Dados de exemplo
const sampleUsers: User[] = [
  {
    id: 1,
    name: "Vitor Admin",
    email: "admin@email.com",
    role: "Admin",
    status: "active",
    createdAt: new Date("2023-01-15"),
    age: 21,
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@email.com",
    role: "Manager",
    status: "active",
    createdAt: new Date("2023-02-20"),
    age: 35,
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro@email.com",
    role: "User",
    status: "inactive",
    createdAt: new Date("2023-03-10"),
    age: 24,
  },
  {
    id: 4,
    name: "Ana Oliveira",
    email: "ana@email.com",
    role: "Manager",
    status: "active",
    createdAt: new Date("2023-04-05"),
    age: 31,
  },
  {
    id: 5,
    name: "Carlos Pereira",
    email: "carlos@email.com",
    role: "User",
    status: "active",
    createdAt: new Date("2023-05-12"),
    age: 27,
  },
  // Adicionar mais dados para demonstrar a paginação
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 6,
    name: `Usuário ${i + 6}`,
    email: `usuario${i + 6}@email.com`,
    role: ["Admin", "Manager", "User"][i % 3],
    status: ["active", "inactive"][i % 2] as "active" | "inactive",
    createdAt: new Date(2023, i % 12, (i % 28) + 1),
    age: 20 + (i % 40),
  })),
];

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
  },
];

export default function DataTableExample() {
  // ✅ CORREÇÃO: Usar o tipo correto
  const [selectedRows, setSelectedRows] = useState<
    GridRowSelectionModel | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    console.log("Editar usuário:", user);
    router.push(`/users/${user.id}`);
  };

  const handleDelete = (user: User) => {
    console.log("Deletar usuário:", user);
  };

  const handleView = (user: User) => {
    console.log("Visualizar usuário:", user);
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

  // ✅ Debug para verificar
  // useEffect(() => {
  //   const selectedIds = getSelectedIds();
  //   //console.log("🔍 Selection changed:", selectedIds.length, "items");
  // }, [selectedRows]);

  //console.log(selectedRows, "selectedRows");
  return (
    <Box sx={{ p: 2, maxHeight: "100%", maxWidth: "100%", overflow: "auto" }}>
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={handleRefresh} disabled={loading}>
          {loading ? "Carregando..." : "Atualizar Dados"}
        </Button>

        {/* ✅ CORREÇÃO: Usar helper para contar */}
        {getSelectedIds().length > 0 && (
          <Button variant="outlined" color="primary" onClick={handleBulkAction}>
            Ação em Lote ({getSelectedIds().length})
          </Button>
        )}
      </Box>

      <DataTable<User>
        rows={sampleUsers}
        columns={columns}
        loading={loading}
        // Configurações de aparência
        title="Gerenciamento de Usuários"
        subtitle="Lista completa de usuários do sistema"
        height={600}
        //width={1200}
        autoWidth={true}
        autoHeight={true}
        // Paginação
        pagination={true}
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        // Seleção
        checkboxSelection={true}
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={setSelectedRows}
        // Virtualização otimizada
        rowBuffer={5}
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
  );
}
