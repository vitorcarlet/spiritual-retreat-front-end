interface TentParticipant {
  registrationId: string;
  name: string;
  email?: string;
  phone?: string;
  position: number;
  gender?: "Male" | "Female";
  city: string;
  age?: number;
}

interface RetreatTentRoster {
  tentId: string;
  number: string;
  category: string;
  capacity: number;
  assignedCount;
  gender: "male" | "female" | "mixed";
  members?: TentParticipant[];
  createdAt?: string;
  updatedAt?: string;
}

interface RetreatTent {
  tentId: string;
  number: string;
  category: "Male" | "Female";
  capacity: number;
  assignedCount;
  //gender?: "male" | "female" | "mixed";
  notes: string;
  members?: TentParticipant[];
  createdAt?: string;
  updatedAt?: string;
}
