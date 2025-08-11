type UsersTableFilters = {
  name?: string;
  state?: string;
  city?: string;
  status?: string;
};

type UsersTableDateFilters = {
  periodStart?: string;
  periodEnd?: string;
};

type UsersTableFiltersWithDates = UsersTableFilters & UsersTableDateFilters;
