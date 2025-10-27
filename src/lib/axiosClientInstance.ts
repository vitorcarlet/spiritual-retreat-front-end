"use client";
import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token do cliente
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession(); // precisa ser await
    const token =
      session?.tokens?.access_token ||
      (session as { accessToken?: string })?.accessToken;

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para resposta
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      await signOut({
        callbackUrl: "/login", // Redirecionar para login
        redirect: true,
      });
    }
    console.error("API Client Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
