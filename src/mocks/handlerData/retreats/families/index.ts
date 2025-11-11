import { Participant } from "@/src/types/retreats";
import { makeParticipant } from "../shared";
import { RetreatFamilyMock } from "./types";

export type { RetreatFamilyMock } from "./types";

const colors = ["#1976d2", "#19d24d", "#ced219", "#29a0b0"];

export const mockFamilies: RetreatFamilyMock[] = (() => {
  const families: RetreatFamilyMock[] = [];
  let participantGlobalId = 1;
  for (let f = 1; f <= 8; f++) {
    const members: Participant[] = [];
    for (let m = 0; m < 4; m++) {
      members.push(makeParticipant(participantGlobalId++, f, m));
    }
    const createdAt = new Date(
      Date.now() - 1000 * 60 * 60 * 24 * f
    ).toISOString();
    families.push({
      familyId: Number(`157${f}`),
      name: `Family ${f}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      contactName: `${members[0].firstName} ${members[0].lastName}`,
      contactEmail: members[0].email,
      contactPhone: members[0].phone,
      membersCount: members.length,
      createdAt,
      updatedAt: createdAt,
      position: f,
      members,
    });
  }
  return families;
})();

// Optional helper to flatten participants if needed
export const mockFamilyParticipants: Participant[] = mockFamilies.flatMap(
  (f) => f.members || []
);
