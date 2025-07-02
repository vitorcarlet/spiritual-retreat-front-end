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
        const user = {
          id: "1",
          name: "Admin",
          email: credentials?.email as string,
        };

        // logic to salt and hash password
        // const pwHash = saltAndHashPassword(credentials.password)

        // // logic to verify if the user exists
        // user = await getUserFromDb(credentials.email, pwHash)

        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error("Invalid credentials.");
        }

        // return user object with their profile data
        return user;
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
    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.email) {
          session.user.email = token.email;
        }

        if (token.role) {
          session.user.role = token.role;
        }

        session.user.name = token.name;
        session.user.image = token.picture;
      }

      return session;
    },

    // async jwt({ token }) {
    //   if (!token.sub) return token;

    //   const dbUser = await getUserById(token.sub);

    //   if (!dbUser) return token;

    //   token.name = dbUser.name;
    //   token.email = dbUser.email;
    //   token.picture = dbUser.image;
    //   token.role = dbUser.role;

    //   return token;
    // },
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
