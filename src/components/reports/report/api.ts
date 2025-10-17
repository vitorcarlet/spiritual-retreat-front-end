import requestServer from "@/src/lib/requestServer";
import { ReportData } from "@/src/types/reports";
import { ColumnDescriptor } from "./columnsBuilder";

export type ReportDataResponse = {
  report: ReportData;
  total: number;
  page: number;
  pageLimit: number;
  columns: ColumnDescriptor[];
};

export const fetchReport = async (id: string): Promise<ReportDataResponse> => {
  const response = await requestServer.get<ReportDataResponse>(
    `/reports/${id}`
  );
  if (!response || response.error || !response.data) {
    throw new Error("failed-to-fetch-report");
  }
  return response.data;
};
