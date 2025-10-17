import type {
  FamilyReportMember,
  FamilyReportRow,
  FamilyReportSummary,
} from "@/src/types/reports";

export type { FamilyReportMember, FamilyReportRow, FamilyReportSummary };

export type FamilyReportResponse = {
  report: {
    id: string;
    name: string;
    type?: string;
    retreatId?: string;
    retreatName?: string;
    generatedAt?: string;
    summary?: FamilyReportSummary;
    rows: FamilyReportRow[];
  };
  columns?: unknown[];
  total: number;
  page: number;
  pageLimit: number;
};

export type TranslateFn = (
  key: string,
  values?: Record<string, string | number | undefined>
) => string;
