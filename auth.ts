import NextAuth from "next-auth";
import "next-auth/jwt";

// import Atlassian from "next-auth/providers/atlassian"
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import vercelKVDriver from "unstorage/drivers/vercel-kv";
import { UnstorageAdapter } from "@auth/unstorage-adapter";
import { credentialsProvider } from "@/auth/CredentialsProvider";
import CredentialsProvider from "next-auth/providers/credentials";

const storage = createStorage({
  driver: process.env.VERCEL
    ? vercelKVDriver({
        base: process.env.AUTH_KV_REST_API_BASE,
        url: process.env.AUTH_KV_REST_API_URL,
        token: process.env.AUTH_KV_REST_API_TOKEN,
        env: false,
      })
    : memoryDriver(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  adapter: UnstorageAdapter(storage),
  providers: [Facebook, Google, CredentialsProvider(credentialsProvider)],
  basePath: "/auth",
  session: { strategy: "jwt" },
  jwt: {
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  },
  // pages: {
  //     signIn: "/login", // opcional
  //   },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname === "/middleware-example") return !!auth;
      return true;
    },
    jwt({ token, trigger, session, account }) {
      if (trigger === "update") token.name = session.user.name;
      if (account?.provider === "keycloak") {
        return { ...token, accessToken: account.access_token };
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) session.accessToken = token.accessToken;

      return session;
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
