import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
    ActivityIndicator,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import PropertyCard from '../components/PropertyCard';
import { sampleProperties } from '../data/sampleProperties';
import { Property } from '../types/property';
import { getAllListings, getUserFavorites, addToFavorites, removeFromFavorites, getListingReviews } from '../services/listingService';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    guests: '',
    bedrooms: '',
    placeType: '',
  });

  // Fetch listings from API
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const listings = await getAllListings();

        // Kullanıcının kendi ilanlarını filtrele
        const filteredListings = user
          ? listings.filter(listing => listing.userId !== user.id)
          : listings;

        // Kullanıcının favorilerini yükle
        let favoriteIds: string[] = [];
        if (user && token) {
          const favorites = await getUserFavorites(token);
          favoriteIds = favorites.map((fav: any) => fav.id.toString());
        }

        // isFavorite alanını güncelle
        const shouldUseSampleProperties = filteredListings.length === 0;
        const listingSource = shouldUseSampleProperties ? sampleProperties : filteredListings;

        const listingsWithFavorites = listingSource.map(
          (listing) => ({
            ...listing,
            isFavorite: favoriteIds.includes(listing.id),
          })
        );

        const listingsWithReviews = shouldUseSampleProperties
          ? listingsWithFavorites
          : await Promise.all(
              listingsWithFavorites.map(async (listing) => {
                const reviewSummary = await getListingReviews(Number(listing.id));

                return {
                  ...listing,
                  rating: reviewSummary.averageRating,
                  reviewCount: reviewSummary.totalReviews,
                };
              })
            );

        listingsWithReviews.sort((a, b) => {
          if (b.reviewCount !== a.reviewCount) {
            return b.reviewCount - a.reviewCount;
          }

          return b.rating - a.rating;
        });

        setProperties(listingsWithReviews);
      } catch (error) {
        console.error('Error loading listings:', error);
        setProperties(sampleProperties);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user, token]);

  const handleFavoritePress = async (propertyId: string) => {
    // Giriş kontrolü
    if (!user || !token) {
      setShowLoginModal(true);
      return;
    }

    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    try {
      if (property.isFavorite) {
        // Favorilerden çıkar
        const result = await removeFromFavorites(propertyId, token);
        if (result.success) {
          setProperties((prev) =>
            prev.map((p) =>
              p.id === propertyId ? { ...p, isFavorite: false } : p
            )
          );
        }
      } else {
        // Favorilere ekle
        const result = await addToFavorites(propertyId, token);
        if (result.success) {
          setProperties((prev) =>
            prev.map((p) =>
              p.id === propertyId ? { ...p, isFavorite: true } : p
            )
          );
        }
      }
    } catch (error) {
      console.error('Favorite error:', error);
    }
  };

  const handlePropertyPress = (propertyId: string) => {
    router.push({
      pathname: '/listing/[id]',
      params: { id: propertyId },
    });
  };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const placeTypeOptions = Array.from(
    new Set(properties.map((property) => property.placeType).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, 'tr'));

  const activeFilterCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.guests,
    filters.bedrooms,
    filters.placeType,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      guests: '',
      bedrooms: '',
      placeType: '',
    });
  };

  const filteredProperties = properties.filter((property) => {
    if (searchQuery.trim()) {
      const query = normalizeText(searchQuery);
      const [city, district] = property.location
        .split(',')
        .map(loc => normalizeText(loc.trim()));

      if (!city?.includes(query) && !district?.includes(query)) {
        return false;
      }
    }

    const minPrice = Number(filters.minPrice);
    const maxPrice = Number(filters.maxPrice);
    const minGuests = Number(filters.guests);
    const minBedrooms = Number(filters.bedrooms);

    if (filters.minPrice && property.price < minPrice) return false;
    if (filters.maxPrice && property.price > maxPrice) return false;
    if (filters.guests && (property.guests || 0) < minGuests) return false;
    if (filters.bedrooms && (property.bedrooms || 0) < minBedrooms) return false;
    if (filters.placeType && property.placeType !== filters.placeType) return false;

    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#717171" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Şehir veya ilçe ara"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#717171"
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
            <Ionicons name="options-outline" size={22} color={activeFilterCount ? '#FF385C' : '#222'} />
            {activeFilterCount > 0 && (
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF385C" />
            <Text style={styles.loadingText}>İlanlar yükleniyor...</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {searchQuery.trim()
                  ? `"${searchQuery}" Arama Sonuçları`
                  : 'Popüler İlanlar'}
              </Text>
              <Text style={styles.sectionCount}>
                {filteredProperties.length} ilan
              </Text>
            </View>

            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onPress={() => handlePropertyPress(property.id)}
                  onFavoritePress={() => handleFavoritePress(property.id)}
                />
              ))
            ) : searchQuery.trim() ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {`"${searchQuery}" ile eşleşen ilan bulunamadı`}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="explore" />

      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalContent}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filtreler</Text>
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={22} color="#222" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Gecelik fiyat</Text>
            <View style={styles.filterInputRow}>
              <TextInput
                style={styles.filterInput}
                value={filters.minPrice}
                onChangeText={(minPrice) => setFilters((prev) => ({ ...prev, minPrice }))}
                placeholder="Min"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.filterInput}
                value={filters.maxPrice}
                onChangeText={(maxPrice) => setFilters((prev) => ({ ...prev, maxPrice }))}
                placeholder="Max"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.filterInputRow}>
              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>Misafir</Text>
                <TextInput
                  style={styles.filterInput}
                  value={filters.guests}
                  onChangeText={(guests) => setFilters((prev) => ({ ...prev, guests }))}
                  placeholder="En az"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>Yatak odası</Text>
                <TextInput
                  style={styles.filterInput}
                  value={filters.bedrooms}
                  onChangeText={(bedrooms) => setFilters((prev) => ({ ...prev, bedrooms }))}
                  placeholder="En az"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.filterLabel}>Mekan türü</Text>
            <View style={styles.chipGrid}>
              {placeTypeOptions.map((placeType) => {
                const selected = filters.placeType === placeType;
                return (
                  <TouchableOpacity
                    key={placeType}
                    style={[styles.filterChip, selected && styles.filterChipSelected]}
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        placeType: selected ? '' : placeType,
                      }))
                    }
                  >
                    <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                      {placeType}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.clearFilterButton} onPress={resetFilters}>
                <Text style={styles.clearFilterText}>Temizle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFilterButton} onPress={() => setShowFilterModal(false)}>
                <Text style={styles.applyFilterText}>Sonuçları Göster</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Login Modal */}
      <Modal
        visible={showLoginModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Giriş Yapmanız Gerekiyor</Text>
            <Text style={styles.modalMessage}>
              Favorilerini yönetmek için hesabınıza giriş yapmanız gerekiyor
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowLoginModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => {
                  setShowLoginModal(false);
                  router.push('/login');
                }}
              >
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#FF385C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingBottom: 20,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  sectionCount: {
    fontSize: 14,
    color: '#717171',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#717171',
  },
  emptyContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#717171',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  filterModalContent: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  filterInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterField: {
    flex: 1,
  },
  filterInput: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#222',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  filterChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  filterChipSelected: {
    borderColor: '#FF385C',
    backgroundColor: '#FFF0F2',
  },
  filterChipText: {
    color: '#222',
    fontSize: 14,
    fontWeight: '700',
  },
  filterChipTextSelected: {
    color: '#FF385C',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 10,
  },
  clearFilterButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  clearFilterText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '800',
  },
  applyFilterButton: {
    flex: 1.5,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF385C',
  },
  applyFilterText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#717171',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  loginButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF385C',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
