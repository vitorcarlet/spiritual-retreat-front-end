'use client';

import React, { useCallback, useMemo, useState } from 'react';

import { rankItem } from '@tanstack/match-sorter-utils';
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Popper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';

import Iconify from '../Iconify';

// Fuzzy filter function
const fuzzyFilter = (
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  value: string,
  addMeta: (meta: { itemRank: ReturnType<typeof rankItem> }) => void
): boolean => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

export interface TanStackTableProps<T extends Record<string, unknown>> {
  // Dados
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;

  // Identificação única
  getRowId?: (row: T) => string;

  // Paginação
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];

  // Paginação Server-Side
  manualPagination?: boolean;
  pageCount?: number;
  /** Total de itens (preferido sobre pageCount para cálculo automático de páginas) */
  totalItems?: number;
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;

  // Seleção
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: T[]) => void;

  // Customização
  title?: string;
  subtitle?: string;
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  enableExportPdf?: boolean;
  enableColumnResizing?: boolean;

  // Ações
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;

  // Estilo
  maxHeight?: string | number;
  stickyHeader?: boolean;
}

// Column Filter Component
function ColumnFilter<T>({ column }: { column: Column<T, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant, selectOptions } = (column.columnDef.meta ?? {}) as {
    filterVariant?: 'text' | 'number' | 'select' | 'range';
    selectOptions?: { value: string | number; label: string }[];
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterValue, setFilterValue] = useState<string>(
    (columnFilterValue as string) ?? ''
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApplyFilter = () => {
    column.setFilterValue(filterValue || undefined);
    handleClose();
  };

  const handleClearFilter = () => {
    setFilterValue('');
    column.setFilterValue(undefined);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const hasFilter = columnFilterValue !== undefined;

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          ml: 0.5,
          opacity: hasFilter ? 1 : 0.5,
          color: hasFilter ? 'primary.main' : 'inherit',
        }}
      >
        <Iconify
          icon={hasFilter ? 'solar:filter-bold' : 'solar:filter-outline'}
          width={16}
        />
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="top-start"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              padding: 8,
            },
          },
        ]}
        style={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper elevation={8} sx={{ p: 2, minWidth: 250 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Filtrar {column.columnDef.header as string}
            </Typography>

            {filterVariant === 'select' && selectOptions ? (
              <TextField
                select
                fullWidth
                size="small"
                label="Selecione"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {selectOptions.map(
                  (option: { value: string | number; label: string }) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  )
                )}
              </TextField>
            ) : filterVariant === 'number' ? (
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Valor mínimo"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            ) : (
              <TextField
                fullWidth
                size="small"
                label="Buscar..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleClearFilter}
                fullWidth
              >
                Limpar
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleApplyFilter}
                fullWidth
              >
                Aplicar
              </Button>
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}

// Column Visibility Menu
function ColumnVisibilityMenu<T>({
  table,
}: {
  table: ReturnType<typeof useReactTable<T>>;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Iconify icon="solar:eye-bold" />}
        onClick={handleClick}
      >
        Colunas
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { maxHeight: 400, width: 250 },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">Visibilidade das Colunas</Typography>
        </Box>
        <Divider />
        {table.getAllLeafColumns().map((column) => {
          if (column.id === 'select') return null;
          return (
            <MenuItem key={column.id} sx={{ py: 0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                  />
                }
                label={
                  typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : column.id
                }
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

// Export CSV Function - WYSIWYG (What You See Is What You Get)
function exportToCSV<T extends Record<string, unknown>>(
  table: ReturnType<typeof useReactTable<T>>,
  filename: string
) {
  // Obter apenas colunas visíveis (exceto a coluna de seleção)
  const visibleColumns = table
    .getVisibleLeafColumns()
    .filter((col) => col.id !== 'select');

  // Cabeçalhos das colunas visíveis
  const headers = visibleColumns.map((col) =>
    typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id
  );

  const csvRows = [headers.join(',')];

  // Obter linhas filtradas e ordenadas (exatamente como aparecem na tabela)
  const sortedAndFilteredRows = table.getSortedRowModel().rows;

  // Processar cada linha
  sortedAndFilteredRows.forEach((row) => {
    const values = visibleColumns.map((col) => {
      const cell = row.getAllCells().find((c) => c.column.id === col.id);
      if (!cell) return '';

      // Tentar obter o valor bruto primeiro
      let value: unknown;

      if ('accessorKey' in col.columnDef && col.columnDef.accessorKey) {
        const accessorKey = col.columnDef.accessorKey as string;
        value = row.original[accessorKey];
      } else if ('accessorFn' in col.columnDef && col.columnDef.accessorFn) {
        value = col.columnDef.accessorFn(row.original, row.index);
      } else {
        value = cell.getValue();
      }

      // Formatar o valor
      let formattedValue = '';
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          // Arrays (como sections) - juntar com ponto e vírgula
          formattedValue = value
            .map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)))
            .join('; ');
        } else if (typeof value === 'object') {
          // Objetos - converter para JSON
          formattedValue = JSON.stringify(value);
        } else if (typeof value === 'boolean') {
          // Booleanos - converter para Sim/Não
          formattedValue = value ? 'Sim' : 'Não';
        } else {
          formattedValue = String(value);
        }
      }

      // Escapar aspas duplas e envolver em aspas
      return `"${formattedValue.replace(/"/g, '""')}"`;
    });

    csvRows.push(values.join(','));
  });

  // Criar o conteúdo CSV com BOM para garantir encoding UTF-8
  const BOM = '\uFEFF';
  const csvContent = BOM + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export PDF Function - WYSIWYG (What You See Is What You Get)
async function exportToPDF<T extends Record<string, unknown>>(
  table: ReturnType<typeof useReactTable<T>>,
  filename: string,
  documentTitle?: string
) {
  const { jsPDF } = await import('jspdf');

  // Configuração do documento
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  // Obter apenas colunas visíveis (exceto a coluna de seleção)
  const visibleColumns = table
    .getVisibleLeafColumns()
    .filter((col) => col.id !== 'select');

  // Cabeçalhos das colunas
  const headers = visibleColumns.map((col) =>
    typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id
  );

  // Obter linhas filtradas e ordenadas
  const sortedAndFilteredRows = table.getSortedRowModel().rows;

  // Processar dados das linhas
  const rows = sortedAndFilteredRows.map((row) => {
    return visibleColumns.map((col) => {
      const cell = row.getAllCells().find((c) => c.column.id === col.id);
      if (!cell) return '';

      let value: unknown;

      if ('accessorKey' in col.columnDef && col.columnDef.accessorKey) {
        const accessorKey = col.columnDef.accessorKey as string;
        value = row.original[accessorKey];
      } else if ('accessorFn' in col.columnDef && col.columnDef.accessorFn) {
        value = col.columnDef.accessorFn(row.original, row.index);
      } else {
        value = cell.getValue();
      }

      // Formatar o valor
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          return value
            .map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)))
            .join(', ');
        } else if (typeof value === 'object') {
          return JSON.stringify(value);
        } else if (typeof value === 'boolean') {
          return value ? 'Sim' : 'Não';
        } else {
          return String(value);
        }
      }
      return '';
    });
  });

  let currentY = margin;

  // Título do documento
  if (documentTitle) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(documentTitle, margin, currentY + 6);
    currentY += 12;
  }

  // Configurações da tabela
  const fontSize = 9;
  const headerHeight = 8;
  const rowHeight = 6;
  const columnWidths = headers.map(() => contentWidth / headers.length);

  // Função para desenhar linha da tabela
  const drawTableRow = (
    rowData: string[],
    y: number,
    isHeader = false
  ): number => {
    // Verificar se precisa adicionar nova página
    if (y + (isHeader ? headerHeight : rowHeight) > pageHeight - margin) {
      doc.addPage();
      y = margin;
      // Redesenhar cabeçalho na nova página
      if (!isHeader) {
        y = drawTableRow(headers, y, true);
      }
    }

    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isHeader ? 'bold' : 'normal');

    // Desenhar células
    rowData.forEach((cellText, colIndex) => {
      const x =
        margin + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
      const cellHeight = isHeader ? headerHeight : rowHeight;

      // Fundo do cabeçalho
      if (isHeader) {
        doc.setFillColor(240, 240, 240);
        doc.rect(x, y, columnWidths[colIndex], cellHeight, 'F');
      }

      // Bordas
      doc.setDrawColor(200, 200, 200);
      doc.rect(x, y, columnWidths[colIndex], cellHeight, 'S');

      // Texto (truncado se necessário)
      const maxWidth = columnWidths[colIndex] - 2;
      let displayText = cellText;

      // Truncar texto longo
      const textWidth = doc.getTextWidth(displayText);
      if (textWidth > maxWidth) {
        while (
          doc.getTextWidth(displayText + '...') > maxWidth &&
          displayText.length > 0
        ) {
          displayText = displayText.slice(0, -1);
        }
        displayText += '...';
      }

      doc.text(displayText, x + 1, y + cellHeight / 2 + 1.5, {
        baseline: 'middle',
      });
    });

    return y + (isHeader ? headerHeight : rowHeight);
  };

  // Desenhar cabeçalho
  currentY = drawTableRow(headers, currentY, true);

  // Desenhar linhas de dados
  rows.forEach((row) => {
    currentY = drawTableRow(row, currentY, false);
  });

  // Rodapé com data de geração
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')} - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Salvar PDF
  doc.save(filename);
}

