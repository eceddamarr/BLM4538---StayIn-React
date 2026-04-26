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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { transformImageUrl } from '@/services/apiClient';
import { getMyReservations, MyReservation } from '@/services/listingService';

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

function ReservationCard({ reservation }: { reservation: MyReservation }) {
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
            <ReservationCard key={reservation.id} reservation={reservation} />
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
});
