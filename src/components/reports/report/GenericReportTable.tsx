"use client";

import { Box, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { getFilters } from "./getFilters";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import FilterButton from "../../filters/FilterButton";
import { TanStackTable } from "../../table";
import {
  ReportsAllFilters,
  ReportsTableFilters,
  ReportsTableDateFilters,
} from "../types";
import {
  buildTanStackReportColumns,
  type ColumnDescriptor,
} from "./tanStackColumnsBuilder";
import { fetchReport } from "./api";

interface ReportRow extends Record<string, unknown> {
  id: string | number;
}

const GenericReportTable = ({ reportId }: { reportId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const filtersConfig = getFilters();

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<ReportsAllFilters>>({
      defaultFilters: {
        page: 1,
        pageLimit: 10,
      },
      excludeFromCount: ["page", "pageLimit", "search"],
    });

  const handleApplyFilters = (
    newFilters: Partial<TableDefaultFilters<ReportsAllFilters>>
  ) => {
    updateFilters({ ...filters, ...newFilters });
  };

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["reports", reportId, filters],
    queryFn: () => fetchReport(reportId, filters),
    staleTime: 5 * 60 * 1000,
  });

  const dynamicColumns = useMemo(() => {
    const fromApi = reportData?.columns;
    if (fromApi && fromApi.length) {
      return buildTanStackReportColumns({ descriptors: fromApi });
    }
    const fallback: ColumnDescriptor[] = [
      { field: "id", type: "string", width: 80 },
      { field: "name", type: "string", minWidth: 180, flex: 1 },
      { field: "sections", type: "string", minWidth: 220, flex: 1 },
      { field: "dateCreation", type: "date", width: 160 },
      { field: "retreatName", type: "string", minWidth: 160, flex: 1 },
    ];
    return buildTanStackReportColumns({ descriptors: fallback });
  }, [reportData?.columns]);

  const reportsArray: ReportRow[] = Array.isArray(reportData?.report.rows)
    ? (reportData!.report.rows as ReportRow[])
    : reportData?.report.rows
      ? ([reportData.report.rows] as ReportRow[])
      : [];

  const handleViewReport = (report: ReportRow) => {
    router.push(`/reports/${report.id}`);
  };

  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        minWidth: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: "100%",
        overflowY: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{ mb: 2, display: "flex", gap: 2, height: "40px", minHeight: 40 }}
      >
        <Button variant="contained" onClick={handleRefresh} disabled={loading}>
          {loading ? "Carregando..." : "Atualizar Dados"}
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
      </Box>

      <Box sx={{ flexGrow: 1, height: "calc(100% - 40px)" }}>
        <TanStackTable
          data={reportsArray}
          columns={dynamicColumns as ColumnDef<ReportRow>[]}
          loading={isLoading || loading}
          //title="Gerenciamento de Relatórios"
          //subtitle={`${reportData?.total || 0} relatórios encontrados`}
          enablePagination
          pageSize={50}
          pageSizeOptions={[10, 50, 100]}
          enableRowSelection
          enableGlobalFilter
          enableColumnFilters
          enableSorting
          enableColumnVisibility
          enableExport
          onRowDoubleClick={handleViewReport}
          maxHeight="calc(100% - 124px)"
          stickyHeader
        />
      </Box>
    </Box>
  );
};

export default GenericReportTable;
