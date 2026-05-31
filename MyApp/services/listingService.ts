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
  guests: number;
}

export interface MyReservation {
  id: number;
  listingId: number;
  listingTitle: string;
  listingPhotoUrl?: string | null;
  hostName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  responsedAt?: string | null;
  isPaid: boolean;
  paymentDate?: string | null;
  review?: ReservationReview | null;
}

export interface ReservationReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IncomingRequest {
  id: number;
  listingId: number;
  listingTitle: string;
  listingPhotoUrl?: string | null;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  responsedAt?: string | null;
  isPaid: boolean;
  paymentDate?: string | null;
}

export interface Review {
  id: number;
  listingId: number;
  guestId: number;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ListingReviewSummary {
  totalReviews: number;
  averageRating: number;
  reviews: Review[];
}

export interface BookedDateRange {
  checkInDate: string;
  checkOutDate: string;
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
    placeType: listing.placeType,
    accommodationType: listing.accommodationType,
    guests: listing.guests,
    bedrooms: listing.bedrooms,
    beds: listing.beds,
    bathrooms: listing.bathrooms,
    amenities: listing.amenities || [],
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

export async function getListingBookedRanges(listingId: number): Promise<BookedDateRange[]> {
  try {
    const result = await request<{ bookedRanges: BookedDateRange[] }>(
      `/Reservation/listing/${listingId}/booked-ranges`
    );
    return result.bookedRanges || [];
  } catch (error) {
    console.error('Error fetching booked ranges:', error);
    return [];
  }
}

// Get reviews for a listing
export async function getListingReviews(listingId: number): Promise<ListingReviewSummary> {
  try {
    const result = await request<{ success: boolean; data: ListingReviewSummary }>(
      `/Reviews/listing/${listingId}`
    );

    return result.data || { totalReviews: 0, averageRating: 0, reviews: [] };
  } catch (error) {
    console.error('Error fetching listing reviews:', error);
    return { totalReviews: 0, averageRating: 0, reviews: [] };
  }
}

export async function createReview(
  reservationId: number,
  rating: number,
  comment: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      '/Reviews',
      {
        method: 'POST',
        body: JSON.stringify({ reservationId, rating, comment }),
      },
      token
    );

    return { success: true, message: result.message || 'Yorum eklendi' };
  } catch (error) {
    console.error('Error creating review:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Yorum eklenemedi',
    };
  }
}

