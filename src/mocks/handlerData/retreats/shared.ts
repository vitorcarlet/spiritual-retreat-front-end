import { Participant } from "@/src/types/retreats";

const cities = [
  { city: "Videira", state: "SC" },
  { city: "Florianópolis", state: "SC" },
  { city: "Curitiba", state: "PR" },
  { city: "Porto Alegre", state: "RS" },
  { city: "São Paulo", state: "SP" },
  { city: "Rio de Janeiro", state: "RJ" },
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

const statuses: Participant["status"][] = [
  "registered",
  "confirmed",
  "attended",
  "cancelled",
];

export function makeParticipant(
  globalIndex: number,
  familyIndex: number,
  memberIndex: number
): Participant {
  const cityInfo = cities[(familyIndex + memberIndex) % cities.length];
  const firstName = `John${familyIndex}${memberIndex}`;
  const lastName = `Doe${familyIndex}`;
  const gender = memberIndex % 2 === 0 ? "male" : "female";
  //const realFamilyId = `real-${familyIndex}-${Math.floor(memberIndex / 2)}`;
  return {
    id: Number(`244${globalIndex}`),
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}${lastName.toLowerCase()}@example.com`,
    phone: `+55 11 9${pad(70000000 + globalIndex, 8)}`,
    birthDate: `199${familyIndex}-0${(memberIndex % 8) + 1}-15`,
    cpf: randomCpf(globalIndex),
    city: cityInfo.city,
    state: cityInfo.state,
    gender,
    //realFamilyId,
    registrationDate: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * (familyIndex * 5 + memberIndex)
    ).toISOString(),
    status: statuses[(familyIndex + memberIndex) % statuses.length],
  };
}
