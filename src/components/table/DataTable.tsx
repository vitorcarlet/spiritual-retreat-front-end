"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridFilterModel,
  GridPaginationModel,
  GridColumnVisibilityModel,
  GridRenderCellParams,
  GridRowParams,
  GridSlots,
  GridValidRowModel,
  GridRowId,
  GridRowSelectionModel, // ✅ Tipo correto
  Toolbar,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportPrint,
  ExportCsv,
} from "@mui/x-data-grid";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  Button,
} from "@mui/material";
import { Iconify } from "../Iconify";
import theme from "@/src/theme/theme";

// Tipos para o componente
export interface DataTableColumn<
  T extends GridValidRowModel = GridValidRowModel
> extends Omit<GridColDef, "field"> {
  field: keyof T | string;
  headerName: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  hideable?: boolean;
  type?:
    | "string"
    | "number"
    | "date"
    | "dateTime"
    | "boolean"
    | "singleSelect"
    | "actions";
  renderCell?: (params: GridRenderCellParams<T>) => React.ReactNode;
  valueOptions?: string[] | { value: string | number; label: string }[];
}

export interface DataTableProps<
  T extends GridValidRowModel = GridValidRowModel
> {
  // Dados
  rows: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;

  // Identificação única
  getRowId?: (row: T) => GridRowId;

  // Paginação
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  rowCount?: number; // Para paginação server-side
  paginationMode?: "client" | "server";

  // Seleção
  checkboxSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
  rowSelectionModel?: GridRowSelectionModel;
  onRowSelectionModelChange?: (selectionModel: GridRowSelectionModel) => void;

  // Filtros e ordenação
  filterMode?: "client" | "server";
  sortingMode?: "client" | "server";
  onSortModelChange?: (model: GridSortModel) => void;
  onFilterModelChange?: (model: GridFilterModel) => void;
  onPaginationModelChange?: (model: GridPaginationModel) => void;

  // Colunas
  columnVisibilityModel?: GridColumnVisibilityModel;
  onColumnVisibilityModelChange?: (model: GridColumnVisibilityModel) => void;

  // Eventos
  onRowClick?: (
    params: GridRowParams<T>,
    event: React.MouseEvent<HTMLElement>
  ) => void;
  onRowDoubleClick?: (
    params: GridRowParams<T>,
    event: React.MouseEvent<HTMLElement>
  ) => void;

  // Aparência
  width?: number | string;
  autoWidth?: boolean;
  height?: number | string;
  autoHeight?: boolean;
  density?: "compact" | "standard" | "comfortable";
  disableColumnFilter?: boolean;
  disableColumnMenu?: boolean;
  disableColumnResize?: boolean;

  // Customização
  title?: string;
  subtitle?: string;
  toolbar?: boolean;
  customToolbar?: React.ReactNode;
  noRowsOverlay?: React.ReactNode;
  noResultsOverlay?: React.ReactNode;

  // Virtualização
  rowBuffer?: number; // Número de linhas extras para renderizar fora da viewport
  columnBuffer?: number; // Número de colunas extras para renderizar fora da viewport

  // Ações personalizadas
  actions?: Array<{
    icon: string;
    label: string;
    onClick: (row: T) => void;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
    disabled?: (row: T) => boolean;
  }>;
}

