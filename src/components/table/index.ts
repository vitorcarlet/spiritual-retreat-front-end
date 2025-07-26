// Exportar o componente principal
export { DataTable, type DataTableProps, type DataTableColumn } from "./DataTable";

// Exportar o exemplo
export { default as DataTableExample } from "./UserDataTable";

// Re-exportar tipos úteis do MUI X DataGrid
export type {
  GridColDef,
  GridRowId,
  GridSortModel,
  GridFilterModel,
  GridPaginationModel,
  GridColumnVisibilityModel,
  GridRenderCellParams,
  GridRowParams,
  GridValidRowModel,
} from "@mui/x-data-grid";
