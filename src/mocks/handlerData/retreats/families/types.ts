import { Participant } from "@/src/types/retreats";

/**
 * Mock type for retreat family - includes additional fields used only in mocks
 * that may not exist in the final API response
 */
export interface RetreatFamilyMock {
  familyId: number;
  name: string;
  color: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
  position?: number;
  members: Participant[];
}
