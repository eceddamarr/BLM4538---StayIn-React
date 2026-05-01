import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { transformImageUrl } from '@/services/apiClient';
import { getMyReservations, MyReservation, cancelReservation } from '@/services/listingService';

const statusMeta: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Pending: { label: 'Beklemede', color: '#FF9500', bg: '#FFF7E8', border: '#FF9500' },
  Approved: { label: 'Onaylandı', color: '#1F9D55', bg: '#EAF8EF', border: '#1F9D55' },
  Rejected: { label: 'Reddedildi', color: '#D92D20', bg: '#FDECEC', border: '#D92D20' },
  Cancelled: { label: 'İptal', color: '#717171', bg: '#F2F2F2', border: '#BDBDBD' },
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function ReservationCard({
  reservation,
  onPay,
  onCancel,
  isProcessing,
}: {
  reservation: MyReservation;
  onPay: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}) {
  const meta = statusMeta[reservation.status] || statusMeta.Pending;
  const imageUrl = reservation.listingPhotoUrl
    ? transformImageUrl(reservation.listingPhotoUrl)
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900';

  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {reservation.listingTitle}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: meta.bg, borderColor: meta.border }]}>
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#222" />
          <Text style={styles.infoText}>
            {formatDate(reservation.checkInDate)} - {formatDate(reservation.checkOutDate)}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#222" />
            <Text style={styles.infoText}>{reservation.guests} misafir</Text>
          </View>
          <Text style={styles.price}>₺{reservation.totalPrice.toLocaleString('tr-TR')}</Text>
        </View>

        {(reservation.status === 'Approved' || reservation.status === 'Pending') && (
          <View style={styles.paymentButtonRow}>
            {reservation.status === 'Approved' && !reservation.isPaid && (
              <TouchableOpacity
                style={[styles.paymentButton, styles.payButton]}
                onPress={onPay}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="card" size={16} color="#fff" />
                    <Text style={styles.payButtonText}>Ödeme Yap</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.paymentButton, styles.cancelPaymentButton]}
              onPress={onCancel}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FF5A5F" size="small" />
              ) : (
                <Text style={styles.cancelPaymentButtonText}>Rezervasyonu İptal Et</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ReservationsScreen() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [reservations, setReservations] = useState<MyReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });

  const loadReservations = useCallback(async () => {
    if (!token) {
      setReservations([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError('');
      const data = await getMyReservations(token);
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rezervasyonlar yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading) {
      loadReservations();
    }
  }, [isLoading, loadReservations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReservations();
  };

  const handlePay = (reservationId: number) => {
    setProcessingId(reservationId);
    try {
      setSuccessModal({ visible: true, message: 'Ödeme işlemi başlatıldı!' });
      setTimeout(() => {
        setSuccessModal({ visible: false, message: '' });
        setProcessingId(null);
        loadReservations();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      setProcessingId(null);
    }
  };

  const handleCancel = async (reservationId: number) => {
    setProcessingId(reservationId);
    try {
      const response = await cancelReservation(reservationId, token!);
      if (response.success) {
        setSuccessModal({ visible: true, message: 'Rezervasyonun iptal edildi. Host tarafında da iptal olarak görünecek.' });
        setTimeout(() => {
          setSuccessModal({ visible: false, message: '' });
          setProcessingId(null);
          loadReservations();
        }, 1500);
      } else {
        setError(response.message);
        setProcessingId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      setProcessingId(null);
    }
  };

  if (isLoading || loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF385C" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rezervasyonlarım</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#C7C7C7" />
          <Text style={styles.emptyTitle}>Giriş yapman gerekiyor</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login' as never)}>
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
        <BottomNav activeTab="reservations" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Modal
        visible={successModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModal({ visible: false, message: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark-circle-outline" size={56} color="#34c759" />
            </View>
            <Text style={styles.modalTitle}>Başarılı</Text>
            <Text style={styles.modalMessage}>{successModal.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setSuccessModal({ visible: false, message: '' })}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rezervasyonlarım</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF385C" />}
      >
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {reservations.length === 0 && !error ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#C7C7C7" />
            <Text style={styles.emptyTitle}>Henüz rezervasyonun yok</Text>
          </View>
        ) : (
          reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onPay={() => handlePay(reservation.id)}
              onCancel={() => handleCancel(reservation.id)}
              isProcessing={processingId === reservation.id}
            />
          ))
        )}
      </ScrollView>

      <BottomNav activeTab="reservations" />
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
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#EDEDED',
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  statusBadge: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#555',
  },
  bottomRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF5A5F',
  },
  emptyState: {
    flex: 1,
    minHeight: 360,
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
  loginButton: {
    marginTop: 18,
    backgroundColor: '#FF385C',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#D92D20',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 14,
  },
  paymentButtonRow: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 14,
  },
  paymentButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  payButton: {
    backgroundColor: '#1F9D55',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelPaymentButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FF5A5F',
  },
  cancelPaymentButtonText: {
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#34c759',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
