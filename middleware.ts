import NextAuth from "next-auth";
import { authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from "./routes";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  console.log("🚀 MIDDLEWARE EXECUTED FOR:", req.nextUrl.pathname);
  const { nextUrl } = req;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-url", req.url);

  // // 🔍 LOGS DETALHADOS PARA DEBUG
  // console.log("=== MIDDLEWARE DEBUG ===");
  // console.log("URL:", nextUrl.href);
  // console.log("Pathname:", nextUrl.pathname);
  //const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  console.log("IsAuthRoute:", nextUrl.pathname);
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // const isLoggedIn = !req.auth?.error;
  const isLoggedIn = !!req.auth;
  console.log("isLoggedIn:", isLoggedIn, req.auth);
  if (nextUrl.pathname === "/") {
    if (isLoggedIn) {
      console.log("🔄 Redirecting logged user from root to dashboard");
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuthRoute) {
    console.log("🔐 Processing auth route");
    if (isLoggedIn) {
      console.log("🔄 Redirecting logged user from auth route to dashboard");
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    console.log("✅ Allowing access to auth route for non-logged user");
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

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

  //const baseUrl = req.nextUrl.origin;

  // Check if the user is authenticated but token expired
  // if (req.auth && req.auth?.validity?.refresh_until) {
  //   const refreshExpired = Date.now() >= req.auth.validity.refresh_until * 1000;
  //   console.log("Refresh token check:", {
  //     refreshExpired,
  //     currentTime: Date.now(),
  //     refreshUntil: req.auth.validity.refresh_until * 1000,
  //   });

  //   if (refreshExpired) {
  //     console.log("🔄 Redirecting due to expired refresh token");
  //     const response = NextResponse.redirect(new URL("/login", nextUrl));
  //     response.cookies.set("next-auth.session-token", "", { maxAge: 0 });
  //     response.cookies.set("next-auth.csrf-token", "", { maxAge: 0 });
  //     return response;
  //   }
  // }

  // LÓGICA DA ROTA RAIZ "/" - ADICIONADA ANTES DAS OUTRAS VERIFICAÇÕES

  console.log("✅ Allowing request to continue");
  console.log("=== END DEBUG ===\n");
  return NextResponse.next({
    request: {
      //it was for callback but does not work yet
      headers: requestHeaders,
    },
  });
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
    "/((?!api|images|installHook.js.map|mockServiceWorker|_next/static|_next/image|favicon.ico).*)",
  ],
};
