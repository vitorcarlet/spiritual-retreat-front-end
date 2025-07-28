import { auth } from "@/auth";

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
  baseUrl?: string;
}

/**
 * Wrapper customizado do fetch para Server Actions/Components
 */
export async function sendRequestServerVanillaFn(
  endpoint: string,
  options: ApiOptions = {}
): Promise<Response> {
  const {
    requireAuth = false,
    baseUrl = process.env.API_BASE_URL || "http://localhost:3000",
    headers = {},
    ...fetchOptions
  } = options;

  // Construir URL completa
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  // Headers padrão
  const defaultHeaders = new Headers({
    "Content-Type": "application/json",
    ...headers,
  });

  // Adicionar token se necessário
  if (requireAuth) {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Adicionar token do usuário autenticado
    defaultHeaders.append(
      "Authorization",
      `Bearer ${session.tokens.access_token}`
    );
  }

  // Fazer a requisição
  const response = await fetch(url, {
    ...fetchOptions,
    headers: defaultHeaders,
  });

  // Log para debug (remover em produção)
  console.log(`🌐 API Call: ${fetchOptions.method || "GET"} ${url}`, {
    status: response.status,
    requireAuth,
  });

  return response;
}

/**
 * Helpers específicos para diferentes métodos HTTP
 */
export const sendRequestServerVanilla = {
  get: (endpoint: string, options?: ApiOptions) =>
    sendRequestServerVanillaFn(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, data?: any, options?: ApiOptions) =>
    sendRequestServerVanillaFn(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (endpoint: string, data?: any, options?: ApiOptions) =>
    sendRequestServerVanillaFn(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options?: ApiOptions) =>
    sendRequestServerVanillaFn(endpoint, { ...options, method: "DELETE" }),

  patch: (endpoint: string, data?: any, options?: ApiOptions) =>
    sendRequestServerVanillaFn(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
};

/**
 * Helper para lidar com respostas da API
 */
export async function handleApiResponse<T = any>(
  response: Response
): Promise<{
  data?: T;
  error?: string;
  success: boolean;
}> {
  try {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
