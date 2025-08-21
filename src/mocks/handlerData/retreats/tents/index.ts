import { makeParticipant } from "../shared";

export const mockTents: RetreatTent[] = (() => {
  const families: RetreatTent[] = [];
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
      tentResponsibleId: members[0].id,
      membersCount: members.length,
      createdAt,
      updatedAt: createdAt,
      members,
    });
  }
  return families;
})();

// Optional helper to flatten participants if needed
export const mockTentParticipants: Participant[] = mockTents.flatMap(
  (f) => f.members || []
);
