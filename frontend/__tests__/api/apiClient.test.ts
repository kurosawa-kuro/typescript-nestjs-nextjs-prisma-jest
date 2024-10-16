import { ApiClient } from '../../src/app/services/apiClient';

// Mock the global fetch function
global.fetch = jest.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should make a successful POST request', async () => {
    // Mock data
    const mockResponse = { data: 'test data' };
    const mockJsonPromise = Promise.resolve(mockResponse);
    const mockFetchPromise = Promise.resolve({
      ok: true,
      json: () => mockJsonPromise,
    });
    (global.fetch as jest.Mock).mockImplementation(() => mockFetchPromise);

    // Test data
    const endpoint = '/test-endpoint';
    const body = { key: 'value' };

    // Make the API call
    const result = await ApiClient.post(endpoint, body);

    // Assertions
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/test-endpoint',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
        body: JSON.stringify(body),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should handle FormData correctly', async () => {
    // Mock data
    const mockResponse = { data: 'test data' };
    const mockJsonPromise = Promise.resolve(mockResponse);
    const mockFetchPromise = Promise.resolve({
      ok: true,
      json: () => mockJsonPromise,
    });
    (global.fetch as jest.Mock).mockImplementation(() => mockFetchPromise);

    // Test data
    const endpoint = '/test-endpoint';
    const formData = new FormData();
    formData.append('key', 'value');

    // Make the API call
    const result = await ApiClient.postFormData(endpoint, formData);

    // Assertions
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/test-endpoint',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
        body: formData,
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should make a successful GET request', async () => {
    const mockResponse = { data: 'test data' };
    const mockJsonPromise = Promise.resolve(mockResponse);
    const mockFetchPromise = Promise.resolve({
      ok: true,
      json: () => mockJsonPromise,
    });
    (global.fetch as jest.Mock).mockImplementation(() => mockFetchPromise);

    const endpoint = '/test-endpoint';
    const result = await ApiClient.get(endpoint);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/test-endpoint',
      expect.objectContaining({
        method: 'GET',
        headers: expect.any(Headers),
      })
    );
    expect(result).toEqual(mockResponse);
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

  // it('should throw and log an error for network failure', async () => {
  //   const networkError = new Error('Network error');
  //   (global.fetch as jest.Mock).mockRejectedValue(networkError);

  //   const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

  //   const endpoint = '/test-endpoint';

  //   await expect(ApiClient.get(endpoint)).rejects.toThrow('Network error');
    
  //   // Check if console.error was called
  //   expect(consoleSpy).toHaveBeenCalled();
    
  //   // Check if the error message contains the expected information
  //   const errorCall = consoleSpy.mock.calls[0];
  //   expect(errorCall[0]).toContain('Error in GET request to /test-endpoint:');
  //   expect(errorCall[1]).toBe(networkError);

  //   consoleSpy.mockRestore();
  // });
});