import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import PropertyCard from '../components/PropertyCard';
import { useAuth } from '../context/AuthContext';
import { getListingReviews, getUserFavorites, removeFromFavorites } from '../services/listingService';
import { Property } from '../types/property';

function favoriteToProperty(listing: any): Property {
  return {
    id: listing.id.toString(),
    title: listing.title,
    location: `${listing.address?.addressCity || ''}, ${listing.address?.addressDistrict || ''}`,
    price: listing.price,
    rating: 0,
    reviewCount: 0,
    image: listing.photoUrls?.[0] || 'https://via.placeholder.com/800x600',
    isFavorite: true,
    userId: listing.userId,
    placeType: listing.placeType,
    accommodationType: listing.accommodationType,
    guests: listing.guests,
    bedrooms: listing.bedrooms,
    beds: listing.beds,
    bathrooms: listing.bathrooms,
  };
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError('');
      const favoriteListings = await getUserFavorites(token);
      const favoriteProperties = await Promise.all(
        favoriteListings.map(async (listing: any) => {
          const property = favoriteToProperty(listing);
          const reviewSummary = await getListingReviews(Number(property.id));

          return {
            ...property,
            rating: reviewSummary.averageRating,
            reviewCount: reviewSummary.totalReviews,
          };
        })
      );

      setFavorites(favoriteProperties);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Favoriler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading) {
      loadFavorites();
    }
  }, [isLoading, loadFavorites]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleFavoritePress = async (propertyId: string) => {
    if (!token) return;

    const previousFavorites = favorites;
    setFavorites((prev) => prev.filter((property) => property.id !== propertyId));

    const result = await removeFromFavorites(propertyId, token);
    if (!result.success) {
      setFavorites(previousFavorites);
      setError(result.message);
    }
  };

  const handlePropertyPress = (propertyId: string) => {
    router.push({
      pathname: '/listing/[id]',
      params: { id: propertyId },
    });
  };

  if (isLoading || loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['top']}>
        <ActivityIndicator size="large" color="#FF385C" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favoriler</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={52} color="#C7C7C7" />
          <Text style={styles.emptyTitle}>Favorilerini görmek için giriş yap</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/profile' as never)}>
            <Text style={styles.primaryButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
        <BottomNav activeTab="favorites" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoriler</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FF385C" />}
      >
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={52} color="#C7C7C7" />
            <Text style={styles.emptyTitle}>Henüz favori ilanın yok</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/' as never)}>
              <Text style={styles.primaryButtonText}>İlanlara Göz At</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>{favorites.length} favori ilan</Text>
            </View>
            {favorites.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPress={() => handlePropertyPress(property.id)}
                onFavoritePress={() => handleFavoritePress(property.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNav activeTab="favorites" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 24,
  },
  list: {
    paddingBottom: 4,
  },
  summaryRow: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
  },
  summaryHint: {
    marginTop: 4,
    fontSize: 13,
    color: '#717171',
  },
  emptyState: {
    flex: 1,
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#FF385C',
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  errorText: {
    color: '#D92D20',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
});
