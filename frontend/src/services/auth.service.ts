import api from './api';
import type { LoginCredentials, RegisterData, AuthResponse, ChangePasswordData } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
    return response.data.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/register', data);
    return response.data.data;
  },

  async logout(refreshToken?: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },

  async changePassword(data: ChangePasswordData): Promise<void> {
    await api.post('/auth/change-password', data);
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },
};
