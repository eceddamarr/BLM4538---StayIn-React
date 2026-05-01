import { Platform } from 'react-native';

const MOBILE_HOST_IP = '172.20.10.3';

// Platform-aware API URL
export const BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5211' // Web tarayıcı
    : `http://${MOBILE_HOST_IP}:5211`; // Telefon / emülatör

export const API_URL = `${BASE_URL}/api`;

// Fotoğraf URL'sini düzelt (localhost'u gerçek IP'ye çevir)
export function transformImageUrl(url: string): string {
  if (!url) return url;

  if (Platform.OS !== 'web') {
    // Telefon/emülatörlerde localhost'u IP address'e çevir
    return url
      .replace('http://localhost:5211', `http://${MOBILE_HOST_IP}:5211`)
      .replace('https://localhost:7063', `http://${MOBILE_HOST_IP}:5211`);
  }

  return url;
}

// User service functions
export async function updateUserProfile(data: { fullName?: string; phoneNumber?: string }, token: string) {
  try {
    const result = await request<{ message: string; user: any }>(
      '/User/profile',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
    return { success: true, message: result.message || 'Profil başarıyla güncellendi', user: result.user };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Profil güncellenemedi',
    };
  }
}

export async function changeUserPassword(oldPassword: string, newPassword: string, token: string) {
  try {
    const result = await request<{ message: string }>(
      '/User/password',
      {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword }),
      },
      token
    );
    return { success: true, message: result.message || 'Şifre başarıyla değiştirildi' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Şifre değiştirilemedi',
    };
  }
}

interface ApiError {
  message?: string;
  error?: string;
}

// Generic request helper with error handling and token support
export async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const isJson = !options.headers || !(options.headers as any)['Content-Type']?.includes('form');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isJson && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let errorMessage = 'Bir hata oluştu';
    try {
      const error: ApiError = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    return {} as T;
  }
}
