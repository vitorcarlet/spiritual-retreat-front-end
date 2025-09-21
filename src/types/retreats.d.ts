interface Retreat {
  id: number;
  title: string;
  edition: number;
  state: string;
  stateShort: string;
  city: string;
  theme: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  participationTax: string;
  enrolled: number;
  location: string;
  isActive: boolean;
  images: string[]; // Substitua pelo caminho correto das imagens
  status: "open" | "closed" | "running" | "ended" | "upcoming"; // Status do retiro,
  instructor?: string; // Opcional, caso tenha instrutor
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
  registrationDate: string;
  status: "registered" | "confirmed" | "cancelled" | "attended"; // Status do participante
}
