"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getFilters } from "./getFilters";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import {
  GridRowSelectionModel,
  GridValidRowModel,
} from "@mui/x-data-grid/models";
import FilterButton from "../../filters/FilterButton";
import { DataTable } from "../../table";
import {
  ReportsAllFilters,
  ReportsTableFilters,
  ReportsTableDateFilters,
} from "../types";
import { buildReportColumns, type ColumnDescriptor } from "./columnsBuilder";
import { fetchReport } from "./api";

const GenericReportTable = ({ reportId }: { reportId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<
    GridRowSelectionModel | undefined
  >(undefined);
  const filtersConfig = getFilters(reportId);

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
    queryKey: ["reports", reportId],
    queryFn: () => fetchReport(reportId),
    staleTime: 5 * 60 * 1000,
  });

  const dynamicColumns = useMemo(() => {
    const fromApi = reportData?.columns;
    if (fromApi && fromApi.length) {
      return buildReportColumns({ descriptors: fromApi });
    }
    const fallback: ColumnDescriptor[] = [
      { field: "id", type: "string", width: 80 },
      { field: "name", type: "string", minWidth: 180, flex: 1 },
      { field: "sections", type: "string", minWidth: 220, flex: 1 },
      { field: "dateCreation", type: "date", width: 160 },
      { field: "retreatName", type: "string", minWidth: 160, flex: 1 },
    ];
    return buildReportColumns({ descriptors: fallback });
  }, [reportData?.columns]);

  const reportsArray: GridValidRowModel[] = Array.isArray(
    reportData?.report.rows
  )
    ? (reportData!.report.rows as GridValidRowModel[])
    : reportData?.report.rows
      ? ([reportData.report.rows] as GridValidRowModel[])
      : [];

  const handleViewReport = (report: any) => {
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

      <Box sx={{ flexGrow: 1, maxHeight: "90%" }}>
        <DataTable<GridValidRowModel, ReportsAllFilters>
          rows={reportsArray}
          rowCount={reportData?.total || 0}
          columns={dynamicColumns}
          loading={isLoading || loading}
          title="Gerenciamento de Relatórios"
          subtitle="Lista completa de relatórios do sistema"
          autoWidth
          autoHeight
          toolbar
          width={1200}
          height={600}
          pagination
          showToolbar
          paginationMode="server"
          page={filters.page ? filters.page - 1 : 0}
          pageSize={filters.pageLimit || 10}
          pageSizeOptions={[10, 25, 50, 100]}
          onPaginationModelChange={(newModel) => {
            updateFilters({
              ...filters,
              page: newModel.page + 1,
              pageLimit: newModel.pageSize,
            });
          }}
          serverFilters={filters}
          checkboxSelection
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={setSelectedRows}
          rowBuffer={500}
          columnBuffer={2}
          actions={[
            {
              icon: "lucide:eye",
              label: "Acessar relatório",
              onClick: (report) => handleViewReport(report),
              color: "info",
            },
          ]}
        />
      </Box>
    </Box>
  );
};

export default GenericReportTable;
