export interface Report {
  id: string;
  name: string;
  sections: string[];
  type: ReportTypes;
  dateCreation: string; // ISO date string
  period: Period;
  preFilters?: {
    reportFilters: number[]; // IDs of standard filters applied
    customReportFilters: number[]; // IDs of custom filters applied
  };
  retreatName: string;
  retreatId: string;
}

export interface ReportData {
  //columns: ColumnDescriptor[];
  rows: unknown[];
  preFilters?: {
    reportFilters: number[]; // IDs of standard filters applied
    customReportFilters: number[]; // IDs of custom filters applied
  };
  id: string;
  name: string;
}

type Period = {
  from: string; // ISO date string
  to: string; // ISO date string
};

ReportTypes = "user" | "participant" | "families" | "tents";
