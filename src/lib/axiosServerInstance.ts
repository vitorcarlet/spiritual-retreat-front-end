import axios from 'axios';

const baseURL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5001/api';

// ✅ Instância server "pura" (sem auth()). Use para rotas públicas como /login, /refresh etc.
const apiServer = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Quando precisar Authorization no server, crie uma instância por request
export function ApiServerWithToken(accessToken?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return axios.create({
    baseURL,
    timeout: apiServer.defaults.timeout,
    headers,
  });
}

export default apiServer;
