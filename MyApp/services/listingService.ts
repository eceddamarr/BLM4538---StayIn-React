import { request } from './apiClient';
import { Property } from '@/types/property';

export interface CreateListingDTO {
  placeType: string;
  accommodationType: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  title: string;
  description: string;
  price: number;
  addressCountry: string;
  addressCity: string;
  addressDistrict: string;
  addressStreet: string;
  addressBuilding?: string;
  addressPostalCode?: string;
  addressRegion?: string;
  amenities: string[];
  photoUrls: string[];
  latitude?: number;
  longitude?: number;
}

export interface ReservationDTO {
  listingId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
}

// Transform backend response to Property type
function transformToProperty(listing: any): Property {
  return {
    id: listing.id.toString(),
    title: listing.title,
    location: `${listing.address?.addressCity || ''}, ${listing.address?.addressDistrict || ''}`,
    price: listing.price,
    rating: 0,
    reviewCount: 0,
    image: listing.photoUrls?.[0] || 'https://via.placeholder.com/800x600',
    isFavorite: false,
    userId: listing.userId,
  };
}

// Get all listings
export async function getAllListings(): Promise<Property[]> {
  try {
    const data = await request<any[]>('/Listing/all');
    return data.map(transformToProperty);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

// Get single listing by ID
export async function getListingById(id: number): Promise<any> {
  try {
    return await request<any>(`/Listing/${id}`);
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
}

// Create new listing
export async function createListing(
  data: CreateListingDTO,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string; listing: any }>(
      '/MyListings',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );

    return { success: true, message: result.message || 'İlan başarıyla oluşturuldu' };
  } catch (error) {
    console.error('Error creating listing:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'İlan oluşturulurken hata oluştu'
    };
  }
}

// Create reservation
export async function createReservation(
  reservationData: ReservationDTO,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      '/Reservation',
      {
        method: 'POST',
        body: JSON.stringify(reservationData),
      },
      token
    );

    return { success: true, message: result.message || 'Rezervasyon başarıyla oluşturuldu' };
  } catch (error) {
    console.error('Error creating reservation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Rezervasyon oluşturulamadı'
    };
  }
}

// Add listing to favorites
export async function addToFavorites(
  listingId: string | number,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      `/Favorites/${listingId}`,
      {
        method: 'POST',
      },
      token
    );

    return { success: true, message: result.message || 'İlan favorilere eklendi' };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Favorilere eklenemedi'
    };
  }
}

// Remove listing from favorites
export async function removeFromFavorites(
  listingId: string | number,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      `/Favorites/${listingId}`,
      {
        method: 'DELETE',
      },
      token
    );

    return { success: true, message: result.message || 'İlan favorilerden çıkarıldı' };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Favorilerden çıkarılamadı'
    };
  }
}

// Get user's favorite listings
export async function getUserFavorites(
  token: string
): Promise<any[]> {
  try {
    const result = await request<{ favorites: any[] }>(
      '/Favorites',
      {},
      token
    );
    return result.favorites || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

// Check if a specific listing is favorited
export async function checkIsFavorite(
  listingId: string | number,
  token: string
): Promise<boolean> {
  try {
    const result = await request<{ isFavorite: boolean }>(
      `/Favorites/check/${listingId}`,
      {},
      token
    );
    return result.isFavorite || false;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}
