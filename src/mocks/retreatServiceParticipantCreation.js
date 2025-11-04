/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.TOKEN || process.argv[2];
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
  "d755dc8b-71a5-4ec4-8f67-3e04c291b175", // Apoio
  "55288f25-5e3a-4e81-8bbe-e96fb254c412", // Cantina
  "4b4e6cc3-2dbf-4837-a940-2e8e6e163548", // Capela
  "21e47918-2f45-410f-b7c9-4a165c2e761c", // Casa da Mãe
  "01f00e3e-2333-4a3c-9191-459ffaa50ad7", // Casa do Pai
  "2a8ca242-ac71-4cf2-8046-31dccfe29ca8", // Cozinha
  "8fedf88a-384a-4f0b-b500-573d02b16294", // Externa
  "761dbc97-b878-4d64-b1b5-e02a4c8823fc", // Guardião
  "62036409-09be-4f86-a791-767285b92afc", // Loja
  "94c1572e-960b-4cdc-8599-c94b4e52a37e", // Madrinha
  "47b23966-8f03-4e87-910f-c887a5d3828c", // Manutenção
  "dbc875db-6c7e-4074-9b2e-9ae4f25550c3", // Música
  "c9f3a275-8bf9-4645-89bd-0cb5392fe7c6", // Padrinho
  "0fea8de0-29ee-4828-8e14-e5e77d191adf", // Saúde
  "af3f6fcd-a8cd-4f68-ac6e-079c0d1b7b7e", // Secretaria
  "7b259dda-8ece-4085-959f-546c7f6d94c4", // Tapera
  "d9dc2015-5e08-4035-9eaf-a414cfc405ee", // Teatro
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
      console.error(`  ✗ Erro: ${result.error}`);
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
