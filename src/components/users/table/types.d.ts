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

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt: Date;
  age: number;
}
