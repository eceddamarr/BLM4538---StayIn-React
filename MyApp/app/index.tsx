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
import { getAllListings, getUserFavorites, addToFavorites, removeFromFavorites } from '../services/listingService';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
        const listingsWithFavorites = (filteredListings.length > 0 ? filteredListings : sampleProperties).map(
          (listing) => ({
            ...listing,
            isFavorite: favoriteIds.includes(listing.id),
          })
        );

        setProperties(listingsWithFavorites);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#717171" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Şehir ara"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#717171"
          />
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
              <Text style={styles.sectionTitle}>Popüler İlanlar</Text>
              <Text style={styles.sectionCount}>{properties.length} ilan</Text>
            </View>

            {properties.map((property) => (
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

      {/* Bottom Navigation */}
      <BottomNav activeTab="explore" />

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
  searchContainer: {
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
