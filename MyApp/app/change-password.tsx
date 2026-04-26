import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { changeUserPassword } from '@/services/apiClient';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({
    visible: false,
    type: 'error' as 'error' | 'success',
    title: '',
    message: '',
  });

  const showAlert = (type: 'error' | 'success', title: string, message: string) => {
    setAlertModal({ visible: true, type, title, message });
  };

  const handleChangePassword = async () => {
    if (!oldPassword.trim()) {
      showAlert('error', 'Hata', 'Eski şifre gerekli');
      return;
    }

    if (!newPassword.trim()) {
      showAlert('error', 'Hata', 'Yeni şifre gerekli');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('error', 'Hata', 'Yeni şifre en az 6 karakter olmalı');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('error', 'Hata', 'Yeni şifreler eşleşmiyor');
      return;
    }

    if (oldPassword === newPassword) {
      showAlert('error', 'Hata', 'Yeni şifre eski şifre ile aynı olamaz');
      return;
    }

    setLoading(true);
    try {
      const result = await changeUserPassword(oldPassword, newPassword, token!);

      if (result.success) {
        showAlert('success', 'Başarılı', result.message);
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        showAlert('error', 'Hata', result.message);
      }
    } catch (error) {
      showAlert('error', 'Hata', 'Şifre değiştirilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Modal
        visible={alertModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAlertModal({ ...alertModal, visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              {alertModal.type === 'error' ? (
                <Ionicons name="close-circle-outline" size={56} color="#ff5a5f" />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={56} color="#34c759" />
              )}
            </View>
            <Text style={styles.modalTitle}>{alertModal.title}</Text>
            <Text style={styles.modalMessage}>{alertModal.message}</Text>
            <TouchableOpacity
              style={[
                styles.modalButtonSingle,
                alertModal.type === 'success' && styles.modalButtonSuccess,
              ]}
              onPress={() => setAlertModal({ ...alertModal, visible: false })}
            >
              <Text style={styles.modalButtonConfirmText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Şifre Değiştir</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Eski Şifre</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#8a8a8a" />
            <TextInput
              style={styles.input}
              placeholder="Eski şifrenizi girin"
              placeholderTextColor="#ababab"
              secureTextEntry={!showOldPassword}
              value={oldPassword}
              onChangeText={setOldPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
              <Ionicons
                name={showOldPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#8a8a8a"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Yeni Şifre</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-reset-outline" size={20} color="#8a8a8a" />
            <TextInput
              style={styles.input}
              placeholder="Yeni şifrenizi girin"
              placeholderTextColor="#ababab"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
              <Ionicons
                name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#8a8a8a"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-check-outline" size={20} color="#8a8a8a" />
            <TextInput
              style={styles.input}
              placeholder="Yeni şifrenizi tekrar girin"
              placeholderTextColor="#ababab"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#8a8a8a"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.helperText}>Şifre en az 6 karakter olmalıdır</Text>

          <TouchableOpacity
            style={[styles.changeButton, loading && styles.changeButtonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.changeButtonText}>Şifre Değiştir</Text>
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
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  scrollContent: {
    paddingVertical: 20,
  },
  formContainer: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    marginBottom: 8,
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  helperText: {
    fontSize: 12,
    color: '#8a8a8a',
    marginTop: 6,
  },
  changeButton: {
    marginTop: 24,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff5a5f',
  },
  changeButtonDisabled: {
    opacity: 0.7,
  },
  changeButtonText: {
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
    color: '#222',
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
  modalButtonSingle: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ff5a5f',
    alignItems: 'center',
  },
  modalButtonSuccess: {
    backgroundColor: '#34c759',
  },
  modalButtonConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
