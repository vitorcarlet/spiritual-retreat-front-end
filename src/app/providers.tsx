// app/providers.tsx
"use client";

import { CssBaseline } from "@mui/material";
import { NextIntlClientProvider } from "next-intl";
import AuthProvider from "./sessionprovider";

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  //   const mode = useThemeStore((state) => state.mode); // por exemplo: 'dark' ou 'light'
  //   const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  console.log("LocaleApp:", locale);
  const realLocale = locale || "pt-br"; // Fallback para 'pt-br' se locale não for fornecido
  return (
    <NextIntlClientProvider locale={realLocale}>
      {/* <ThemeProvider theme={theme}> */}
      <AuthProvider>
        <CssBaseline />
        {children}
      </AuthProvider>
      {/* <ToastContainer /> */}
      {/* </ThemeProvider> */}
    </NextIntlClientProvider>
  );
}
