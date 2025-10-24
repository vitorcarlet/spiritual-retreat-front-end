interface Retreat {
  id: number;
  name: string;
  edition: string;
  theme: string;
  startDate: string;
  endDate: string;
  maleSlots: number;
  femaleSlots: number;
  registrationStart: string;
  registrationEnd: string;
  feeFazer: {
    amount: number;
    currency: string;
  };
  feeServir: {
    amount: number;
    currency: string;
  };
  westRegionPct: {
    value: number;
  };
  otherRegionPct: {
    value: number;
  };
  state?: string;
  stateShort?: string;
  city?: string;
  description?: string;
  capacity?: number;
  participationTax?: string;
  enrolled?: number;
  location?: string;
  isActive?: boolean;
  images?: string[];
  status: "open" | "closed" | "running" | "ended" | "upcoming";
  instructor?: string;
  image?: string;
}

export interface Participant {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  cpf: string;
  city: string;
  state: string;
  gender?: "male" | "female" | "other" | "na";
  registrationDate: string;
  status: "registered" | "confirmed" | "cancelled" | "attended"; // Status do participante
}
