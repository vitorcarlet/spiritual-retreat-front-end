// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authServiceMock from "@/services/mockAuth";

const config: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 2 },
  secret: process.env.AUTH_SECRET,             // .env.local → AUTH_SECRET=...
  providers: [
    Credentials({
      credentials: {
        email:    { label: "E‑mail",   type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { email, password } = credentials as {
          email: string; password: string;
        };
        return authServiceMock.login({ email, password }) ?? null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user })      { if (user)    token.id    = user.id;   return token; },
    async session({ session, token }) { if (session.user) session.user.id = token.id as string; return session; },
  },
};

// ──────────────────────────────────────────────────────────────
//   ⬇️  ‘NextAuth’ devolve { handlers, auth, signIn, … }
// ──────────────────────────────────────────────────────────────
const { handlers, auth, signIn, signOut } = NextAuth(config);

// ✅ App Router precisa que essas duas consts existam
export const { GET, POST } = handlers;

// Opcional: para usar em outras partes do app
export { auth, signIn, signOut };
