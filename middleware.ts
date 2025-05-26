import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";

const locales = ["en", "pt"];
const defaultLocale = "pt";

// ⬇️ Primeiro aplica a internacionalização do next-intl
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
});

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Redireciona usuário autenticado da home para /[locale]/dashboard
  if (token) {
    const pathnameIsRoot =
      pathname === "/" || locales.includes(pathname.replace("/", ""));
    if (pathnameIsRoot) {
      const locale = request.nextUrl.locale || defaultLocale;
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard`, request.url)
      );
    }
  }

  // Redireciona visitante para /login se não autenticado
  if (!token) {
    const locale = request.nextUrl.locale || defaultLocale;
    const isPublicRoute =
      pathname.match(/^\/(en|pt)\/(login|register|forgotpassword)/) ||
      pathname.startsWith("/api/");

    if (!isPublicRoute) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // Aplica lógica de idioma padrão do next-intl
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/", // raiz
    "/(pt|en)/:path*", // rotas com locale
    "/((?!_next|favicon.ico|api).*)", // ignora arquivos estáticos e APIs
  ],
};
