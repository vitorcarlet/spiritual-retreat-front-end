import { getSession } from "next-auth/react";

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
  baseUrl?: string;
  params?: Record<string, unknown>;
  getAccessToken?: () => Promise<string | undefined>;
}

function buildUrlWithParams(
  baseUrl: string,
  params?: Record<string, unknown>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, String(v)));
      return;
    }

    url.searchParams.set(key, String(value));
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

let globalAccessTokenResolver: (() => Promise<string | undefined>) | undefined;

export const setClientAccessTokenResolver = (
  resolver?: () => Promise<string | undefined>
) => {
  globalAccessTokenResolver = resolver;
};

async function resolveAccessToken(
  requireAuth: boolean,
  getAccessToken?: () => Promise<string | undefined>
): Promise<string | undefined> {
  if (!requireAuth) {
    return undefined;
  }
  if (getAccessToken) {
    return getAccessToken();
  }
  if (globalAccessTokenResolver) return globalAccessTokenResolver();

  const session = await getSession();

  const token =
    (session as { tokens?: { accessToken?: string } } | null | undefined)
      ?.tokens?.accessToken ||
    (session as { accessToken?: string } | null | undefined)?.accessToken;

  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
}

export async function sendRequestClientVanillaFn(
  endpoint: string,
  options: ApiOptions = {}
): Promise<Response> {
  const {
    requireAuth = true,
    baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    headers = {},
    params,
    getAccessToken,
    ...fetchOptions
  } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  if (params) {
    url = buildUrlWithParams(url, params);
  }

  const defaultHeaders = new Headers({
    "Content-Type": "application/json",
    ...headers,
  });

  const token = await resolveAccessToken(requireAuth, getAccessToken);

  if (token && !defaultHeaders.get('Authorization')) {
    defaultHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: defaultHeaders,
  });

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
      // ignore parsing errors
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

export const sendRequestClientVanilla = {
  get: (endpoint: string, options?: ApiOptions) =>
    sendRequestClientVanillaFn(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, data?: unknown, options?: ApiOptions) =>
    sendRequestClientVanillaFn(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (endpoint: string, data?: unknown, options?: ApiOptions) =>
    sendRequestClientVanillaFn(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: (endpoint: string, data?: unknown, options?: ApiOptions) =>
    sendRequestClientVanillaFn(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options?: ApiOptions) =>
    sendRequestClientVanillaFn(endpoint, { ...options, method: "DELETE" }),
};

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
