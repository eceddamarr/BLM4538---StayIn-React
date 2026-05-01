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

export async function forgotPasswordApi(email: string): Promise<{ success: boolean; message: string }> {
  return request('/Auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyCodeApi(email: string, code: string): Promise<{ success: boolean; message: string }> {
  return request('/Auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export async function resetPasswordApi(
  email: string,
  code: string,
  newPassword: string,
  newPasswordConfirm: string
): Promise<{ success: boolean; message: string }> {
  return request('/Auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword, newPasswordConfirm }),
  });
}
