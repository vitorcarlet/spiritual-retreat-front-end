import { mockFamilies } from "@/src/mocks/handlerData/retreats/families";

type FiveMinutesCardRow = {
  id: string;
  participantId: number;
  fullName: string;
  familyId: number;
  familyName: string;
  familyColor: string;
  confirmed: boolean;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  status?: string;
};

type FiveMinutesCardSummary = {
  totalParticipants: number;
};

type FiveMinutesCardResponse = {
  id: string;
  type: string;
  name: string;
  retreatName: string;
  retreatId: string;
  summary: FiveMinutesCardSummary;
  columns: Array<{
    field: string;
    headerName: string;
    type: string;
  }>;
  rows: FiveMinutesCardRow[];
};

const buildFiveMinutesCardRows = (): FiveMinutesCardRow[] => {
  return mockFamilies.flatMap((family) =>
    (family.members ?? []).map((member) => ({
      id: `${family.familyId}-${member.id}`,
      participantId: member.id,
      fullName:
        member.name ||
        `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim(),
      familyId: family.familyId,
      familyName: family.name,
      familyColor: family.color,
      confirmed: true,
      email: member.email,
      phone: member.phone,
      city: member.city,
      state: member.state,
      status: member.status,
    }))
  );
};

const buildFiveMinutesCardSummary = (
  rows: FiveMinutesCardRow[]
): FiveMinutesCardSummary => {
  return {
    totalParticipants: rows.length,
  };
};

export const getFiveMinutesCardMock = (
  reportId: string
): FiveMinutesCardResponse => {
  const rows = buildFiveMinutesCardRows();
  const summary = buildFiveMinutesCardSummary(rows);

  const columns: Array<{ field: string; headerName: string; type: string }> =
    [];

  return {
    id: reportId,
    type: "fiveMinutesCard",
    name: "Relatório de 5 minutos participante",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
    summary,
    columns,
    rows,
  };
};

/**
 * Fetch five minutes card report data - currently using mock data
 * TODO: Replace with real API call when endpoint is available
 */
export const fetchFiveMinutesCardReport = async (
  reportId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filters?: Record<string, unknown>
): Promise<{ report: FiveMinutesCardResponse }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const reportData = getFiveMinutesCardMock(reportId);

  // TODO: When real API is available, use filters for searching/filtering
  // const response = await apiClient.get(`/reports/${reportId}/five-minutes-card`, { params: filters });

  return {
    report: reportData,
  };
};

export type {
  FiveMinutesCardRow,
  FiveMinutesCardSummary,
  FiveMinutesCardResponse,
};
