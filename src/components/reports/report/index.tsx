"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Typography } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useModal } from "@/src/hooks/useModal";
import { sendRequestClient } from "@/src/lib/sendRequestClient";
import requestServer from "@/src/lib/requestServer";
import { useMemo, useState } from "react";
import { Report } from "@/src/types/reports";
import { getFilters } from "./getFilters";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import { useTranslations } from "next-intl";
import { GridRowSelectionModel } from "@mui/x-data-grid/models";
import FilterButton from "../../filters/FilterButton";
import SearchField from "../../filters/SearchField";
import { DataTable } from "../../table";
import {
  ReportsAllFilters,
  ReportsTableFilters,
  ReportsTableDateFilters,
} from "../types";
import { buildReportColumns, type ColumnDescriptor } from "./columnsBuilder";

type ReportDataRequest = {
  rows: Report[];
  total: number;
  page: number;
  pageLimit: number;
  // NOVO: meta de colunas retornada pela API (ou vinda do "modelo" salvo)
  columns?: ColumnDescriptor[];
};

const fetchReports = async () => {
  const response = await requestServer.get<ReportDataRequest>("/reports");
  if (!response || response.error) {
    throw new Error("Failed to fetch reports");
  }
  return response.data as ReportDataRequest;
};

const deleteReport = async (id: string | number) => {
  const response = sendRequestClient({
    url: `/reports/${id}`,
    method: "DELETE",
  });

  if (!response) {
    throw new Error("Failed to delete report");
  }

  return response;
};

const ReportIdPage = ({ reportId }: { reportId: string }) => {
  const t = useTranslations();
  const router = useRouter();
  const modal = useModal();
  const queryClient = useQueryClient();
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
      excludeFromCount: ["page", "pageLimit", "search"], // Don't count pagination in active filters
    });
  const handleApplyFilters = (
    newFilters: Partial<TableDefaultFilters<ReportsAllFilters>>
  ) => {
    updateFilters({ ...filters, ...newFilters });
  };

  // Fetch reports data
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["reports", reportId],
    queryFn: fetchReports,
    staleTime: 5 * 60 * 1000,
  });

  // Constrói colunas dinamicamente a partir da resposta
  const dynamicColumns = useMemo(() => {
    const fromApi = reportsData?.columns;
    if (fromApi && fromApi.length) {
      return buildReportColumns({ descriptors: fromApi });
    }
    // Fallback (caso API ainda não envie metadados de colunas)
    const fallback: ColumnDescriptor[] = [
      { field: "id", type: "string", width: 80 },
      { field: "name", type: "string", minWidth: 180, flex: 1 },
      { field: "sections", type: "string", minWidth: 220, flex: 1 },
      { field: "dateCreation", type: "date", width: 160 },
      { field: "retreatName", type: "string", minWidth: 160, flex: 1 },
    ];
    return buildReportColumns({ descriptors: fallback });
  }, [reportsData?.columns]);

  const reportsArray: Report[] = Array.isArray(reportsData?.rows)
    ? (reportsData!.rows as Report[])
    : reportsData?.rows
      ? ([reportsData.rows] as Report[])
      : [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const onConfirmDelete = (reportId: string | number) => {
    return deleteMutation.mutate(reportId);
  };

  // Handlers for the DataGrid actions
  const handleViewReport = (report: any) => {
    router.push(`/reports/${report.id}`);
  };

  const handleDeleteReport = (
    report: any,
    onConfirmDelete: (reportId: number | string) => void
  ) => {
    modal.open({
      title: "Excluir Relatório",
      size: "sm",
      customRender: () => (
        <>
          <Typography>
            Tem certeza que deseja excluir o relatório {report.name}?
          </Typography>
          <Button onClick={() => onConfirmDelete(report?.id)}>Confirmar</Button>
        </>
      ),
    });
  };

  const handleCreateReport = () => {
    router.push("/reports/new");
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
        sx={{ mb: 2, display: "flex", gap: 2, height: "10%", minHeight: 40 }}
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

        <SearchField
          sx={{
            height: "100%",
            minWidth: "120px",
            width: "max-content",
            flexShrink: 0,
          }}
          value={filters.search || ""}
          onChange={(e) => {
            updateFilters({ ...filters, search: e });
          }}
          placeholder="search-field"
        />

        <Button variant="outlined" color="primary" onClick={handleCreateReport}>
          {t("new-report")}
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, maxHeight: "90%" }}>
        <DataTable<Report, ReportsAllFilters>
          rows={reportsArray}
          rowCount={reportsData?.total || 0}
          columns={dynamicColumns}
          loading={isLoading || loading}
          // Configurações de aparência
          title="Gerenciamento de Relatórios"
          subtitle="Lista completa de relatórios do sistema"
          autoWidth={true}
          autoHeight={true}
          // Paginação
          width={1200}
          height={600}
          pagination={true}
          showToolbar={false}
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
          // Seleção
          checkboxSelection={true}
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={setSelectedRows}
          // Virtualização otimizada
          rowBuffer={500}
          columnBuffer={2}
          // Ações personalizadas
          actions={[
            {
              icon: "lucide:trash-2",
              label: "Acessar relatório",
              onClick: (report) => handleViewReport(report),
              color: "primary",
              //disabled: (user) => user.role === "Admin", // Admins não podem ser deletados
            },
            {
              icon: "lucide:trash-2",
              label: "Deletar relatório",
              onClick: (report) => handleDeleteReport(report, onConfirmDelete),
              color: "primary",
              //disabled: (user) => user.role === "Admin", // Admins não podem ser deletados
            },
          ]}
          // Eventos
          // onRowClick={(params) => {
          //   console.log("Linha clicada:", params.row);
          // }}
          // onRowDoubleClick={(params) => {
          //   handleView(params.row);
          // }}
        />
      </Box>
    </Box>
  );
};

export default ReportIdPage;
