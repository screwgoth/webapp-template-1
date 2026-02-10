import { vi } from 'vitest';
import type { User } from '@/types';

export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockAuthResponse = {
  user: mockUser,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

export const mockLoginCredentials = {
  email: 'test@example.com',
  password: 'Password123!',
  rememberMe: false,
};

export const mockRegisterData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123!',
};

// Mock API responses
export const mockApiSuccess = <T>(data: T) => ({
  data: {
    status: 'success',
    data,
  },
});

export const mockApiError = (message: string, statusCode = 400) => ({
  response: {
    status: statusCode,
    data: {
      status: 'error',
      message,
    },
  },
});

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

// Mock navigate function
export const mockNavigate = vi.fn();

// Mock services
export const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
};

export const mockUserService = {
  getCurrentUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
};
