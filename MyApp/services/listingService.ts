import { API_URL, request } from './apiClient';
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

// Get all listings
export async function getAllListings(): Promise<Property[]> {
  try {
    const response = await fetch(`${API_URL}/Listing/all`);
    if (!response.ok) {
      throw new Error('Failed to fetch listings');
    }
    const data = await response.json();

    // Transform backend response to Property type
    return data.map((listing: any) => ({
      id: listing.id.toString(),
      title: listing.title,
      location: `${listing.address?.addressCity || ''}, ${listing.address?.addressDistrict || ''}`,
      price: listing.price,
      rating: 0,
      reviewCount: 0,
      image: listing.photoUrls?.[0] || 'https://via.placeholder.com/800x600',
      isFavorite: false,
    }));
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

// Get single listing by ID
export async function getListingById(id: number): Promise<Property | null> {
  try {
    const response = await fetch(`${API_URL}/Listing/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch listing');
    }
    const listing = await response.json();

    return {
      id: listing.id.toString(),
      title: listing.title,
      location: `${listing.address?.addressCity || ''}, ${listing.address?.addressDistrict || ''}`,
      price: listing.price,
      rating: 4.5,
      reviewCount: 0,
      image: listing.photoUrls?.[0] || 'https://via.placeholder.com/800x600',
      isFavorite: false,
    };
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

// Create new listing
export async function createListing(
  data: CreateListingDTO,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string; listing: any }>(
      '/api/MyListings',
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
