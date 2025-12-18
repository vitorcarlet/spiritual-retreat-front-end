import { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid/models';

// =========================
// Pagination Helpers
// =========================

/**
 * converts page/limit to skip/take
 * @param page - pageNumber (1-indexed)
 * @param pageLimit - PageLimit
 * @returns { skip, take }
 */
export const pageToSkipTake = (
  page: number,
  pageLimit: number
): { skip: number; take: number } => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, pageLimit);
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
};

/**
 * Converts skip/take back to page/pageLimit
 * @param skip - Number of items to skip
 * @param take - Number of items to return
 * @returns { page, pageLimit }
 */
export const skipTakeToPage = (
  skip: number,
  take: number
): { page: number; pageLimit: number } => {
  const safeTake = Math.max(1, take);
  return {
    page: Math.floor(skip / safeTake) + 1,
    pageLimit: safeTake,
  };
};

/**
 * Calculates the total number of pages based on the total number of items and items per page.
 * @param totalItems - Total number of items
 * @param pageLimit - Number of items per page
 * @returns Total number of pages
 */
export const calculatePageCount = (
  totalItems: number,
  pageLimit: number
): number => {
  if (totalItems <= 0 || pageLimit <= 0) return 1;
  return Math.ceil(totalItems / pageLimit);
};

/**
 * Prepares pagination parameters to send to the API.
 * Returns either page/pageLimit or skip/take depending on the mode.
 */
export const preparePaginationParams = (
  page: number,
  pageLimit: number,
  mode: 'page' | 'skip' = 'skip'
): Record<string, number> => {
  if (mode === 'skip') {
    return pageToSkipTake(page, pageLimit);
  }
  return { page, pageLimit };
};

// =========================
// Selection Helpers
// =========================

export const getSelectedIds = <T>({
  data,
  selectedRows,
}: getSelectedIdsProps<T>): GridRowId[] => {
  if (data === undefined || selectedRows === undefined) return [];
  if (
    typeof selectedRows === 'object' &&
    'type' in selectedRows &&
    selectedRows.type === 'exclude'
  ) {
    return data?.rows.map((row) => row.id) || [];
  }
  if (Array.isArray(selectedRows)) {
    return selectedRows;
  }
  if (typeof selectedRows === 'object' && 'ids' in selectedRows) {
    return Array.from(selectedRows.ids) || [];
  }

  return [];
};

type getSelectedIdsProps<T> = {
  data: TableRequest<T> | undefined;
  selectedRows: GridRowSelectionModel | undefined;
};

type TableRequest<T> = {
  rows: (T & { id: string | number })[];
  total: number;
  page: number;
  pageLimit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export const keysToRemoveFromFilters = ['page', 'pageLimit', 'skip', 'take'];
