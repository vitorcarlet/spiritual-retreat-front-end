interface ServiceSpaceMember {
  registrationId: string;
  name: string;
  // role: "coordinator" | "vice" | "member" | "support";
  role: 0 | 1 | 2 | "Coordinator" | "Vice" | "Member"; //0 - normal 1 - coordinator 2 - vice
  email?: string;
  phone?: string;
  gender?: "female" | "male";
  cpf?: string;
}

interface ServiceSpace {
  spaceId: string;
  isLocked: boolean;
  isActive: boolean;
  retreatId: string;
  name: string;
  description: string;
  color: string;
  // coordinator: ServiceSpaceMember | null;
  // viceCoordinator: ServiceSpaceMember | null;
  members: ServiceSpaceMember[];
  maxPeople: number;
  minPeople: number;
  createdAt?: string;
  updatedAt?: string;
  count: number;
  hasCoordinator: boolean;
  hasVice: boolean;
}

/**
 * Tipo para a resposta da API de service spaces
 * Estrutura diferente do ServiceSpace (sem members, diferentes nomes de propriedades)
 */
interface ServiceSpaceLite {
  spaceId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isLocked: boolean;
  minPeople: number;
  maxPeople: number;
  allocated: number;
  members: ServiceSpaceApiResponseMember[];
}

interface ServiceSpaceApiResponseMember {
  registrationId: string;
  name: string;
  role: number;
  position: number;
  city: string;
}

interface ServiceSpacesApiResponse {
  version: number;
  spaces: ServiceSpaceLite[];
}

interface ServiceSpaceWarning {
  code: string; //MissingVice MissingCoordinator
  message: string;
  spaceId: string;
}
