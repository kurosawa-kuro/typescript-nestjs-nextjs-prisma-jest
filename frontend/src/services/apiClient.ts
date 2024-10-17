const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const ApiClient = {
  request: async <T>(
    method: string, 
    endpoint: string, 
    options?: RequestInit & { useNoStore?: boolean }
  ): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options?.headers,
      },
    };

    // Add cache: 'no-store' if useNoStore flag is true
    if (options?.useNoStore) {
      mergedOptions.cache = 'no-store';
    }

    const response = await fetch(url, mergedOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  get: <T>(endpoint: string, options?: RequestInit & { useNoStore?: boolean }) => 
    ApiClient.request<T>('GET', endpoint, options),
  post: <T>(endpoint: string, body: unknown, options?: RequestInit & { useNoStore?: boolean }) => 
    ApiClient.request<T>('POST', endpoint, { ...options, body: JSON.stringify(body) }),
};
