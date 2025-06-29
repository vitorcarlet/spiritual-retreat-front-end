import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "./providers";
import { getLocale } from "next-intl/server";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={poppins.className}>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
