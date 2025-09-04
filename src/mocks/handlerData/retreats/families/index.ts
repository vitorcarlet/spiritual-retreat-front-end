import { Participant } from "@/src/types/retreats";
import { makeParticipant } from "../shared";

export const mockFamilies: RetreatFamily[] = (() => {
  const families: RetreatFamily[] = [];
  let participantGlobalId = 1;
  for (let f = 1; f <= 20; f++) {
    const members: Participant[] = [];
    for (let m = 0; m < 4; m++) {
      members.push(makeParticipant(participantGlobalId++, f, m));
    }
    const createdAt = new Date(
      Date.now() - 1000 * 60 * 60 * 24 * f
    ).toISOString();
    families.push({
      id: Number(`157${f}`),
      name: `Family ${f}`,
      contactName: `${members[0].firstName} ${members[0].lastName}`,
      contactEmail: members[0].email,
      contactPhone: members[0].phone,
      membersCount: members.length,
      createdAt,
      updatedAt: createdAt,
      members,
    });
  }
  return families;
})();

// Optional helper to flatten participants if needed
export const mockFamilyParticipants: Participant[] = mockFamilies.flatMap(
  (f) => f.members || []
);
