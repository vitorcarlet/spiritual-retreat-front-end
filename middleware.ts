import NextAuth from "next-auth";
import { authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from "./routes";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import Helpers from "./src/helpers";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  console.log("🚀 MIDDLEWARE EXECUTED FOR:", req.nextUrl.pathname);
  const { nextUrl } = req;
  // // 🔍 LOGS DETALHADOS PARA DEBUG
  // console.log("=== MIDDLEWARE DEBUG ===");
  // console.log("URL:", nextUrl.href);
  // console.log("Pathname:", nextUrl.pathname);
  console.log("req.auth:", req.auth);

  //const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  console.log("IsAuthRoute:", nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // if (req.auth?.error || !req.auth) {
  //   console.log("❌ Token error detected, clearing session:", req.auth?.error);

  //   // Limpar cookies e redirecionar para login
  //   const response = NextResponse.redirect(new URL("/login", nextUrl));
  //   response.cookies.set("next-auth.session-token", "", {
  //     maxAge: 0,
  //     path: "/",
  //     httpOnly: true,
  //     sameSite: "lax",
  //   });
  //   response.cookies.set("next-auth.csrf-token", "", {
  //     maxAge: 0,
  //     path: "/",
  //     httpOnly: true,
  //     sameSite: "lax",
  //   });
  //   response.cookies.set("next-auth.callback-url", "", {
  //     maxAge: 0,
  //     path: "/",
  //     httpOnly: true,
  //     sameSite: "lax",
  //   });

  //   return response;
  // }

  // const isLoggedIn = Helpers.isLoggedIn(
  //   !!req.auth,
  //   req.auth?.validity?.refresh_until
  // );
  const isLoggedIn = !!req.auth;
  console.log("isLoggedIn:", isLoggedIn);
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
    return NextResponse.next();
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
    "/((?!api|images|installHook.js.map|mockServiceWorker|_next/static|_next/image|favicon.ico).*)",
  ],
};
