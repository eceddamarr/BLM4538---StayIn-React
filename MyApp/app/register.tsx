import { useAuth } from '@/context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const showValidationError = (message: string) => {
    setErrorModal({ visible: true, title: 'Hata', message });
  };

  function goBackOrHome() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }

  const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 11);

  const isValidFullName = (value: string) => {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    return parts.length >= 2 && parts.every((part) => part.length >= 2);
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  async function handleRegister() {
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    if (!trimmedFullName || !trimmedEmail || !normalizedPhone || !password || !confirmPassword) {
      showValidationError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (!isValidFullName(trimmedFullName)) {
      showValidationError('Ad soyad en az iki kelimeden oluşmalı. Örn: Ayşe Demir');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      showValidationError('Geçerli bir e-posta adresi girin.');
      return;
    }
    if (!/^0\d{10}$/.test(normalizedPhone)) {
      showValidationError('Telefon numarası 0 ile başlamalı ve 11 rakamlı olmalı.');
      return;
    }
    if (password !== confirmPassword) {
      showValidationError('Şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 6) {
      showValidationError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        fullName: trimmedFullName,
        email: trimmedEmail,
        phoneNumber: normalizedPhone,
        password,
        passwordConfirm: confirmPassword,
      });
      goBackOrHome();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kayıt başarısız.';
      setErrorModal({ visible: true, title: 'Kayıt Hatası', message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={errorModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setErrorModal({ visible: false, title: '', message: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="alert-circle-outline" size={56} color="#ff5a5f" />
            </View>
            <Text style={styles.modalTitle}>{errorModal.title}</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorModal({ visible: false, title: '', message: '' })}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.closeButton} onPress={goBackOrHome}>
            <Ionicons name="close" size={24} color="#303030" />
          </TouchableOpacity>
        </View>

        <View style={styles.logoWrapper}>
          <MaterialCommunityIcons name="account-plus" size={56} color="#ff5a5f" />
          <Text style={styles.title}>Kayıt Ol</Text>
          <Text style={styles.subtitle}>Yeni bir hesap oluşturun</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Ad Soyad</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="account-outline" size={20} color="#8a8a8a" />
            <TextInput
              style={styles.input}
              placeholder="Adınızı ve soyadınızı girin"
              placeholderTextColor="#ababab"
              value={fullName}
              onChangeText={setFullName}
              editable={!submitting}
            />
          </View>

          <Text style={styles.label}>E-posta</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#8a8a8a" />
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              placeholderTextColor="#ababab"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!submitting}
            />
          </View>

          <Text style={styles.label}>Telefon</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="phone-outline" size={20} color="#8a8a8a" />
            <TextInput
              style={styles.input}
              placeholder="05XXXXXXXXX"
              placeholderTextColor="#ababab"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(value) => setPhone(normalizePhone(value))}
              maxLength={11}
              editable={!submitting}
            />
          </View>

          <Text style={styles.label}>Şifre</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#8a8a8a" />
            <TextInput
              style={styles.input}
              placeholder="En az 6 karakter"
              placeholderTextColor="#ababab"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              editable={!submitting}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible((prev) => !prev)}>
              <Ionicons
                name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color="#8a8a8a"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Şifreyi Onayla</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#8a8a8a" />
            <TextInput
              style={styles.input}
              placeholder="Şifrenizi tekrar girin"
              placeholderTextColor="#ababab"
              secureTextEntry={!isConfirmPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!submitting}
            />
            <TouchableOpacity onPress={() => setIsConfirmPasswordVisible((prev) => !prev)}>
              <Ionicons
                name={isConfirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color="#8a8a8a"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleRegister}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 28,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    marginTop: 4,
    fontSize: 32,
    fontWeight: '700',
    color: '#212121',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#8a8a8a',
  },
  formContainer: {
    marginTop: 18,
    marginHorizontal: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    backgroundColor: '#f8f8f8',
  },
  label: {
    marginBottom: 7,
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#3b3b3b',
  },
  inputWrapper: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dddddd',
    backgroundColor: '#efefef',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
  },
  submitButton: {
    marginTop: 22,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ff5a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
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
    backgroundColor: '#ff5a5f',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
