const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const ApiClient = {
  request: async <T>(method: string, endpoint: string, body?: unknown): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  get: <T>(endpoint: string, p0: { headers: { Authorization: string; 'Content-Type': string; }; }) => ApiClient.request<T>('GET', endpoint),
  post: <T>(endpoint: string, body: unknown) => ApiClient.request<T>('POST', endpoint, body),
};
