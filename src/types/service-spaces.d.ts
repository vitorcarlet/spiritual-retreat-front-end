interface ServiceSpaceMember {
  id: string;
  name: string;
  role: "coordinator" | "vice" | "member" | "support";
  email?: string;
  phone?: string;
  gender?: "female" | "male";
}

interface ServiceSpace {
  spaceId: string;
  isLocked: boolean;
  retreatId: string;
  name: string;
  description: string;
  color: string;
  minMembers: number;
  coordinator: ServiceSpaceMember | null;
  viceCoordinator: ServiceSpaceMember | null;
  members: ServiceSpaceMember[];
  maxMembers: number;
  minMember: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Tipo para a resposta da API de service spaces
 * Estrutura diferente do ServiceSpace (sem members, diferentes nomes de propriedades)
 */
interface ServiceSpaceApiResponse {
  spaceId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isLocked: boolean;
  minPeople: number;
  maxPeople: number;
  allocated: number;
}

interface ServiceSpacesApiResponse {
  version: number;
  items: ServiceSpaceApiResponse[];
}
