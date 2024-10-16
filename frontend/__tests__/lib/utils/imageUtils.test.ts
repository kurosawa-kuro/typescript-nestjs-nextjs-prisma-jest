import { ImageUtils } from '../../../src/app/lib/utils/imageUtils';

describe('ImageUtils.getPreviewUrl', () => {
  const originalURL = global.URL;
  const mockCreateObjectURL = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    // Create a mock URL class that matches the structure of the real URL class
    class MockURL {
      static createObjectURL = mockCreateObjectURL;
      static revokeObjectURL = jest.fn();
      static canParse = jest.fn();
    }
    global.URL = MockURL as unknown as typeof global.URL;
  });

  afterEach(() => {
    global.URL = originalURL;
  });

  it('should return object URL when file is provided and URL.createObjectURL is available', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    mockCreateObjectURL.mockReturnValue('blob:http://example.com/1234-5678');

    const result = ImageUtils.getPreviewUrl(mockFile);

    expect(result).toBe('blob:http://example.com/1234-5678');
    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockFile);
  });

  it('should return dummy URL when file is null', () => {
    const result = ImageUtils.getPreviewUrl(null);

    expect(result).toBe('/dummy-image-url.jpg');
    expect(mockCreateObjectURL).not.toHaveBeenCalled();
  });
});