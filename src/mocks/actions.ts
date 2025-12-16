import type { BackendAccessJWT, UserObject } from 'next-auth';

import { AxiosResponse } from 'axios';
import jwt from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';

import apiServer from '../lib/axiosServerInstance';

/**
 * Log in a user by sending a POST request to the backend using the supplied credentials.
 */
// export async function login(
//   email: string,
//   password: string
// ): Promise<Response> {
//   console.debug("Logging in");

//   if (!email) {
//     throw new Error("Email is required");
//   }
//   if (!password) {
//     throw new Error("Password is required");
//   }

//   // Simular dados do usuário após validação
//   const userData: UserObject = {
//     id: "1",
//     email: email,
//     name: "Test User",
//     roles: ["user"],
//     first_name: "Test",
//     last_name: "User",
//     permissions: {
//       read: ["profile", "settings"],
//       write: ["profile"],
//     },
//   };

//   // Dummy data to simulate a successful login
//   const mock_data: BackendJWT = {
//     accessToken: create_accessToken(userData),
//     refreshToken: create_refreshToken(userData),
//   };

//   return new Response(JSON.stringify(mock_data), {
//     status: 200,
//     statusText: "OK",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
// }

/**
 * Refresh the access token by sending the refresh token.
 */
export async function refresh(tokens: {
  accessToken: string;
  refreshToken: string;
}): Promise<AxiosResponse<BackendAccessJWT, any>> {
  console.warn('Refreshing token');

  // Verify that the token is valid and not expired
  try {
    if (!tokens) {
      return Promise.reject({
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: { error: 'Refresh token expired' },
        },
      });
    }
    const decoded = jwtDecode(tokens.accessToken) as UserObject & {
      exp: number;
    };

    // Verificar se o token expirou
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return Promise.reject({
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: { error: 'Refresh token expired' },
        },
      });
    }

    // Criar novo access token com os dados do usuário
    const newAccessToken = await apiServer.post<{
      accessToken: string;
      refreshToken: string;
    }>(tokens.refreshToken);

    return newAccessToken;
  } catch (err) {
    console.error(`Refresh token expired:`, err);
    return Promise.reject({
      response: {
        status: 401,
        statusText: 'Unauthorized',
        data: { error: 'Refresh token expired' },
      },
    });
  }
}

// Função utilitária para decodificar tokens (aqui você pode usar jwt-decode)
export const decodeToken = (token: string) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Função utilitária para verificar se token expirou
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};