export async function updateReview(
  reviewId: number,
  reservationId: number,
  rating: number,
  comment: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      `/Reviews/${reviewId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ reservationId, rating, comment }),
      },
      token
    );

    return { success: true, message: result.message || 'Yorum güncellendi' };
  } catch (error) {
    console.error('Error updating review:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Yorum güncellenemedi',
    };
  }
}

export async function deleteReview(
  reviewId: number,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      `/Reviews/${reviewId}`,
      {
        method: 'DELETE',
      },
      token
    );

    return { success: true, message: result.message || 'Yorum silindi' };
  } catch (error) {
    console.error('Error deleting review:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Yorum silinemedi',
    };
  }
}

// Get my listing details (for editing)
export async function getMyListingDetail(
  listingId: number,
  token: string
): Promise<any> {
  try {
    // İlk olarak tüm ilanlarımızı al
    const listings = await getMyListings(token);
    // İstenen ilanı bul
    const listing = listings.find(l => l.id === listingId);
    if (!listing) {
      throw new Error('İlan bulunamadı');
    }
    return listing;
  } catch (error) {
    console.error('Error fetching my listing detail:', error);
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
      '/Reservation/create',
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

// Get user's reservations
export async function getMyReservations(token: string): Promise<MyReservation[]> {
  try {
    const result = await request<{ reservations: MyReservation[] }>(
      '/Reservation/my-reservations',
      {},
      token
    );
    return result.reservations || [];
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
}

// Get incoming reservation requests (for hosts)
export async function getIncomingRequests(token: string): Promise<IncomingRequest[]> {
  try {
    const result = await request<{ requests: IncomingRequest[] }>(
      '/Reservation/incoming-requests',
      {},
      token
    );
    return result.requests || [];
  } catch (error) {
    console.error('Error fetching incoming requests:', error);
    throw error;
  }
}

// Approve reservation
export async function approveReservation(
  reservationId: number,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      `/Reservation/${reservationId}/approve`,
      {
        method: 'POST',
      },
      token
    );

    return { success: true, message: result.message || 'Rezervasyon onaylandı' };
  } catch (error) {
    console.error('Error approving reservation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Rezervasyon onaylanamadı'
    };
  }
}

// Reject reservation
export async function rejectReservation(
  reservationId: number,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      `/Reservation/${reservationId}/reject`,
      {
        method: 'POST',
      },
      token
    );

    return { success: true, message: result.message || 'Rezervasyon reddedildi' };
  } catch (error) {
    console.error('Error rejecting reservation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Rezervasyon reddedilemedi'
    };
  }
}

// Cancel reservation (Guest)
export async function cancelReservation(
  reservationId: number,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      `/Reservation/${reservationId}/cancel`,
      {
        method: 'POST',
      },
      token
    );

    return { success: true, message: result.message || 'Rezervasyon iptal edildi' };
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Rezervasyon iptal edilemedi'
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

// Get user's listings (active)
export async function getMyListings(token: string): Promise<any[]> {
  try {
    const result = await request<{ listings: any[] }>(
      '/MyListings',
      {},
      token
    );
    return result.listings || [];
  } catch (error) {
    console.error('Error fetching my listings:', error);
    return [];
  }
}

// Get user's archived listings
export async function getArchivedListings(token: string): Promise<any[]> {
  try {
    const result = await request<{ listings: any[] }>(
      '/MyListings/archived',
      {},
      token
    );
    return result.listings || [];
  } catch (error) {
    console.error('Error fetching archived listings:', error);
    return [];
  }
}

// Update listing
export async function updateListing(
  listingId: string | number,
  data: CreateListingDTO,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      `/MyListings/${listingId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );

    return { success: true, message: result.message || 'İlan başarıyla güncellendi' };
  } catch (error) {
    console.error('Error updating listing:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'İlan güncellenemedi'
    };
  }
}

// Delete listing
export async function deleteListing(
  listingId: string | number,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      `/MyListings/${listingId}`,
      {
        method: 'DELETE',
      },
      token
    );

    return { success: true, message: result.message || 'İlan başarıyla silindi' };
  } catch (error) {
    console.error('Error deleting listing:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'İlan silinemedi'
    };
  }
}

// Archive listing
export async function archiveListing(
  listingId: string | number,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      `/MyListings/${listingId}/archive`,
      {
        method: 'POST',
      },
      token
    );

    return { success: true, message: result.message || 'İlan arşivlendi' };
  } catch (error) {
    console.error('Error archiving listing:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'İlan arşivlenemedi'
    };
  }
}

// Unarchive listing
export async function unarchiveListing(
  listingId: string | number,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<{ message: string }>(
      `/MyListings/${listingId}/unarchive`,
      {
        method: 'POST',
      },
      token
    );

    return { success: true, message: result.message || 'İlan arşivden çıkarıldı' };
  } catch (error) {
    console.error('Error unarchiving listing:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'İlan arşivden çıkarılamadı'
    };
  }
}

export interface PaymentDTO {
  reservationId: number;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  cardholderName: string;
  amount?: number;
}

// Process payment
export async function processPayment(
  paymentData: PaymentDTO,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const [month, year] = paymentData.expiryDate.split('/');
    const payload = {
      cardNumber: paymentData.cardNumber.replace(/\s+/g, ''),
      cardHolder: paymentData.cardholderName,
      expiryMonth: month,
      expiryYear: `20${year}`,
      cvv: paymentData.cvv,
      amount: paymentData.amount || 0,
    };

    const result = await request<{ message: string }>(
      `/Payments/reservation/${paymentData.reservationId}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token
    );

    return { success: true, message: result.message || 'Ödeme başarıyla işlendi' };
  } catch (error) {
    console.error('Error processing payment:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Ödeme işlenemedi'
    };
  }
}
