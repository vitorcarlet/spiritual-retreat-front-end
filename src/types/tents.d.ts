interface TentParticipant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: "male" | "female" | "other" | "na";
  city?: string;
  age?: number;
}

interface RetreatTentLite {
  tentId: string;
  number: string;
  category: string;
  capacity: number;
  assignedCount
  gender?: "male" | "female" | "mixed";
  participants?: TentParticipant[];
  createdAt?: string;
  updatedAt?: string;
}


interface RetreatTent {
  tentId: string;
  number: string;
  category: string;
  capacity: number;
  assignedCount
  gender?: "male" | "female" | "mixed";
  notes: string;
  participants?: TentParticipant[];
  createdAt?: string;
  updatedAt?: string;
}
