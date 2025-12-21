import { RetreatLite } from '@/src/types/retreats';

export type RetreatOption = { options: RetreatLite[]; total: number };

// ---------- Dashboard Overview Types ----------

export interface DashboardOverviewResponse {
  retreat: {
    id: string;
    name: string;
    edition: string;
  };
  kpis: {
    totalConfirmed: number;
    totalPaid: number;
    totalPending: number;
    capacity: number;
    occupancyPercent: number;
  };
  gender: {
    male: number;
    female: number;
  };
  shirts: Array<{ label: string; value: number }>;
  citiesTop: Array<{ label: string; value: number }>;
  families: {
    count: number;
    topByPaid: Array<{ label: string; value: number }>;
  };
  tents: {
    total: number;
    occupied: number;
    occupancyPercent: number;
  };
  payments: {
    byMethod: Array<{ label: string; value: number }>;
    timeSeries: Array<{ date: string; paid: number; pending: number }>;
  };
  service: {
    kpis: {
      submitted: number;
      confirmed: number;
      declined: number;
      cancelled: number;
      assigned: number;
      paid: number;
    };
    spaces: ServiceSpaceDashboard[];
  };
}

export interface ServiceSpaceDashboard {
  label: string;
  capacity: number;
  submitted: number;
  confirmed: number;
  assigned: number;
  occupancyPercent: number;
}
