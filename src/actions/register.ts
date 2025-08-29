"use server";

import { ROUTES } from "@/routes";
import { RegisterSchema } from "@/src/schemas";
import {
  sendRequestServerVanilla,
  handleApiResponse,
} from "../lib/sendRequestServerVanilla";
import { redirect } from "next/navigation";

export const registerForm = async (values: RegisterSchema) => {
  try {
    const { email, password, code } = values;

    // ✅ Usar API client configurado
    const response = await sendRequestServerVanilla.post(ROUTES.AUTH.REGISTER, {
      email,
      password,
      code,
    });

    // ✅ Lidar com resposta de forma consistente
    const result = await handleApiResponse(response);

    if (!result.success) {
      return { error: result.error };
    }

    // ✅ Redirecionar usando rotas centralizadas
    redirect(ROUTES.PROTECTED.DASHBOARD);
  } catch (error) {
    console.error("Registration error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong during registration.",
    };
  }
};
