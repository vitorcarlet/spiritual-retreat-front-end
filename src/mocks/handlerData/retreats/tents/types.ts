/**
 * Mock type for tent participant - includes additional fields used only in mocks
 * that may not exist in the final API response
 */
export interface TentParticipantMock {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  city: string;
}

/**
 * Mock type for retreat tent - includes additional fields used only in mocks
 * that may not exist in the final API response
 */
export interface RetreatTentMock {
  id: string;
  retreatId: string;
  number: string;
  capacity: number;
  gender: "male" | "female";
  notes?: string;
  participants: TentParticipantMock[];
  createdAt: string;
  updatedAt: string;
}
