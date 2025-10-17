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
import SearchField from "../../../filters/SearchField";
import FilterButton from "../../../filters/FilterButton";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import {
  ReportsAllFilters,
  ReportsTableFilters,
  ReportsTableDateFilters,
} from "../../types";
import { getFilters } from "../getFilters";
import {
  FamilyReportMember,
  FamilyReportRow,
  FamilyReportSummary,
  ReportDataSummary,
} from "@/src/types/reports";
import { fetchReport } from "../api";
import { useTranslations } from "next-intl";

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
  const filtersConfig = getFilters(reportId);
  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<ReportsAllFilters>>({
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
    queryKey: ["reports", reportId, "family"],
    queryFn: () => fetchReport(reportId),
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

  const handleToggleFamily = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApplyFilters = (
    newFilters: Partial<TableDefaultFilters<ReportsAllFilters>>
  ) => {
    updateFilters({ ...filters, ...newFilters });
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
          startIcon={<Iconify icon="mdi:refresh" size={20} />}
        >
          {isFetching
            ? t("family-report-refresh-loading")
            : t("family-report-refresh")}
        </Button>

        <Button
          variant="contained"
          onClick={handleExportCsv}
          disabled={!families.length}
          startIcon={<Iconify icon="mdi:file-export-outline" size={20} />}
        >
          {t("family-report-export")}
        </Button>

        <FilterButton<
          TableDefaultFilters<ReportsTableFilters>,
          ReportsTableDateFilters
        >
          filters={filtersConfig}
          defaultValues={filters}
          onApplyFilters={handleApplyFilters}
          onReset={resetFilters}
          activeFiltersCount={activeFiltersCount}
        />

        <SearchField
          sx={{ minWidth: 220, flex: 1, maxWidth: 320 }}
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            updateFilters({ ...filters, search: value });
          }}
          placeholder={t("family-report-search")}
        />
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
                          size={20}
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
                      <Iconify icon="mdi:account-multiple" size={18} />
                      <Typography variant="body2" color="text.secondary">
                        {t("family-report-members-count", {
                          count: family.membersCount,
                        })}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="mdi:clock-outline" size={18} />
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
                          size={18}
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
          icon={<Iconify icon={icon} size={18} />}
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
