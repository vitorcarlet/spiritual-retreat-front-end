"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridFilterModel,
  GridToolbar,
} from "@mui/x-data-grid";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Iconify from "../../Iconify";

// Define the Report type to match the columns

interface ReportsDataGridProps {
  reports?: Report[] | undefined;
  isLoading?: boolean;
  onView?: (report: Report) => void;
  onEdit?: (report: Report) => void;
  onDelete?: (
    report: Report,
    onConfirmDelete: (reportId: number | string) => void
  ) => void;
  onCreate?: () => void;
  onConfirmDelete: (reportId: number | string) => void;
}

export default function ReportsDataGrid({
  reports = [],
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onConfirmDelete,
}: ReportsDataGridProps) {
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });

  const handleResetFilters = () => {
    setFilterModel({
      items: [],
    });
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nome",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "sections",
      headerName: "Seções",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Report, string[]>) => (
        <Box>
          {params.value?.map((section, index) => (
            <Typography
              key={index}
              variant="body2"
              component="span"
              sx={{
                display: "inline-block",
                backgroundColor: "action.hover",
                borderRadius: "4px",
                px: 1,
                py: 0.5,
                mr: 0.5,
                mb: 0.5,
                fontSize: "0.75rem",
              }}
            >
              {section}
            </Typography>
          ))}
        </Box>
      ),
    },
    {
      field: "dateCreation",
      headerName: "Data de Criação",
      flex: 1,
      minWidth: 150,
      valueFormatter: (params: any) => {
        if (!params.value) return "";
        return format(new Date(params.value), "dd/MM/yyyy", {
          locale: ptBR,
        });
      },
    },
    {
      field: "retreatName",
      headerName: "Retiro Associado",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Report>) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Visualizar">
            <IconButton
              size="small"
              onClick={() => onView && onView(params.row)}
              color="info"
            >
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => onEdit && onEdit(params.row)}
              color="primary"
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              size="small"
              onClick={() =>
                onDelete &&
                onDelete(params.row, (reportId) => onConfirmDelete(reportId))
              }
              color="error"
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Relatórios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {reports.length} {reports.length === 1 ? "relatório" : "relatórios"}{" "}
            encontrados
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:restart-bold" />}
            onClick={handleResetFilters}
          >
            Limpar Filtros
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={onCreate}
          >
            Novo Relatório
          </Button>
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          height: "100%",
          flex: 1,
          overflow: "hidden",
          borderRadius: 1,
        }}
      >
        <DataGrid
          rows={reports}
          columns={columns}
          loading={isLoading}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          disableRowSelectionOnClick
          autoHeight
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
            sorting: {
              sortModel: [{ field: "dateCreation", sort: "desc" }],
            },
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
      </Paper>
    </Box>
  );
}
