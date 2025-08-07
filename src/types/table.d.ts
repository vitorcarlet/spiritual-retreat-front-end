interface FiltersDate<T = unknown> {
  title: string;
  filter: keyof T;
  configKey?: string;
  variantDate?: "month" | "day" | "year" | "week";
}

interface FilterField {
  typeField:
    | "selectAutocomplete"
    | "input"
    | "select"
    | "checkbox"
    | "radio"
    | "date";
  name: string;
  primaryKey?: string;
  onlyFirstLoad?: boolean;
  url?: string;
  isMultiple?: boolean;
  custom?: {
    variant?: "custom" | "default";
    [key: string]: unknown;
  };
  label?: string;
  placeholder?: string;
  options?: Array<{
    value: unknown;
    label: string;
  }>;
}

interface FilterItem {
  title: string;
  fields: FilterField[];
}

interface TableBase {
  search?: string;
  page?: number;
  pageLimit?: number;
}

type TableDefaultFields<T = unknown> = TableBase & T;

interface Filters<Filters, DateFilters> {
  variantDate?: "month" | "day" | "year" | "dateRange";
  date?: FiltersDate<Filters & DateFilters>[];
  items?: FilterItem<Filters & DateFilters>[];
}

// Generic type for service orders report filters (example usage)
interface ServiceOrdersReportsFilters {
  period: string;
  status: string[];
  city: string[];
}

// Generic type for any filters object
type AnyFilters = Record<string, unknown>;

// Helper type to extract filter keys from a filters object
type FilterKeys<T> = keyof T;

// Type for date filter configuration
type DateFilterConfig<T = AnyFilters> = {
  configKey?: string;
  variantDate?: "month" | "day" | "year" | "week";
  title: string;
  filter: FilterKeys<T>;
};
