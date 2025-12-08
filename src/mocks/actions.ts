import type { UserObject, BackendAccessJWT } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken"; // Use import ao invés de require
import { AxiosResponse } from "axios";
import { SignJWT } from "jose";
import { jwtDecode } from "jwt-decode";

// Dummy secret salt for signing tokens
const SECRET_SIGNING_SALT = new TextEncoder().encode("super-secret-salt");
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
//     access_token: create_access_token(userData),
//     refresh_token: create_refresh_token(userData),
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
export async function refresh(
  token: string
): Promise<AxiosResponse<BackendAccessJWT, any>> {
  console.warn("Refreshing token");

  // Verify that the token is valid and not expired
  try {
    if (!token) {
      return Promise.reject({
        response: {
          status: 401,
          statusText: "Unauthorized",
          data: { error: "Refresh token expired" },
        },
      });
    }
    const decoded = jwtDecode(token) as UserObject & { exp: number };

    // Verificar se o token expirou
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return Promise.reject({
        response: {
          status: 401,
          statusText: "Unauthorized",
          data: { error: "Refresh token expired" },
        },
      });
    }

    // Criar novo access token com os dados do usuário
    const newAccessToken = await create_access_token(decoded);

    const mockResponse: BackendAccessJWT = {
      access_token: newAccessToken,
    };

    // Simular resposta do axios
    return {
      data: mockResponse,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
      request: {},
    } as AxiosResponse<BackendAccessJWT>;
  } catch (err) {
    console.error(`Refresh token expired:`, err);
    return Promise.reject({
      response: {
        status: 401,
        statusText: "Unauthorized",
        data: { error: "Refresh token expired" },
      },
    });
  }
}
// Função para criar access token
export const create_access_token = async (
  user: UserObject
): Promise<string> => {
  const sanitizedUser: Record<string, unknown> = {
    ...(user as unknown as Record<string, unknown>),
  };
  delete sanitizedUser.exp;
  delete sanitizedUser.iat;
  delete sanitizedUser.nbf;
  delete sanitizedUser.aud;
  delete sanitizedUser.iss;

  return new SignJWT({
    ...sanitizedUser,
    jti: uuidv4(),
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(SECRET_SIGNING_SALT);
};

export const create_refresh_token = async (
  user: UserObject
): Promise<string> => {
  return new SignJWT({
    id: user.id,
    email: user.email,
    jti: uuidv4(),
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET_SIGNING_SALT);
};

// Função utilitária para decodificar tokens (aqui você pode usar jwt-decode)
export const decodeToken = (token: string) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
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
