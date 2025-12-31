import apiClient from '@/src/lib/axiosClientInstance';
import { columnsMock } from '@/src/mocks/handlerData/reports/columns';
import { ReportData } from '@/src/types/reports';

import { RegistrationApiResponse } from '../../retreats/tabs/RetreatContemplation/types';
import { keysToRemoveFromFilters } from '../../table/shared';
import { ReportsAllFilters } from '../types';
import { ColumnDescriptor } from './tanStackColumnsBuilder';

export type ReportDataResponse = {
  report: ReportData;
  total: number;
  page: number;
  pageLimit: number;
  columns: ColumnDescriptor[];
};

export type ReportConfigResponse = {
  report: {
    id: string;
    type: string;
    name: string;
    retreatName: string;
    retreatId: string;
  };
  columns: ColumnDescriptor[];
  pageLimit?: number;
  page: number;
};

export const fetchReport = async (
  reportId: string,
  filters: TableDefaultFilters<ReportsAllFilters>,
  params?: Record<string, unknown>
): Promise<ReportDataResponse> => {
  // Primeiro, obter os dados do report para pegar o retreatId
  const reportResponse = await apiClient.get<ReportConfigResponse>(
    `/reports/${reportId}`
  );
  if (!reportResponse?.data) {
    throw new Error('failed-to-fetch-report');
  }
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageLimit =
    filters.pageLimit && filters.pageLimit > 0 ? filters.pageLimit : 20;
  const skip = (page - 1) * pageLimit;

  // Remover chaves desnecessárias dos filtros
  const filtersFiltered = { ...filters };
  keysToRemoveFromFilters.forEach((key) => delete filtersFiltered[key]);

  const { retreatId } = reportResponse.data.report;

  // Depois, fazer a requisição com o retreatId
  const response = await apiClient.get<RegistrationApiResponse>(
    `/Registrations`,
    {
      params: {
        retreatId,
        ...filtersFiltered,
        ...params,
        take: pageLimit,
        skip,
      },
    }
  );

  if (!response?.data) {
    throw new Error('failed-to-fetch-registrations');
  }

  const items = response.data.items ?? [];

  // Identificar as colunas que existem nos dados retornados
  const detectedColumns = detectColumnsFromData(items);

  // Filtrar o columnsMock para retornar apenas as colunas detectadas
  const filteredColumns = columnsMock.filter((col) =>
    detectedColumns.includes(String(col.field))
  ) as ColumnDescriptor[];

  return {
    report: { rows: items } as ReportData,
    columns: filteredColumns,
    total: response.data.totalCount ?? 0,
    page: Math.floor((response.data.skip ?? 0) / (response.data.take ?? 1)) + 1,
    pageLimit: response.data.take ?? 10,
  };
};

// Helper function para detectar colunas do response
function detectColumnsFromData(
  data: RegistrationApiResponse['items']
): string[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Pegar as chaves do primeiro objeto do array
  const firstItem = data[0];
  return Object.keys(firstItem);
}
