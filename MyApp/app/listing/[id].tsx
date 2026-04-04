import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useAuth } from '@/context/AuthContext';
import { getListingById, createReservation, ReservationDTO } from '@/services/listingService';

dayjs.locale('tr');
const isWeb = Platform.OS === 'web';

const { width } = Dimensions.get('window');

interface ListingDetail {
  id: number;
  title: string;
  description: string;
  placeType: string;
  accommodationType: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  price: number;
  address: {
    addressCity: string;
    addressDistrict: string;
    addressCountry: string;
    addressStreet: string;
  };
  amenities: string[];
  photoUrls: string[];
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reservationData, setReservationData] = useState({
    checkIn: '',
    nights: 1,
    guests: 1,
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const getTotalPrice = () => {
    return listing ? Math.round(listing.price * reservationData.nights) : 0;
  };

  const handleDateChange = (params: any) => {
    const date = params.date;
    if (date) {
      setSelectedDate(date);
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      setReservationData({
        ...reservationData,
        checkIn: formattedDate,
      });
    }
  };

  const confirmDateSelection = () => {
    setShowDatePicker(false);
  };

  useEffect(() => {
    fetchListingDetail();
  }, [id]);

  const fetchListingDetail = async () => {
    try {
      setLoading(true);
      const data = await getListingById(parseInt(id as string));
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing detail:', error);
      Alert.alert('Hata', 'İlan yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowReservationModal(true);
  };

  const submitReservation = async () => {
    if (!reservationData.checkIn) {
      Alert.alert('Hata', 'Lütfen giriş tarihini seçin');
      return;
    }

    if (reservationData.nights <= 0) {
      Alert.alert('Hata', 'Gece sayısı 0 dan büyük olmalıdır');
      return;
    }

    if (reservationData.guests <= 0) {
      Alert.alert('Hata', 'Konuk sayısı 0 dan büyük olmalıdır');
      return;
    }

    if (listing && reservationData.guests > listing.guests) {
      Alert.alert('Hata', `Bu ilan maksimum ${listing.guests} konuk kabul ediyor`);
      return;
    }

    if (!token) {
      Alert.alert('Hata', 'Giriş yapmanız gerekiyor');
      return;
    }

    try {
      setReservationLoading(true);

      // Parse check-in date and calculate check-out date
      const [year, month, day] = reservationData.checkIn.split('-').map(Number);
      const checkInDate = new Date(year, month - 1, day);

      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + reservationData.nights);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const result = await createReservation({
        listingId: parseInt(id as string),
        checkInDate: formatDate(checkInDate),
        checkOutDate: formatDate(checkOutDate),
        numberOfGuests: reservationData.guests,
      }, token);

      if (result.success) {
        Alert.alert('Başarılı', result.message, [
          {
            text: 'Tamam',
            onPress: () => {
              setShowReservationModal(false);
              router.push('/');
            },
          },
        ]);
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Reservation error:', error);
      Alert.alert('Hata', error instanceof Error ? error.message : 'Rezervasyon oluşturulamadı');
    } finally {
      setReservationLoading(false);
    }
  };

  const renderAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: string } = {
      'Wifi': 'wifi',
      'TV': 'television',
      'Mutfak': 'silverware-fork-knife',
      'Çamaşır makinesi': 'washing-machine',
      'Binada ücretsiz otopark': 'parking',
      'Mülkte ücretli otopark': 'currency-usd',
      'Klima': 'air-conditioner',
      'Havuz': 'waves',
      'Veranda': 'sofa',
      'Mangal': 'grill',
      'Özel çalışma alanı': 'desk',
      'Jakuzi': 'hot-tub',
      'Bilarido masası': 'billiards',
      'Şömine': 'fire',
      'Piyano': 'piano',
      'Açık havada yemek alanı': 'table-furniture',
      'Egzersiz ekipmanı': 'dumbbell',
      'Göle erişim': 'water',
      'Plaja erişim': 'beach',
    };
    return iconMap[amenity] || 'check';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF385C" />
          <Text style={styles.loadingText}>İlan yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>İlan bulunamadı</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
            <Text style={styles.backButtonText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Photo Gallery */}
        <View style={styles.photoGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentPhotoIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {listing.photoUrls.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo }}
                style={styles.photo}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Photo Indicator */}
          <View style={styles.photoIndicator}>
            <Text style={styles.photoIndicatorText}>
              {currentPhotoIndex + 1} / {listing.photoUrls.length}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Location */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{listing.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#717171" />
              <Text style={styles.location}>
                {listing.address.addressCity}, {listing.address.addressDistrict}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Host Info */}
          <View style={styles.hostSection}>
            <View style={styles.hostAvatar}>
              <Ionicons name="person" size={32} color="#717171" />
            </View>
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>
                Ev sahibi: {listing.user?.fullName || 'Kullanıcı'}
              </Text>
              <Text style={styles.hostSubtext}>{listing.placeType}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Property Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={24} color="#222" />
              <Text style={styles.detailText}>{listing.guests} Konuk</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="bed-outline" size={24} color="#222" />
              <Text style={styles.detailText}>{listing.bedrooms} Yatak Odası</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="bed-outline" size={24} color="#222" />
              <Text style={styles.detailText}>{listing.beds} Yatak</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="shower" size={24} color="#222" />
              <Text style={styles.detailText}>{listing.bathrooms} Banyo</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <>
              <View style={styles.amenitiesSection}>
                <Text style={styles.sectionTitle}>Olanaklar</Text>
                <View style={styles.amenitiesList}>
                  {listing.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                      <MaterialCommunityIcons
                        name={renderAmenityIcon(amenity) as any}
                        size={24}
                        color="#222"
                      />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.divider} />
            </>
          )}

          {/* Address */}
          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Adres</Text>
            <Text style={styles.addressText}>
              {listing.address.addressStreet}
              {'\n'}
              {listing.address.addressDistrict}, {listing.address.addressCity}
              {'\n'}
              {listing.address.addressCountry}
            </Text>
          </View>

          {/* Bottom Padding */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Bar - Price and Reserve Button */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <Text style={styles.price}>₺{listing.price.toLocaleString('tr-TR')}</Text>
          <Text style={styles.priceUnit}> / gece</Text>
        </View>
        <TouchableOpacity style={styles.reserveButton} onPress={handleReservation}>
          <Text style={styles.reserveButtonText}>Rezervasyon Yap</Text>
        </TouchableOpacity>
      </View>

      {/* Reservation Modal */}
      <Modal
        visible={showReservationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReservationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rezervasyon Detayları</Text>
              <TouchableOpacity onPress={() => setShowReservationModal(false)}>
                <Ionicons name="close" size={28} color="#222" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Check-in Date */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Giriş Tarihi</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <MaterialCommunityIcons name="calendar" size={20} color="#FF385C" />
                  <Text style={styles.dateButtonText}>
                    {reservationData.checkIn ? dayjs(reservationData.checkIn).format('DD MMMM YYYY') : 'Tarih Seçin'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Nights Stepper */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Gece Sayısı</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() =>
                      reservationData.nights > 1 &&
                      setReservationData({
                        ...reservationData,
                        nights: reservationData.nights - 1,
                      })
                    }
                  >
                    <Ionicons name="remove" size={20} color="#FF385C" />
                  </TouchableOpacity>
                  <Text style={styles.stepperDisplay}>{reservationData.nights}</Text>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() =>
                      setReservationData({
                        ...reservationData,
                        nights: reservationData.nights + 1,
                      })
                    }
                  >
                    <Ionicons name="add" size={20} color="#FF385C" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Guests Stepper */}
              <View style={styles.inputSection}>
                <View style={styles.stepperHeader}>
                  <Text style={styles.inputLabel}>Konuk Sayısı</Text>
                  <Text style={styles.maxGuestsText}>Maksimum: {listing?.guests || 1}</Text>
                </View>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={[
                      styles.stepperButton,
                      reservationData.guests <= 1 && styles.stepperButtonDisabled
                    ]}
                    onPress={() =>
                      reservationData.guests > 1 &&
                      setReservationData({
                        ...reservationData,
                        guests: reservationData.guests - 1,
                      })
                    }
                    disabled={reservationData.guests <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={reservationData.guests <= 1 ? "#CCCCCC" : "#FF385C"}
                    />
                  </TouchableOpacity>
                  <Text style={styles.stepperDisplay}>{reservationData.guests}</Text>
                  <TouchableOpacity
                    style={[
                      styles.stepperButton,
                      reservationData.guests >= (listing?.guests || 1) && styles.stepperButtonDisabled
                    ]}
                    onPress={() =>
                      listing && reservationData.guests < listing.guests &&
                      setReservationData({
                        ...reservationData,
                        guests: reservationData.guests + 1,
                      })
                    }
                    disabled={reservationData.guests >= (listing?.guests || 1)}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={reservationData.guests >= (listing?.guests || 1) ? "#CCCCCC" : "#FF385C"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Price Summary */}
              <View style={styles.priceSummary}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>
                    ₺{listing?.price.toLocaleString('tr-TR')} × {reservationData.nights} gece
                  </Text>
                  <Text style={styles.priceValue}>
                    ₺{getTotalPrice().toLocaleString('tr-TR')}
                  </Text>
                </View>
                <View style={styles.priceDivider} />
                <View style={styles.priceRow}>
                  <Text style={styles.totalLabel}>Toplam</Text>
                  <Text style={styles.totalValue}>
                    ₺{getTotalPrice().toLocaleString('tr-TR')}
                  </Text>
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitReservation}
                disabled={reservationLoading}
              >
                {reservationLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Rezervasyonu Tamamla</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Modern Date Picker Modal */}
            {showDatePicker && (
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <View style={styles.datePickerModal}>
                  <View style={styles.datePickerWrapper}>
                    <View style={styles.datePickerHeader}>
                      <Text style={styles.datePickerTitle}>Giriş Tarihi Seçin</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Ionicons name="close" size={24} color="#222" />
                      </TouchableOpacity>
                    </View>

                    <DatePicker
                      mode="single"
                      date={selectedDate}
                      onChange={handleDateChange}
                    />

                    <View style={styles.datePickerFooter}>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={confirmDateSelection}
                      >
                        <Text style={styles.datePickerButtonText}>Tamam</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#717171',
  },
  errorText: {
    fontSize: 18,
    color: '#222',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF385C',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 101,
  },
  scrollView: {
    flex: 1,
  },
  photoGallery: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  photo: {
    width: width,
    height: 300,
  },
  photoIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  photoIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
  },
  titleSection: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 15,
    color: '#717171',
  },
  divider: {
    height: 1,
    backgroundColor: '#EBEBEB',
    marginVertical: 20,
  },
  hostSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  hostSubtext: {
    fontSize: 14,
    color: '#717171',
  },
  detailsSection: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#222',
  },
  descriptionSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  description: {
    fontSize: 15,
    color: '#222',
    lineHeight: 24,
  },
  amenitiesSection: {
    gap: 16,
  },
  amenitiesList: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  amenityText: {
    fontSize: 15,
    color: '#222',
  },
  addressSection: {
    gap: 12,
  },
  addressText: {
    fontSize: 15,
    color: '#222',
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  priceUnit: {
    fontSize: 14,
    color: '#717171',
  },
  reserveButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  modalBody: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f9f9f9',
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  stepperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  maxGuestsText: {
    fontSize: 13,
    color: '#717171',
    fontWeight: '500',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepperButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  stepperDisplay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    minWidth: 40,
    textAlign: 'center',
  },
  priceSummary: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#717171',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#EBEBEB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF385C',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
  },
  submitButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  datePickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  datePickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    backgroundColor: '#fff',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  datePickerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    backgroundColor: '#fff',
  },
  datePickerButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
