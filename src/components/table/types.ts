// Tipos para a tabela reutilizável
export type FilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | null
  | undefined;

export type ColumnDataType =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export interface SelectFilterOption {
  label: string;
  value: string | number | boolean;
}

export interface TableColumn<T = Record<string, ColumnDataType>> {
  id: string;
  label: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "select" | "date" | "number";
  filterOptions?: SelectFilterOption[];
  render?: (value: ColumnDataType, row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  sticky?: boolean;
  resizable?: boolean;
}

export interface TableAction<T = Record<string, ColumnDataType>> {
  label: string;
  icon?: string;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  onClick: (row: T, index: number) => void;
  disabled?: (row: T) => boolean;
  show?: (row: T) => boolean;
}

export interface DataTableProps<T = Record<string, ColumnDataType>> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];

  // Paginação
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];

  // Seleção
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[], selectedIndices: number[]) => void;

  // Filtros
  filterable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;

  // Ordenação
  sortable?: boolean;
  defaultSort?: { column: string; direction: "asc" | "desc" };

  // Layout
  height?: number | string;
  maxHeight?: number | string;
  stickyHeader?: boolean;
  showToolbar?: boolean;
  title?: string;

  // Customização
  dense?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;

  // Loading e empty states
  loading?: boolean;
  emptyMessage?: string;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;

  // Callbacks
  onRowClick?: (row: T, index: number) => void;
  onCellClick?: (
    value: ColumnDataType,
    row: T,
    column: TableColumn<T>,
    index: number
  ) => void;
}

export interface SortConfig {
  column: string;
  direction: "asc" | "desc";
}

export interface FilterConfig {
  [key: string]: FilterValue;
}

// Exemplos de tipos específicos para uso
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  createdAt: Date | string;
  lastLogin?: Date | string;
}
