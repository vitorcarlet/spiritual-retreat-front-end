import { mockFamilies } from "@/src/mocks/handlerData/retreats/families";

type FamilyReportRow = {
  id: string;
  familyId: number;
  familyName: string;
  color: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
  locked: boolean;
  members: Array<{
    id: number;
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    status: string;
  }>;
};

type FamilyReportSummary = {
  totalFamilies: number;
  totalParticipants: number;
  lockedFamilies: number;
  generatedAt?: string;
};

type FamilyReportResponse = {
  id: string;
  type: string;
  name: string;
  retreatName: string;
  retreatId: string;
  summary: FamilyReportSummary;
  columns: Array<{
    field: string;
    headerName: string;
    type: string;
  }>;
  rows: FamilyReportRow[];
};

const buildFamilyReportRows = (): FamilyReportRow[] => {
  return mockFamilies.map((family) => {
    const members = (family.members ?? []).map((member) => ({
      id: member.id,
      fullName:
        member.name ||
        `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim(),
      firstName: member.name ?? "",
      lastName: member.lastName ?? "",
      email: member.email,
      phone: member.phone,
      city: member.city,
      state: member.state,
      status: member.status,
    }));

    return {
      id: String(family.familyId),
      familyId: family.familyId,
      familyName: family.name,
      color: family.color,
      contactName: family.contactName,
      contactEmail: family.contactEmail,
      contactPhone: family.contactPhone,
      membersCount: family.membersCount,
      createdAt: family.createdAt,
      updatedAt: family.updatedAt,
      locked: false, // Mock families are not locked by default
      members,
    } satisfies FamilyReportRow;
  });
};

const buildFamilyReportSummary = (
  rows: FamilyReportRow[]
): FamilyReportSummary => {
  return rows.reduce(
    (acc, family) => {
      acc.totalParticipants += family.members.length;
      if (family.locked) acc.lockedFamilies += 1;
      return acc;
    },
    {
      totalFamilies: rows.length,
      totalParticipants: 0,
      lockedFamilies: 0,
      generatedAt: new Date("2025-03-06T09:30:00Z").toISOString(),
    }
  );
};

export const getFamilyReportMock = (
  reportId: string
): FamilyReportResponse => {
  const rows = buildFamilyReportRows();
  const summary = buildFamilyReportSummary(rows);

  const columns = [
    { field: "familyName", headerName: "Família", type: "string" },
    { field: "membersCount", headerName: "Participantes", type: "number" },
    { field: "contactName", headerName: "Contato", type: "string" },
    { field: "contactPhone", headerName: "Telefone", type: "string" },
  ];

  return {
    id: reportId,
    type: "families",
    name: "Relatório de Famílias",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
    summary,
    columns,
    rows,
  };
};

/**
 * Fetch family report data - currently using mock data
 * TODO: Replace with real API call when endpoint is available
 */
export const fetchFamilyReport = async (
  reportId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filters?: Record<string, unknown>
): Promise<{ report: FamilyReportResponse }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const reportData = getFamilyReportMock(reportId);

  // TODO: When real API is available, use filters for pagination/filtering
  // const response = await apiClient.get(`/reports/${reportId}/families`, { params: filters });

  return {
    report: reportData,
  };
};

export type { FamilyReportRow, FamilyReportSummary, FamilyReportResponse };
