import type { UserObject } from 'next-auth';

import { LoginResponse } from '@/generated-types/Api';

type DefaultResponse = {
  message?: string;
  error?: string;
  alert?: string;
  success?: boolean;
};

export interface LoginResponse extends DefaultResponse {
  accessToken: string;
  refreshToken: string;
  emailConfirmed: boolean;
  user: UserObject;
  isNonCodeConfirmed?: boolean;
}

// export interface UserObject {
//   sub: string;
//   email: string;
//   name: string;
//   first_name: string;
//   last_name: string;
//   roles: string[];
//   permissions: {
//     [key: string]: string[];
//   };
// }
// export interface DecodedJWT {
//   token_type: "refresh" | "access";
//   exp: number;
//   iat: number;
//   jti: string;
//   user_id: number;
// }
// export interface AuthValidity {
//   valid_until: number;
//   refresh_until: number;
// }
// export interface User {
//   tokens: LoginResponse;
//   user: UserObject;
//   validity: AuthValidity;
// }
// export interface Session {
//   user: UserObject;
//   validity: AuthValidity;
//   tokens: LoginResponse;
// }

// // export interface JWT {
// //   data: User;
// // }

// export type SessionCallbackParams = {
//   token: {
//     sub?: string;
//     email?: string;
//     role?: string;
//     name?: string;
//     picture?: string;
//   };
//   session: {
//     user?: {
//       id?: string;
//       email?: string;
//       role?: string;
//       name?: string;
//       image?: string;
//     };
//   };
// };
