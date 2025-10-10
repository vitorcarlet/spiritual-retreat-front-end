"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { setClientAccessTokenResolver } from "@/src/lib/sendRequestClientVanilla";

export function useConfigureClientRequests() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") {
      setClientAccessTokenResolver(undefined);
      return;
    }

    setClientAccessTokenResolver(async () => {
      const token =
        session?.tokens?.access_token ||
        (session as { accessToken?: string })?.accessToken;

      if (!token) {
        throw new Error("Authentication required");
      }

      return token;
    });

    return () => setClientAccessTokenResolver(undefined);
  }, [session, status]);
}
