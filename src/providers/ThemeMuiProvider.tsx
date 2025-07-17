// ThemeProvider.tsx - Configurar no provider
"use client";

import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "@/src/theme/theme";

export default function ThemeMuiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      theme={theme}
      defaultMode="system"
      modeStorageKey="mui-mode"
    >
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
