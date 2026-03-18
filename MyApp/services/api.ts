import { Property } from '../types/property';

const API_URL = 'http://localhost:5211/api';

export const api = {
  // Get all listings
  async getListings(): Promise<Property[]> {
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
        rating: 0, // Default rating - update when reviews available
        reviewCount: 0, // Default review count - update when reviews available
        image: listing.photoUrls?.[0] || 'https://via.placeholder.com/800x600',
        isFavorite: false,
      }));
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  },

  // Get single listing
  async getListingById(id: number): Promise<Property | null> {
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
  },
};
