"use client";
import axios from "axios";
import { getSession } from "next-auth/react";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token do cliente
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession(); // Use getSession para client-side

      if (session?.tokens?.access_token) {
        config.headers.Authorization = `Bearer ${session.tokens.access_token}`;
      }
    } catch (error) {
      console.warn("Failed to get session in interceptor:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para resposta
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    console.error("API Client Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
