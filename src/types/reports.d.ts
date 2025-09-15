export interface Report {
  id: string;
  name: string;
  sections: string[];
  dateCreation: string; // ISO date string
  period: Period;
  preFilters?: {
    reportFilters: number[]; // IDs of standard filters applied
    customReportFilters: number[]; // IDs of custom filters applied
  };
  retreatName: string;
  retreatId: string;
}

type Period = {
  from: string; // ISO date string
  to: string; // ISO date string
};
