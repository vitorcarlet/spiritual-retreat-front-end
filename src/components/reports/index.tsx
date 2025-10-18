"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Chip, Typography } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useModal } from "@/src/hooks/useModal";
import { sendRequestClient } from "@/src/lib/sendRequestClient";
import requestServer from "@/src/lib/requestServer";
import { useState } from "react";
import DataTable, { DataTableColumn } from "../table/DataTable";
import SearchField from "../filters/SearchField";
import FilterButton from "../filters/FilterButton";
import { Report } from "@/src/types/reports";
import {
  ReportsAllFilters,
  ReportsTableDateFilters,
  ReportsTableFilters,
} from "./types";
import { getFilters } from "./getFilters";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import { useTranslations } from "next-intl";
import { GridRowSelectionModel } from "@mui/x-data-grid/models";
import { format } from "date-fns/format";

type ReportDataRequest = {
  rows: Report[];
  total: number;
  page: number;
  pageLimit: number;
};

const columns: DataTableColumn<Report>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 70,
    type: "string",
  },
  {
    field: "name",
    headerName: "Nome",
    flex: 1,
    minWidth: 180,
    renderCell: (params) => (
      <Box
        component="span"
        sx={{
          fontSize: 14,
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 160,
        }}
      >
        {params.value}
      </Box>
    ),
  },
  {
    field: "type",
    headerName: "Tipo",
    flex: 1,
    minWidth: 180,
    renderCell: (params) => (
      <Box
        component="span"
        sx={{
          fontSize: 14,
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 160,
        }}
      >
        {params.value}
      </Box>
    ),
  },
  {
    field: "sections",
    headerName: "Seções",
    flex: 1,
    minWidth: 220,
    renderCell: (params) => (
      <Box>
        {Array.isArray(params.value) && params.value.length > 0 ? (
          params.value.map((section: string, index: number) => (
            <Chip key={index} label={section} size="small" color="primary" />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhuma seção disponível
          </Typography>
        )}
      </Box>
    ),
  },
  {
    field: "dateCreation",
    headerName: "Data de Criação",
    width: 140,
    valueFormatter: (v) => (v ? format(new Date(v), "dd/MM/yyyy - HH:mm") : ""),
  },
  {
    field: "retreatName",
    headerName: "Retiro",
    flex: 1,
  },
];

const fetchReports = async () => {
  const response = await requestServer.get<ReportDataRequest>("/reports");
  if (!response || response.error) {
    throw new Error("Failed to fetch reports");
  }
  console.log("Fetched reports:", response);
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

const ReportPage = () => {
  const t = useTranslations();
  const router = useRouter();
  const modal = useModal();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<
    GridRowSelectionModel | undefined
  >(undefined);
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
      excludeFromCount: ["page", "pageLimit", "search"], // Don't count pagination in active filters
    });
  const handleApplyFilters = (
    newFilters: Partial<TableDefaultFilters<ReportsAllFilters>>
  ) => {
    updateFilters({ ...filters, ...newFilters });
  };

  // Fetch reports data
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
    const url = getUrlByReportType(report.type);
    router.push(`/reports/${report.id}/${url}`);
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

  const reportsArray: Report[] = Array.isArray(reportsData?.rows)
    ? (reportsData!.rows as Report[])
    : reportsData?.rows
      ? ([reportsData.rows] as Report[])
      : []; // garante []

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
          columns={columns}
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

export default ReportPage;
function getUrlByReportType(type: any): string {
  const t = (
    typeof type === "string" ? type : String(type || "")
  ).toLowerCase();

  switch (t) {
    case "participant":
    case "participants":
      return "participant";

    case "family":
    case "families":
      return "family";
    case "fiveMinutesCard":
    case "fiveminutescard":
      return "fiveminutescard";

    case "service":
    case "service_order":
    case "service-orders":
    case "serviceorders":
    case "service_order_report":
      return "service";

    case "tent":
    case "tents":
      return "tent";

    case "attendance":
    case "attendance_report":
      return "attendance";

    case "financial":
    case "finance":
    case "financial_report":
      return "financial";

    // add other known report types here

    default:
      // fallback route segment when type is unknown
      return "participant";
  }
}
