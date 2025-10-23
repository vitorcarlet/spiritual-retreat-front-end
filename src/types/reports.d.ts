export type ReportTypes =
  | "user"
  | "participant"
  | "participants"
  | "family"
  | "families"
  | "fiveMinutesCard"
  | "exitChecklist"
  | "service"
  | "service_order"
  | "service-orders"
  | "attendance"
  | "financial"
  | "tents"
  | "ribbons"
  | (string & {});

export type Period = {
  from: string; // ISO date string
  to: string; // ISO date string
};

export interface Report {
  id: string;
  name: string;
  sections: string[];
  type: ReportTypes;
  dateCreation: string; // ISO date string
  period?: Period;
  preFilters?: {
    reportFilters: number[]; // IDs of standard filters applied
    customReportFilters: number[]; // IDs of custom filters applied
  };
  retreatName: string;
  retreatId: string;
}

export interface ReportDataSummary {
  totalFamilies?: number;
  totalParticipants?: number;
  lockedFamilies?: number;
  generatedAt?: string;
  [key: string]: unknown;
}

export interface ReportData {
  id: string;
  name: string;
  type?: ReportTypes;
  rows: unknown[];
  retreatId?: string;
  retreatName?: string;
  generatedAt?: string;
  summary?: ReportDataSummary;
  preFilters?: {
    reportFilters: number[]; // IDs of standard filters applied
    customReportFilters: number[]; // IDs of custom filters applied
  };
}

export interface FamilyReportMember {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: string;
}

export interface FamilyReportRow {
  id: string;
  familyId: number;
  familyName: string;
  color: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
  membersCount: number;
  locked: boolean;
  members: FamilyReportMember[];
}

export interface FamilyReportSummary extends ReportDataSummary {
  totalFamilies: number;
  totalParticipants: number;
  lockedFamilies: number;
}

export interface FamilyReportData extends ReportData {
  type: "family" | "families";
  rows: FamilyReportRow[];
  summary: FamilyReportSummary;
}

export interface FiveMinutesCardParticipant {
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
}

export interface FiveMinutesCardReportData extends ReportData {
  type: "fiveMinutesCard";
  rows: FiveMinutesCardParticipant[];
  summary?: {
    totalParticipants?: number;
  } & ReportDataSummary;
}

export interface ExitChecklistRow {
  id: string;
  participantId: number;
  fullName: string;
}

export interface ExitChecklistReportData extends ReportData {
  type: "exitChecklist";
  rows: ExitChecklistRow[];
  summary?: {
    totalParticipants: number;
  } & ReportDataSummary;
}

export interface TentReportRow {
  id: string;
  tentNumber: string;
  familyName: string;
  gender: "male" | "female" | "mixed";
  sponsorName?: string;
  rahamistas: string[];
  familyColor?: string;
  notes?: string;
}

export interface TentReportData extends ReportData {
  type: "tents";
  rows: TentReportRow[];
  summary?: {
    totalTents: number;
  } & ReportDataSummary;
}

export interface RibbonReportRow {
  id: string;
  displayName: string;
  uppercase?: boolean;
}

export interface RibbonReportData extends ReportData {
  type: "ribbons";
  rows: RibbonReportRow[];
  summary?: {
    totalParticipants: number;
    uppercaseDefault?: boolean;
  } & ReportDataSummary;
}
