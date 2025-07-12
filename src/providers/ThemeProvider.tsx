// ThemeProvider.tsx - Configurar no provider
"use client";

import React from "react";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import theme from "@/src/theme/theme";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CssVarsProvider
      theme={theme}
      defaultMode="system"
      modeStorageKey="mui-mode"
      colorSchemeSelector="class" // ← CONFIGURAR AQUI
      // OU usar template customizado:
      // colorSchemeSelector=".theme-%s"
    >
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}
