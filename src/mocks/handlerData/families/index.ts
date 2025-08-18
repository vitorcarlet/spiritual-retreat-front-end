const cities = [
  { city: "Videira", state: "SC" },
  { city: "Florianópolis", state: "SC" },
  { city: "Curitiba", state: "PR" },
  { city: "Porto Alegre", state: "RS" },
  { city: "São Paulo", state: "SP" },
  { city: "Rio de Janeiro", state: "RJ" },
];

const statuses: Participant["status"][] = [
  "registered",
  "confirmed",
  "attended",
  "cancelled",
];

function pad(num: number, size = 2) {
  return num.toString().padStart(size, "0");
}

function randomCpf(i: number) {
  return `${pad(100 + i, 3)}.${pad(200 + i, 3)}.${pad(300 + i, 3)}-${pad(
    10 + i,
    2
  )}`;
}

function makeParticipant(
  globalIndex: number,
  familyIndex: number,
  memberIndex: number
): Participant {
  const cityInfo = cities[(familyIndex + memberIndex) % cities.length];
  const firstName = `John${familyIndex}${memberIndex}`;
  const lastName = `Doe${familyIndex}`;
  return {
    id: globalIndex,
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}${lastName.toLowerCase()}@example.com`,
    phone: `+55 11 9${pad(70000000 + globalIndex, 8)}`,
    birthDate: `199${familyIndex}-0${(memberIndex % 8) + 1}-15`,
    cpf: randomCpf(globalIndex),
    city: cityInfo.city,
    state: cityInfo.state,
    registrationDate: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * (familyIndex * 5 + memberIndex)
    ).toISOString(),
    status: statuses[(familyIndex + memberIndex) % statuses.length],
  };
}

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
      id: f,
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
