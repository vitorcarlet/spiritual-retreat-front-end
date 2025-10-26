interface ContemplatedParticipant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf: string;
  region: string;
  status: "contemplated" | "not_contemplated";
  photoUrl?: string;
  activity: string;
  paymentStatus: "paid" | "pending" | "overdue";
  participation: boolean;
}
