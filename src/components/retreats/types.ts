// Simplified retreat shape returned by some endpoints (items[])
export type RetreatSimple = {
  id: string;
  name: string;
  edition?: string;
  startDate?: string;
  endDate?: string;
  image?: string;
};

// Wrapper structure for lists that include pagination metadata
export interface RetreatSimpleRequest {
  items: RetreatSimple[];
  totalCount: number;
  skip: number;
  take: number;
}

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
