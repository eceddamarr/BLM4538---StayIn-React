import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { processPayment } from '@/services/listingService';

interface PaymentModalProps {
  visible: boolean;
  reservationId: number;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

export default function PaymentModal({
  visible,
  reservationId,
  amount,
  onClose,
  onSuccess,
  token,
}: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 16) return cardNumber;
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 4) return;
    if (cleaned.length >= 2) {
      let month = parseInt(cleaned.slice(0, 2));
      if (month > 12) {
        month = 12;
      }
      const monthStr = month.toString().padStart(2, '0');
      const formatted = monthStr + '/' + cleaned.slice(2, 4);
      setExpiryDate(formatted);
    } else {
      setExpiryDate(cleaned);
    }
  };

  const validateForm = () => {
    if (!cardNumber.replace(/\s+/g, '')) {
      setError('Kart numarasını giriniz');
      return false;
    }
    if (cardNumber.replace(/\s+/g, '').length !== 16) {
      setError('Kart numarası 16 haneli olmalıdır');
      return false;
    }
    if (!expiryDate) {
      setError('Son kullanma tarihini giriniz');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      setError('Son kullanma tarihi MM/YY formatında olmalıdır');
      return false;
    }

    const [month, year] = expiryDate.split('/');
    const expiryMonth = parseInt(month);

    if (expiryMonth < 1 || expiryMonth > 12) {
      setError('Ay 01-12 arasında olmalıdır');
      return false;
    }

    const expiryYear = parseInt(`20${year}`);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      setError('Kartın süresi dolmuş');
      return false;
    }

    if (!cvv) {
      setError('CVV giriniz');
      return false;
    }
    if (cvv.length !== 3) {
      setError('CVV 3 haneli olmalıdır');
      return false;
    }
    if (!cardholderName.trim()) {
      setError('Kart sahibinin adını giriniz');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await processPayment(
        {
          reservationId,
          cardNumber,
          cvv,
          expiryDate,
          cardholderName,
          amount,
        },
        token
      );

      if (result.success) {
        resetForm();
        onSuccess();
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ödeme işleminde hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setCvv('');
    setExpiryDate('');
    setCardholderName('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ödeme Yap</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Toplam Tutar</Text>
            <Text style={styles.amount}>₺{amount.toLocaleString('tr-TR')}</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#D92D20" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Kart Numarası</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={19}
                value={cardNumber}
                onChangeText={formatCardNumber}
                editable={!loading}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Son Kullanma</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={5}
                  value={expiryDate}
                  onChangeText={formatExpiryDate}
                  editable={!loading}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry={true}
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 3))}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Kart Sahibinin Adı Soyadı</Text>
              <TextInput
                style={styles.input}
                placeholder="Adı Soyadı"
                placeholderTextColor="#999"
                value={cardholderName}
                onChangeText={setCardholderName}
                editable={!loading}
              />
            </View>

          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.payButton]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.payButtonText}>Ödeme Yap</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  amountContainer: {
    marginTop: 24,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF5A5F',
  },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: '#D92D20',
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
    fontFamily: 'Courier New',
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D9D9D9',
  },
  cancelButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '700',
  },
  payButton: {
    backgroundColor: '#FF385C',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
