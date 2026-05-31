export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  isFavorite: boolean;
  userId?: number;
  placeType?: string;
  accommodationType?: string;
  guests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  amenities?: string[];
}
