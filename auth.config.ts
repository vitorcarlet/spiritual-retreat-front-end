import { BackendJWT, NextAuthConfig, AuthValidity, User, DecodedJWT } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { LoginResponse } from "./src/auth/types";
import { sendRequestServer } from "./src/lib/sendRequestServer";
import { jwtDecode } from "jwt-decode";

export const TOKEN_EXPIRY_BUFFER = 300; //

export default {providers: [
    GitHub,
    Google,
    Credentials({
      name: "Login",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@mail.com"
        },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        try{
        const data = await sendRequestServer<LoginResponse>({
          url: "/login",
          isSilent: true,
          method: "post",
          payload: {
            email: credentials.email,
            password: credentials.password,
          },
        });
        const tokens: BackendJWT = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        };
          if (!data || data.access_token === undefined) throw tokens;

        const access: DecodedJWT = jwtDecode(tokens.access_token!);
        const refresh: DecodedJWT = jwtDecode(tokens.refresh_token);
        const validity: AuthValidity = {
            valid_until: access.exp,
            refresh_until: refresh.exp
          };

        return {
            id: refresh.jti, // User object is forced to have a string id so use refresh token id
            tokens: tokens,
            user: data.user,
            validity: validity
          } as User;
        } catch (error) {
          console.error("Error during authorization:", error);
          return null;
        }
      },
    }),
  ]
} satisfies NextAuthConfig