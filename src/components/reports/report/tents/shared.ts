import { mockFamilies } from "@/src/mocks/handlerData/retreats/families";
import { mockTents } from "@/src/mocks/handlerData/retreats/tents";

type TentReportRow = {
  id: string;
  tentNumber: string;
  familyName: string;
  familyColor: string;
  gender: "male" | "female" | "mixed";
  sponsorName?: string;
  rahamistas: string[];
  notes?: string;
};

type TentReportSummary = {
  totalTents: number;
  generatedAt?: string;
};

type TentReportResponse = {
  id: string;
  type: string;
  name: string;
  retreatName: string;
  retreatId: string;
  summary: TentReportSummary;
  columns: Array<{
    field: string;
    headerName: string;
    type: string;
  }>;
  rows: TentReportRow[];
};

const getMemberDisplayName = (member: {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) => {
  if (member.name) return member.name;
  const composed = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim();
  return composed || "Participante";
};

const buildTentReportRows = (): TentReportRow[] => {
  return mockTents.map((tent, index) => {
    const family = mockFamilies[index % mockFamilies.length];
    const members = family.members ?? [];
    const rahamistas = members
      .slice(0, 3)
      .map((member) => getMemberDisplayName(member));

    const sponsorName = (() => {
      if (!members.length) return family.contactName ?? null;
      if (tent.gender === "female") {
        return getMemberDisplayName(
          members.find((m) => m.gender === "female") ?? members[0]
        );
      }
      if (tent.gender === "male") {
        return getMemberDisplayName(
          members.find((m) => m.gender === "male") ?? members[0]
        );
      }
      return family.contactName ?? getMemberDisplayName(members[0]);
    })();

    return {
      id: tent.id,
      tentNumber: tent.number,
      familyName: family.name,
      familyColor: family.color,
      gender: tent.gender,
      sponsorName: sponsorName ?? undefined,
      rahamistas,
      notes: tent.notes,
    };
  });
};

const buildTentReportSummary = (
  rows: TentReportRow[]
): TentReportSummary => {
  return {
    totalTents: rows.length,
    generatedAt: new Date("2025-03-06T09:45:00Z").toISOString(),
  };
};

export const getTentReportMock = (reportId: string): TentReportResponse => {
  const rows = buildTentReportRows();
  const summary = buildTentReportSummary(rows);

  const columns: Array<{ field: string; headerName: string; type: string }> =
    [];

  return {
    id: reportId,
    type: "tents",
    name: "Relatório de Barracas",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
    summary,
    columns,
    rows,
  };
};

/**
 * Fetch tent report data - currently using mock data
 * TODO: Replace with real API call when endpoint is available
 */
export const fetchTentReport = async (
  reportId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filters?: Record<string, unknown>
): Promise<{ report: TentReportResponse }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const reportData = getTentReportMock(reportId);

  // TODO: When real API is available, use filters for searching/filtering
  // const response = await apiClient.get(`/reports/${reportId}/tents`, { params: filters });

  return {
    report: reportData,
  };
};

export type { TentReportRow, TentReportSummary, TentReportResponse };
