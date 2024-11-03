const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

type RequestOptions = RequestInit & { 
  useCache?: boolean; 
  rawBody?: boolean; 
  params?: Record<string, string | undefined>;
  skipAuth?: boolean;
  responseType?: 'json' | 'blob';
};

// トークン関連の処理を集約
function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') {
    /* istanbul ignore next */
    {
      // Server-side
      const { cookies } = require('next/headers');
      return cookies().get('jwt')?.value;
    }
  } else {
    // Client-side
    /* istanbul ignore next */
    const jwt = document.cookie.split('; ').find(row => row.startsWith('jwt='));
    return jwt ? jwt.split('=')[1] : undefined;
  }
}

function getAuthHeaders(skipAuth?: boolean): Record<string, string> {
  if (skipAuth) return {};
  
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(method: string, endpoint: string, options?: RequestOptions): Promise<T> {
  let url = `${API_BASE_URL}${endpoint}`;

  if (options?.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value);
      }
    });
    url += `?${searchParams.toString()}`;
  }

  const defaultOptions: RequestInit = {
    method,
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders(options?.skipAuth),
    },
    credentials: 'include',
    cache: 'no-store',
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options?.headers } as Record<string, string>,
    cache: options?.useCache ? undefined : 'no-store',
  };

  if (options?.rawBody && options.body instanceof FormData) {
    delete (mergedOptions.headers as Record<string, string>)['Content-Type'];
  } else if (typeof options?.body === 'object' && !(options?.body instanceof FormData)) {
    mergedOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, mergedOptions as RequestInit);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (options?.responseType === 'blob') {
    return response.blob() as Promise<T>;
  }
  
  return response.json();
}

export const ApiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>('GET', endpoint, options),
  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) => 
    request<T>('POST', endpoint, { ...options, body: body as BodyInit }),
  put: <T>(endpoint: string, body: unknown, options?: RequestOptions) => 
    request<T>('PUT', endpoint, { ...options, body: body as BodyInit }),
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>('DELETE', endpoint, options),
};

export async function serverRequest<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  return request<T>(method, endpoint, body ? { body: JSON.stringify(body) } : undefined);
}
