"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Typography } from "@mui/material";
import LoadingScreenCircular from "../loading-screen/client/LoadingScreenCircular";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useModal } from "@/src/hooks/useModal";
import { sendRequestClient } from "@/src/lib/sendRequestClient";
import {
  handleApiResponse,
  sendRequestServerVanilla as sendRequest,
} from "@/src/lib/sendRequestServerVanilla";

// API service functions
const fetchReports = async () => {
  const response = await handleApiResponse<Report[]>(
    await sendRequest.get("/reports")
  );
  if (!response || response.error) {
    throw new Error("Failed to fetch reports");
  }
  console.log("Fetched reports:", response);
  return response.data;
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

const DragAndDropSections = dynamic(
  () => import("@/src/components/reports/DataGrid"),
  {
    loading: () => <LoadingScreenCircular />,
  }
);

const ReportPage = () => {
  const router = useRouter();
  const modal = useModal();
  const queryClient = useQueryClient();

  // Fetch reports data
  const { data: reports = [], isLoading } = useQuery({
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
    router.push(`/reports/${report.id}`);
  };

  const handleEditReport = (report: any) => {
    router.push(`/reports/${report.id}/edit`);
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
    <Box padding={2}>
      <DragAndDropSections
        reports={reports}
        isLoading={isLoading || deleteMutation.isPending}
        onConfirmDelete={onConfirmDelete}
        onView={handleViewReport}
        onEdit={handleEditReport}
        onDelete={handleDeleteReport}
        onCreate={handleCreateReport}
      />
    </Box>
  );
};

export default ReportPage;
