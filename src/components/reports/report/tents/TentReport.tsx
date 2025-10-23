"use client";

import { useCallback, useMemo, useState } from "react";
import { alpha } from "@mui/material";
import {
  Box,
  Button,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Iconify from "@/src/components/Iconify";
import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
import SearchField from "@/src/components/filters/SearchField";
import { fetchReport } from "../api";
import {
  ReportDataSummary,
  TentReportData,
  TentReportRow,
} from "@/src/types/reports";
import {
  getContrastingTextColor,
  hexToRgb,
  normalizeHexColor,
} from "../utils/colors";

const tentsPerPagePdf = 8;
const pdfColumns = 2;
const pdfRowsPerPage = tentsPerPagePdf / pdfColumns;

type TentReportLabels = {
  family: string;
  femaleSponsor: string;
  maleSponsor: string;
  mixedSponsor: string;
  rahamistas: string;
};

const lightenForHighlight = (color?: string) => {
  const normalized = normalizeHexColor(color);
  const { r, g, b } = hexToRgb(normalized);
  const lightFactor = 0.65;
  const lighten = (component: number) =>
    Math.min(255, Math.round(component + (255 - component) * lightFactor));
  return { r: lighten(r), g: lighten(g), b: lighten(b) };
};

const generateTentReportPdf = async (
  tents: TentReportRow[],
  labels: TentReportLabels
) => {
  if (!tents.length) return;
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const cellWidth = (pageWidth - margin * 2) / pdfColumns;
  const cellHeight = (pageHeight - margin * 2) / pdfRowsPerPage;

  tents.forEach((tent, index) => {
    if (index > 0 && index % tentsPerPagePdf === 0) {
      doc.addPage();
    }

    const indexWithinPage = index % tentsPerPagePdf;
    const row = Math.floor(indexWithinPage / pdfColumns);
    const column = indexWithinPage % pdfColumns;

    const startX = margin + column * cellWidth;
    const startY = margin + row * cellHeight;

    const familyColor = normalizeHexColor(tent.familyColor);
    const contrast = getContrastingTextColor(familyColor);
    const familyHighlight = lightenForHighlight(familyColor);

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(startX, startY, cellWidth, cellHeight, "S");

    let cursorY = startY + 10;
    const cursorX = startX + 6;

    const sponsorLabel =
      tent.gender === "female"
        ? labels.femaleSponsor
        : tent.gender === "male"
          ? labels.maleSponsor
          : labels.mixedSponsor;

    const sections: Array<{
      label: string;
      value: string;
      highlight?: boolean;
    }> = [
      {
        label: `${labels.family}:`,
        value: tent.familyName,
        highlight: true,
      },
      {
        label: `${sponsorLabel}:`,
        value: tent.sponsorName || "-",
        highlight: Boolean(tent.sponsorName),
      },
      {
        label: `${labels.rahamistas}:`,
        value: tent.rahamistas.length ? tent.rahamistas.join(", ") : "-",
      },
    ];

    if (tent.notes) {
      sections.push({ label: "Obs:", value: tent.notes });
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${tent.tentNumber}`, startX + cellWidth - 8, startY + 8, {
      align: "right",
    });

    doc.setFontSize(11);
    const valueLineHeight = 6;
    const valueRightPadding = 6;

    sections.forEach(({ label, value, highlight: shouldHighlight }) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text(label, cursorX, cursorY);

      const labelWidth = doc.getTextWidth(label);
      const valueX = cursorX + labelWidth + 2;
      const availableWidth = Math.max(
        20,
        cellWidth - (valueX - startX) - valueRightPadding
      );

      doc.setFont("helvetica", "normal");
      const valueLines = doc.splitTextToSize(value, availableWidth);

      valueLines.forEach((line: string, index: number) => {
        const lineY = cursorY + index * valueLineHeight;
        if (shouldHighlight && value !== "-") {
          doc.setFillColor(
            familyHighlight.r,
            familyHighlight.g,
            familyHighlight.b
          );
          const textWidth = doc.getTextWidth(line) + 2;
          doc.rect(
            valueX - 1,
            lineY - 4.5,
            textWidth,
            valueLineHeight + 2,
            "F"
          );
          doc.setTextColor(contrast.r, contrast.g, contrast.b);
        } else {
          doc.setTextColor(66, 66, 66);
        }

        doc.text(line, valueX, lineY);
      });

      cursorY += valueLines.length * valueLineHeight + 4;
      doc.setTextColor(33, 33, 33);
    });

    // Reset text color for next iteration
    doc.setTextColor(33, 33, 33);
  });

  doc.save("tent-report.pdf");
};

const isTentReport = (
  report: unknown
): report is TentReportData & {
  summary?: ReportDataSummary & { totalTents?: number };
} => {
  if (!report || typeof report !== "object") return false;
  const data = report as { type?: unknown; rows?: unknown };
  return data.type === "tents" && Array.isArray(data.rows);
};

const getSponsorLabel = (
  gender: TentReportRow["gender"],
  labels: TentReportLabels
) => {
  switch (gender) {
    case "female":
      return labels.femaleSponsor;
    case "male":
      return labels.maleSponsor;
    default:
      return labels.mixedSponsor;
  }
};

const TentReport = ({ reportId }: { reportId: string }) => {
  const t = useTranslations();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const labels = useMemo<TentReportLabels>(
    () => ({
      family: t("tent-report-family-label"),
      femaleSponsor: t("tent-report-female-sponsor"),
      maleSponsor: t("tent-report-male-sponsor"),
      mixedSponsor: t("tent-report-generic-sponsor"),
      rahamistas: t("tent-report-rahamistas-label"),
    }),
    [t]
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["reports", reportId, "tents"],
    queryFn: () => fetchReport(reportId),
    staleTime: 5 * 60 * 1000,
  });

  const tents = useMemo(() => {
    if (!data || !isTentReport(data.report)) return [] as TentReportRow[];
    return (data.report.rows ?? []) as TentReportRow[];
  }, [data]);

  const filtered = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return tents;
    return tents.filter((tent) => {
      const sponsor = tent.sponsorName ?? "";
      const rahamistas = tent.rahamistas.join(" ");
      return [tent.tentNumber, tent.familyName, sponsor, rahamistas]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [tents, searchTerm]);

  const handleExport = useCallback(async () => {
    if (!filtered.length || isExporting) return;
    try {
      setIsExporting(true);
      await generateTentReportPdf(filtered, labels);
    } finally {
      setIsExporting(false);
    }
  }, [filtered, isExporting, labels]);

  if (isLoading) {
    return (
      <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <LoadingScreenCircular />
      </Box>
    );
  }

  const totalTents = tents.length;

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
          {isFetching ? t("tent-report-refreshing") : t("tent-report-refresh")}
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleExport}
          disabled={!filtered.length || isExporting}
          startIcon={<Iconify icon="mdi:file-pdf-box" size={2} />}
        >
          {isExporting ? t("tent-report-exporting") : t("tent-report-export")}
        </Button>

        <SearchField
          sx={{ minWidth: 220, flex: 1, maxWidth: 360 }}
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t("tent-report-search-placeholder")}
        />

        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
          {t("tent-report-total", { count: totalTents })}
        </Typography>
      </Box>

      {!filtered.length ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {t("tent-report-empty")}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },
          }}
        >
          {filtered.map((tent) => {
            const familyColor = normalizeHexColor(tent.familyColor);
            const highlight = alpha(familyColor, 0.25);
            const sponsorLabel = getSponsorLabel(tent.gender, labels);

            return (
              <Box
                key={tent.id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2,
                  minHeight: 160,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  backgroundColor: "background.paper",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    {t("tent-report-tent-label", { number: tent.tentNumber })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tent.gender === "female"
                      ? t("tent-report-gender-female")
                      : tent.gender === "male"
                        ? t("tent-report-gender-male")
                        : t("tent-report-gender-mixed")}
                  </Typography>
                </Stack>

                <Stack spacing={1.25}>
                  <Typography variant="body2" fontWeight={600}>
                    {labels.family}:{" "}
                    <Box
                      component="span"
                      sx={{
                        px: 0.75,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: highlight,
                        color: theme.palette.getContrastText(highlight),
                        fontWeight: 700,
                        display: "inline-block",
                        mt: isSmallScreen ? 0.75 : 0,
                      }}
                    >
                      {tent.familyName}
                    </Box>
                  </Typography>

                  <Typography variant="body2" fontWeight={600}>
                    {sponsorLabel}:{" "}
                    <Box
                      component="span"
                      sx={{
                        fontWeight: 500,
                        color: tent.sponsorName
                          ? theme.palette.text.primary
                          : theme.palette.text.disabled,
                      }}
                    >
                      {tent.sponsorName || t("tent-report-missing-sponsor")}
                    </Box>
                  </Typography>

                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {labels.rahamistas}:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tent.rahamistas.length
                        ? tent.rahamistas.join(", ")
                        : t("tent-report-no-rahamistas")}
                    </Typography>
                  </Box>

                  {tent.notes ? (
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {t("tent-report-notes-label")}:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tent.notes}
                      </Typography>
                    </Box>
                  ) : null}
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default TentReport;
