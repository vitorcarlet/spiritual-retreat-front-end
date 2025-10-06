// ThemeProvider.tsx - Configurar no provider
"use client";

import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "@/src/theme/theme";
import { DarkModeProvider } from "@/src/theme/DarkModeContext";

export default function ThemeMuiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DarkModeProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </DarkModeProvider>
  );
}
