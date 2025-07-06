import NextAuth, {
  AuthValidity,
  BackendAccessJWT,
  BackendJWT,
  DecodedJWT,
  User,
} from "next-auth";
import "next-auth/jwt";

// import Atlassian from "next-auth/providers/atlassian"

import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import vercelKVDriver from "unstorage/drivers/vercel-kv";
import { UnstorageAdapter } from "@auth/unstorage-adapter";
import { refresh } from "./src/mocks/actions";
import { jwtDecode } from "jwt-decode";
import { JWT } from "next-auth/jwt";
import { sendRequestServer } from "./src/lib/sendRequestServer";
import { LoginResponse } from "./src/auth/types";
import GitHub from "next-auth/providers/github";
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

  //basePath: "/auth",
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      //const existingUser = await getUserById(user.id);
      //todo email verification and twofactor

      if (user) {
        console.log("User signed in:", user);
        return true;
      }
      return false;
    },
    // 2. Executa sempre que alguém chama /api/auth/session
    // async session({ session, token }) {
    //   session.user.id = token.id as string;
    //   session.user.role = token.role as string;

    //   // expõe só o que precisa ser lido no browser
    //   session.accessToken = token.accessToken as string;

    //   return session;
    // },
    // async redirect({ url, baseUrl }) {
    //   return url.startsWith(baseUrl)
    //     ? Promise.resolve(url)
    //     : Promise.resolve(baseUrl);
    // },

    async jwt({ token, user, account }) {
      // Initial signin contains a 'User' object from authorize method
      if (user || account) {
        console.debug("Initial signin");
        return { ...token, data: user };
      }

      // The current access token is still valid
      if (Date.now() < token.data.validity.valid_until * 1000) {
        console.debug("Access token is still valid");
        return token;
      }

      // The current access token has expired, but the refresh token is still valid
      if (Date.now() < token.data.validity.refresh_until * 1000) {
        console.debug("Access token is being refreshed");
        return await refreshAccessToken(token);
      }

      // The current access token and refresh token have both expired
      // This should not really happen unless you get really unlucky with
      // the timing of the token expiration because the middleware should
      // have caught this case before the callback is called
      console.debug("Both tokens have expired");
      return { ...token, error: "RefreshTokenExpired" } as JWT;
    },
    async session({ session, token }) {
      session.user = token.data.user;
      session.validity = token.data.validity;
      session.error = token.error;
      return session;
    },
  },
  experimental: { enableWebAuthn: true },
  providers: [
    GitHub,
    Google,
    Credentials({
      name: "Login",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@mail.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (
        credentials: Partial<Record<"email" | "password", unknown>>
      ) => {
        try {
          const data = await sendRequestServer<LoginResponse>({
            url: "/login",
            isSilent: true,
            method: "post",
            payload: {
              email: credentials.email,
              password: credentials.password,
            },
          });
          if (data === undefined) return null;
          if (data.access_token === undefined) return null;
          const tokens: BackendJWT = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          };

          const access: DecodedJWT = jwtDecode(tokens.access_token!);
          const refresh: DecodedJWT = jwtDecode(tokens.refresh_token);
          const validity: AuthValidity = {
            valid_until: access.exp,
            refresh_until: refresh.exp,
          };

          return {
            id: refresh.jti, // User object is forced to have a string id so use refresh token id
            tokens: tokens,
            user: data.user,
            validity: validity,
          } as User;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          console.error("Error during authorization:");
          return null;
        }
      },
    }),
  ],
});

// declare module "next-auth" {
//   interface Session {
//     accessToken?: string;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     accessToken?: string;
//   }
// }

async function refreshAccessToken(nextAuthJWT: JWT): Promise<JWT> {
  try {
    // Get a new access token from backend using the refresh token
    const res = await refresh(nextAuthJWT.data.tokens.refresh);
    const accessToken: BackendAccessJWT = res?.data;

    if (!res || accessToken.access_token === undefined) throw accessToken;
    const { exp }: DecodedJWT = jwtDecode(accessToken.access_token);

    // Update the token and validity in the next-auth object
    nextAuthJWT.data.validity.valid_until = exp;
    nextAuthJWT.data.tokens.access = accessToken.access_token;
    // Ensure the returned jwt has a new object reference ID
    // (jwt will not be updated otherwise)
    return { ...nextAuthJWT };
  } catch (error) {
    console.debug(error);
    return {
      ...nextAuthJWT,
      error: "RefreshAccessTokenError",
    };
  }
}
