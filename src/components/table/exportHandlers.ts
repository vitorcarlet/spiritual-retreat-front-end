import { Table } from '@tanstack/react-table';

/**
 * Handler para exportar dados em CSV
 * WYSIWYG (What You See Is What You Get) - exporta apenas colunas visíveis
 */
export async function exportToCSV<T extends Record<string, unknown>>(
  table: Table<T>,
  filename: string
): Promise<void> {
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

/**
 * Handler para exportar dados em PDF
 * WYSIWYG (What You See Is What You Get) - exporta apenas colunas visíveis
 */
export async function exportToPDF<T extends Record<string, unknown>>(
  table: Table<T>,
  filename: string,
  documentTitle?: string
): Promise<void> {
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

/**
 * Tipo para handler de export customizado
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ExportHandler<T extends Record<string, unknown>> = (
  reportId: string,
  filename?: string
) => Promise<void>;

/**
 * Configuração de extensões de export
 */
export interface ExportConfig<
  T extends Record<string, unknown>,
  E extends string = string,
> {
  extensions: E[];
  handlers: Record<E, ExportHandler<T>>;
}
