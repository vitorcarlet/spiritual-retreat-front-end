interface RetreatFamily {
  familyId: number;
  name: string;
  capacity: number;
  totalMembers: number;
  maleCount: number;
  femaleCount: number;
  remaining: number;
  color?: string;
  alerts: string[];
  isLocked: boolean;
  groupStatus: string;
  groupLink: string | null;
  groupExternalId: string | null;
  groupChannel: string | null;
  groupCreatedAt: string | null;
  groupLastNotifiedAt: string | null;
  groupVersion: number;
  members: FamilyParticipant[];
  // contactName: string;
  // contactEmail: string;
  // contactPhone: string;
  // membersCount: number;
  // createdAt: string;
  // updatedAt: string;
}

type FamilyParticipant = {
  registrationId: string;
  name: string;
  gender: "Male" | "Female";
  city: "Lages";
  position: number;
};
