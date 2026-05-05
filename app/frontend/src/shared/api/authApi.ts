import { apiRequest } from './client';
import type {
  LoginPayload,
  RegisterPayload,
  UserResponse,
} from '@labyrinth/shared/types/api';

export const authApi = {
  login(payload: LoginPayload) {
    return apiRequest<UserResponse>('/api/auth/login', {
      method: 'POST',
      body: payload,
    });
  },

  register(payload: RegisterPayload) {
    return apiRequest<UserResponse>('/api/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  me() {
    return apiRequest<UserResponse>('/api/auth/me');
  },

  logout() {
    return apiRequest<void>('/api/auth/logout', {
      method: 'POST',
    });
  },
};
