import { API_URL, BASE_URL } from './apiClient';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export interface UploadResponse {
  url: string;
  fileName: string;
}

// Convert to Base64 (platform independent)
async function convertToBase64(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
}

// Get MIME type from URI
function getMimeType(uri: string): string {
  const ext = uri.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
  };
  return mimeTypes[ext ?? ''] || 'image/jpeg';
}

// Upload single photo
export async function uploadPhoto(
  uri: string,
  token: string
): Promise<string> {
  try {
    const base64 = await convertToBase64(uri);
    const filename = uri.split('/').pop() || 'photo.jpg';
    const mimeType = getMimeType(uri);

    const response = await fetch(`${API_URL}/Upload/photo-base64`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data: base64,
        fileName: filename,
        mimeType: mimeType,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Fotoğraf yüklenemedi';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = `HTTP Error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data: UploadResponse = await response.json();
    return data.url;
  } catch (error) {
    console.error('Photo upload error:', error);
    throw error;
  }
}

// Upload multiple photos
export async function uploadPhotos(
  uris: string[],
  token: string,
  onProgress?: (uploadedCount: number, total: number) => void
): Promise<string[]> {
  try {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < uris.length; i++) {
      const url = await uploadPhoto(uris[i], token);
      uploadedUrls.push(url);

      if (onProgress) {
        onProgress(i + 1, uris.length);
      }
    }

    return uploadedUrls;
  } catch (error) {
    console.error('Multiple photos upload error:', error);
    throw error;
  }
}
