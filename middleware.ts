export { auth as middleware } from "auth";

// export async function middleware(request: NextRequest) {
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   const { pathname } = request.nextUrl;

//   const isPublicRoute = /^\/(login|register|forgotpassword)(\/|$)/.test(
//     pathname
//   );

//   // Se não tiver token e a rota não for pública, redireciona para /login
//   if (!token && !isPublicRoute) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // Se tiver token e estiver tentando acessar a home "/", redireciona para /dashboard
//   if (token && pathname === "/") {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

export const config = {
  matcher: [
    /*
     * Executa o middleware em todas as rotas, exceto:
     * - arquivos estáticos (_next)
     * - API routes
     * - favicon
     * - rotas públicas como login/register
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|forgotpassword).*)",
  ],
};
