const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export class ApiClient {
  private static async request<T>(
    method: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers);

    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      method,
      headers,
      credentials: 'include',
      cache: 'no-store',
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error in ${method} request to ${endpoint}:`, error);
      throw error;
    }
  }

  static async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>('GET', endpoint, options);
  }

  static async post<T>(endpoint: string, body: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>('POST', endpoint, { ...options, body: JSON.stringify(body) });
  }

  static async postFormData<T>(endpoint: string, formData: FormData, options: RequestInit = {}): Promise<T> {
    return this.request<T>('POST', endpoint, { ...options, body: formData });
  }
}