"use client";
import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useConfigureClientRequests } from "../hooks/useConfigureClientRequests";

export default function SessionWatcher({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  useConfigureClientRequests();

  useEffect(() => {
    const message = session?.error;
    if (!message) return;

    if (
      message.includes("RefreshTokenExpired") ||
      message.includes("RefreshTokenNotFound")
    ) {
      console.warn("Sessão com erro de refresh — desconectando...");
      signOut();
    }
  }, [session?.error]);

  return children;
}
