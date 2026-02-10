import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import api from '@/services/api';

vi.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('request interceptor', () => {
    it('adds authorization header when token exists', () => {
      localStorage.setItem('accessToken', 'mock-token');

      const config = {
        headers: {},
      };

      // Access the request interceptor
      const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
      const modifiedConfig = requestInterceptor(config);

      expect(modifiedConfig.headers.Authorization).toBe('Bearer mock-token');
    });

    it('does not add authorization header when token does not exist', () => {
      const config = {
        headers: {},
      };

      const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
      const modifiedConfig = requestInterceptor(config);

      expect(modifiedConfig.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor', () => {
    it('returns response on success', async () => {
      const mockResponse = { data: { success: true } };

      const responseInterceptor = (api.interceptors.response as any).handlers[0].fulfilled;
      const result = responseInterceptor(mockResponse);

      expect(result).toBe(mockResponse);
    });

    it('attempts token refresh on 401 error', async () => {
      const mockError = {
        response: {
          status: 401,
        },
        config: {
          headers: {},
        },
      };

      localStorage.setItem('refreshToken', 'mock-refresh-token');

      const mockRefreshResponse = {
        data: {
          data: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          },
        },
      };

      vi.spyOn(axios, 'post').mockResolvedValue(mockRefreshResponse);
      vi.spyOn(api, 'request').mockResolvedValue({ data: { success: true } });

      const responseInterceptor = (api.interceptors.response as any).handlers[0].rejected;
      await responseInterceptor(mockError);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh'),
        { refreshToken: 'mock-refresh-token' }
      );
      expect(localStorage.getItem('accessToken')).toBe('new-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
    });

    it('does not retry if request already has X-Retry header', async () => {
      const mockError = {
        response: {
          status: 401,
        },
        config: {
          headers: {
            'X-Retry': 'true',
          },
        },
      };

      const responseInterceptor = (api.interceptors.response as any).handlers[0].rejected;

      await expect(responseInterceptor(mockError)).rejects.toEqual(mockError);
    });

    it('redirects to signin and clears tokens when refresh fails', async () => {
      const mockError = {
        response: {
          status: 401,
        },
        config: {
          headers: {},
        },
      };

      localStorage.setItem('refreshToken', 'mock-refresh-token');
      localStorage.setItem('accessToken', 'old-token');

      vi.spyOn(axios, 'post').mockRejectedValue(new Error('Refresh failed'));

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;

      const responseInterceptor = (api.interceptors.response as any).handlers[0].rejected;

      try {
        await responseInterceptor(mockError);
      } catch (error) {
        // Expected to reject
      }

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(window.location.href).toBe('/signin');
    });

    it('does not attempt refresh when no refresh token exists', async () => {
      const mockError = {
        response: {
          status: 401,
        },
        config: {
          headers: {},
        },
      };

      const responseInterceptor = (api.interceptors.response as any).handlers[0].rejected;

      await expect(responseInterceptor(mockError)).rejects.toEqual(mockError);
    });

    it('rejects non-401 errors without refresh attempt', async () => {
      const mockError = {
        response: {
          status: 500,
        },
        config: {
          headers: {},
        },
      };

      const responseInterceptor = (api.interceptors.response as any).handlers[0].rejected;

      await expect(responseInterceptor(mockError)).rejects.toEqual(mockError);
    });
  });
});
