import { mockFamilyParticipants } from "@/src/mocks/handlerData/retreats/families";

type ExitChecklistRow = {
  id: string;
  participantId: number;
  fullName: string;
};

type ExitChecklistSummary = {
  totalParticipants: number;
};

type ExitChecklistResponse = {
  id: string;
  type: string;
  name: string;
  retreatName: string;
  retreatId: string;
  summary: ExitChecklistSummary;
  columns: Array<{
    field: string;
    headerName: string;
    type: string;
  }>;
  rows: ExitChecklistRow[];
};

const buildExitChecklistRows = (): ExitChecklistRow[] => {
  return mockFamilyParticipants
    .filter((participant) => participant.status === "confirmed")
    .map((participant, index) => ({
      id: `exit-${participant.id}-${index}`,
      participantId: participant.id,
      fullName:
        participant.name ||
        `${participant.firstName ?? ""} ${participant.lastName ?? ""}`.trim(),
    }));
};

const buildExitChecklistSummary = (
  rows: ExitChecklistRow[]
): ExitChecklistSummary => {
  return {
    totalParticipants: rows.length,
  };
};

export const getExitChecklistMock = (
  reportId: string
): ExitChecklistResponse => {
  const rows = buildExitChecklistRows();
  const summary = buildExitChecklistSummary(rows);

  const columns: Array<{ field: string; headerName: string; type: string }> =
    [];

  return {
    id: reportId,
    type: "exitChecklist",
    name: "Relatório Bota-Fora",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
    summary,
    columns,
    rows,
  };
};

/**
 * Fetch exit checklist report data - currently using mock data
 * TODO: Replace with real API call when endpoint is available
 */
export const fetchExitChecklistReport = async (
  reportId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filters?: Record<string, unknown>
): Promise<{ report: ExitChecklistResponse }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const reportData = getExitChecklistMock(reportId);

  // TODO: When real API is available, use filters for searching/filtering
  // const response = await apiClient.get(`/reports/${reportId}/exit-checklist`, { params: filters });

  return {
    report: reportData,
  };
};

export type {
  ExitChecklistRow,
  ExitChecklistSummary,
  ExitChecklistResponse,
};
