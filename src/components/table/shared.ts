import { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid/models";

export const getSelectedIds = <T>({
  data,
  selectedRows,
}: getSelectedIdsProps<T>): GridRowId[] => {
  if (data === undefined || selectedRows === undefined) return [];
  if (
    typeof selectedRows === "object" &&
    "type" in selectedRows &&
    selectedRows.type === "exclude"
  ) {
    return data?.rows.map((row) => row.id) || [];
  }
  if (Array.isArray(selectedRows)) {
    return selectedRows;
  }
  if (typeof selectedRows === "object" && "ids" in selectedRows) {
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

export const keysToRemoveFromFilters = ["page", "pageLimit"];
