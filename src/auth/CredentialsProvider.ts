import Credentials from "next-auth/providers/credentials";

export const credentialsProvider = Credentials({
  id: "credentials-provider",
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials: Partial<Record<"email" | "password", unknown>>) {
    console.log(credentials, "credentials");
    if (
      credentials?.email === "admin@email.com" &&
      credentials?.password === "123"
    ) {
      return {
        id: "1",
        name: "Admin",
        email: credentials.email as string,
      };
    }
    return null;
  },
});
