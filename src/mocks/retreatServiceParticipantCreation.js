/* eslint-disable no-console */
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const RETREAT_ID = process.env.RETREAT_ID || process.argv[3];

if (!RETREAT_ID) {
  console.error(
    "Usage: TOKEN=... RETREAT_ID=... node retreatServiceParticipantCreation.js"
  );
  process.exit(1);
}

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

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
    "Tubarão, Laguna",
    "Braço do Norte",
    "Orleans",
    "Urussanga",
  ],
  oeste: ["Chapecó", "Concórdia", "Caçador", "Xanxerê", "Joaçaba"],
  leste: ["Blumenau", "Brusque", "Gaspar", "Timbó", "Indaial"],
};

// SpaceIds disponíveis
const spaceIds = [
  "28925689-436a-4903-8e88-23cfcedf8211", // Apoio
  "73c3019d-2f81-4d0a-8465-896c01e7e90b", // Cantina
  "bb236f9a-4cef-4e0f-9c56-adc6d18b2d60", // Capela
  "674865c7-0602-45f1-b271-d4ed60825006", // Casa da Mãe (CDM)
  "94b4f0fc-418c-4a9e-8ba1-a8911ed0f6f6", // Casa do Pai (CDP)
  "b8388807-4a7c-43e3-9fa1-bb133df79b97", // Cozinha
  "ccc7bdf5-1763-4c6e-958b-e11a77c2333d", // Externa
  "9a1bc5ed-0b80-4dd8-8247-0d7de3c23131", // Guardião
  "182e5147-2e4d-4870-b0bf-5f317ecd63ce", // Loja
  "14f7b305-0b84-4e65-85ad-01b28827c551", // Madrinha
  "e6661b15-adf3-4b14-8f2c-f28c793cee0a", // Manutenção
  "4ab363af-d377-4ae3-bd5e-cf2f55113098", // Música
  "04490a98-47e5-472f-8f84-42114dc1e1b0", // Padrinho
  "63ad5b6a-eeb2-4526-9ec1-c1e420e2b58f", // Saúde
  "33ad303a-bf5e-42d4-9080-2d4bac9fd38f", // Secretaria
  "c61334cc-8f12-40bf-9975-88c5097e37ba", // Tapera
  "c773e731-7110-4516-b443-7c37bfc30fba", // Teatro
];

const regions = ["norte", "sul", "oeste", "leste"];
const genders = [0, 1, 2]; // 0=Masculino, 1=Feminino, 2=Outro

// Gerador de dados fake
function generateCPF() {
  const part1 = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  const part2 = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  const part3 = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  const part4 = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `${part1}.${part2}.${part3}-${part4}`;
}

function generateEmail(name) {
  const namePart = name.toLowerCase().replace(/\s+/g, ".");
  const random = Math.floor(Math.random() * 10000);
  return `${namePart}.${random}@example.com`;
}

function generatePhone() {
  const area = String(Math.floor(Math.random() * 90 + 10));
  const first = String(Math.floor(Math.random() * 9 + 1));
  const second = String(Math.floor(Math.random() * 9999999)).padStart(7, "0");
  return `(${area}) ${first} ${second}`;
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

  const region = regions[Math.floor(Math.random() * regions.length)];
  const cities = catarinenseCities[region];
  const city = cities[Math.floor(Math.random() * cities.length)];

  const birthDate = randomDate(new Date(1950, 0, 1), new Date(2005, 11, 31));
  const gender = genders[Math.floor(Math.random() * genders.length)];
  const spaceId = spaceIds[Math.floor(Math.random() * spaceIds.length)];

  return {
    retreatId: RETREAT_ID,
    name: { value: fullName },
    cpf: { value: generateCPF() },
    email: { value: generateEmail(fullName) },
    phone: generatePhone(),
    birthDate: formatDate(birthDate),
    gender,
    city,
    region,
    preferredSpaceId: spaceId,
  };
}

async function createParticipant(participant) {
  try {
    const url = `${BASE_URL}/api/retreats/${RETREAT_ID}/service/registrations`;
    const response = await axios.post(url, participant, {
      headers: {
        //Authorization: `Bearer ${TOKEN}`,
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
      } - ${participant.city} (${participant.region})`
    );

    const result = await createParticipant(participant);
    results.push(result);
    const errorMessage = axios.isAxiosError(result.error)
      ? result.error.response?.data?.error ?? result.error.message
      : "Não foi possível enviar a mensagem.";
    if (result.success) {
      console.log(`  ✓ ID de registro: ${result.data.serviceRegistrationId}`);
    } else {
      console.error(`  ✗ Erro: ${errorMessage}`);
    }

    await sleep(500); // Aguarda 500ms entre requisições
  }

  return results;
}

async function main() {
  try {
    const numParticipants =
      process.env.NUM_PARTICIPANTS || process.argv[4] || 5;
    const results = await createMultipleParticipants(parseInt(numParticipants));

    const failed = results.filter((r) => !r.success).length;



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
