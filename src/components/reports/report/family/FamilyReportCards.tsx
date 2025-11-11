"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
import Iconify from "@/src/components/Iconify";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import { ReportsAllFilters } from "../../types";
import { FamilyReportMember, ReportDataSummary } from "@/src/types/reports";
import {
  fetchFamilyReport,
  FamilyReportRow,
  FamilyReportSummary,
} from "./shared";
import { useTranslations } from "next-intl";
import {
  normalizeHexColor,
  hexToRgb,
  getContrastingTextColor,
} from "../utils/colors";

type TranslateFn = ReturnType<typeof useTranslations>;

const buildMemberEntries = (
  doc: import("jspdf").jsPDF,
  members: FamilyReportMember[],
  contentWidth: number,
  fontSize: number,
  lineHeight: number,
  t: TranslateFn
) => {
  doc.setFontSize(fontSize);
  const notProvided = t("family-report-pdf-not-provided");
  const phoneLabel = t("family-report-pdf-phone-label");
  const emailLabel = t("family-report-pdf-email-label");
  const locationLabel = t("family-report-pdf-location-label");
  const statusLabel = t("family-report-pdf-status-label");

  const membersEntries = members.map((member) => {
    const location =
      [member.city, member.state].filter(Boolean).join(" / ") || notProvided;
    const status = member.status || t("family-report-member-status-unknown");
    const pieces = [
      member.fullName || notProvided,
      `${phoneLabel}: ${member.phone || notProvided}`,
      `${emailLabel}: ${member.email || notProvided}`,
      `${locationLabel}: ${location}`,
      `${statusLabel}: ${status}`,
    ];

    const text = pieces.join(" • ");
    const lines = doc.splitTextToSize(text, contentWidth);
    const height = lines.length * lineHeight + 2;

    return { lines, height };
  });

  const totalHeight = membersEntries.reduce(
    (acc, entry) => acc + entry.height,
    0
  );

  return { membersEntries, totalHeight };
};

