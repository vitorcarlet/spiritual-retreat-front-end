"use server";

import { signOut } from "@/auth";
import { revalidatePath } from "next/cache";

export const logout = async () => {
  try {
    await signOut({});
  } catch (error: any) {
    // NEXT_REDIRECT é esperado - não é um erro real
    if (error?.message?.includes("NEXT_REDIRECT")) {
      console.log("✅ Logout successful, redirecting...");

      // Limpar cache antes do redirect
      revalidatePath("/", "layout");

      // Permitir que o redirect aconteça
      throw error;
    }

    // Apenas erros reais
    console.error("❌ Erro real ao fazer logout:", error);
    return { success: false, error: "Erro ao fazer logout" };
  }
};
