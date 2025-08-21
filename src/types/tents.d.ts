interface RetreatTent {
  id: number;
  name: string;
  tentResponsibleId: number;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
  members: Participant[] | null;
}
