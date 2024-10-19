const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

type RequestOptions = RequestInit & { useCache?: boolean; rawBody?: boolean };

async function request<T>(method: string, endpoint: string, options?: RequestOptions): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    cache: 'no-store',
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options?.headers } as Record<string, string>,
    cache: options?.useCache ? undefined : 'no-store',
  };

  // rawBody オプションが true の場合、body をそのまま使用
  if (options?.rawBody && options.body instanceof FormData) {
    delete (mergedOptions.headers as Record<string, string>)['Content-Type'];
  } else if (typeof options?.body === 'object' && !(options?.body instanceof FormData)) {
    mergedOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, mergedOptions as RequestInit);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const ApiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>('GET', endpoint, options),
  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) => 
    request<T>('POST', endpoint, { ...options, body: body as BodyInit }),
  put: <T>(endpoint: string, body: unknown, options?: RequestOptions) => 
    request<T>('PUT', endpoint, { ...options, body: body as BodyInit }),
};

// Add this new function for server-side requests
export async function serverRequest<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  return request<T>(method, endpoint, body ? { body: JSON.stringify(body) } : undefined);
}
