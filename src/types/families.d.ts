interface RetreatFamily {
  id: number;
  name: string;
  color: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
  members: Participant[] | null;
  locked?: boolean;
}
