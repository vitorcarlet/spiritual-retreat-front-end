// app/layout.tsx ou algum componente Client
"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function SessionWatcher({ children }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (
      session?.error.includes("RefreshTokenExpired") ||
      session?.error.includes("RefreshTokenNotFound")
    ) {
      console.warn("Sessão com erro de refresh — desconectando...");
      signOut();
    }
  }, [session]);

  return children;
}
