import { makeParticipant } from "../shared";

const genders: Array<"male" | "female"> = ["male", "female"];

export const mockTents: RetreatTent[] = (() => {
  const tents: RetreatTent[] = [];
  let participantGlobalId = 1;

  for (let index = 1; index <= 12; index++) {
    const gender = genders[index % genders.length];
    const participants: TentParticipant[] = [];

    for (let m = 0; m < 3; m++) {
      const participant = makeParticipant(participantGlobalId++, index, m);
      participants.push({
        id: String(participant.id),
        name: participant.name,
        email: participant.email,
        phone: participant.phone,
        gender: participant.gender,
        city: participant.city,
      });
    }

    const createdAt = new Date(
      Date.now() - 1000 * 60 * 60 * 12 * index
    ).toISOString();

    tents.push({
      id: `tent-${index}`,
      retreatId: "retreat-1",
      number: String(index).padStart(2, "0"),
      capacity: 6,
      gender,
      notes:
        index % 3 === 0 ? "Precisa de manutenção na lona lateral." : undefined,
      participants,
      createdAt,
      updatedAt: createdAt,
    });
  }

  return tents;
})();

export const mockTentParticipants: TentParticipant[] = mockTents.flatMap(
  (tent) => tent.participants
);
