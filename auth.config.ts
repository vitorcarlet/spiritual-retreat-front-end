import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { LoginResponse } from "./src/auth/types";
import { sendRequestServer } from "./src/lib/sendRequestServer";

export default {providers: [
    GitHub,
    Google,
    Credentials({
      // credentials: {
      //   email: {
      //     type: "email",
      //     label: "Email",
      //     placeholder: "johndoe@gmail.com",
      //   },
      //   password: {
      //     type: "password",
      //     label: "Password",
      //     placeholder: "*****",
      //   },
      // },
      authorize: async (credentials) => {
        const data = await sendRequestServer<LoginResponse>({
          url: "/login",
          isSilent: true,
          method: "post",
          payload: {
            email: credentials.email,
            password: credentials.password,
          },
        });
        console.log(data, "data");
        if (data.user) {
          return data.user;
        }
        return null;
      },
    }),
  ]
} satisfies NextAuthConfig