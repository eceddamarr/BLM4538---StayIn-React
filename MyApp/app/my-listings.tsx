import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import {
  getMyListings,
  getArchivedListings,
  deleteListing,
  archiveListing,
  unarchiveListing,
} from '../services/listingService';

interface Listing {
  id: number;
  title: string;
  price: number;
  address: {
    addressCity: string;
    addressDistrict: string;
  };
  photoUrls: string[];
  beds: number;
  bedrooms: number;
  bathrooms: number;
  createdAt: string;
}

export default function MyListingsScreen() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [archivedListings, setArchivedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteListingId, setDeleteListingId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return; // Auth yüklenmesi bitmesini bekle

    if (!user || !token) {
      router.push('/login');
      return;
    }
    fetchListings();
  }, [user, token, authLoading]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const [active, archived] = await Promise.all([
        getMyListings(token!),
        getArchivedListings(token!),
      ]);
      setActiveListings(active);
      setArchivedListings(archived);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (listingId: number) => {
    try {
      const result = await archiveListing(listingId, token!);
      if (result.success) {
        // İlanları yeniden yükle
        fetchListings();
      }
      setShowMenu(null);
    } catch (error) {
      Alert.alert('Hata', 'İlan arşivlenemedi');
    }
  };

  const handleDeletePress = (listingId: number) => {
    setDeleteListingId(listingId);
    setShowDeleteModal(true);
    setShowMenu(null);
  };

  const confirmDelete = async () => {
    if (!deleteListingId) return;
    try {
      const result = await deleteListing(deleteListingId, token!);
      if (result.success) {
        fetchListings();
      }
    } catch (error) {
      Alert.alert('Hata', 'İlan silinemedi');
    } finally {
      setShowDeleteModal(false);
      setDeleteListingId(null);
    }
  };

  const handleUnarchive = async (listingId: number) => {
    try {
      const result = await unarchiveListing(listingId, token!);
      if (result.success) {
        // İlanları yeniden yükle
        fetchListings();
      }
    } catch (error) {
      Alert.alert('Hata', 'İlan aktif hale getirilemedi');
    }
  };

  const listings = activeTab === 'active' ? activeListings : archivedListings;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İlanlarım</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Ionicons name="list" size={18} color={activeTab === 'active' ? '#FF385C' : '#717171'} />
          <Text
            style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}
          >
            Aktif İlanlar ({activeListings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'archived' && styles.activeTab]}
          onPress={() => setActiveTab('archived')}
        >
          <Ionicons name="archive" size={18} color={activeTab === 'archived' ? '#FF385C' : '#717171'} />
          <Text
            style={[styles.tabText, activeTab === 'archived' && styles.activeTabText]}
          >
            Arşiv ({archivedListings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {authLoading || loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF385C" />
          </View>
        ) : listings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>
              {activeTab === 'active' ? 'Aktif ilanınız yok' : 'Arşivlenmiş ilanınız yok'}
            </Text>
          </View>
        ) : (
          <View style={styles.listingsContainer}>
            {listings.map((listing) => (
              <View key={listing.id} style={styles.listingCard}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: listing.photoUrls?.[0] || 'https://via.placeholder.com/400x250' }}
                    style={styles.listingImage}
                    resizeMode="cover"
                  />

                  {activeTab === 'archived' && (
                    <View style={styles.archivedBadge}>
                      <Text style={styles.archivedBadgeText}>Arşivlenmiş</Text>
                    </View>
                  )}

                  {/* Action Buttons - Top Right */}
                  <View style={styles.actionButtonsTopRight}>
                    {activeTab === 'active' ? (
                      <>
                        <TouchableOpacity
                          style={[styles.smallActionButton, styles.editButton]}
                          onPress={() => router.push(`/become-host?editId=${listing.id}` as never)}
                        >
                          <Ionicons name="pencil" size={18} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.smallActionButton, styles.archiveButton]}
                          onPress={() => handleArchive(listing.id)}
                        >
                          <Ionicons name="archive" size={18} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.smallActionButton, styles.deleteButton]}
                          onPress={() => handleDeletePress(listing.id)}
                        >
                          <Ionicons name="trash" size={18} color="#fff" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={[styles.smallActionButton, styles.activateButton]}
                          onPress={() => handleUnarchive(listing.id)}
                        >
                          <Ionicons name="archive" size={18} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.smallActionButton, styles.deleteButton]}
                          onPress={() => handleDeletePress(listing.id)}
                        >
                          <Ionicons name="trash" size={18} color="#fff" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.listingContent}>
                  <Text style={styles.listingTitle} numberOfLines={2}>
                    {listing.title}
                  </Text>

                  <View style={styles.addressRow}>
                    <Ionicons name="location-outline" size={14} color="#717171" />
                    <Text style={styles.address}>
                      {listing.address?.addressCity}, {listing.address?.addressDistrict}
                    </Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="bed-outline" size={14} color="#717171" />
                      <Text style={styles.detailText}>{listing.bedrooms} Oda</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="bed-outline" size={14} color="#717171" />
                      <Text style={styles.detailText}>{listing.beds} Yatak</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="shower" size={14} color="#717171" />
                      <Text style={styles.detailText}>{listing.bathrooms} Banyo</Text>
                    </View>
                  </View>

                  <View style={styles.footerRow}>
                    <Text style={styles.price}>₺{listing.price.toLocaleString('tr-TR')}</Text>
                    <Text style={styles.priceUnit}>/gece</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Ionicons name="alert-circle" size={48} color="#FF385C" />
            <Text style={styles.deleteModalTitle}>İlanı Sil</Text>
            <Text style={styles.deleteModalMessage}>Bu işlem geri alınamaz. Emin misiniz?</Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmDeleteButtonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav activeTab="listings" />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF385C',
  },
  tabText: {
    fontSize: 14,
    color: '#717171',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF385C',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#717171',
  },
  listingsContainer: {
    padding: 16,
    gap: 16,
  },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  listingImage: {
    width: '100%',
    height: '100%',
  },
  archivedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  archivedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonsTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  smallActionButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  listingContent: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  address: {
    fontSize: 13,
    color: '#717171',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#717171',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF385C',
  },
  priceUnit: {
    fontSize: 12,
    color: '#717171',
    marginLeft: 4,
  },
  archiveButton: {
    backgroundColor: '#FF9500',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  activateButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF385C',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginTop: 16,
    marginBottom: 8,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#717171',
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
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
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF385C',
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
