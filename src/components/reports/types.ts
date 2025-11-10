import { Report } from "@/src/types/reports";

export type ReportsTableFilters = {
  name?: string;
  state?: string;
  city?: string;
  status?: string;
};

export type ReportsTableDateFilters = {
  periodStart?: string;
  periodEnd?: string;
};

export interface ReportRequest {
  rows: Report[];
  total: number;
  page: number;
  pageLimit: number;
  hasNextPage: boolean;
  hasPervPage: boolean;
}

export type ReportsAllFilters = ReportsTableFilters & ReportsTableDateFilters;
