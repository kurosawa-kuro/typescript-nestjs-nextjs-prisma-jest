import { ApiClient, serverRequest } from '../../src/services/apiClient';

// Mock the global fetch function
global.fetch = jest.fn();

// next/headers のモックを修正
const mockGet = jest.fn();
const mockCookies = jest.fn();

// モックの設定を変更
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: mockGet
  })
}));

describe('ApiClient', () => {
  let originalWindow: any;

  beforeAll(() => {
    originalWindow = global.window;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks
    mockGet.mockImplementation((name) => name === 'jwt' ? { value: 'server-token' } : undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.window = originalWindow;
  });

  const setupMockFetch = (mockResponse: any) => {
    const mockJsonPromise = Promise.resolve(mockResponse);
    const mockFetchPromise = Promise.resolve({
      ok: true,
      json: () => mockJsonPromise,
    });
    (global.fetch as jest.Mock).mockImplementation(() => mockFetchPromise);
  };

  describe('POST requests', () => {
    it('should make a successful POST request', async () => {
      const mockResponse = { data: 'test data' };
      setupMockFetch(mockResponse);

      const endpoint = '/test-endpoint';
      const body = { key: 'value' };

      const result = await ApiClient.post(endpoint, body);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/test-endpoint',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
          cache: 'no-store',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should remove Content-Type header when sending FormData with rawBody option', async () => {
      const mockResponse = { data: 'test data' };
      setupMockFetch(mockResponse);

      const endpoint = '/test-endpoint';
      const formData = new FormData();
      formData.append('key', 'value');

      const result = await ApiClient.post(endpoint, formData, { rawBody: true });

      const calledOptions = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(calledOptions.headers).not.toHaveProperty('Content-Type');
      expect(calledOptions.body).toBe(formData);
      expect(result).toEqual(mockResponse);
    });

    it('should keep Content-Type header when sending FormData without rawBody option', async () => {
      const mockResponse = { data: 'test data' };
      setupMockFetch(mockResponse);

      const endpoint = '/test-endpoint';
      const formData = new FormData();
      formData.append('key', 'value');

      const result = await ApiClient.post(endpoint, formData);

      const calledOptions = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(calledOptions.headers).toHaveProperty('Content-Type', 'application/json');
      expect(calledOptions.body).toBe(formData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('GET requests', () => {
    it('should make a successful GET request', async () => {
      const mockResponse = { data: 'test data' };
      setupMockFetch(mockResponse);

      const endpoint = '/test-endpoint';
      const result = await ApiClient.get(endpoint);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/test-endpoint',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          cache: 'no-store',
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('PUT requests', () => {
    it('should make a successful PUT request', async () => {
      const mockResponse = { data: 'updated data' };
      setupMockFetch(mockResponse);

      const endpoint = '/test-endpoint';
      const body = { key: 'updated value' };

      const result = await ApiClient.put(endpoint, body);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/test-endpoint',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
          cache: 'no-store',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should remove Content-Type header when sending FormData with rawBody option for PUT request', async () => {
      const mockResponse = { data: 'updated data' };
      setupMockFetch(mockResponse);

      const endpoint = '/test-endpoint';
      const formData = new FormData();
      formData.append('key', 'updated value');

      const result = await ApiClient.put(endpoint, formData, { rawBody: true });

      const calledOptions = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(calledOptions.headers).not.toHaveProperty('Content-Type');
      expect(calledOptions.body).toBe(formData);
      expect(result).toEqual(mockResponse);
    });
  });

  it('should throw an error for non-OK HTTP response', async () => {
    const mockFetchPromise = Promise.resolve({
      ok: false,
      status: 404,
    });
    (global.fetch as jest.Mock).mockImplementation(() => mockFetchPromise);

    const endpoint = '/test-endpoint';

    await expect(ApiClient.get(endpoint)).rejects.toThrow('HTTP error! status: 404');
  });

  describe('Authentication', () => {
    

    describe('Client-side', () => {
      beforeEach(() => {
        global.window = {
          document: {
            cookie: 'jwt=client-token; other=value',
          },
        } as any;
      });

      it('should get auth token from client-side cookies', async () => {
        const mockResponse = { data: 'test data' };
        setupMockFetch(mockResponse);

        await ApiClient.get('/test-endpoint');
        const calls = (global.fetch as jest.Mock).mock.calls;
        const headers = calls[0][1].headers;
        expect(headers).toHaveProperty('Content-Type', 'application/json');
        expect(headers).toHaveProperty('Authorization', 'Bearer client-token');
      });

      it('should handle missing jwt cookie', async () => {
        global.window.document.cookie = 'other=value';
        const mockResponse = { data: 'test data' };
        setupMockFetch(mockResponse);

        await ApiClient.get('/test-endpoint');

        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.not.objectContaining({
              'Authorization': expect.any(String),
            }),
          })
        );
      });

      it('should handle empty cookie string', async () => {
        global.window.document.cookie = '';
        const mockResponse = { data: 'test data' };
        setupMockFetch(mockResponse);

        await ApiClient.get('/test-endpoint');

        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.not.objectContaining({
              'Authorization': expect.any(String),
            }),
          })
        );
      });
    });

    it('should skip auth token when skipAuth option is true', async () => {
      const mockResponse = { data: 'test data' };
      setupMockFetch(mockResponse);

      await ApiClient.get('/test-endpoint', { skipAuth: true });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });
  });
});

describe('serverRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupMockFetch = (mockResponse: any) => {
    const mockJsonPromise = Promise.resolve(mockResponse);
    const mockFetchPromise = Promise.resolve({
      ok: true,
      json: () => mockJsonPromise,
    });
    (global.fetch as jest.Mock).mockImplementation(() => mockFetchPromise);
  };

  it('should make a successful GET request', async () => {
    const mockResponse = { data: 'server data' };
    setupMockFetch(mockResponse);

    const endpoint = '/server-endpoint';
    const result = await serverRequest('GET', endpoint);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/server-endpoint',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should make a successful POST request with body', async () => {
    const mockResponse = { data: 'server post data' };
    setupMockFetch(mockResponse);

    const endpoint = '/server-endpoint';
    const body = { key: 'server value' };
    const result = await serverRequest('POST', endpoint, body);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/server-endpoint',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
        cache: 'no-store',
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should throw an error for non-OK HTTP response', async () => {
    const mockFetchPromise = Promise.resolve({
      ok: false,
      status: 500,
    });
    (global.fetch as jest.Mock).mockImplementation(() => mockFetchPromise);

    const endpoint = '/server-endpoint';

    await expect(serverRequest('GET', endpoint)).rejects.toThrow('HTTP error! status: 500');
  });
});
