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

export type ContemplatedDataRequest = {
  rows: ContemplatedParticipant[];
  total: number;
  page: number;
  pageLimit: number;
};

export type RegistrationStatus =
  | "NotSelected"
  | "Selected"
  | "PendingPayment"
  | "PaymentConfirmed"
  | "Confirmed"
  | "Canceled";

export type ISO8601DateTime = string & { readonly __brand: "ISO8601DateTime" };

export type RegistrationDTO = {
  id: string;
  status: RegistrationStatus;
  name: string;
  cpf: string;
  region: string;
  category: "Guest" | "Server";
  registrationDate: ISO8601DateTime;
  photoUrl?: string;
};

export type RegistrationApiResponse = {
  items?: RegistrationDTO[];
  totalCount?: number;
  skip: number;
  take: number;
};
