import api from './api';
import type { User, UpdateUserData } from '@/types';

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ data: { user: User } }>('/users/me');
    return response.data.data.user;
  },

  async updateUser(data: UpdateUserData): Promise<User> {
    const response = await api.put<{ data: { user: User } }>('/users/me', data);
    return response.data.data.user;
  },

  async deleteUser(): Promise<void> {
    await api.delete('/users/me');
  },
};
