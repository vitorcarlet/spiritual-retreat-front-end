// src/utils/axiosInstance.ts
import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Exemplo: http://localhost:3001
});

api.interceptors.request.use(
  async (config) => {
    const session = await getSession();

    if (session && session.user) {
      const token = session.user.token || session.accessToken; // depende do que você retorna no callback do next-auth
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
