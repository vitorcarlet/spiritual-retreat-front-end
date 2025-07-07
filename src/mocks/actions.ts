import type { UserObject, BackendJWT, BackendAccessJWT } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken"; // Use import ao invés de require
import { AxiosResponse } from "axios";

// Dummy secret salt for signing tokens
const SECRET_SIGNING_SALT = "super-secret-salt";

/**
 * Log in a user by sending a POST request to the backend using the supplied credentials.
 */
export async function login(
  email: string,
  password: string
): Promise<Response> {
  console.debug("Logging in");

  if (!email) {
    throw new Error("Email is required");
  }
  if (!password) {
    throw new Error("Password is required");
  }

  // Simular dados do usuário após validação
  const userData: UserObject = {
    id: "1",
    email: email,
    name: "Test User",
    roles: ["user"],
    first_name: "Test",
    last_name: "User",
    permissions: {
      read: ["profile", "settings"],
      write: ["profile"],
    },
  };

  // Dummy data to simulate a successful login
  const mock_data: BackendJWT = {
    access_token: create_access_token(userData),
    refresh_token: create_refresh_token(userData),
  };

  return new Response(JSON.stringify(mock_data), {
    status: 200,
    statusText: "OK",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Refresh the access token by sending the refresh token.
 */
export async function refresh(
  token: string
): Promise<AxiosResponse<BackendAccessJWT, any>> {
  console.debug("Refreshing token");

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
    const decoded = jwt.verify(token, SECRET_SIGNING_SALT) as UserObject;

    // Criar novo access token com os dados do usuário
    const newAccessToken = create_access_token(decoded);

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
export const create_access_token = (user: UserObject): string => {
  return jwt.sign(
    {
      ...user,
      jti: uuidv4(),
      type: "access",
    },
    SECRET_SIGNING_SALT,
    {
      algorithm: "HS256", // HS256 é mais comum que HS384
      expiresIn: "15m", // 15 minutos é mais realista
    }
  );
};

// Função para criar refresh token
export const create_refresh_token = (user: UserObject): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      jti: uuidv4(),
      type: "refresh",
    },
    SECRET_SIGNING_SALT,
    {
      algorithm: "HS256",
      expiresIn: "7d", // 7 dias é mais realista para refresh tokens
    }
  );
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
