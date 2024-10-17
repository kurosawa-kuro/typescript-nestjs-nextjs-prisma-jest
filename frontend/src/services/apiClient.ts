const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

type RequestOptions = RequestInit & { useNoStore?: boolean };

async function request<T>(method: string, endpoint: string, options?: RequestOptions): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options?.headers },
    cache: options?.useNoStore ? 'no-store' : undefined,
  };

  const response = await fetch(url, {
    ...mergedOptions,
    cache: mergedOptions.cache as RequestCache | undefined
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const ApiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>('GET', endpoint, options),
  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) => 
    request<T>('POST', endpoint, { ...options, body: JSON.stringify(body) }),
};