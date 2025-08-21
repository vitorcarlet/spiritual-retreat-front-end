// Lista mock de 100 participantes contemplados
export interface ContemplatedParticipant {
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

const activities = ["Participante", "Serviço"];

const paymentCycle: ContemplatedParticipant["paymentStatus"][] = [
  "paid",
  "pending",
  "overdue",
];

export const mockContemplatedParticipants: ContemplatedParticipant[] =
  Array.from({ length: 100 }, (_, i) => {
    const id = i + 1;
    return {
      id,
      name: `Participante ${id}`,
      email: `participante${id}@email.com`,
      phone: `+55 11 9${String(10000000 + id).slice(-8)}`,
      status: "contemplated",
      photoUrl: undefined, // ou `https://api.dicebear.com/7.x/initials/svg?seed=${id}`
      activity: activities[i % activities.length],
      paymentStatus: paymentCycle[i % paymentCycle.length],
      participation: i % 5 !== 0, // ~80% presentes
    };
  });
