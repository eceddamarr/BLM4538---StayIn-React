import { Platform } from 'react-native';

// Platform-aware API URL
export const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5211'
    : 'http://localhost:5211';

export const API_URL = `${BASE_URL}/api`;

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
