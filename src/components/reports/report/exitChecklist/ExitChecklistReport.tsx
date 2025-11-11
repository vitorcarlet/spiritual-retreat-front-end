"use client";

import { type ReactNode, useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Iconify from "@/src/components/Iconify";
import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
import SearchField from "../../../filters/SearchField";
import { fetchExitChecklistReport } from "./shared";
import {
  ExitChecklistReportData,
  ExitChecklistRow,
  ReportDataSummary,
} from "@/src/types/reports";

const generateExitChecklistPdf = async (
  rows: ExitChecklistRow[],
  {
    retreatName,
    t,
  }: {
    retreatName?: string;
    t: ReturnType<typeof useTranslations>;
  }
) => {
  if (!rows.length) return;

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const marginY = 12;
  const titleHeight = 12;
  const headerGap = 4;
  const headerRowHeight = 9;
  const rowHeight = 9;

  const displayedRetreat =
    retreatName?.trim() || t("exit-checklist-retreat-fallback");
  const title = t("exit-checklist-title", { retreat: displayedRetreat });

  const columns = [
    {
      key: "seq",
      label: t("exit-checklist-column-seq"),
      width: 16,
      getValue: (_row: ExitChecklistRow, index: number) => String(index + 1),
    },
    {
      key: "name",
      label: t("exit-checklist-column-name"),
      width: 68,
      getValue: (row: ExitChecklistRow) => row.fullName,
    },
    {
      key: "term",
      label: t("exit-checklist-column-term"),
      width: 22,
      getValue: () => "",
    },
    {
      key: "phone",
      label: t("exit-checklist-column-phone"),
      width: 22,
      getValue: () => "",
    },
    {
      key: "watch",
      label: t("exit-checklist-column-watch"),
      width: 22,
      getValue: () => "",
    },
    {
      key: "medicine",
      label: t("exit-checklist-column-medicine"),
      width: 22,
      getValue: () => "",
    },
    {
      key: "wallet",
      label: t("exit-checklist-column-wallet"),
      width: 22,
      getValue: () => "",
    },
    {
      key: "handbag",
      label: t("exit-checklist-column-handbag"),
      width: 22,
      getValue: () => "",
    },
    {
      key: "key",
      label: t("exit-checklist-column-key"),
      width: 22,
      getValue: () => "",
    },
    {
      key: "birthday",
      label: t("exit-checklist-column-birthday"),
      width: 22,
      getValue: () => "",
    },
    {
      key: "signature",
      label: t("exit-checklist-column-signature"),
      width: 32,
      getValue: () => "",
    },
  ] as const;

  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const tableStartX =
    marginX + Math.max((pageWidth - marginX * 2 - tableWidth) / 2, 0);

  const availableHeight =
    pageHeight - marginY * 2 - titleHeight - headerGap - headerRowHeight;
  const rowsPerPage = Math.max(Math.floor(availableHeight / rowHeight), 1);

  const drawTableHeader = () => {
    let y = marginY;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, pageWidth / 2, y + titleHeight - 2, {
      align: "center",
    });

    y += titleHeight + headerGap;

    doc.setFontSize(11);
    doc.setLineWidth(0.3);

    let x = tableStartX;
    columns.forEach((column) => {
      doc.rect(x, y, column.width, headerRowHeight, "S");
      const headerTextY = y + headerRowHeight - 2.5;
      if (column.key === "seq") {
        doc.text(column.label, x + column.width / 2, headerTextY, {
          align: "center",
        });
      } else {
        doc.text(column.label, x + 1.5, headerTextY);
      }
      x += column.width;
    });

    return y + headerRowHeight;
  };

  let currentY = drawTableHeader();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  rows.forEach((row, index) => {
    if (index > 0 && index % rowsPerPage === 0) {
      doc.addPage();
      currentY = drawTableHeader();
    }

    let x = tableStartX;
    columns.forEach((column) => {
      doc.rect(x, currentY, column.width, rowHeight, "S");
      const value = column.getValue(row, index);
      if (value) {
        const textY = currentY + rowHeight - 2.5;
        if (column.key === "seq") {
          doc.text(value, x + column.width / 2, textY, { align: "center" });
        } else {
          doc.text(value, x + 1.5, textY);
        }
      }
      x += column.width;
    });

    currentY += rowHeight;
  });

  const safeRetreat =
    displayedRetreat
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "retreat";

  const fileName = t("exit-checklist-file-name", { retreat: safeRetreat });
  doc.save(fileName);
};

const isExitChecklistReport = (
  report: unknown
): report is ExitChecklistReportData & {
  rows: ExitChecklistRow[];
  summary?: ReportDataSummary & { totalParticipants?: number };
} => {
  if (!report || typeof report !== "object") return false;
  const data = report as { type?: unknown; rows?: unknown };
  return data.type === "exitChecklist" && Array.isArray(data.rows);
};

type TableColumn = {
  key: string;
  label: string;
  width?: number | string;
  align?: "left" | "center" | "right";
  render: (row: ExitChecklistRow, index: number) => ReactNode;
};