const generateFamilyReportPdf = async ({
  families,
  summary,
  reportId,
  t,
}: {
  families: FamilyReportRow[];
  summary?: FamilyReportSummary | ReportDataSummary;
  reportId: string;
  t: TranslateFn;
}) => {
  if (!families.length) return;
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const headerHeight = 18;
  const contentWidth = pageWidth - margin * 2;
  const minFontSize = 6;

  families.forEach((family, index) => {
    if (index > 0) {
      doc.addPage();
    }

    const familyColor = normalizeHexColor(family.color);
    const { r, g, b } = hexToRgb(familyColor);
    const contrast = getContrastingTextColor(familyColor);

    doc.setFillColor(r, g, b);
    doc.rect(margin, margin, contentWidth, headerHeight, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(contrast.r, contrast.g, contrast.b);
    doc.text(
      family.familyName,
      margin + contentWidth / 2,
      margin + headerHeight / 2 + 5,
      {
        align: "center",
      }
    );

    if (summary?.generatedAt && index === 0) {
      doc.setFontSize(9);
      doc.text(
        t("family-report-generated-at", {
          value: formatSummaryDate(summary.generatedAt),
        }),
        margin + contentWidth,
        margin + headerHeight / 2 + 5,
        { align: "right" }
      );
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(33, 33, 33);

    let cursorY = margin + headerHeight + 8;

    doc.setFontSize(11);
    const membersCount = t("family-report-members-count", {
      count: family.membersCount,
    });
    doc.text(membersCount, margin, cursorY);

    if (family.updatedAt) {
      doc.text(
        t("family-report-updated-at", {
          value: formatSummaryDate(family.updatedAt),
        }),
        margin + contentWidth,
        cursorY,
        { align: "right" }
      );
    }

    cursorY += 6;

    const contactLine = t("family-report-contact", {
      name: family.contactName || t("family-report-pdf-not-provided"),
      phone: family.contactPhone || t("family-report-pdf-not-provided"),
      email: family.contactEmail || t("family-report-pdf-not-provided"),
    });

    const contactLines = doc.splitTextToSize(contactLine, contentWidth);
    doc.text(contactLines, margin, cursorY);
    cursorY += contactLines.length * 6 + 4;

    doc.setFont("helvetica", "bold");
    doc.text(t("family-report-members"), margin, cursorY);
    doc.setFont("helvetica", "normal");
    cursorY += 6;

    if (!family.members.length) {
      doc.text(t("family-report-no-members"), margin, cursorY);
      return;
    }

    const availableHeight = pageHeight - margin - cursorY;
    let fontSize = 11;
    let lineHeight = 6;

    let { membersEntries, totalHeight } = buildMemberEntries(
      doc,
      family.members,
      contentWidth,
      fontSize,
      lineHeight,
      t
    );

    while (totalHeight > availableHeight && fontSize > minFontSize) {
      fontSize -= 1;
      lineHeight = Math.max(3.5, lineHeight - 0.5);
      ({ membersEntries, totalHeight } = buildMemberEntries(
        doc,
        family.members,
        contentWidth,
        fontSize,
        lineHeight,
        t
      ));
    }

    doc.setFontSize(fontSize);
    doc.setDrawColor(220, 220, 220);

    membersEntries.forEach(({ lines }, memberIndex) => {
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * lineHeight + 2;

      if (memberIndex < membersEntries.length - 1) {
        doc.line(margin, cursorY - 1, margin + contentWidth, cursorY - 1);
        cursorY += 1;
      }
    });
  });

  doc.save(`family-report-${reportId}.pdf`);
};

const formatSummaryDate = (value?: string) =>
  value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "";

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const escapeCsv = (value?: string | number) => {
  if (value === undefined || value === null) return "";
  const stringValue = String(value).replace(/"/g, '""');
  if (stringValue.includes(";") || stringValue.includes("\n")) {
    return `"${stringValue}"`;
  }
  return stringValue;
};

const buildCsv = (
  families: FamilyReportRow[],
  summary?: FamilyReportSummary | ReportDataSummary
) => {
  const rows: string[] = [];
  const header = [
    "family_id",
    "family_name",
    "members_count",
    "contact_name",
    "contact_phone",
    "member_id",
    "member_name",
    "member_email",
    "member_phone",
    "member_city",
    "member_state",
    "member_status",
  ];

  if (summary) {
    rows.push(
      [
        "total_families",
        summary.totalFamilies ?? families.length,
        "total_participants",
        summary.totalParticipants ??
          families.reduce((acc, family) => acc + family.members.length, 0),
        "locked_families",
        summary.lockedFamilies ?? 0,
      ]
        .map((value) => escapeCsv(value))
        .join(";")
    );
    rows.push("");
  }

  rows.push(header.join(";"));

  families.forEach((family) => {
    if (!family.members.length) {
      rows.push(
        [
          family.familyId,
          family.familyName,
          family.membersCount,
          family.contactName,
          family.contactPhone,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]
          .map((value) => escapeCsv(value))
          .join(";")
      );
      return;
    }

    family.members.forEach((member) => {
      rows.push(
        [
          family.familyId,
          family.familyName,
          family.membersCount,
          family.contactName,
          family.contactPhone,
          member.id,
          member.fullName,
          member.email,
          member.phone,
          member.city,
          member.state,
          member.status,
        ]
          .map((value) => escapeCsv(value))
          .join(";")
      );
    });
  });

  return rows.join("\n");
};

const shouldIncludeFamily = (
  family: FamilyReportRow,
  searchTerm: string
): boolean => {
  if (!searchTerm) return true;
  const normalized = searchTerm.toLowerCase();
  const matchesFamily = family.familyName.toLowerCase().includes(normalized);
  const matchesContact = family.contactName.toLowerCase().includes(normalized);
  const matchesMember = family.members.some((member) =>
    member.fullName.toLowerCase().includes(normalized)
  );
  return matchesFamily || matchesContact || matchesMember;
};

const FamilyReportCards = ({ reportId }: { reportId: string }) => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { filters } = useUrlFilters<TableDefaultFilters<ReportsAllFilters>>({
    defaultFilters: {
      page: 1,
      pageLimit: 12,
    },
    excludeFromCount: ["page", "pageLimit", "search"],
  });

  const {
    data: reportData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["reports", reportId, "family", filters],
    queryFn: () => fetchFamilyReport(reportId, filters),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (typeof filters.search === "string" && filters.search !== searchTerm) {
      setSearchTerm(filters.search);
    }
  }, [filters.search, searchTerm]);

  const families = useMemo(() => {
    const rows = Array.isArray(reportData?.report.rows)
      ? (reportData?.report.rows as FamilyReportRow[])
      : [];

    return rows.filter((family) => shouldIncludeFamily(family, searchTerm));
  }, [reportData?.report.rows, searchTerm]);

  const summary = useMemo(() => {
    const baseSummary = (reportData?.report.summary ?? {}) as
      | FamilyReportSummary
      | ReportDataSummary;

    const computedTotals = families.reduce(
      (acc, family) => {
        acc.totalFamilies += 1;
        acc.totalParticipants += family.members.length;
        if (family.locked) acc.lockedFamilies += 1;
        return acc;
      },
      { totalFamilies: 0, totalParticipants: 0, lockedFamilies: 0 }
    );

    return {
      totalFamilies: baseSummary.totalFamilies ?? computedTotals.totalFamilies,
      totalParticipants:
        baseSummary.totalParticipants ?? computedTotals.totalParticipants,
      lockedFamilies:
        baseSummary.lockedFamilies ?? computedTotals.lockedFamilies,
      generatedAt: baseSummary.generatedAt,
    } satisfies FamilyReportSummary;
  }, [families, reportData?.report.summary]);

  const handleExportCsv = useCallback(() => {
    if (!families.length) return;
    const csv = buildCsv(families, summary);
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    downloadBlob(blob, `families-report-${reportId}.csv`);
  }, [families, summary, reportId]);

  const handleExportPdf = useCallback(async () => {
    if (!families.length || isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      await generateFamilyReportPdf({
        families,
        summary,
        reportId,
        t,
      });
    } catch (error) {
      console.error("Failed to generate family report PDF", error);
    } finally {
      setIsExportingPdf(false);
    }
  }, [families, summary, reportId, t, isExportingPdf]);

  const handleToggleFamily = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderMembers = (members: FamilyReportMember[]) => {
    if (!members.length) {
      return (
        <Typography variant="body2" color="text.secondary">
          {t("family-report-no-members")}
        </Typography>
      );
    }

    return (
      <Stack spacing={1} sx={{ mt: 1 }}>
        {members.map((member) => (
          <Stack
            key={member.id}
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Typography variant="subtitle2" color="text.primary">
              {member.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {member.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {member.phone}
            </Typography>
            <Chip
              size="small"
              color="info"
              label={member.status || t("family-report-member-status-unknown")}
            />
          </Stack>
        ))}
      </Stack>
    );
  };

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
            ? t("family-report-refresh-loading")
            : t("family-report-refresh")}
        </Button>

        <Button
          variant="contained"
          onClick={handleExportCsv}
          disabled={!families.length}
          startIcon={<Iconify icon="mdi:file-export-outline" size={2} />}
        >
          {t("family-report-export")}
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleExportPdf}
          disabled={!families.length || isExportingPdf}
          startIcon={<Iconify icon="mdi:file-pdf-box" size={2} />}
        >
          {isExportingPdf
            ? t("family-report-exporting-pdf")
            : t("family-report-export-pdf")}
        </Button>

        {/* <SearchField
          sx={{ minWidth: 220, flex: 1, maxWidth: 320 }}
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            updateFilters({ ...filters, search: value });
          }}
          placeholder={t("family-report-search")}
        /> */}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
        }}
      >
        <SummaryCard
          icon="mdi:home-group"
          label={t("family-report-total-families")}
          value={summary.totalFamilies}
        />
        <SummaryCard
          icon="mdi:account-group"
          label={t("family-report-total-participants")}
          value={summary.totalParticipants}
        />
        <SummaryCard
          icon="mdi:lock"
          label={t("family-report-locked-families")}
          value={summary.lockedFamilies}
        />
      </Box>

      {summary.generatedAt ? (
        <Typography variant="caption" color="text.secondary">
          {t("family-report-generated-at", {
            value: formatSummaryDate(summary.generatedAt),
          })}
        </Typography>
      ) : null}

      {isLoading ? (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <LoadingScreenCircular />
        </Box>
      ) : families.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {t("family-report-empty-state")}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
          }}
        >
          {families.map((family) => {
            const isExpanded = expanded[family.id] ?? false;
            return (
              <Card
                key={family.id}
                variant="outlined"
                sx={{
                  height: "100%",
                  borderColor: family.locked ? "warning.light" : "divider",
                  position: "relative",
                }}
              >
                <CardHeader
                  title={family.familyName}
                  subheader={family.contactName}
                  action={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip
                        title={
                          family.locked
                            ? t("family-report-tags.locked")
                            : t("family-report-tags.active")
                        }
                      >
                        <Chip
                          size="small"
                          label={
                            family.locked
                              ? t("family-report-tags.locked")
                              : t("family-report-tags.active")
                          }
                          color={family.locked ? "warning" : "success"}
                        />
                      </Tooltip>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleToggleFamily(family.id)}
                      >
                        <Iconify
                          icon={
                            isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"
                          }
                          size={2}
                        />
                      </IconButton>
                    </Stack>
                  }
                  sx={{
                    borderBottom: (theme) =>
                      `1px solid ${theme.palette.divider}`,
                  }}
                />

                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="body2" color="text.secondary">
                      {t("family-report-contact", {
                        name: family.contactName,
                        phone: family.contactPhone,
                        email: family.contactEmail,
                      })}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="mdi:account-multiple" size={2} />
                      <Typography variant="body2" color="text.secondary">
                        {t("family-report-members-count", {
                          count: family.membersCount,
                        })}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="mdi:clock-outline" size={2} />
                      <Typography variant="body2" color="text.secondary">
                        {t("family-report-updated-at", {
                          value: formatSummaryDate(family.updatedAt),
                        })}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle2">
                      {t("family-report-members")}
                    </Typography>
                    <Button
                      size="small"
                      endIcon={
                        <Iconify
                          icon={
                            isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"
                          }
                          size={2}
                        />
                      }
                      onClick={() => handleToggleFamily(family.id)}
                    >
                      {isExpanded
                        ? t("family-report-hide-members")
                        : t("family-report-show-members")}
                    </Button>
                  </Stack>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    {renderMembers(family.members)}
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) => (
  <Card variant="outlined">
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Chip
          icon={<Iconify icon={icon} size={2} />}
          label={value}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
    </CardContent>
  </Card>
);

export default FamilyReportCards;
