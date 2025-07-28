import type { Metadata } from "next";
import { Poppins } from "next/font/google";
// import { getLocale } from "next-intl/server";
import { InitColorSchemeScript } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { NextIntlClientProvider } from "next-intl";
import ModeSwitch from "../src/components/navbar/mui/ModeSwitch";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { initMocks } from "@/src/mocks";
import { MSWProvider } from "@/src/providers/MSWProvider";
import EmotionCacheProvider from "@/src/components/navbar/mui/EmotionCacheProvider";
import ThemeMuiProvider from "@/src/providers/ThemeMuiProvider";
import { ModalProvider } from "@/src/contexts/ModalContext";
//import { initMocks } from "@/src/mocks";

if (process.env.NODE_ENV === "development") {
  if (typeof window !== "undefined") {
    initMocks();
  }
}

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // You can pick any weights you use
  style: ["normal", "italic"], // Optional
  display: "swap", // Recommended to avoid FOIT
});

export async function metadata(): Promise<Metadata> {
  return {
    title: "SAM Gestor",
    description: "Plataforma de gestão de retiros espirituais",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //const locale = getLocale();
  const session = await auth();
  const realLocale = "pt-br"; // Fallback para 'pt-br' se locale não for fornecido
  return (
    <html lang={realLocale} suppressHydrationWarning>
      <body className={poppins.className}>
        <SessionProvider session={session}>
          <EmotionCacheProvider>
            <InitColorSchemeScript attribute="class" />
            <AppRouterCacheProvider options={{ enableCssLayer: true }}>
              <ThemeMuiProvider>
                <NextIntlClientProvider locale={realLocale}>
                  <MSWProvider>
                    <ModeSwitch />
                    <ModalProvider>{children}</ModalProvider>
                    {/* <ToastContainer /> */}
                  </MSWProvider>
                </NextIntlClientProvider>
              </ThemeMuiProvider>
            </AppRouterCacheProvider>
          </EmotionCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
