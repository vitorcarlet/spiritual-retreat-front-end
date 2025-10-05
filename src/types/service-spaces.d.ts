interface ServiceSpaceMember {
  id: string;
  name: string;
  role: "coordinator" | "vice" | "member" | "support";
  email?: string;
  phone?: string;
  gender?: "female" | "male";
}

interface ServiceSpace {
  id: string;
  retreatId: string;
  name: string;
  description: string;
  minMembers: number;
  coordinator: ServiceSpaceMember | null;
  viceCoordinator: ServiceSpaceMember | null;
  members: ServiceSpaceMember[];
  createdAt?: string;
  updatedAt?: string;
}
