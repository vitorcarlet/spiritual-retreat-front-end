import { AsyncOption } from "../select-auto-complete/AsynchronousAutoComplete";

export interface RetreatMetrics {
  payments: {
    pending: number;
    confirmed: number;
    total: number;
  };
  families: {
    formed: number;
    total: number;
  };
  accommodations: {
    occupied: number;
    total: number;
  };
  teams: {
    complete: number;
    total: number;
  };
  messages: {
    sent: number;
  };
  criticalIssues: {
    count: number;
    items: Array<{
      id: string;
      description: string;
      type: "payment" | "accommodation" | "family" | "team";
    }>;
  };
}

export type RetreatOption = { options: RetreatLite[]; total: number };
export type RetreatLite = AsyncOption & {
  startDate: string;
  endDate: string;
  isActive: boolean;
  location: string;
};
