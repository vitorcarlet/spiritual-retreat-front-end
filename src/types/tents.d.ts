interface TentParticipant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: "male" | "female" | "other" | "na";
  city?: string;
  age?: number;
}

interface RetreatTent {
  id: string;
  retreatId: string;
  number: string;
  capacity: number;
  gender: "male" | "female" | "mixed";
  notes?: string;
  participants: TentParticipant[];
  createdAt?: string;
  updatedAt?: string;
}
