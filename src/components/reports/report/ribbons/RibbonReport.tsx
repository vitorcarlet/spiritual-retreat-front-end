"use client";

import { useCallback, useMemo, useState } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Iconify from "@/src/components/Iconify";
import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
import SearchField from "@/src/components/filters/SearchField";
import { fetchReport } from "../api";
import {
  RibbonReportData,
  RibbonReportRow,
  ReportDataSummary,
} from "@/src/types/reports";

const ribbonFontSize = 20;
const ribbonLineHeight = ribbonFontSize * 1.25;
const pdfMargin = 18;

const generateRibbonPdf = async (
  participants: RibbonReportRow[],
  uppercaseDefault: boolean,
  fileName: string
) => {
  if (!participants.length) return;
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableHeight = pageHeight - pdfMargin * 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(ribbonFontSize);

  let cursorY = pdfMargin;

  participants.forEach((row, index) => {
    const display =
      (row.uppercase ?? uppercaseDefault)
        ? row.displayName.toUpperCase()
        : row.displayName;

    if (index > 0 && cursorY + ribbonLineHeight > pdfMargin + usableHeight) {
      doc.addPage();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(ribbonFontSize);
      cursorY = pdfMargin;
    }

    const boxTop = cursorY;
    const boxHeight = ribbonLineHeight;
    const boxWidth = pageWidth - pdfMargin * 2;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.6);
    doc.rect(pdfMargin, boxTop, boxWidth, boxHeight, "S");

    doc.text(display, pageWidth / 2, boxTop + boxHeight / 2, {
      align: "center",
      baseline: "middle",
    });

    // Reset to default thin line width for any future drawing operations
    doc.setLineWidth(0.2);

    cursorY += ribbonLineHeight;
  });

  doc.save(fileName);
};

const isRibbonReport = (
  report: unknown
): report is RibbonReportData & {
  summary?: ReportDataSummary & { totalParticipants?: number };
} => {
  if (!report || typeof report !== "object") return false;
  const data = report as { type?: unknown; rows?: unknown };
  return data.type === "ribbons" && Array.isArray(data.rows);
};

const RibbonReport = ({ reportId }: { reportId: string }) => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["reports", reportId, "ribbons"],
    queryFn: () => fetchReport(reportId),
    staleTime: 5 * 60 * 1000,
  });

  const participants = useMemo(() => {
    if (!data || !isRibbonReport(data.report)) return [] as RibbonReportRow[];
    return (data.report.rows ?? []) as RibbonReportRow[];
  }, [data]);

  const filtered = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return participants;
    return participants.filter((item) =>
      item.displayName.toLowerCase().includes(normalized)
    );
  }, [participants, searchTerm]);

  const uppercaseDefault = Boolean(
    data && isRibbonReport(data.report) && data.report.summary?.uppercaseDefault
  );

  const fileName = useMemo(
    () =>
      data && isRibbonReport(data.report) && data.report.retreatName
        ? t("ribbon-report-file-name", {
            retreat: data.report.retreatName.replace(/\s+/g, "-").toLowerCase(),
          })
        : t("ribbon-report-default-file"),
    [data, t]
  );

  const handleExport = useCallback(async () => {
    if (!filtered.length || isExporting) return;
    try {
      setIsExporting(true);
      await generateRibbonPdf(filtered, uppercaseDefault, fileName);
    } finally {
      setIsExporting(false);
    }
  }, [filtered, isExporting, uppercaseDefault, fileName]);

  if (isLoading) {
    return (
      <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <LoadingScreenCircular />
      </Box>
    );
  }

  const totalParticipants = participants.length;

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
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Button
          variant="outlined"
          onClick={() => refetch()}
          disabled={isFetching}
          startIcon={<Iconify icon="mdi:refresh" size={2} />}
        >
          {isFetching
            ? t("ribbon-report-refreshing")
            : t("ribbon-report-refresh")}
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleExport}
          disabled={!filtered.length || isExporting}
          startIcon={<Iconify icon="mdi:file-pdf-box" size={2} />}
        >
          {isExporting
            ? t("ribbon-report-exporting")
            : t("ribbon-report-export")}
        </Button>

        <SearchField
          sx={{ minWidth: 220, flex: 1, maxWidth: 360 }}
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t("ribbon-report-search-placeholder")}
        />

        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
          {t("ribbon-report-total", { count: totalParticipants })}
        </Typography>
      </Box>

      {!filtered.length ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {t("ribbon-report-empty")}
          </Typography>
        </Box>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            width: "100%",
            p: 3,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Stack spacing={0}>
            {filtered.map((participant, index) => {
              const text =
                (participant.uppercase ?? uppercaseDefault)
                  ? participant.displayName.toUpperCase()
                  : participant.displayName;
              return (
                <Box
                  key={participant.id}
                  sx={{
                    border: "1px solid",
                    borderColor: "text.primary",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: `${ribbonLineHeight}px`,
                    ...(index > 0
                      ? {
                          mt: "-1px",
                        }
                      : {}),
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: ribbonFontSize,
                      lineHeight: 1,
                      fontWeight: 600,
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    {text}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default RibbonReport;
