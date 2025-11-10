// Exportar o componente principal
export { DataTable, type DataTableProps, type DataTableColumn } from "./DataTable";

// Exportar TanStack Table
export { TanStackTable, type TanStackTableProps } from "./TanStackTable";

// Exportar o exemplo
export { default as DataTableExample } from "../users/table/UserDataTable";

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

// Re-exportar tipos úteis do TanStack Table
export type {
  ColumnDef,
  Row,
  Table,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
