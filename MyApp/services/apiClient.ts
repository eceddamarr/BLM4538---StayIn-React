import { Platform } from 'react-native';

// Platform-aware API URL
// Web / iOS simülatör: localhost
// Android emülatör: 10.0.2.2 (host machine'e erişim)
// Fiziksel cihaz: bilgisayarınızın IP adresi (örn. http://192.168.1.x:5211)
export const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5211'
    : 'http://localhost:5211';

export const API_URL = `${BASE_URL}/api`;

// Generic request helper with error handling and token support
export async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? 'Bir hata oluştu.');
  }

  return data as T;
}
