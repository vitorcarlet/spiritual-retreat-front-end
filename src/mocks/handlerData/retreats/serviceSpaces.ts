import { nanoid } from "nanoid";

export interface MockServiceSpaceMember {
  id: string;
  name: string;
  role?: "member" | "support";
}

export interface MockServiceSpace {
  id: string;
  retreatId: string;
  color: string;
  name: string;
  description: string;
  minMembers: number;
  coordinator: MockServiceSpaceMember | null;
  viceCoordinator: MockServiceSpaceMember | null;
  members: MockServiceSpaceMember[];
}

const baseMembers: MockServiceSpaceMember[] = [
  { id: "member-ana", name: "Ana Martins" },
  { id: "member-lucas", name: "Lucas Pereira" },
  { id: "member-sofia", name: "Sofia Almeida" },
  { id: "member-joao", name: "João Carvalho" },
];

const colors = ["#1976d2", "#19d24d", "#ced219", "#29a0b0"];

function createSpace(
  retreatId: string,
  name: string,
  description: string,
  minMembers: number,
  coordinator: MockServiceSpaceMember,
  viceCoordinator: MockServiceSpaceMember,
  memberIds: string[]
): MockServiceSpace {
  return {
    id: nanoid(10),
    retreatId,
    name,
    description,
    minMembers,
    color: colors[Math.floor(Math.random() * colors.length)],
    coordinator,
    viceCoordinator,
    members: memberIds.map((memberId, index) => ({
      id: `${memberId}-${index}`,
      name: baseMembers[index % baseMembers.length].name,
    })),
  };
}

export const mockServiceSpaces: MockServiceSpace[] = [
  createSpace(
    "1",
    "Casa da Mãe",
    "Espaço acolhedor para orientação espiritual das participantes.",
    6,
    { id: "coord-maria", name: "Maria Ferreira" },
    { id: "vice-helena", name: "Helena Souza" },
    ["mae-equipe-1", "mae-equipe-2", "mae-equipe-3"]
  ),
  createSpace(
    "1",
    "Casa do Pai",
    "Suporte emocional e confissões para os participantes.",
    5,
    { id: "coord-antonio", name: "Antônio Silva" },
    { id: "vice-carlos", name: "Carlos Lima" },
    ["pai-equipe-1", "pai-equipe-2"]
  ),
  createSpace(
    "1",
    "Música",
    "Equipe responsável pela condução musical e ambientação.",
    8,
    { id: "coord-joaquim", name: "Joaquim Alves" },
    { id: "vice-mariana", name: "Mariana Duarte" },
    ["musica-equipe-1", "musica-equipe-2", "musica-equipe-3", "musica-equipe-4"]
  ),
];

export function addServiceSpace(space: MockServiceSpace) {
  mockServiceSpaces.push(space);
}

export function updateServiceSpace(
  spaceId: string,
  data: Partial<MockServiceSpace>
) {
  const index = mockServiceSpaces.findIndex((space) => space.id === spaceId);
  if (index === -1) {
    return null;
  }

  const current = mockServiceSpaces[index];
  const updated = { ...current, ...data };
  mockServiceSpaces[index] = updated;
  return updated;
}

export function deleteServiceSpace(spaceId: string) {
  const index = mockServiceSpaces.findIndex((space) => space.id === spaceId);
  if (index === -1) {
    return false;
  }

  mockServiceSpaces.splice(index, 1);
  return true;
}
