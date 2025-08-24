import { Retreat } from "@/src/types/retreats";

export type RetreatsCardTableFilters = {
  name?: string;
  state?: string;
  city?: string;
  status?: string;
  periodStart?: string;
  periodEnd?: string;
};

export type RetreatsCardTableDateFilters = {
  periodStart?: string;
  periodEnd?: string;
};

export interface RetreatRequest {
  rows: Retreat[];
  total: number;
  page: number;
  pageLimit: number;
  hasNextPage: boolean;
  hasPervPage: boolean;
}
