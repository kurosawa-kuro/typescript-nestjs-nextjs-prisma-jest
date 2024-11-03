import { ClientSideApiService } from '../../src/services/ClientSideApiService';
import { ApiClient } from '../../src/services/apiClient';
import { UserDetails } from '../../src/types/user';

// ApiClient をモック化
jest.mock('../../src/services/apiClient');

describe('ClientSideApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call ApiClient.post with correct parameters', async () => {
      const mockLoginResponse = { token: 'test-token', user: { id: 1, email: 'test@example.com' } };
      (ApiClient.post as jest.Mock).mockResolvedValue(mockLoginResponse);

      const email = 'test@example.com';
      const password = 'password123';

      const result = await ClientSideApiService.login(email, password);

      expect(ApiClient.post).toHaveBeenCalledWith('/auth/login', { email, password });
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('logout', () => {
    it('should call ApiClient.post with correct parameters', async () => {
      await ClientSideApiService.logout();

      expect(ApiClient.post).toHaveBeenCalledWith('/auth/logout', {});
    });
  });

  describe('me', () => {
    it('should call ApiClient.get with correct parameters', async () => {
      const mockUserResponse = { id: 1, email: 'test@example.com' };
      (ApiClient.get as jest.Mock).mockResolvedValue(mockUserResponse);

      const result = await ClientSideApiService.me("test-token");

      expect(ApiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('updateAvatar', () => {
    it('should call ApiClient.put with correct parameters', async () => {
      const mockUserDetails = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: { avatarPath: 'new/avatar/path' },
        userRoles: ['user'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (ApiClient.put as jest.Mock).mockResolvedValue(mockUserDetails);

      const userId = 1;
      const formData = new FormData();
      formData.append('avatar', new Blob(['test']), 'test.jpg');

      const result = await ClientSideApiService.updateAvatar(userId, formData);

      expect(ApiClient.put).toHaveBeenCalledWith(
        `/users/${userId}/avatar`,
        formData,
        { rawBody: true }
      );
      expect(result).toEqual(mockUserDetails);
    });
  });

  describe('updateUserProfile', () => {
    it('should call ApiClient.put with correct parameters', async () => {
      const mockUserDetails: UserDetails = {
        id: 1,
        name: 'Updated User',
        email: 'updated@example.com',
        userRoles: ['user'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (ApiClient.put as jest.Mock).mockResolvedValue(mockUserDetails);

      const userId = 1;
      const updatedFields: Partial<UserDetails> = { name: 'Updated User' };

      const result = await ClientSideApiService.updateUserProfile(userId, updatedFields);

      expect(ApiClient.put).toHaveBeenCalledWith(`/users/${userId}`, updatedFields);
      expect(result).toEqual(mockUserDetails);
    });
  });

  describe('updateUserRoles', () => {
    it('should call ApiClient.put with correct parameters when adding roles', async () => {
      const mockUserDetails = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        userRoles: ['admin'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (ApiClient.put as jest.Mock).mockResolvedValue(mockUserDetails);

      const userId = 1;
      const roles = ['admin'];
      const action = 'add';

      const result = await ClientSideApiService.updateUserRoles(userId, roles, action);

      expect(ApiClient.put).toHaveBeenCalledWith(
        `/users/${userId}/roles`,
        { roles, action }
      );
      expect(result).toEqual(mockUserDetails);
    });

    it('should call ApiClient.put with correct parameters when removing roles', async () => {
      const mockUserDetails = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        userRoles: ['user'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (ApiClient.put as jest.Mock).mockResolvedValue(mockUserDetails);

      const userId = 1;
      const roles = ['admin'];
      const action = 'remove';

      const result = await ClientSideApiService.updateUserRoles(userId, roles, action);

      expect(ApiClient.put).toHaveBeenCalledWith(
        `/users/${userId}/roles`,
        { roles, action }
      );
      expect(result).toEqual(mockUserDetails);
    });
  });

  describe('followUser', () => {
    it('should call ApiClient.post with correct parameters', async () => {
      const mockUserDetails: UserDetails[] = [{
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        userRoles: ['user'],
        createdAt: new Date(),
        updatedAt: new Date()
      }];
      (ApiClient.post as jest.Mock).mockResolvedValue(mockUserDetails);

      const userId = 1;

      const result = await ClientSideApiService.followUser(userId);

      expect(ApiClient.post).toHaveBeenCalledWith(`/follow/${userId}`, {});
      expect(result).toEqual(mockUserDetails);
    });
  });

  describe('unfollowUser', () => {
    it('should call ApiClient.delete with correct parameters', async () => {
      const mockUserDetails: UserDetails[] = [{
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        userRoles: ['user'],
        createdAt: new Date(),
        updatedAt: new Date()
      }];
      (ApiClient.delete as jest.Mock).mockResolvedValue(mockUserDetails);

      const userId = 1;

      const result = await ClientSideApiService.unfollowUser(userId);

      expect(ApiClient.delete).toHaveBeenCalledWith(`/follow/${userId}`);
      expect(result).toEqual(mockUserDetails);
    });
  });

  describe('createMicroPost', () => {
    it('should call ApiClient.post with correct parameters', async () => {
      const mockResponse = { id: 1, title: 'Test Post' };
      (ApiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const formData = new FormData();
      formData.append('title', 'Test Post');
      formData.append('image', new Blob(['test']), 'test.jpg');

      const result = await ClientSideApiService.createMicroPost(formData);

      expect(ApiClient.post).toHaveBeenCalledWith('/microposts', formData, {
        rawBody: true,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createComment', () => {
    it('should call ApiClient.post with correct parameters', async () => {
      const mockResponse = { id: 1, content: 'Test Comment' };
      (ApiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const micropostId = 1;
      const content = 'Test Comment';

      const result = await ClientSideApiService.createComment(micropostId, content);

      expect(ApiClient.post).toHaveBeenCalledWith(`/microposts/${micropostId}/comments`, { content });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getComments', () => {
    it('should call ApiClient.get with correct parameters', async () => {
      const mockResponse = [{ id: 1, content: 'Test Comment' }];
      (ApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const micropostId = 1;

      const result = await ClientSideApiService.getComments(micropostId);

      expect(ApiClient.get).toHaveBeenCalledWith(`/microposts/${micropostId}/comments`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('like operations', () => {
    it('should call ApiClient.post when adding like', async () => {
      const mockResponse = { success: true };
      (ApiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const micropostId = 1;
      const result = await ClientSideApiService.addLike(micropostId);

      expect(ApiClient.post).toHaveBeenCalledWith(`/microposts/${micropostId}/likes`, {});
      expect(result).toEqual(mockResponse);
    });

    it('should call ApiClient.delete when removing like', async () => {
      const mockResponse = { success: true };
      (ApiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const micropostId = 1;
      const result = await ClientSideApiService.removeLike(micropostId);

      expect(ApiClient.delete).toHaveBeenCalledWith(`/microposts/${micropostId}/likes`);
      expect(result).toEqual(mockResponse);
    });

    it('should call ApiClient.get when getting like status', async () => {
      const mockResponse = { isLiked: true };
      (ApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const micropostId = 1;
      const result = await ClientSideApiService.getLikeStatus(micropostId);

      expect(ApiClient.get).toHaveBeenCalledWith(`/microposts/${micropostId}/likes`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMicropostDetails', () => {
    it('should call ApiClient.get with correct parameters', async () => {
      const mockResponse = { id: 1, title: 'Test Post', content: 'Test Content' };
      (ApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const micropostId = 1;
      const result = await ClientSideApiService.getMicropostDetails(micropostId);

      expect(ApiClient.get).toHaveBeenCalledWith(`/microposts/${micropostId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('exportUsers', () => {
    let mockURL: any;
    let mockDocument: any;
    
    beforeEach(() => {
      // Mock URL object
      mockURL = {
        createObjectURL: jest.fn().mockReturnValue('mock-url'),
        revokeObjectURL: jest.fn()
      };
      global.URL = mockURL;

      // Mock document
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn()
      };
      mockDocument = {
        createElement: jest.fn().mockReturnValue(mockLink),
        body: {
          appendChild: jest.fn()
        }
      };
      global.document = mockDocument;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle CSV export correctly', async () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' });
      (ApiClient.get as jest.Mock).mockResolvedValue(mockBlob);

      await ClientSideApiService.exportUsers();

      expect(ApiClient.get).toHaveBeenCalledWith('/users/export-csv', {
        responseType: 'blob'
      });
      expect(mockURL.createObjectURL).toHaveBeenCalled();
      // expect(mockDocument.body.appendChild).toHaveBeenCalled();
      // expect(mockURL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should clean up resources after export', async () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' });
      (ApiClient.get as jest.Mock).mockResolvedValue(mockBlob);

      await ClientSideApiService.exportUsers();

      expect(mockURL.revokeObjectURL).toHaveBeenCalled();   
    });
  });
});
