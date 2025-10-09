import { auth } from "@/auth";

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
  baseUrl?: string;
  params?: Record<string, any>;
}

/**
 * Helper function to build URL with query parameters
 */
function buildUrlWithParams(
  baseUrl: string,
  params?: Record<string, any>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Handle arrays (for multiple values)
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  });

  return url.toString();
}

export class HttpError extends Error {
  status: number;
  statusText: string;
  url: string;
  body?: unknown;
  constructor(
    message: string,
    init: { status: number; statusText: string; url: string; body?: unknown }
  ) {
    super(message);
    this.name = "HttpError";
    this.status = init.status;
    this.statusText = init.statusText;
    this.url = init.url;
    this.body = init.body;
  }
}

export async function sendRequestServerVanillaFn(
  endpoint: string,
  options: ApiOptions = {}
): Promise<Response> {
  const {
    requireAuth = true,
    baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    headers = {},
    params,
    ...fetchOptions
  } = options;

  // Construir URL completa
  let url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  // Add query parameters if provided
  if (params) {
    url = buildUrlWithParams(url, params);
  }

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
  console.log(`API Request: ${fetchOptions.method || "GET"} ${url}`);

  // Lança erro para qualquer status não-2xx (inclui 404)
  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    let body: unknown = undefined;

    try {
      if (contentType.includes("application/json")) {
        body = await response.clone().json();
      } else {
        body = await response.clone().text();
      }
    } catch {
      // ignore parse errors
    }

    throw new HttpError(`HTTP ${response.status} ${response.statusText}`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url || url,
      body,
    });
  }

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
export async function handleApiResponse<T = unknown>(
  response: Response
): Promise<RequestResponse<T>> {
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

export function handleApiPromise<T = unknown>(
  promise: Promise<T>
): Promise<{
  data?: T;
  error?: string;
  success: boolean;
}> {
  return promise.then();
}
