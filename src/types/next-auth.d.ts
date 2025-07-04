import "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: User;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    email?: string;
    name?: string;
    image?: string;
    token?: string;
  }
}
