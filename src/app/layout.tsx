import type { Metadata } from "next";
import { Poppins } from "next/font/google";
// import { getLocale } from "next-intl/server";
import {
  CssBaseline,
  InitColorSchemeScript,
  ThemeProvider,
} from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import theme from "../theme/theme";
import { NextIntlClientProvider } from "next-intl";
import AuthProvider from "./sessionprovider";
import ModeSwitch from "../components/navbar/mui/ModeSwitch";
import ThemeWrapper from "./themeProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function metadata(): Promise<Metadata> {
  return {
    title: "SAM Gestor",
    description: "Plataforma de gestão de retiros espirituais",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //const locale = getLocale();
  const realLocale = "pt-br"; // Fallback para 'pt-br' se locale não for fornecido
  return (
    <html lang={realLocale} suppressHydrationWarning>
      <body className={poppins.className}>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <NextIntlClientProvider locale={realLocale}>
              <ModeSwitch />
              {/* <AuthProvider></AuthProvider> */}
              {children}
              {/* <ToastContainer /> */}
            </NextIntlClientProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
