import { auth } from "@/auth";

/* Se RequestResponse já existir em outro arquivo, remova esta interface duplicada */
export interface RequestResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
  baseUrl?: string;
  params?: Record<string, any>;
  /**
   * Dados a serem serializados em JSON no corpo (atalho para body: JSON.stringify(data))
   */
  data?: any;
  /**
   * Desabilita tentativa de parse automático em JSON
   */
  raw?: boolean;
}

/** Monta URL com query params */
function buildUrlWithParams(baseUrl: string, params?: Record<string, any>) {
  if (!params || Object.keys(params).length === 0) return baseUrl;
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v))
      v.forEach((vv) => url.searchParams.append(k, String(vv)));
    else url.searchParams.set(k, String(v));
  });
  return url.toString();
}

/**
 * Função ÚNICA que junta (antes) sendRequestServerVanillaFn + handleApiResponse.
 * Faz a requisição, adiciona auth opcional, trata erro e retorna objeto estruturado.
 */
export async function requestServerFn<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<RequestResponse<T>> {
  const {
    requireAuth = false,
    baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    headers,
    params,
    data,
    raw = false,
    method = "GET",
    body, // caso já venha definido
    ...rest
  } = options;

  try {
    // URL completa
    let url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;
    if (params) url = buildUrlWithParams(url, params);

    // Headers
    const finalHeaders = new Headers({
      "Content-Type": "application/json",
      ...headers,
    });

    // Auth
    if (requireAuth) {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          error: "Authentication required",
          status: 401,
        };
      }
      finalHeaders.set(
        "Authorization",
        `Bearer ${session.tokens.accessToken}`
      );
    }

    // Corpo (prioridade para body explícito)
    const finalBody =
      body !== undefined
        ? body
        : data !== undefined
          ? JSON.stringify(data)
          : undefined;

    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
      ...rest,
    });

    const status = response.status;

    if (!response.ok) {
      // Tenta extrair erro JSON ou texto simples
      let errorMessage: string | undefined;
      try {
        const errJson = await response.json();
        errorMessage =
          errJson?.message ||
          errJson?.error ||
          `HTTP Error: ${response.status}`;
      } catch {
        errorMessage = `HTTP Error: ${response.status}`;
      }
      return { success: false, error: errorMessage, status };
    }

    if (raw) {
      // Retorno sem parse (ex: blobs / streams — adapte conforme necessidade)
      return { success: true, data: undefined as unknown as T, status };
    }

    let parsed: any;
    try {
      parsed = await response.json();
    } catch {
      parsed = undefined;
    }

    return { success: true, data: parsed as T, status };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
      status: 0,
    };
  }
}

/* Atalhos convenientes preservando assinatura anterior */
export const requestServer = {
  get: <T>(endpoint: string, options?: Omit<ApiOptions, "method">) =>
    requestServerFn<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(
    endpoint: string,
    data?: any,
    options?: Omit<ApiOptions, "method" | "data">
  ) => requestServerFn<T>(endpoint, { ...options, method: "POST", data }),
  put: <T>(
    endpoint: string,
    data?: any,
    options?: Omit<ApiOptions, "method" | "data">
  ) => requestServerFn<T>(endpoint, { ...options, method: "PUT", data }),
  patch: <T>(
    endpoint: string,
    data?: any,
    options?: Omit<ApiOptions, "method" | "data">
  ) => requestServerFn<T>(endpoint, { ...options, method: "PATCH", data }),
  delete: <T>(endpoint: string, options?: Omit<ApiOptions, "method">) =>
    requestServerFn<T>(endpoint, { ...options, method: "DELETE" }),
};

// Exporta como padrão a função principal
export default requestServer;
