import {
  ExitChecklistRow,
  Report,
  TentReportRow,
  RibbonReportRow,
} from "@/src/types/reports";
import { mockFamilies, mockFamilyParticipants } from "../retreats/families";
import { mockTents } from "../retreats/tents";
import { columnsMock } from "./columns";

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

const familyReportRows: FamilyReportRow[] = mockFamilies.map((family) => {
  const members = (family.members ?? []).map((member) => ({
    id: member.id,
    fullName:
      member.name || `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim(),
    firstName: member.firstName ?? "",
    lastName: member.lastName ?? "",
    email: member.email,
    phone: member.phone,
    city: member.city,
    state: member.state,
    status: member.status,
  }));

  return {
    id: String(family.id),
    familyId: family.id,
    familyName: family.name,
    color: family.color,
    contactName: family.contactName,
    contactEmail: family.contactEmail,
    contactPhone: family.contactPhone,
    membersCount: family.membersCount,
    createdAt: family.createdAt,
    updatedAt: family.updatedAt,
    locked: Boolean(family.locked && members.length > 0),
    members,
  } satisfies FamilyReportRow;
});

const familyReportSummary = familyReportRows.reduce(
  (acc, family) => {
    acc.totalParticipants += family.members.length;
    if (family.locked) acc.lockedFamilies += 1;
    return acc;
  },
  {
    totalFamilies: familyReportRows.length,
    totalParticipants: 0,
    lockedFamilies: 0,
  }
);

const familyReportColumns = [
  { field: "familyName", headerName: "Família", type: "string" },
  { field: "membersCount", headerName: "Participantes", type: "number" },
  { field: "contactName", headerName: "Contato", type: "string" },
  { field: "contactPhone", headerName: "Telefone", type: "string" },
];

const fiveMinutesCardRows: FiveMinutesCardRow[] = mockFamilies.flatMap(
  (family) =>
    (family.members ?? []).map((member) => ({
      id: `${family.id}-${member.id}`,
      participantId: member.id,
      fullName:
        member.name ||
        `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim(),
      familyId: family.id,
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

const fiveMinutesCardSummary = {
  totalParticipants: fiveMinutesCardRows.length,
};

const exitChecklistRows: ExitChecklistRow[] = mockFamilyParticipants
  .filter((participant) => participant.status === "confirmed")
  .map((participant, index) => ({
    id: `exit-${participant.id}-${index}`,
    participantId: participant.id,
    fullName:
      participant.name ||
      `${participant.firstName ?? ""} ${participant.lastName ?? ""}`.trim(),
  }));

const exitChecklistSummary = {
  totalParticipants: exitChecklistRows.length,
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

const tentReportRows: TentReportRow[] = mockTents.map((tent, index) => {
  const family = mockFamilies[index % mockFamilies.length];
  const members = family.members ?? [];
  const rahamistas = members.slice(0, 3).map((member) => getMemberDisplayName(member));

  const sponsorName = (() => {
    if (!members.length) return family.contactName ?? null;
    if (tent.gender === "female") {
      return getMemberDisplayName(members.find((m) => m.gender === "female") ?? members[0]);
    }
    if (tent.gender === "male") {
      return getMemberDisplayName(members.find((m) => m.gender === "male") ?? members[0]);
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
  } satisfies TentReportRow;
});

const tentReportSummary = {
  totalTents: tentReportRows.length,
  generatedAt: new Date("2025-03-06T09:45:00Z").toISOString(),
};

const ribbonReportRows: RibbonReportRow[] = mockFamilyParticipants.map(
  (participant, index) => ({
    id: `ribbon-${participant.id}-${index}`,
    displayName:
      participant.name ||
      `${participant.firstName ?? ""} ${participant.lastName ?? ""}`.trim() ||
      `Participante ${index + 1}`,
    uppercase:
      index % 4 === 0 // sprinkle uppercase rows for variation
        ? true
        : undefined,
  })
);

const ribbonReportSummary = {
  totalParticipants: ribbonReportRows.length,
  uppercaseDefault: false,
  generatedAt: new Date("2025-03-06T10:30:00Z").toISOString(),
};
export const mockReports: Report[] = [
  {
    id: "1",
    name: "Relatório de Inscrições",
    type: "participant",
    sections: ["Inscrições", "Pagamentos", "Formulários"],
    dateCreation: "2025-01-15T10:30:00Z",
    preFilters: {
      reportFilters: [1, 2, 3],
      customReportFilters: [22],
    },
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
    period: {
      from: "2025-01-01T00:00:00Z",
      to: "2025-01-15T10:30:00Z",
    },
  },
  {
    id: "2",
    type: "participant",
    name: "Análise de Participação",
    sections: ["Presença", "Atividades", "Feedback"],
    dateCreation: "2025-02-20T14:45:00Z",
    retreatName: "Retiro de Inverno 2025",
    retreatId: "2",
    period: {
      from: "2025-02-01T00:00:00Z",
      to: "2025-02-20T14:45:00Z",
    },
  },
  {
    id: "3",
    type: "participant",
    name: "Relatório de Equipes",
    sections: ["Voluntários", "Coordenadores", "Distribuição"],
    dateCreation: "2024-12-10T09:15:00Z",
    retreatName: "Retiro Jovem 2024",
    retreatId: "3",
    period: {
      from: "2024-12-01T00:00:00Z",
      to: "2024-12-10T09:15:00Z",
    },
  },
  {
    id: "4",
    type: "participant",
    name: "Análise de Custos",
    sections: ["Alimentação", "Hospedagem", "Materiais"],
    dateCreation: "2025-03-05T16:20:00Z",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
    period: {
      from: "2025-03-01T00:00:00Z",
      to: "2025-03-05T16:20:00Z",
    },
  },
  {
    id: "5",
    type: "families",
    name: "Relatorio de familias",
    sections: ["Alimentação", "Hospedagem", "Materiais"],
    dateCreation: "2025-03-05T16:20:00Z",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
  },
  {
    id: "6",
    type: "fiveMinutesCard",
    name: "Relatorio de 5 minutos participante",
    sections: ["Participante"],
    dateCreation: "2025-03-05T16:20:00Z",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
  },
  {
    id: "7",
    type: "botafora",
    name: "Relatório Bota-Fora",
    sections: ["Checklist"],
    dateCreation: "2025-03-06T09:00:00Z",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
  },
  {
    id: "8",
    type: "tents",
    name: "Relatório de Barracas",
    sections: ["Hospedagem"],
    dateCreation: "2025-03-06T10:15:00Z",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
  },
  {
    id: "9",
    type: "ribbons",
    name: "Relatório de Fitas",
    sections: ["Participantes"],
    dateCreation: "2025-03-06T10:45:00Z",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
  },
];

export const mockReportDetails: Array<Record<string, unknown>> = [
  {
    id: "1",
    type: "participant",
    name: "Relatório de Inscrições",
    // preFilters: {
    //   reportFilters: [1, 2, 3],
    //   customReportFilters: [22],
    // },
    retreatName: "Retiro de Verão 2025",
    retreatId: "6fd7563b-2ad3-448e-9e21-a95a572803a0",
    // columns: columnsMock,
  },
  {
    id: "5",
    type: "families",
    name: "Relatório de Famílias",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
    summary: {
      totalFamilies: familyReportSummary.totalFamilies,
      totalParticipants: familyReportSummary.totalParticipants,
      lockedFamilies: familyReportSummary.lockedFamilies,
      generatedAt: new Date("2025-03-06T09:30:00Z").toISOString(),
    },
    columns: familyReportColumns,
    rows: familyReportRows,
  },
  {
    id: "6",
    type: "fiveMinutesCard",
    name: "Relatorio de 5 minutos participante",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
    summary: fiveMinutesCardSummary,
    columns: [],
    rows: fiveMinutesCardRows,
  },
  {
    id: "7",
    type: "exitChecklist",
    name: "Relatório Bota-Fora",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
    summary: exitChecklistSummary,
    columns: [],
    rows: exitChecklistRows,
  },
  {
    id: "8",
    type: "tents",
    name: "Relatório de Barracas",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
    summary: tentReportSummary,
    columns: [],
    rows: tentReportRows,
  },
  {
    id: "9",
    type: "ribbons",
    name: "Relatório de Fitas",
    retreatName: "Retiro de Verão 2025",
    retreatId: "1",
    summary: ribbonReportSummary,
    columns: [],
    rows: ribbonReportRows,
  },
];
