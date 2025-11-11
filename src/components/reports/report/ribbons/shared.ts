import { mockFamilyParticipants } from "@/src/mocks/handlerData/retreats/families";

type RibbonReportRow = {
  id: string;
  displayName: string;
  uppercase?: boolean;
};

type RibbonReportSummary = {
  totalParticipants: number;
  uppercaseDefault: boolean;
  generatedAt?: string;
};

type RibbonReportResponse = {
  id: string;
  type: string;
  name: string;
  retreatName: string;
  retreatId: string;
  summary: RibbonReportSummary;
  columns: Array<{
    field: string;
    headerName: string;
    type: string;
  }>;
  rows: RibbonReportRow[];
};

const buildRibbonReportRows = (): RibbonReportRow[] => {
  return mockFamilyParticipants.map((participant, index) => ({
    id: `ribbon-${participant.id}-${index}`,
    displayName:
      participant.name ||
      `${participant.firstName ?? ""} ${participant.lastName ?? ""}`.trim() ||
      `Participante ${index + 1}`,
    uppercase:
      index % 4 === 0 // sprinkle uppercase rows for variation
        ? true
        : undefined,
  }));
};

const buildRibbonReportSummary = (
  rows: RibbonReportRow[]
): RibbonReportSummary => {
  return {
    totalParticipants: rows.length,
    uppercaseDefault: false,
    generatedAt: new Date("2025-03-06T10:30:00Z").toISOString(),
  };
};

export const getRibbonReportMock = (
  reportId: string
): RibbonReportResponse => {
  const rows = buildRibbonReportRows();
  const summary = buildRibbonReportSummary(rows);

  const columns: Array<{ field: string; headerName: string; type: string }> =
    [];

  return {
    id: reportId,
    type: "ribbons",
    name: "Relatório de Fitas",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
    summary,
    columns,
    rows,
  };
};

/**
 * Fetch ribbon report data - currently using mock data
 * TODO: Replace with real API call when endpoint is available
 */
export const fetchRibbonReport = async (
  reportId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filters?: Record<string, unknown>
): Promise<{ report: RibbonReportResponse }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const reportData = getRibbonReportMock(reportId);

  // TODO: When real API is available, use filters for searching/filtering
  // const response = await apiClient.get(`/reports/${reportId}/ribbons`, { params: filters });

  return {
    report: reportData,
  };
};

export type { RibbonReportRow, RibbonReportSummary, RibbonReportResponse };
