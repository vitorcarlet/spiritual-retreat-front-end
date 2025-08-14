export type ContemplatedTableFilters = {
  name?: string;
  state?: string;
  city?: string;
  status?: string;
};

export type ContemplatedTableDateFilters = {
  periodStart?: string;
  periodEnd?: string;
};

export type ContemplatedTableFiltersWithDates = ContemplatedTableFilters &
  ContemplatedTableDateFilters;
