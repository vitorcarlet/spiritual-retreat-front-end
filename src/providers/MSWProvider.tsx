// src/mocks/MSWProvider.tsx
"use client";

import { useEffect, useState } from "react";
import { SplashScreen } from "../components/loading-screen";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const initMocks = async () => {
      if (process.env.NODE_ENV === "development") {
        const { worker } = await import("@/src/mocks/browser");
        await worker.start({
          onUnhandledRequest: "bypass", // Não interceptar requests não mockados
        });
        setMswReady(true);
      } else {
        setMswReady(true);
      }
    };

    initMocks();
  }, []);

  // Em desenvolvimento, esperar MSW carregar
  if (process.env.NODE_ENV === "development" && !mswReady) {
    return <SplashScreen />; // ou seu componente de loading
  }

  return <>{children}</>;
}
