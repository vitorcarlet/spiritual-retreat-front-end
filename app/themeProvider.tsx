"use client";

import { Theme, ThemeProvider } from "@mui/material";
import React from "react";

export default function ThemeWrapper({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
}) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
