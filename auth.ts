import NextAuth, {
  AuthValidity,
  BackendAccessJWT,
  BackendJWT,
  CredentialsSignin,
  DecodedJWT,
  User,
} from "next-auth";
import "next-auth/jwt";

// import Atlassian from "next-auth/providers/atlassian"

import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import vercelKVDriver from "unstorage/drivers/vercel-kv";
import { UnstorageAdapter } from "@auth/unstorage-adapter";
import { authRoutes } from "./routes";
import { isPublicPath } from "./routes";
import { refresh } from "./src/mocks/actions";
import { jwtDecode } from "jwt-decode";
import { JWT } from "next-auth/jwt";
import { LoginResponse } from "./src/auth/types";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "./src/lib/sendRequestServerVanilla";
import apiServer from "./src/lib/axiosServerInstance";

const storage = createStorage({
  driver: process.env.VERCEL
    ? vercelKVDriver({
        url: process.env.AUTH_KV_REST_API_URL,
        token: process.env.AUTH_KV_REST_API_TOKEN,
        env: false,
      })
    : memoryDriver(),
});

class UserNotActivatedError extends CredentialsSignin {
  constructor() {
    super("CONFIRMATION_CODE_REQUIRED");
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  // logger: {
  //   error(code, metadata) {
  //     // Envia o erro para o Sentry com mais contexto
  //     Sentry.captureException(metadata.error, {
  //       extra: {
  //         code: code,
  //         ...metadata
  //       }
  //     });
  //     // Você pode também logar no console se quiser
  //     console.error(code, metadata);
  //   },
  //   warn(code, message) {
  //     console.warn(code, message)
  //   },
  //   debug(code, message) {
  //     // Evite enviar logs de debug para produção
  //     if (process.env.NODE_ENV !== "production") {
  //       console.debug(code, message)
  //     }
  //   }
  // },
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 4 minutes
    updateAge: 30 * 60, // 30 minutes
  },
  pages: {
    signIn: "/login",
    error: "/", // Error code passed in query string as ?error=
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
        //console.log("User signed in:", user);
        return true;
      }
      return false;
    },

    async jwt({ token, user }) {
      // Initial signin contains a 'User' object from authorize method
      //console.log(user,token,'JWT USER')
      if (user) {
        const enrichedUser = user as User & {
          tokens?: BackendJWT;
          validity?: AuthValidity;
        };

        // eslint-disable-next-line no-console
        console.log("✅ Initial signin - User data:", {
          userId: enrichedUser.user?.id ?? enrichedUser.id,
          hasTokens: !!enrichedUser.tokens,
          validUntil: enrichedUser.validity?.valid_until
            ? new Date(enrichedUser.validity.valid_until * 1000).toISOString()
            : "N/A",
        });
        return { ...token, data: enrichedUser };
      }

      // ✅ Validação: se não tem data, significa que o token é inválido
      if (!token.data) {
        console.warn("❌ Token without data - invalid token");
        return { ...token, error: "NoTokenData" } as JWT;
      }

      const now = Date.now();
      const validUntil = token.data.validity?.valid_until
        ? token.data.validity.valid_until * 1000
        : 0;
      const refreshUntil = token.data.validity?.refresh_until
        ? token.data.validity.refresh_until * 1000
        : 0;

      // eslint-disable-next-line no-console
      console.log("🔍 Token check:", {
        now: new Date(now).toISOString(),
        validUntil: validUntil ? new Date(validUntil).toISOString() : "N/A",
        refreshUntil: refreshUntil
          ? new Date(refreshUntil).toISOString()
          : "N/A",
        isValid: now < validUntil,
        canRefresh: now < refreshUntil,
      });

      // The current access token is still valid
      if (token.data.validity?.valid_until && now < validUntil) {
        // eslint-disable-next-line no-console
        console.log("✅ Access token is still valid");
        return token;
      }

      // The current access token has expired, but the refresh token is still valid
      if (token.data.validity?.refresh_until && now < refreshUntil) {
        // eslint-disable-next-line no-console
        console.log("🔄 Refreshing access token...");
        const refreshedToken = await refreshAccessToken(token);
        if (refreshedToken.error) {
          console.warn("❌ Refresh failed - forcing logout");
          return { ...token, error: "RefreshAccessTokenError" };
        }

        return refreshedToken;
      }
      // The current access token and refresh token have both expired
      // This should not really happen unless you get really unlucky with
      // the timing of the token expiration because the middleware should
      // have caught this case before the callback is called
      console.warn("Both tokens have expired");
      return { ...token, error: "RefreshTokenExpired" } as JWT;
    },
    async session({ session, token }) {
      const buildInvalidSession = (errorCode: string) => {
        return {
          ...session,
          user: undefined,
          validity: null,
          tokens: undefined,
          error: errorCode,
          expires: "1970-01-01T00:00:00.000Z",
        };
      };

      if (token.error) {
        console.warn("❌ Token error detected:", token.error);
        return buildInvalidSession(token.error as string);
      }

      const hasUserData =
        token.data?.user && Object.keys(token.data.user).length > 0;

      if (!hasUserData) {
        console.warn("❌ Invalid user data in token");
        return buildInvalidSession("InvalidUserData");
      }

      return {
        ...session,
        user: token.data.user,
        validity: token.data.validity,
        tokens: token.data.tokens,
        error: token.error,
      };
    },
    authorized: ({ auth, request }) => {
      if (
        auth?.error === "RefreshAccessTokenError" ||
        auth?.error === "RefreshTokenExpired"
      ) {
        console.warn("❌ Unauthorized due to token error:", auth.error);
        return false;
      }
      const { pathname } = request.nextUrl;
      const isPublicRoute = isPublicPath(pathname);
      const isAuthRoute = authRoutes.includes(pathname);

      if (!isPublicRoute && !isAuthRoute) {
        return !auth?.error && !!auth?.user;
      }
      return true;
    },
    // authorized: ({ auth, request }) => {
    //   if (auth?.error) {
    //     console.debug("❌ Unauthorized due to token error:", auth.error);
    //     return false;
    //   }
    //   const { pathname } = request.nextUrl;
    //   const publicRoutes = [...authRoutes, ...pubRoutes];
    //   if (!publicRoutes.includes(pathname)) return !auth?.error && !!auth?.user;
    //   return true;
    // }
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
        code: { label: "Code", type: "text", placeholder: "123456" }, // se usar fluxo de código
      },
      authorize: async (
        credentials: Partial<Record<"email" | "password" | "code", unknown>>
      ) => {
        // Não envolva tudo em try/catch que retorna null; só capture para re-lançar
        try {
          // Fluxo de verificação de código direto
          if (!!credentials.code) {
            const { data, error } = await handleApiResponse<LoginResponse>(
              await sendRequestServerVanilla.post("/verify-code", {
                email: credentials.email,
                code: credentials.code,
              })
            );

            if (!data?.access_token || error) {
              // Código inválido -> credenciais inválidas
              return null;
            }

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
              id: refresh.jti,
              tokens,
              user: data.user,
              validity,
            } as User;
          }

          // Login normal
          const response = await apiServer.post<LoginResponse>("/login", {
            email: credentials.email,
            password: credentials.password,
          });
          // eslint-disable-next-line no-console
          console.log(
            "RESPONSE LOGIN <-----------------",
            response.data,
            "<------------------RESPONSE LOGIN"
          );
          const data = response.data;

          if (!data) return null;

          if (data.isNonCodeConfirmed) {
            // Usuário precisa confirmar código -> lançar erro tipado
            throw new UserNotActivatedError();
          }

          if (!data.access_token) return null;

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
            id: refresh.jti,
            tokens,
            user: data.user,
            validity,
          } as User;
        } catch (err) {
          // Se já é CredentialsSignin (ou subclasse) re-lança para NextAuth tratar e preservar cause
          if (err instanceof CredentialsSignin) throw err;

          // Qualquer outro erro inesperado -> encapsular em CredentialsSignin com identificador
          throw new CredentialsSignin("INTERNAL_AUTH_ERROR");
        }
      },
    }),
  ],
});

