// src/actions/login-server.ts
"use server";

import { signIn } from "@/auth";
import { z } from "zod";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

// Schema de validação
const loginSchema = z.object({
  email: z.string().email("Informe um email válido"),
  password: z.string().min(3, "A senha deve ter no mínimo 3 caracteres"),
});

export async function loginServerAction(
  prevState: any,
  formData: FormData
) {
  // Validar dados com Zod
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Dados inválidos. Verifique os campos.",
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: "Credenciais inválidas. Verifique email e senha.",
          };
        default:
          return {
            message: "Algo deu errado. Tente novamente.",
          };
      }
    }
    throw error;
  }

  // Se chegou aqui, login foi bem-sucedido
  redirect("/dashboard");
}