// Main Component
export function TanStackTable<T extends Record<string, unknown>>({
  data,
  columns: columnsProp,
  loading = false,
  getRowId,
  enablePagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 50, 100],
  manualPagination = false,
  pageCount,
  totalItems,
  onPaginationModelChange,
  enableRowSelection = false,
  onRowSelectionChange,
  title,
  subtitle,
  enableGlobalFilter = true,
  enableColumnFilters = true,
  enableSorting = true,
  enableColumnVisibility = true,
  enableExport = true,
  enableExportPdf = true,
  enableColumnResizing = true,
  onRowClick,
  onRowDoubleClick,
  //maxHeight = 600,
  stickyHeader = true,
}: TanStackTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [showAllRows, setShowAllRows] = useState(false);
  const [columnSizing, setColumnSizing] = useState({});

  // Calcula o número de páginas baseado em totalItems ou pageCount
  const calculatedPageCount = useMemo(() => {
    if (totalItems !== undefined && totalItems > 0) {
      return Math.ceil(totalItems / pagination.pageSize);
    }
    return pageCount;
  }, [totalItems, pageCount, pagination.pageSize]);

  // Build columns with selection if enabled
  const columns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = [...columnsProp];

    if (enableRowSelection) {
      cols.unshift({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
      });
    }

    return cols;
  }, [columnsProp, enableRowSelection]);

  const table = useReactTable<T>({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
      columnVisibility,
      rowSelection,
      columnSizing,
      pagination: showAllRows
        ? { pageIndex: 0, pageSize: data.length }
        : pagination,
    },
    enableRowSelection,
    enableColumnResizing,
    columnResizeMode: 'onChange',
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
    getRowId: getRowId,
    // Server-side pagination
    manualPagination,
    pageCount: manualPagination ? (calculatedPageCount ?? -1) : undefined,
  });

  // Handle row selection change
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, onRowSelectionChange, table]);

  // Handle pagination change for server-side pagination
  React.useEffect(() => {
    if (manualPagination && onPaginationModelChange && !showAllRows) {
      onPaginationModelChange({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
    }
  }, [pagination, manualPagination, onPaginationModelChange, showAllRows]);

  const handleExportCSV = useCallback(() => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = title
      ? `${title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.csv`
      : `export-${timestamp}.csv`;
    exportToCSV(table, filename);
  }, [table, title]);

  const handleExportPDF = useCallback(async () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = title
      ? `${title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.pdf`
      : `export-${timestamp}.pdf`;
    await exportToPDF(table, filename, title);
  }, [table, title]);

  const handlePageSizeChange = (size: number) => {
    if (size === -1) {
      setShowAllRows(true);
      setPagination({ pageIndex: 0, pageSize: data.length });
    } else {
      setShowAllRows(false);
      setPagination({ pageIndex: 0, pageSize: size });
    }
  };

  // Calcula o total de linhas para exibição
  const totalRows = useMemo(() => {
    if (manualPagination) {
      // Prioriza totalItems se disponível
      if (totalItems !== undefined) {
        return totalItems;
      }
      // Fallback para pageCount * pageSize
      if (calculatedPageCount) {
        return calculatedPageCount * pagination.pageSize;
      }
      return data.length;
    }
    return table.getFilteredRowModel().rows.length;
  }, [
    manualPagination,
    totalItems,
    calculatedPageCount,
    pagination.pageSize,
    data.length,
    table,
  ]);

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <Paper
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      {(title || subtitle) && (
        <Box sx={{ p: 2, pb: 1 }}>
          {title && <Typography variant="h6">{title}</Typography>}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Toolbar */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {/* Global Filter */}
        {enableGlobalFilter && (
          <TextField
            size="small"
            placeholder="Buscar em todas as colunas..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-linear" />
                </InputAdornment>
              ),
            }}
          />
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Selected Count */}
        {enableRowSelection && selectedCount > 0 && (
          <Chip
            label={`${selectedCount} selecionado${selectedCount > 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
          />
        )}

        {/* Column Visibility */}
        {enableColumnVisibility && <ColumnVisibilityMenu table={table} />}

        {/* Export CSV */}
        {enableExport && (
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:download-bold" />}
            onClick={handleExportCSV}
          >
            Exportar CSV
          </Button>
        )}

        {/* Export PDF */}
        {enableExportPdf && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Iconify icon="solar:file-text-bold" />}
            onClick={handleExportPDF}
          >
            Exportar PDF
          </Button>
        )}
      </Box>

      {/* Table */}
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table stickyHeader={stickyHeader} sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      fontWeight: 600,
                      backgroundColor: 'background.neutral',
                      width: header.getSize(),
                      position: 'relative',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      {header.isPlaceholder ? null : (
                        <>
                          {enableSorting && header.column.getCanSort() ? (
                            <TableSortLabel
                              active={header.column.getIsSorted() !== false}
                              direction={
                                header.column.getIsSorted() === 'asc'
                                  ? 'asc'
                                  : 'desc'
                              }
                              onClick={header.column.getToggleSortingHandler()}
                              sx={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%',
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </TableSortLabel>
                          ) : (
                            <Box
                              sx={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%',
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </Box>
                          )}

                          {enableColumnFilters &&
                            header.column.getCanFilter() && (
                              <ColumnFilter column={header.column} />
                            )}
                        </>
                      )}
                    </Stack>

                    {/* Resize Handle */}
                    {enableColumnResizing && header.column.getCanResize() && (
                      <Box
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        sx={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          height: '100%',
                          width: '5px',
                          cursor: 'col-resize',
                          userSelect: 'none',
                          touchAction: 'none',
                          backgroundColor: header.column.getIsResizing()
                            ? 'primary.main'
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                          },
                          transition: 'background-color 0.2s',
                        }}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{ textAlign: 'center', py: 10 }}
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{ textAlign: 'center', py: 10 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Nenhum resultado encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => onRowClick?.(row.original)}
                  onDoubleClick={() => onRowDoubleClick?.(row.original)}
                  sx={{
                    cursor:
                      onRowClick || onRowDoubleClick ? 'pointer' : 'default',
                    backgroundColor: row.getIsSelected()
                      ? 'action.selected'
                      : 'inherit',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {enablePagination && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            bg: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total: {totalRows} registros
            </Typography>
          </Stack>

          <TablePagination
            component="div"
            count={showAllRows ? data.length : totalRows}
            page={pagination.pageIndex}
            onPageChange={(_, page) =>
              setPagination((prev) => ({ ...prev, pageIndex: page }))
            }
            rowsPerPage={showAllRows ? -1 : pagination.pageSize}
            onRowsPerPageChange={(e) => {
              const value = parseInt(e.target.value, 10);
              handlePageSizeChange(value);
            }}
            rowsPerPageOptions={[
              ...pageSizeOptions,
              { label: 'Tudo', value: -1 },
            ]}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              showAllRows
                ? `Mostrando ${count} de ${count}`
                : `${from}-${to} de ${count}`
            }
          />
        </Box>
      )}
    </Paper>
  );
}

export default TanStackTable;
