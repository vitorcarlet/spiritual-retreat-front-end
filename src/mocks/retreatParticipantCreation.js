/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const RETREAT_ID = process.env.RETREAT_ID || process.argv[2];
const NUM_PARTICIPANTS = parseInt(
  process.env.NUM_PARTICIPANTS || process.argv[3] || "5",
  10
);

if (!RETREAT_ID) {
  console.error(
    "Uso: RETREAT_ID=... [NUM_PARTICIPANTS=...] node retreatServiceParticipantCreation.js"
  );
  process.exit(1);
}

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5001";

// Dados de cidades catarinenses por região
const catarinenseCities = {
  norte: [
    "Jaraguá do Sul",
    "Corupá",
    "Schroeder",
    "Massaranduba",
    "Barra Velha",
  ],
  sul: [
    "Criciúma",
    "Tubarão",
    "Laguna",
    "Braço do Norte",
    "Orleans",
    "Urussanga",
  ],
  oeste: ["Chapecó", "Concórdia", "Caçador", "Xanxerê", "Joaçaba"],
  leste: ["Blumenau", "Brusque", "Gaspar", "Timbó", "Indaial"],
};

const regions = Object.keys(catarinenseCities);
const genders = ["Male", "Female"];
const maritalStatuses = [
  "Single",
  "Married",
  "Cohabiting",
  "IrregularUnion",
  "SecondUnion",
  "Widowed",
];
const pregnancyStatuses = [
  "None",
  "Weeks0To12",
  "Weeks13To24",
  "Weeks25To36",
  "Weeks37Plus",
];
const shirtSizes = ["P", "M", "G", "GG", "GG1", "GG2", "GG3", "GG4"];
const ufList = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
const parentStatuses = ["Alive", "Deceased"];
const religions = [
  "Católico",
  "Evangélico",
  "Espírita",
  "Budista",
  "SemReligião",
];
const alcoholUse = ["None", "Daily", "Weekends", "AlcoholDependent"];
const relationshipOptions = [
  "None",
  "Boyfriend",
  "Spouse",
  "Father",
  "Mother",
  "Friend",
  "Cousin",
  "Uncle",
  "Other",
];
const rahaminAttemptOptions = [
  "None",
  "RahaminPortaI_2015_EUA",
  "RahaminPortaII_2016_02_Cacador",
  "RahaminPortaIII_2016_03_MorroDaFumaca",
  "RahaminPortaIV_2016_08_Cacador",
];
const rahaminVidaOptions = [
  "None",
  "VidaI_2016_03_Cacador",
  "VidaII_2016_10_Cacador",
  "VidaVII_2019_02_Cacador",
  "VidaX_2023_02_Cacador",
];

