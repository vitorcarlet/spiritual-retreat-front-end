import { keysToRemoveFromFilters } from '@/src/components/table/shared';
import apiClient from '@/src/lib/axiosClientInstance';

import { ReportsAllFilters } from '../../types';
import { ContemplatedReport } from './types';

export const fetchContemplatedReport = async (
  reportId: string,
  filters: TableDefaultFilters<ReportsAllFilters>,
  params?: Record<string, unknown>
): Promise<ContemplatedReport> => {
  // Primeiro, obter os dados do report para pegar o retreatId
  const reportResponse = await apiClient.get<ContemplatedReport>(
    `/reports/${reportId}`
  );
  if (!reportResponse?.data) {
    throw new Error('failed-to-fetch-report');
  }

  // Remover chaves desnecessárias dos filtros
  const filtersFiltered = { ...filters };
  keysToRemoveFromFilters.forEach((key) => delete filtersFiltered[key]);

  const retreatId = reportResponse.data.report.id;

  // Depois, fazer a requisição com o retreatId
  const response = await apiClient.get<ContemplatedReport>(`/Registrations`, {
    params: {
      retreatId,
      ...filtersFiltered,
      ...params,
      page: filters.page,
      pageLimit: filters.pageLimit,
    },
  });

  if (!response?.data) {
    throw new Error('failed-to-fetch-registrations');
  }

  return response.data;
};
