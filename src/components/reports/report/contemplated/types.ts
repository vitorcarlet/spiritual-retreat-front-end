export interface ContemplatedReport {
  report: {
    id: string;
    title: string;
    dateCreation: string;
  };
  columns: Array<{ key: string; label: string }>;
  data: Array<Record<string, any>>;
  summary: Record<string, any>;
  total: number;
  page: number;
  pageLimit: number;
}
