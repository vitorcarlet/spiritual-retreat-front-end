interface RetreatFamily {
  familyId: number;
  name: string;
  capacity: number;
  totalMember: number;
  maleCount: number;
  femaleCount: number;
  remaining: number;

  color?: string;

  // contactName: string;
  // contactEmail: string;
  // contactPhone: string;
  // membersCount: number;
  // createdAt: string;
  // updatedAt: string;
  members: FamilyParticipant[];
  locked?: boolean;
}

type FamilyParticipant = {
  registrationId: string;
  name: string;
  gender: "Male" | "Female";
  city: "Lages";
  position: number;
};
