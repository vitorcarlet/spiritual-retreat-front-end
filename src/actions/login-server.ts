/* eslint-disable @typescript-eslint/no-explicit-any */
// src/actions/login-server.ts
"use server";

import { signIn } from "@/auth";
import { z } from "zod";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// Schema de validação
const loginSchema = z.object({
  email: z.string().email("Informe um email válido"),
  password: z.string().min(3, "A senha deve ter no mínimo 3 caracteres"),
});

const DEFAULT_REDIRECT = "/dashboard";

function sanitizeCallback(raw: string | null): string {
  if (!raw) return DEFAULT_REDIRECT;
  try {
    // Se vier já codificado (?callbackUrl=%2Freports), decode primeiro
    const decoded = decodeURIComponent(raw);
    // Só permitir caminhos relativos internos
    if (
      decoded.startsWith("/") &&
      !decoded.startsWith("//") && // evita esquema implícito
      !decoded.startsWith("/api/") // opcional bloquear APIs
    ) {
      return decoded === "/login" ? DEFAULT_REDIRECT : decoded;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_REDIRECT;
}

export async function loginServerAction(
  formData: FormData,
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
      // A mensagem de AuthError do NextAuth adiciona “. Read more at …”
      // e nem sempre preserva cause. Normalizamos.
      const raw =
        // tenta pegar cause explícita (quando usamos CredentialsSignin(new Error("CODE")))
        (error as any)?.cause?.message ||
        // fallback para message (vem com sufixo doc)
        error.message ||
        // último fallback: tipo
        error.type;

      // Normaliza removendo tudo após o primeiro ponto / quebra de linha
      const normalized = raw.split(/[\n.]/)[0].trim();
      console.log(
        "AuthError during signIn (raw):",
        raw,
        "| normalized:",
        normalized
      );

      if (normalized === "CONFIRMATION_CODE_REQUIRED") {
        console.log("Redirecionando para /login/code POR ACTION");
        redirect(`/login/code?email=${encodeURIComponent(email)}`);
      }

      switch (error.type) {
        case "CredentialsSignin":
          return {
            message:
              normalized === "INTERNAL_AUTH_ERROR"
                ? "Erro interno de autenticação. Tente novamente."
                : "Credenciais inválidas. Verifique email e senha.",
          };
        default:
          return { message: "Algo deu errado. Tente novamente." };
      }
    }
    console.error("Unexpected error during signIn:", error);
    return { message: "Erro inesperado. Tente novamente." };
  }

  // Se chegou aqui, login foi bem-sucedido
  const h = headers();
  const rawUrl = (await h).get("x-url"); // Ex: http://localhost:3000/login?callbackUrl=%2Freports
  let callbackUrl: string | null = null;

  if (rawUrl) {
    try {
      const u = new URL(rawUrl);
      callbackUrl = u.searchParams.get("callbackUrl");
      // Se não há callbackUrl explícito e o usuário acessou /alguma-coisa protegida redirecionado para /login,
      // você pode capturar o pathname original no middleware e colocar em outro header (ex: x-original-path)
      if (!callbackUrl) {
        const original = (await h).get("x-original-path");
        if (original) callbackUrl = original;
      }
    } catch {
      /* ignore */
    }
  }

  const redirectTo = sanitizeCallback(callbackUrl);

  redirect(redirectTo);
}