const ExitChecklistReport = ({ reportId }: { reportId: string }) => {
  const t = useTranslations();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["reports", reportId, "exitChecklist"],
    queryFn: () => fetchExitChecklistReport(reportId),
    staleTime: 5 * 60 * 1000,
  });

  const { rows, retreatName, totalParticipants } = useMemo(() => {
    if (!data || !isExitChecklistReport(data.report)) {
      return {
        rows: [] as ExitChecklistRow[],
        retreatName: "",
        totalParticipants: 0,
      };
    }

    const report = data.report;
    const summaryTotal = report.summary?.totalParticipants;

    return {
      rows: report.rows ?? [],
      retreatName:
        typeof report.retreatName === "string" && report.retreatName.trim()
          ? report.retreatName
          : "",
      totalParticipants:
        typeof summaryTotal === "number" && Number.isFinite(summaryTotal)
          ? summaryTotal
          : report.rows.length,
    };
  }, [data]);

  const filteredRows = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      row.fullName.toLowerCase().includes(normalized)
    );
  }, [rows, searchTerm]);

  const defaultRetreatName = t("exit-checklist-retreat-fallback");
  const displayedRetreatName = retreatName || defaultRetreatName;
  const title = t("exit-checklist-title", { retreat: displayedRetreatName });

  const tableColumns: TableColumn[] = useMemo(() => {
    const blankCell = () => (
      <Box
        sx={{
          width: "100%",
          height: 24,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      />
    );

    return [
      {
        key: "seq",
        label: t("exit-checklist-column-seq"),
        width: 70,
        align: "center",
        render: (_row, index) => (
          <Typography variant="body2" fontWeight={600}>
            {index + 1}
          </Typography>
        ),
      },
      {
        key: "name",
        label: t("exit-checklist-column-name"),
        width: 240,
        render: (row) => (
          <Typography variant="body2" noWrap>
            {row.fullName}
          </Typography>
        ),
      },
      {
        key: "term",
        label: t("exit-checklist-column-term"),
        align: "center",
        render: () => blankCell(),
      },
      {
        key: "phone",
        label: t("exit-checklist-column-phone"),
        align: "center",
        render: () => blankCell(),
      },
      {
        key: "watch",
        label: t("exit-checklist-column-watch"),
        align: "center",
        render: () => blankCell(),
      },
      {
        key: "medicine",
        label: t("exit-checklist-column-medicine"),
        align: "center",
        render: () => blankCell(),
      },
      {
        key: "wallet",
        label: t("exit-checklist-column-wallet"),
        align: "center",
        render: () => blankCell(),
      },
      {
        key: "handbag",
        label: t("exit-checklist-column-handbag"),
        align: "center",
        render: () => blankCell(),
      },
      {
        key: "key",
        label: t("exit-checklist-column-key"),
        align: "center",
        render: () => blankCell(),
      },
      {
        key: "birthday",
        label: t("exit-checklist-column-birthday"),
        align: "center",
        render: () => blankCell(),
      },
      {
        key: "signature",
        label: t("exit-checklist-column-signature"),
        align: "center",
        render: () => blankCell(),
      },
    ];
  }, [t, theme.palette.divider]);

  const handleExport = useCallback(async () => {
    if (!filteredRows.length || isExporting) return;
    try {
      setIsExporting(true);
      await generateExitChecklistPdf(filteredRows, {
        retreatName: displayedRetreatName,
        t,
      });
    } finally {
      setIsExporting(false);
    }
  }, [filteredRows, isExporting, displayedRetreatName, t]);

  if (isLoading) {
    return (
      <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <LoadingScreenCircular />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
        <Button
          variant="outlined"
          onClick={() => refetch()}
          disabled={isFetching}
          startIcon={<Iconify icon="mdi:refresh" size={2} />}
        >
          {isFetching
            ? t("exit-checklist-refreshing")
            : t("exit-checklist-refresh")}
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleExport}
          disabled={!filteredRows.length || isExporting}
          startIcon={<Iconify icon="mdi:file-pdf-box" size={2} />}
        >
          {isExporting
            ? t("exit-checklist-exporting-pdf")
            : t("exit-checklist-export-pdf")}
        </Button>

        <SearchField
          sx={{ minWidth: 240, flex: 1, maxWidth: 340 }}
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t("exit-checklist-search-placeholder")}
        />

        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
          {t("exit-checklist-total", { count: totalParticipants })}
        </Typography>
      </Stack>

      <Box>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
      </Box>

      {!filteredRows.length ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {t("exit-checklist-empty")}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {tableColumns.map((column) => (
                  <TableCell
                    key={column.key}
                    align={column.align ?? "left"}
                    sx={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      width: column.width,
                      minWidth: column.width,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row, index) => (
                <TableRow key={row.id ?? `${row.participantId}-${index}`}>
                  {tableColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      align={column.align ?? "left"}
                      sx={{
                        width: column.width,
                        minWidth: column.width,
                        py: 1,
                      }}
                    >
                      {column.render(row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ExitChecklistReport;
