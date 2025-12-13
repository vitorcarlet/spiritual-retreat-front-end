import { auth } from "@/auth";
import axios from "axios";

const apiServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Função para criar instância com token
export const createAuthenticatedApi = async () => {
  try {
    const session = await auth();

    if (session?.tokens.accessToken) {
      apiServer.defaults.headers.Authorization = `Bearer ${session.tokens.accessToken}`;
    }

    return apiServer;
  } catch (error) {
    console.error("Failed to create authenticated API:", error);
    return apiServer; // Retorna sem token se falhar
  }
};

export default apiServer;
