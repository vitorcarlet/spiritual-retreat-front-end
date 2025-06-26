import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // If user is logged in, redirect from home to /dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect visitor to /login if not authenticated
  if (!token) {
    const isPublicRoute =
      pathname.match(/^\/(login|register|forgotpassword)/) ||
      pathname.startsWith("/api/");

    if (!isPublicRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
}