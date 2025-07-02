import NextAuth from "next-auth";
import "next-auth/jwt";

// import Atlassian from "next-auth/providers/atlassian"
import GitHub from "next-auth/providers/github";

import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import vercelKVDriver from "unstorage/drivers/vercel-kv";
import { UnstorageAdapter } from "@auth/unstorage-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { sendRequest } from "./src/lib/sendRequest";
import { LoginResponse } from "./src/auth/types";

const storage = createStorage({
  driver: process.env.VERCEL
    ? vercelKVDriver({
        url: process.env.AUTH_KV_REST_API_URL,
        token: process.env.AUTH_KV_REST_API_TOKEN,
        env: false,
      })
    : memoryDriver(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  adapter: UnstorageAdapter(storage),
  providers: [
    GitHub,
    Google,
    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      authorize: async (credentials) => {
        try {
          const data = await sendRequest<LoginResponse>({
            url: "/login",
            isSilent: true,
            method: "post",
            payload: {
              email: credentials.email,
              password: credentials.password,
            },
          });

          return data.user; // Retorna o usuário autenticado
        } catch (error) {
          console.error("Error logging in:", error);
          throw new Error("Invalid credentials.");
        }
      },
    }),
  ],
  //basePath: "/auth",
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      //const existingUser = await getUserById(user.id);
      //todo email verification and twofactor

      return true;
    },
    // 2. Executa sempre que alguém chama /api/auth/session
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;

      // expõe só o que precisa ser lido no browser
      session.accessToken = token.accessToken as string;

      return session;
    },
    async jwt({ token, user, account }) {
      // Primeira vez (sign-in com Credentials) → temos user preenchido
      if (user) {
        token.id = user.id; // persistir id
        token.role = user.role; // ou permissions…
        token.accessToken = user.token_access; // recebido da API
        // token.refreshToken = user.token_refresh;   // **não exponha** ao client
      }
      return token;
    },
  },
  experimental: { enableWebAuthn: true },
});

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
