interface ContemplatedParticipant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: "contemplated" | "not_contemplated";
  photoUrl?: string;
  activity: string;
  paymentStatus: "paid" | "pending" | "overdue";
  participation: boolean;
}