// Gerador de dados fake
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function generateCPF() {
  const numbers = Array.from({ length: 11 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function generateEmail(name) {
  const namePart = name.toLowerCase().replace(/\s+/g, ".");
  const random = Math.floor(Math.random() * 10000);
  return `${namePart}.${random}@example.com`;
}

function generatePhoneDigits() {
  const digits = Array.from({ length: 11 }, (_, idx) =>
    idx === 0 ? 9 : Math.floor(Math.random() * 10)
  );
  return digits.join("");
}

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function maybe(value, probability = 0.5) {
  return Math.random() < probability ? value : null;
}

function getRandomFlags(options, { allowNone = true, max = 3 } = {}) {
  const withoutNone = options.filter((opt) => opt !== "None");

  if (allowNone && Math.random() < 0.35) {
    return "None";
  }

  if (!withoutNone.length) {
    return "None";
  }

  const target = Math.max(
    1,
    Math.min(max, withoutNone.length, Math.floor(Math.random() * max) + 1)
  );

  const selection = new Set();
  while (selection.size < target) {
    selection.add(pickRandom(withoutNone));
  }

  return Array.from(selection).join(",");
}

function generateParticipant() {
  const firstNames = [
    "João",
    "Maria",
    "Pedro",
    "Ana",
    "Carlos",
    "Lucia",
    "Roberto",
    "Fernanda",
    "Antonio",
    "Paula",
    "Francisco",
    "Mariana",
    "José",
    "Beatriz",
    "Marcos",
    "Claudia",
    "Gabriel",
    "Isabela",
    "Rodrigo",
    "Camila",
    "Felipe",
    "Juliana",
    "Lucas",
    "Amanda",
    "Rafael",
    "Larissa",
    "Diego",
    "Bianca",
    "Gustavo",
    "Natalia",
    "Bruno",
    "Victoria",
    "André",
    "Priscila",
    "Leandro",
    "Renata",
    "Thiago",
    "Fernanda",
    "Mateus",
    "Adriana",
    "Vicente",
    "Cristina",
    "Ricardo",
    "Patricia",
    "Sergio",
    "Daniele",
    "Claudio",
    "Simone",
  ];

  const lastNames = [
    "Silva",
    "Santos",
    "Oliveira",
    "Souza",
    "Costa",
    "Ferreira",
    "Gomes",
    "Martins",
    "Alves",
    "Dias",
    "Rocha",
    "Ribeiro",
    "Pereira",
    "Carvalho",
    "Barbosa",
    "Correia",
    "Machado",
    "Monteiro",
    "Tavares",
    "Braga",
    "Moreira",
    "Pinto",
    "Neves",
    "Teixeira",
    "Lopes",
    "Mendes",
    "Soares",
    "Sá",
    "Reis",
    "Matos",
    "Vaz",
    "Faria",
    "Nascimento",
    "Araújo",
    "Castro",
    "Ribeiro",
    "Andrade",
    "Mesquita",
    "Vargas",
    "Cabral",
    "Medeiros",
    "Vieira",
    "Campos",
    "Nunes",
    "Duarte",
    "Marques",
    "Peixoto",
    "Azevedo",
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${firstName} ${lastName}`;

  const region = pickRandom(regions);
  const city = pickRandom(catarinenseCities[region]);

  const birthDate = randomDate(new Date(1950, 0, 1), new Date(2006, 11, 31));
  const gender = pickRandom(genders);
  const maritalStatus = pickRandom(maritalStatuses);
  const pregnancy =
    gender === "Female" ? pickRandom(pregnancyStatuses) : "None";
  const shirtSize = pickRandom(shirtSizes);
  const uf = pickRandom(ufList);
  const fatherStatus = pickRandom(parentStatuses);
  const motherStatus = pickRandom(parentStatuses);
  const religion = pickRandom(religions);
  const alcohol = pickRandom(alcoholUse);
  const hadFamilyLoss = Math.random() < 0.3;
  const hasSubmitter = Math.random() < 0.4;
  const usesDrugs = Math.random() < 0.15;
  const hasAllergies = Math.random() < 0.2;
  const hasMedicalRestriction = Math.random() < 0.15;
  const takesMedication = Math.random() < 0.2;
  const smoker = Math.random() < 0.2;

  return {
    retreatId: RETREAT_ID,
    name: { value: fullName },
    cpf: { value: generateCPF() },
    email: { value: generateEmail(fullName) },
    phone: generatePhoneDigits(),
    birthDate: formatDate(birthDate),
    gender,
    city,
    maritalStatus,
    pregnancy,
    shirtSize,
    weightKg: Number((55 + Math.random() * 45).toFixed(1)),
    heightCm: Number((150 + Math.random() * 25).toFixed(1)),
    profession: pickRandom([
      "Professor",
      "Engenheiro",
      "Enfermeiro",
      "Autônomo",
      "Estudante",
      "Administrador",
    ]),
    streetAndNumber: `${pickRandom(["Rua", "Av.", "Travessa"])} ${pickRandom(lastNames)} ${Math.floor(Math.random() * 300)}`,
    neighborhood: pickRandom([
      "Centro",
      "Vila Nova",
      "São José",
      "Nossa Senhora das Graças",
      "Industrial",
      "Santa Mônica",
    ]),
    state: uf,
    whatsapp: maybe(generatePhoneDigits(), 0.8),
    facebookUsername: maybe(
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
    ),
    instagramHandle: maybe(
      `@${firstName.toLowerCase()}_${lastName.toLowerCase()}`
    ),
    neighborPhone: generatePhoneDigits(),
    relativePhone: generatePhoneDigits(),
    fatherStatus,
    fatherName: fatherStatus === "Deceased" ? null : maybe(`Sr. ${lastName}`),
    fatherPhone:
      fatherStatus === "Deceased" ? null : maybe(generatePhoneDigits()),
    motherStatus,
    motherName:
      motherStatus === "Deceased"
        ? null
        : maybe(`Dona ${pickRandom(lastNames)}`),
    motherPhone:
      motherStatus === "Deceased" ? null : maybe(generatePhoneDigits()),
    hadFamilyLossLast6Months: hadFamilyLoss,
    familyLossDetails: hadFamilyLoss ? "Perda recente na família." : null,
    hasRelativeOrFriendSubmitted: hasSubmitter,
    submitterRelationship: hasSubmitter
      ? getRandomFlags(relationshipOptions, { allowNone: false, max: 2 })
      : "None",
    submitterNames: hasSubmitter
      ? `${pickRandom(firstNames)} ${pickRandom(lastNames)}`
      : null,
    religion,
    previousUncalledApplications: getRandomFlags(rahaminAttemptOptions),
    rahaminVidaCompleted: getRandomFlags(rahaminVidaOptions),
    alcoholUse: alcohol,
    smoker,
    usesDrugs,
    drugUseFrequency: usesDrugs
      ? pickRandom(["Semanal", "Mensal", "Eventual"])
      : null,
    hasAllergies,
    allergiesDetails: hasAllergies ? "Relato de alergia a poeira." : null,
    hasMedicalRestriction,
    medicalRestrictionDetails: hasMedicalRestriction
      ? "Restrição alimentar."
      : null,
    takesMedication,
    medicationsDetails: takesMedication ? "Uso contínuo de vitaminas." : null,
    physicalLimitationDetails: maybe("Nenhuma limitação relevante."),
    recentSurgeryOrProcedureDetails: maybe("Cirurgia simples em 2023."),
    termsAccepted: true,
    termsVersion: "2025.1",
    marketingOptIn: true,
    _meta: { region },
  };
}

async function createParticipant(participant) {
  try {
    const url = `${BASE_URL}/api/registrations`;
    const response = await axios.post(url, participant, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });
    return { success: true, data: response.data, participant };
  } catch (error) {
    return {
      success: false,
      error: error,
      participant,
    };
  }
}

async function createMultipleParticipants(count = 10) {
  console.log(`Criando ${count} participantes para retiro ${RETREAT_ID}...`);
  const results = [];
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < count; i++) {
    const participant = generateParticipant();
    console.log(
      `[${i + 1}/${count}] Criando: ${participant.name.value} - ${
        participant.cpf.value
      } - ${participant.city} (${participant._meta.region})`
    );

    const { _meta, ...payload } = participant;
    const result = await createParticipant(payload);
    results.push(result);
    if (result.success) {
      console.log(`  ✓ Registro criado: ${result.data.registrationId}`);
    } else {
      const errorMsg = axios.isAxiosError(result.error)
        ? JSON.stringify(
            result.error.response?.data ?? result.error.message,
            null,
            2
          )
        : String(result.error);
      console.error(`  ✗ Erro ao criar ${participant.name.value}: ${errorMsg}`);
    }

    await sleep(500); // Aguarda 500ms entre requisições
  }

  return results;
}

async function main() {
  try {
    const results = await createMultipleParticipants(NUM_PARTICIPANTS);

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`\n=== RESUMO ===`);
    console.log(`Total: ${results.length}`);
    console.log(`Sucesso: ${successful}`);
    console.log(`Falhas: ${failed}`);

    if (failed > 0) {
      console.log(`\nErros:`);
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`  - ${r.participant.name.value}: ${r.error}`);
        });
    }
  } catch (err) {
    console.error("Erro fatal:", err.message);
    process.exit(1);
  }
}

main();
