import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
import DatePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useAuth } from '@/context/AuthContext';
import {
  getListingById,
  createReservation,
  ReservationDTO,
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite,
  getListingReviews,
  ListingReviewSummary,
  getListingBookedRanges,
  BookedDateRange,
} from '@/services/listingService';
import { transformImageUrl } from '@/services/apiClient';

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
  const defaultDatePickerStyles = useDefaultStyles();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reviewSummary, setReviewSummary] = useState<ListingReviewSummary>({
    totalReviews: 0,
    averageRating: 0,
    reviews: [],
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [bookedRanges, setBookedRanges] = useState<BookedDateRange[]>([]);
  const [reservationData, setReservationData] = useState({
    checkIn: '',
    checkOut: '',
    nights: 0,
    guests: 1,
  });
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);

  const getTotalPrice = () => {
    return listing ? Math.round(listing.price * reservationData.nights) : 0;
  };

  const bookedDates = useMemo(() => {
    const dates: Date[] = [];

    bookedRanges.forEach((range) => {
      const start = dayjs(range.checkInDate).startOf('day');
      const end = dayjs(range.checkOutDate).startOf('day');

      if (!start.isValid() || !end.isValid()) return;

      let current = start;
      while (current.isBefore(end)) {
        dates.push(current.toDate());
        current = current.add(1, 'day');
      }
    });

    return dates;
  }, [bookedRanges]);

  const isDateBooked = (value: any) => {
    const date = dayjs(value).startOf('day');
    if (!date.isValid()) return false;

    return bookedRanges.some((range) => {
      const start = dayjs(range.checkInDate).startOf('day');
      const end = dayjs(range.checkOutDate).startOf('day');
      return date.isSame(start) || (date.isAfter(start) && date.isBefore(end));
    });
  };

  const hasBookedDateInRange = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return false;

    const start = dayjs(checkIn).startOf('day');
    const end = dayjs(checkOut).startOf('day');

    if (!start.isValid() || !end.isValid() || !end.isAfter(start)) return false;

    return bookedRanges.some((range) => {
      const bookedStart = dayjs(range.checkInDate).startOf('day');
      const bookedEnd = dayjs(range.checkOutDate).startOf('day');
      return start.isBefore(bookedEnd) && end.isAfter(bookedStart);
    });
  };

  const showBookedDateError = () => {
    setErrorMessage('Seçtiğiniz konaklama aralığında dolu gün var. Lütfen farklı tarih veya gece sayısı seçin.');
    setShowErrorModal(true);
  };

  const handleDateRangeChange = (params: any) => {
    const startDate = params.startDate;
    const endDate = params.endDate;

    if (startDate && isDateBooked(startDate)) {
      setErrorMessage('Bu giriş tarihi dolu. Lütfen müsait bir tarih seçin.');
      setShowErrorModal(true);
      return;
    }

    const formattedStart = startDate ? dayjs(startDate).format('YYYY-MM-DD') : '';
    const formattedEnd = endDate ? dayjs(endDate).format('YYYY-MM-DD') : '';
    const nights = formattedStart && formattedEnd
      ? dayjs(formattedEnd).diff(dayjs(formattedStart), 'day')
      : 0;

    if (formattedStart && formattedEnd && nights <= 0) {
      setErrorMessage('Çıkış tarihi giriş tarihinden sonra olmalıdır.');
      setShowErrorModal(true);
      return;
    }

    if (hasBookedDateInRange(formattedStart, formattedEnd)) {
      showBookedDateError();
      return;
    }

    setSelectedStartDate(startDate ? dayjs(startDate).toDate() : undefined);
    setSelectedEndDate(endDate ? dayjs(endDate).toDate() : undefined);
    setReservationData({
      ...reservationData,
      checkIn: formattedStart,
      checkOut: formattedEnd,
      nights,
    });
  };

  const confirmDateSelection = () => {
    setShowDatePicker(false);
  };

  const formatReviewDate = (value: string) => {
    const date = dayjs(value);
    return date.isValid() ? date.format('D MMMM YYYY') : value;
  };

  useEffect(() => {
    fetchListingDetail();
  }, [id]);

  const fetchListingDetail = async () => {
    try {
      setLoading(true);
      const listingId = parseInt(id as string);
      const data = await getListingById(listingId);
      setListing(data);
      setReviewsLoading(true);
      getListingReviews(listingId)
        .then(setReviewSummary)
        .finally(() => setReviewsLoading(false));
      getListingBookedRanges(listingId).then(setBookedRanges);

      // İlan favorilerde mi kontrol et
      if (user && token) {
        try {
          const favorite = await checkIsFavorite(listingId.toString(), token);
          setIsFavorite(favorite);
        } catch (error) {
          console.error('Error checking favorite status:', error);
          setIsFavorite(false);
        }
      } else {
        setIsFavorite(false);
      }
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

  const handleFavoritePress = async () => {
    // Giriş kontrolü
    if (!user || !token) {
      setShowLoginModal(true);
      return;
    }

    try {
      const listingId = id as string;
      if (isFavorite) {
        // Favorilerden çıkar
        const result = await removeFromFavorites(listingId, token);
        if (result.success) {
          setIsFavorite(false);
        } else {
          Alert.alert('Hata', result.message);
        }
      } else {
        // Favorilere ekle
        const result = await addToFavorites(listingId, token);
        if (result.success) {
          setIsFavorite(true);
        } else {
          Alert.alert('Hata', result.message);
        }
      }
    } catch (error) {
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi');
      console.error('Favorite error:', error);
    }
  };

  const submitReservation = async () => {
    if (!reservationData.checkIn || !reservationData.checkOut) {
      setErrorMessage('Lütfen giriş ve çıkış tarihlerini seçin');
      setShowErrorModal(true);
      return;
    }

    if (reservationData.nights <= 0) {
      setErrorMessage('Konaklama süresi en az 1 gece olmalıdır');
      setShowErrorModal(true);
      return;
    }

    if (reservationData.guests <= 0) {
      setErrorMessage('Konuk sayısı 0 dan büyük olmalıdır');
      setShowErrorModal(true);
      return;
    }

    if (listing && reservationData.guests > listing.guests) {
      setErrorMessage(`Bu ilan maksimum ${listing.guests} konuk kabul ediyor`);
      setShowErrorModal(true);
      return;
    }

    if (!token) {
      setErrorMessage('Giriş yapmanız gerekiyor');
      setShowErrorModal(true);
      return;
    }

    if (hasBookedDateInRange(reservationData.checkIn, reservationData.checkOut)) {
      setErrorMessage('Seçtiğiniz konaklama aralığında dolu gün var. Lütfen farklı tarih veya gece sayısı seçin.');
      setShowErrorModal(true);
      return;
    }

    try {
      setReservationLoading(true);

      const reservationPayload = {
        listingId: parseInt(id as string),
        checkInDate: reservationData.checkIn,
        checkOutDate: reservationData.checkOut,
        guests: reservationData.guests,
      };

      console.log('Rezervasyon gönderiliyor:', reservationPayload);

      const result = await createReservation(reservationPayload, token);

      console.log('Rezervasyon response:', result);

      if (result.success) {
        setShowReservationModal(false);
        setShowSuccessModal(true);
      } else {
        setErrorMessage(result.message);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Reservation error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Rezervasyon oluşturulamadı');
      setShowErrorModal(true);
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
        <TouchableOpacity onPress={handleFavoritePress} style={styles.headerButton}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#FF385C' : '#222'}
          />
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
                source={{ uri: transformImageUrl(photo) }}
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

          <View style={styles.divider} />

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Yorumlar</Text>
              {reviewSummary.totalReviews > 0 && (
                <View style={styles.reviewSummaryBadge}>
                  <Ionicons name="star" size={15} color="#FF385C" />
                  <Text style={styles.reviewSummaryText}>
                    {reviewSummary.averageRating.toFixed(1)} · {reviewSummary.totalReviews} yorum
                  </Text>
                </View>
              )}
            </View>

            {reviewsLoading ? (
              <View style={styles.reviewsLoading}>
                <ActivityIndicator color="#FF385C" />
              </View>
            ) : reviewSummary.reviews.length === 0 ? (
              <View style={styles.emptyReviews}>
                <Ionicons name="chatbubble-ellipses-outline" size={28} color="#B0B0B0" />
                <Text style={styles.emptyReviewsText}>Bu ilan için henüz yorum yok.</Text>
              </View>
            ) : (
              <View style={styles.reviewsList}>
                {reviewSummary.reviews.map((review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewTopRow}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>
                          {review.guestName.trim().charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.reviewGuestInfo}>
                        <Text style={styles.reviewGuestName}>{review.guestName}</Text>
                        <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
                      </View>
                      <View style={styles.reviewRating}>
                        <Ionicons name="star" size={14} color="#FF385C" />
                        <Text style={styles.reviewRatingText}>{review.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  </View>
                ))}
              </View>
            )}
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
              {/* Stay Dates */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Konaklama Tarihleri</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <MaterialCommunityIcons name="calendar" size={20} color="#FF385C" />
                  <View style={styles.dateRangeTextGroup}>
                    <Text style={styles.dateButtonText}>
                      {reservationData.checkIn && reservationData.checkOut
                        ? `${dayjs(reservationData.checkIn).format('DD MMM YYYY')} - ${dayjs(reservationData.checkOut).format('DD MMM YYYY')}`
                        : 'Giriş ve çıkış tarihi seçin'}
                    </Text>
                    {reservationData.nights > 0 && (
                      <Text style={styles.dateRangeSubText}>{reservationData.nights} gece</Text>
                    )}
                  </View>
                </TouchableOpacity>
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
                      <Text style={styles.datePickerTitle}>Giriş ve Çıkış Tarihi Seçin</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Ionicons name="close" size={24} color="#222" />
                      </TouchableOpacity>
                    </View>

                    <DatePicker
                      mode="range"
                      startDate={selectedStartDate}
                      endDate={selectedEndDate}
                      onChange={handleDateRangeChange}
                      minDate={new Date()}
                      disabledDates={bookedDates}
                      styles={{
                        ...defaultDatePickerStyles,
                        selected: styles.datePickerSelectedDay,
                        selected_label: styles.datePickerSelectedLabel,
                        range_start: styles.datePickerSelectedDay,
                        range_start_label: styles.datePickerSelectedLabel,
                        range_end: styles.datePickerSelectedDay,
                        range_end_label: styles.datePickerSelectedLabel,
                        range_middle: styles.datePickerRangeMiddle,
                        range_middle_label: styles.datePickerRangeMiddleLabel,
                        disabled: styles.datePickerDisabledDay,
                        disabled_label: styles.datePickerDisabledLabel,
                        today: styles.datePickerToday,
                      }}
                    />
                    <View style={styles.datePickerHintRow}>
                      <View style={styles.bookedDot} />
                      <Text style={styles.datePickerHintText}>Dolu günler seçilemez.</Text>
                    </View>
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

      {/* Login Modal */}
      <Modal
        visible={showLoginModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={styles.loginModalOverlay}>
          <View style={styles.loginModalContent}>
            <Text style={styles.loginModalTitle}>Giriş Yapmanız Gerekiyor</Text>
            <Text style={styles.loginModalMessage}>
              Favorilerini yönetmek için hesabınıza giriş yapmanız gerekiyor
            </Text>
            <View style={styles.loginModalButtons}>
              <TouchableOpacity
                style={styles.loginModalCancelButton}
                onPress={() => setShowLoginModal(false)}
              >
                <Text style={styles.loginModalCancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.loginModalLoginButton}
                onPress={() => {
                  setShowLoginModal(false);
                  router.push('/login');
                }}
              >
                <Text style={styles.loginModalLoginButtonText}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color="#1F9D55" />
            </View>
            <Text style={styles.successModalTitle}>Rezervasyon Başarılı!</Text>
            <Text style={styles.successModalMessage}>
              Rezervasyon talebiniz gönderildi. Ev sahibinin onayını bekleyin.
            </Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.push('/');
              }}
            >
              <Text style={styles.successModalButtonText}>Ana Sayfaya Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.errorModalOverlay}>
          <View style={styles.errorModalContent}>
            <View style={styles.errorIcon}>
              <Ionicons name="close-circle" size={64} color="#D92D20" />
            </View>
            <Text style={styles.errorModalTitle}>Hata</Text>
            <Text style={styles.errorModalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.errorModalButtonText}>Tamam</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
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
  reviewsSection: {
    gap: 16,
  },
  reviewsHeader: {
    gap: 8,
  },
  reviewSummaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
  },
  reviewSummaryText: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
  },
  reviewsLoading: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyReviews: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  emptyReviewsText: {
    color: '#717171',
    fontSize: 14,
  },
  reviewsList: {
    gap: 14,
  },
  reviewItem: {
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#fff',
  },
  reviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reviewAvatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  reviewGuestInfo: {
    flex: 1,
  },
  reviewGuestName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  reviewDate: {
    marginTop: 2,
    fontSize: 12,
    color: '#717171',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
  },
  reviewComment: {
    fontSize: 14,
    color: '#222',
    lineHeight: 21,
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
  dateRangeTextGroup: {
    flex: 1,
    gap: 4,
  },
  dateRangeSubText: {
    fontSize: 13,
    color: '#717171',
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
  datePickerSelectedDay: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
  },
  datePickerSelectedLabel: {
    color: '#fff',
    fontWeight: '700',
  },
  datePickerRangeMiddle: {
    backgroundColor: '#FFE8EE',
    borderRadius: 8,
  },
  datePickerRangeMiddleLabel: {
    color: '#222',
    fontWeight: '600',
  },
  datePickerDisabledDay: {
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    opacity: 1,
  },
  datePickerDisabledLabel: {
    color: '#9A9A9A',
    textDecorationLine: 'line-through',
  },
  datePickerToday: {
    borderWidth: 1,
    borderColor: '#FF385C',
    borderRadius: 8,
  },
  datePickerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    backgroundColor: '#fff',
  },
  datePickerHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  bookedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B0B0B0',
  },
  datePickerHintText: {
    fontSize: 13,
    color: '#717171',
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
  loginModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginModalContent: {
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
  loginModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginModalMessage: {
    fontSize: 16,
    color: '#717171',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  loginModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  loginModalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
  },
  loginModalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  loginModalLoginButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF385C',
    alignItems: 'center',
  },
  loginModalLoginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successIcon: {
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  successModalMessage: {
    fontSize: 16,
    color: '#717171',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  successModalButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  successModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorModalMessage: {
    fontSize: 16,
    color: '#717171',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorModalButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  errorModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
