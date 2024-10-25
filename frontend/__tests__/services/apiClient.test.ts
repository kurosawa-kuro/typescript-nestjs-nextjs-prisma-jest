import { ApiClient, serverRequest } from '../../src/services/apiClient';

// Mock the global fetch function
global.fetch = jest.fn();

describe('ApiClient', () => {
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
