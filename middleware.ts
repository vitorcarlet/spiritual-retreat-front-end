import NextAuth from "next-auth";
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from "./routes";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  console.log("🚀 MIDDLEWARE EXECUTED FOR:", req.nextUrl.pathname);
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 🔍 LOGS DETALHADOS PARA DEBUG
  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("URL:", nextUrl.href);
  console.log("Pathname:", nextUrl.pathname);
  console.log("isLoggedIn:", isLoggedIn);
  console.log("req.auth:", req.auth);

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  console.log("Routes check:", {
    isApiAuthRoute,
    isPublicRoute,
    isAuthRoute,
    apiAuthPrefix,
    publicRoutes,
    authRoutes,
  });

  if (isAuthRoute) {
    console.log("🔐 Processing auth route");
    if (isLoggedIn) {
      console.log("🔄 Redirecting logged user from auth route to dashboard");
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    console.log("✅ Allowing access to auth route for non-logged user");
    return null;
  }

  // Verificar token
  console.log("Token exists:", !!req.auth);
  console.log(
    "Token data:",
    req.auth
      ? {
          email: req.auth.user,
          exp: req.auth.expires,
          hasData: !!req.auth,
          dataKeys: req.auth ? Object.keys(req.auth) : null,
        }
      : null
  );

  const baseUrl = req.nextUrl.origin;

  // Check if the user is authenticated but token expired
  if (req.auth && req.auth?.validity?.refresh_until) {
    const refreshExpired = Date.now() >= req.auth.validity.refresh_until * 1000;
    console.log("Refresh token check:", {
      refreshExpired,
      currentTime: Date.now(),
      refreshUntil: req.auth.validity.refresh_until * 1000,
    });

    if (refreshExpired) {
      console.log("🔄 Redirecting due to expired refresh token");
      const response = NextResponse.redirect(`${baseUrl}/login`);
      response.cookies.set("next-auth.session-token", "", { maxAge: 0 });
      response.cookies.set("next-auth.csrf-token", "", { maxAge: 0 });
      return response;
    }
  }

  // Permitir todas as rotas de API de autenticação
  if (isApiAuthRoute) {
    console.log("✅ Allowing API auth route");
    return NextResponse.next();
  }

  // LÓGICA DA ROTA RAIZ "/" - ADICIONADA ANTES DAS OUTRAS VERIFICAÇÕES
  if (nextUrl.pathname === "/") {
    console.log("🏠 Processing root route /");
    console.log("isLoggedIn for root:", isLoggedIn);

    if (isLoggedIn) {
      console.log("🔄 Redirecting logged user to dashboard");
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    } else {
      console.log("🔄 Redirecting non-logged user to login");
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // Se estiver em uma rota de auth e já estiver logado, redirecionar para dashboard

  // Se não estiver logado e não for uma rota pública, redirecionar para login
  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    console.log("🔒 Redirecting to login - protected route access denied");
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  console.log("✅ Allowing request to continue");
  console.log("=== END DEBUG ===\n");
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico (favicon)
     */
    //todo: verificar outras rotas public que possam estar passando pelo middleware
    "/((?!api|images|mockServiceWorker|_next/static|_next/image|favicon.ico).*)",
  ],
};
