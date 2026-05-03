import { apiRequest } from './client';
import type { User } from '../types/domain';

interface UserResponse {
  user: User;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  passwordConfirm: string;
  acceptedTerms: boolean;
}

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
