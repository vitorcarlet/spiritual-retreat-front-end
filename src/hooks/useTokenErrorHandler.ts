"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook que monitora erros de token e redireciona para login quando necessário
 */
export function useTokenErrorHandler() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Verifica se há erros de token que requerem redirecionamento
    if (
      session?.error === "RefreshAccessTokenError" ||
      session?.error === "RefreshTokenExpired"
    ) {
      console.warn(
        "Token error detected, redirecting to login:",
        session.error
      );

      // Preserva a URL atual como callbackUrl
      const currentPath = window.location.pathname + window.location.search;
      const encodedCallbackUrl = encodeURIComponent(currentPath);

      // Redireciona para login com callback
      router.push(`/login?callbackUrl=${encodedCallbackUrl}`);
    }
  }, [session?.error, router]);

  return {
    hasTokenError:
      session?.error === "RefreshAccessTokenError" ||
      session?.error === "RefreshTokenExpired",
    isAuthenticated: !!session?.user && !session?.error,
  };
}