async function refreshAccessToken(nextAuthJWT: JWT): Promise<JWT> {
  try {
    // Get a new access token from backend using the refresh token
    //console.log(nextAuthJWT,'NEXTAUTHJWTWWW')
    const res = await refresh(nextAuthJWT.data.tokens.refresh_token);
    const accessToken: BackendAccessJWT = res?.data;

    if (!res || accessToken.access_token === undefined)
      return { ...nextAuthJWT, error: "RefreshAccessTokenError" };
    const { exp }: DecodedJWT = jwtDecode(accessToken.access_token);

    // Update the token and validity in the next-auth object
    // nextAuthJWT.data.validity.valid_until = exp;
    // nextAuthJWT.data.tokens.access = accessToken.access_token;
    // Ensure the returned jwt has a new object reference ID
    // (jwt will not be updated otherwise)
    return {
      ...nextAuthJWT,
      data: {
        ...nextAuthJWT.data,
        validity: {
          ...nextAuthJWT.data.validity,
          valid_until: exp,
        },
        tokens: {
          ...nextAuthJWT.data.tokens,
          access_token: accessToken.access_token,
        },
      },
    };
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    return {
      ...nextAuthJWT,
      error: "RefreshAccessTokenError",
    };
  }
}

// class InvalidLoginError extends CredentialsSignin {
//   code = "Invalid identifier or password";
// }

// class UserNotActivatedError extends CredentialsSignin {
//   code = "User not activated"
// }
