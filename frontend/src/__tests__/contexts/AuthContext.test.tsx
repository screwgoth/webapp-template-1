import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import * as authService from '@/services/auth.service';
import * as userService from '@/services/user.service';
import { mockAuthResponse, mockUser, mockLoginCredentials, mockRegisterData } from '../mocks';

vi.mock('@/services/auth.service');
vi.mock('@/services/user.service');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      spy.mockRestore();
    });

    it('returns auth context when used within AuthProvider', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('refreshUser');
    });
  });

  describe('initial state', () => {
    it('starts with null user and loading false when no token exists', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });

    it('fetches user data when token exists', async () => {
      localStorage.setItem('accessToken', 'mock-token');
      vi.spyOn(userService, 'getCurrentUser').mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(userService.getCurrentUser).toHaveBeenCalled();
    });

    it('clears tokens when user fetch fails', async () => {
      localStorage.setItem('accessToken', 'invalid-token');
      localStorage.setItem('refreshToken', 'invalid-refresh');
      vi.spyOn(userService, 'getCurrentUser').mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe('login', () => {
    it('logs in successfully and stores tokens', async () => {
      vi.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.login(mockLoginCredentials);

      expect(authService.login).toHaveBeenCalledWith(mockLoginCredentials);
      expect(localStorage.getItem('accessToken')).toBe(mockAuthResponse.accessToken);
      expect(localStorage.getItem('refreshToken')).toBe(mockAuthResponse.refreshToken);
      expect(result.current.user).toEqual(mockAuthResponse.user);
    });

    it('throws error on failed login', async () => {
      vi.spyOn(authService, 'login').mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.login(mockLoginCredentials)).rejects.toThrow('Invalid credentials');
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe('register', () => {
    it('registers successfully and stores tokens', async () => {
      vi.spyOn(authService, 'register').mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.register(mockRegisterData);

      expect(authService.register).toHaveBeenCalledWith(mockRegisterData);
      expect(localStorage.getItem('accessToken')).toBe(mockAuthResponse.accessToken);
      expect(localStorage.getItem('refreshToken')).toBe(mockAuthResponse.refreshToken);
      expect(result.current.user).toEqual(mockAuthResponse.user);
    });

    it('throws error on failed registration', async () => {
      vi.spyOn(authService, 'register').mockRejectedValue(new Error('Email already exists'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.register(mockRegisterData)).rejects.toThrow('Email already exists');
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe('logout', () => {
    it('logs out successfully and clears tokens', async () => {
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      vi.spyOn(authService, 'logout').mockResolvedValue();
      vi.spyOn(userService, 'getCurrentUser').mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await result.current.logout();

      expect(authService.logout).toHaveBeenCalledWith('mock-refresh-token');
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(result.current.user).toBeNull();
    });

    it('clears tokens even if logout API fails', async () => {
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      vi.spyOn(authService, 'logout').mockRejectedValue(new Error('Server error'));
      vi.spyOn(userService, 'getCurrentUser').mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await result.current.logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe('refreshUser', () => {
    it('refreshes user data successfully', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      vi.spyOn(userService, 'getCurrentUser').mockResolvedValueOnce(mockUser).mockResolvedValueOnce(updatedUser);
      localStorage.setItem('accessToken', 'mock-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await result.current.refreshUser();

      expect(result.current.user).toEqual(updatedUser);
      expect(userService.getCurrentUser).toHaveBeenCalledTimes(2);
    });

    it('throws error when refresh fails', async () => {
      vi.spyOn(userService, 'getCurrentUser').mockResolvedValueOnce(mockUser).mockRejectedValueOnce(new Error('Failed to refresh'));
      localStorage.setItem('accessToken', 'mock-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await expect(result.current.refreshUser()).rejects.toThrow('Failed to refresh');
    });
  });
});
