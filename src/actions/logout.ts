"use server";

import { signOut } from "@/auth";
import { revalidatePath } from "next/cache";

export const logout = async () => {
  try {
    await signOut({
      redirect: false,
    });

    // Use revalidatePath ao invés de redirect
    revalidatePath("/", "layout");

    // Retorne uma URL para redirecionamento no client
    return { success: true, redirectTo: "/login" };
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return { success: false, error: "Erro ao fazer logout" };
  }
};
