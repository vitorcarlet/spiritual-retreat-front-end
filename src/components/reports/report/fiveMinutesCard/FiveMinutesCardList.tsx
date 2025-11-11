"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Iconify from "@/src/components/Iconify";
import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
import SearchField from "../../../filters/SearchField";
import { fetchFiveMinutesCardReport } from "./shared";
import {
  FiveMinutesCardParticipant,
  FiveMinutesCardReportData,
  ReportDataSummary,
} from "@/src/types/reports";
import { useTranslations } from "next-intl";
import {
  getContrastingTextColor,
  hexToRgb,
  normalizeHexColor,
} from "../utils/colors";

const generateFiveMinutesCardPdf = async (
  participants: FiveMinutesCardParticipant[]
) => {
  if (!participants.length) return;
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const headerHeight = 22;
  const gap = 6;
  const contentWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const sectionHeight = usableHeight / 2;

  participants.forEach((participant, index) => {
    const position = index % 2;
    if (index > 0 && position === 0) {
      doc.addPage();
    }

    const startY = margin + sectionHeight * position;
    const familyColor = normalizeHexColor(participant.familyColor);
    const { r, g, b } = hexToRgb(familyColor);
    const contrast = getContrastingTextColor(familyColor);

    doc.setFillColor(r, g, b);
    doc.rect(margin, startY, contentWidth, headerHeight, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(contrast.r, contrast.g, contrast.b);
    doc.text(
      participant.fullName,
      margin + contentWidth / 2,
      startY + headerHeight / 2 + 5,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(11);
    doc.text(participant.familyName, margin + 4, startY + headerHeight - 4);

    const noteStartY = startY + headerHeight + gap;
    const noteHeight = sectionHeight - headerHeight - gap;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.6);
    doc.rect(margin, noteStartY, contentWidth, noteHeight, "S");
  });

  doc.save("five-minutes-cards.pdf");
};

const isFiveMinutesReport = (
  report: unknown
): report is FiveMinutesCardReportData & {
  summary?: ReportDataSummary & { totalParticipants?: number };
} => {
  if (!report || typeof report !== "object") return false;
  const data = report as { type?: unknown; rows?: unknown };
  return data.type === "fiveMinutesCard" && Array.isArray(data.rows);
};

const FiveMinutesCardList = ({ reportId }: { reportId: string }) => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["reports", reportId, "fiveMinutesCard"],
    queryFn: () => fetchFiveMinutesCardReport(reportId),
    staleTime: 5 * 60 * 1000,
  });

  const participants = useMemo(() => {
    if (!data || !isFiveMinutesReport(data.report))
      return [] as FiveMinutesCardParticipant[];
    return (data.report.rows ?? []) as FiveMinutesCardParticipant[];
  }, [data]);

  const filtered = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return participants;
    return participants.filter((participant) => {
      const { fullName, familyName } = participant;
      return (
        fullName.toLowerCase().includes(normalized) ||
        familyName.toLowerCase().includes(normalized)
      );
    });
  }, [participants, searchTerm]);

  const totalParticipants = participants.length;

  const handleExport = useCallback(async () => {
    if (!filtered.length || isExporting) return;
    try {
      setIsExporting(true);
      await generateFiveMinutesCardPdf(filtered);
    } finally {
      setIsExporting(false);
    }
  }, [filtered, isExporting]);

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
            ? t("five-minutes-card-refreshing")
            : t("five-minutes-card-refresh")}
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleExport}
          disabled={!filtered.length || isExporting}
          startIcon={<Iconify icon="mdi:file-pdf-box" size={2} />}
        >
          {isExporting
            ? t("five-minutes-card-exporting-pdf")
            : t("five-minutes-card-export-pdf")}
        </Button>

        <SearchField
          sx={{ minWidth: 220, flex: 1, maxWidth: 320 }}
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t("five-minutes-card-search-placeholder")}
        />

        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
          {t("five-minutes-card-total", { count: totalParticipants })}
        </Typography>
      </Box>

      {!filtered.length ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {t("five-minutes-card-empty")}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
          }}
        >
          {filtered.map((participant) => {
            const familyColor = normalizeHexColor(participant.familyColor);
            const contrast = getContrastingTextColor(familyColor);
            const location =
              [participant.city, participant.state]
                .filter(Boolean)
                .join(" / ") || t("five-minutes-card-not-provided");

            const statusLabel = (() => {
              switch (participant.status) {
                case "confirmed":
                  return t("five-minutes-card-status-confirmed");
                case "registered":
                  return t("five-minutes-card-status-registered");
                case "attended":
                  return t("five-minutes-card-status-attended");
                case "cancelled":
                  return t("five-minutes-card-status-cancelled");
                default:
                  return participant.confirmed
                    ? t("five-minutes-card-status-confirmed")
                    : t("five-minutes-card-status-unknown");
              }
            })();

            const infoItems = [
              {
                label: t("five-minutes-card-id-label"),
                value:
                  participant.participantId !== undefined &&
                  participant.participantId !== null
                    ? String(participant.participantId)
                    : t("five-minutes-card-not-provided"),
              },
              {
                label: t("five-minutes-card-email-label"),
                value: participant.email || t("five-minutes-card-not-provided"),
              },
              {
                label: t("five-minutes-card-phone-label"),
                value: participant.phone || t("five-minutes-card-not-provided"),
              },
              {
                label: t("five-minutes-card-location-label"),
                value: location,
              },
              {
                label: t("five-minutes-card-status-label"),
                value: statusLabel,
              },
            ];
            return (
              <Card key={participant.id} variant="outlined">
                <Box
                  sx={{
                    bgcolor: familyColor,
                    color: `rgb(${contrast.r}, ${contrast.g}, ${contrast.b})`,
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      lineHeight={1.2}
                    >
                      {participant.fullName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9 }}
                      color={`rgb(${contrast.r}, ${contrast.g}, ${contrast.b})`}
                    >
                      {participant.familyName}
                    </Typography>
                  </Stack>
                </Box>

                <CardContent>
                  <Stack spacing={1.25}>
                    {infoItems.map((item) => (
                      <Stack
                        key={`${participant.id}-${item.label}`}
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                        flexWrap="wrap"
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ minWidth: 120 }}
                        >
                          {item.label}:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.value}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default FiveMinutesCardList;