// Toolbar customizada
const CustomToolbar = React.memo(function CustomToolbar({
  title,
  subtitle,
  selectedCount,
  onClearSelection,
  setDensity,
}: {
  title?: string;
  subtitle?: string;
  selectedCount?: number;
  onClearSelection?: () => void;
  setDensity: (density: "compact" | "standard" | "comfortable") => void;
}) {
  return (
    <Toolbar style={{ backgroundColor: "--mui-palette-background-default" }}>
      <Box
        sx={{ flex: 1, display: "flex", alignItems: "center", gap: 2, p: 1 }}
      >
        {title && (
          <Box>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        {selectedCount && selectedCount > 0 && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${selectedCount} selecionado(s)`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Tooltip title="Limpar seleção">
              <IconButton size="small" onClick={onClearSelection}>
                <Iconify icon="lucide:x" size={1.2} />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>

      <Stack direction="row" spacing={1}>
        <ColumnsPanelTrigger />
        <FilterPanelTrigger />
        <Button onClick={() => setDensity("compact")}>Compact</Button>
        <Button onClick={() => setDensity("standard")}>Standard</Button>
        <Button onClick={() => setDensity("comfortable")}>Comfortable</Button>
        <ExportPrint />
        <ExportCsv />
      </Stack>
    </Toolbar>
  );
});

// Componente principal
export function DataTable<T extends GridValidRowModel>({
  rows,
  columns,
  loading = false,
  getRowId,

  // Paginação
  //pagination = true,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  rowCount,
  paginationMode = "client",

  // Seleção
  checkboxSelection = false,
  disableRowSelectionOnClick = false,
  rowSelectionModel,
  onRowSelectionModelChange,

  // Filtros e ordenação
  filterMode = "client",
  sortingMode = "client",
  onSortModelChange,
  onFilterModelChange,
  onPaginationModelChange,

  // Colunas
  columnVisibilityModel,
  onColumnVisibilityModelChange,

  // Eventos
  onRowClick,
  onRowDoubleClick,

  // Aparência
  height = 600,
  width = 1200,
  autoWidth = false,
  autoHeight = false,
  density: ds = "standard",
  disableColumnFilter = false,
  disableColumnMenu = false,
  disableColumnResize = false,

  // Customização
  title,
  subtitle,
  toolbar = true,
  customToolbar,
  noRowsOverlay,
  noResultsOverlay,

  // Virtualização
  rowBuffer = 2,
  columnBuffer = 2,

  // Ações
  actions,
}: DataTableProps<T>) {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize,
  });
  const [density, setDensity] = useState<
    "compact" | "standard" | "comfortable"
  >(ds);
  // Preparar colunas com ações se necessário
  const processedColumns = useMemo<GridColDef[]>(() => {
    const cols = [...columns] as GridColDef[];

    // Adicionar coluna de ações se definida
    if (actions && actions.length > 0) {
      cols.push({
        field: "actions",
        headerName: "Ações",
        width: Math.max(actions.length * 50, 120),
        sortable: false,
        filterable: false,
        hideable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<T>) => (
          <Stack direction="row" spacing={0.5}>
            {actions.map((action, index) => (
              <Tooltip key={index} title={action.label}>
                <span>
                  <IconButton
                    size="small"
                    color={action.color || "default"}
                    disabled={
                      action.disabled ? action.disabled(params.row) : false
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(params.row);
                    }}
                  >
                    <Iconify icon={action.icon} size={1.2} />
                  </IconButton>
                </span>
              </Tooltip>
            ))}
          </Stack>
        ),
      });
    }

    return cols;
  }, [columns, actions]);

  // Handle pagination
  const handlePaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);
      onPaginationModelChange?.(model);
    },
    [onPaginationModelChange]
  );

  // Handle selection clearing
  const handleClearSelection = useCallback(() => {
    const emptySelection: GridRowSelectionModel = {
      type: "include",
      ids: new Set<GridRowId>(),
    };
    onRowSelectionModelChange?.(emptySelection);
  }, [onRowSelectionModelChange]);

  // ✅ CORREÇÃO 6: Calcular selectedCount corretamente
  const selectedCount = useMemo(() => {
    if (!rowSelectionModel) return 0;

    // GridRowSelectionModel pode ser array ou objeto
    if (Array.isArray(rowSelectionModel)) {
      return rowSelectionModel.length;
    }

    // Se for objeto com estrutura { type, ids }
    if (typeof rowSelectionModel === "object" && "ids" in rowSelectionModel) {
      return rowSelectionModel.ids?.size || 0;
    }

    return 0;
  }, [rowSelectionModel]);

  // Slots para customização
  const slots: Partial<GridSlots> = {};

  if (toolbar) {
    if (customToolbar) {
      slots.toolbar = () => <>{customToolbar}</>;
    } else {
      slots.toolbar = () => (
        <CustomToolbar
          title={title}
          subtitle={subtitle}
          selectedCount={selectedCount}
          onClearSelection={handleClearSelection}
          setDensity={setDensity}
        />
      );
    }
  }

  if (noRowsOverlay) {
    slots.noRowsOverlay = () => <>{noRowsOverlay}</>;
  }

  if (noResultsOverlay) {
    slots.noResultsOverlay = () => <>{noResultsOverlay}</>;
  }

  return (
    <Paper
      elevation={1}
      sx={{
        width: autoWidth ? "auto" : width,
        height: autoHeight ? "auto" : height,
        "& .MuiDataGrid-root": {
          border: "none",
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: theme.vars?.palette.background.paper,
          borderBottom: `1px solid ${theme.vars?.palette.divider}`,
        },
        "& .MuiDataGrid-columnHeaderTitle": {
          fontWeight: 600,
        },
        "& .MuiDataGrid-row": {
          "&:hover": {
            backgroundColor: theme.vars?.palette.action.hover,
          },
          "&.Mui-selected": {
            backgroundColor: theme.vars?.palette.primary.main + "10",
            "&:hover": {
              backgroundColor: theme.vars?.palette.primary.main + "20",
            },
          },
        },
        "& .MuiDataGrid-cell": {
          borderBottom: `1px solid ${theme.vars?.palette.divider}`,
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: `1px solid ${theme.vars?.palette.divider}`,
          backgroundColor: theme.vars?.palette.background.paper,
        },
        "& .MuiDataGrid-toolbarContainer": {
          padding: theme.spacing(1),
          borderBottom: `1px solid ${theme.vars?.palette.divider}`,
        },
        "& .MuiDataGrid-virtualScroller": {
          // Otimizações para virtualização
          willChange: "transform",
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={processedColumns}
        loading={loading}
        getRowId={getRowId}
        // Paginação
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={pageSizeOptions}
        rowCount={rowCount}
        paginationMode={paginationMode}
        // Seleção
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        //rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(newSelection) => {
          if (onRowSelectionModelChange) {
            onRowSelectionModelChange(newSelection);
          }
        }}
        // Filtros e ordenação
        filterMode={filterMode}
        sortingMode={sortingMode}
        onSortModelChange={onSortModelChange}
        onFilterModelChange={onFilterModelChange}
        // Colunas
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        // Eventos
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
        // Aparência
        autoHeight={autoHeight}
        density={density}
        disableColumnFilter={disableColumnFilter}
        disableColumnMenu={disableColumnMenu}
        disableColumnResize={disableColumnResize}
        // Virtualização - otimizações de performance
        rowBufferPx={rowBuffer}
        columnBufferPx={columnBuffer}
        // Slots customizados
        slots={slots}
        // Configurações de localização
        localeText={{
          // Toolbar
          toolbarColumns: "Colunas",
          toolbarFilters: "Filtros",
          toolbarDensity: "Densidade",
          toolbarExport: "Exportar",

          // Filtros
          filterPanelAddFilter: "Adicionar filtro",
          filterPanelDeleteIconLabel: "Remover",
          filterPanelOperator: "Operador",
          filterPanelOperatorAnd: "E",
          filterPanelOperatorOr: "OU",
          filterPanelColumns: "Colunas",
          filterPanelInputLabel: "Valor",
          filterPanelInputPlaceholder: "Valor do filtro",

          // Paginação
          footerRowSelected: (count) => `${count} linha(s) selecionada(s)`,
          footerTotalRows: "Total de linhas:",

          // Densidade
          toolbarDensityLabel: "Densidade",
          toolbarDensityCompact: "Compacta",
          toolbarDensityStandard: "Padrão",
          toolbarDensityComfortable: "Confortável",

          // Coluna
          columnMenuLabel: "Menu",
          columnMenuShowColumns: "Mostrar colunas",
          columnMenuFilter: "Filtrar",
          columnMenuHideColumn: "Ocultar",
          columnMenuUnsort: "Remover ordenação",
          columnMenuSortAsc: "Ordenar crescente",
          columnMenuSortDesc: "Ordenar decrescente",

          // Mensagens
          noRowsLabel: "Nenhum dado encontrado",
          noResultsOverlayLabel: "Nenhum resultado encontrado.",
        }}
      />
    </Paper>
  );
}

export default DataTable;
