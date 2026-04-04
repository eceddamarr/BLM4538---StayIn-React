import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';
import { request } from './apiClient';

export async function loginApi(body: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>('/Auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function registerApi(body: RegisterRequest): Promise<AuthResponse> {
  return request<AuthResponse>('/Auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
