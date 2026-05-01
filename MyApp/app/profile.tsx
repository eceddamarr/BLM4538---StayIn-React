import { useAuth } from '@/context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoading, login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [alertModal, setAlertModal] = useState({
    visible: false,
    type: 'error' as 'error' | 'success',
    title: '',
    message: '',
  });

  const showAlert = (type: 'error' | 'success', title: string, message: string) => {
    setAlertModal({ visible: true, type, title, message });
  };

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      showAlert('error', 'Hata', 'E-posta ve şifre gerekli.');
      return;
    }
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Giriş başarısız.';
      showAlert('error', 'Giriş Hatası', message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    setShowLogoutModal(true);
  }

  async function confirmLogout() {
    setShowLogoutModal(false);
    await logout();
    router.replace('/');
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ff5a5f" />
      </SafeAreaView>
    );
  }

  // Giriş yapılmış: profil ekranı
  if (user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="log-out-outline" size={48} color="#ff5a5f" />
              </View>
              <Text style={styles.modalTitle}>Çıkış Yap</Text>
              <Text style={styles.modalMessage}>
                Hesabınızdan çıkmak istediğinize emin misiniz?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.modalButtonCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonConfirm}
                  onPress={confirmLogout}
                >
                  <Text style={styles.modalButtonConfirmText}>Çıkış Yap</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* General Alert Modal */}
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
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user.fullName?.charAt(0).toUpperCase() || 'P'}
              </Text>
            </View>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          {/* Ev Sahipliği Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ev Sahipliği</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/become-host' as never)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFE8EB' }]}>
                <MaterialCommunityIcons name="home-plus-outline" size={24} color="#ff5a5f" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Ev Sahipliği Yapın</Text>
                <Text style={styles.menuSubtitle}>Mekanınızı paylaşın ve kazanın</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cccccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/incoming-requests' as never)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFE8EB' }]}>
                <MaterialCommunityIcons name="calendar-check" size={24} color="#ff5a5f" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Gelen Rezervasyon Talepleri</Text>
                <Text style={styles.menuSubtitle}>Rezervasyon isteklerini yönetin</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cccccc" />
            </TouchableOpacity>
          </View>

          {/* Hesap Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Hesap</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/edit-profile' as never)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#E8F3FF' }]}>
                <MaterialCommunityIcons name="account-edit" size={24} color="#007AFF" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Profili Düzenle</Text>
                <Text style={styles.menuSubtitle}>Adı, email ve telefon bilgilerini güncelleyin</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cccccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/change-password' as never)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons name="lock-reset" size={24} color="#FF9800" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Şifre Değiştir</Text>
                <Text style={styles.menuSubtitle}>Hesap şifrenizi güncelleyin</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cccccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFEBEE' }]}>
                <MaterialCommunityIcons name="logout" size={24} color="#DC2C2C" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Çıkış Yap</Text>
                <Text style={styles.menuSubtitle}>Hesabınızdan çıkış yapın</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cccccc" />
            </TouchableOpacity>
          </View>
        </ScrollView>
        <BottomNav activeTab="profile" />
      </SafeAreaView>
    );
  }

  // Giriş yapılmamış: login ekranı
  return (
    <SafeAreaView style={styles.container}>
      {/* General Alert Modal */}
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoWrapper}>
          <MaterialCommunityIcons name="home" size={56} color="#ff5a5f" />
          <Text style={styles.brand}>StayIn</Text>
          <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>E-posta</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="email-outline" size={19} color="#8a8a8a" />
            <TextInput
              style={styles.input}
              placeholder="abc@email.com"
              placeholderTextColor="#ababab"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!submitting}
            />
          </View>

          <Text style={styles.label}>Şifre</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={19} color="#8a8a8a" />
            <TextInput
              style={styles.input}
              placeholder="********"
              placeholderTextColor="#ababab"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              editable={!submitting}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible((prev) => !prev)}>
              <Ionicons
                name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#8a8a8a"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Şifremi unuttum</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, submitting && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerCard}>
            <Text style={styles.registerPrompt}>Hesabınız yok mu?</Text>
            <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/register' as never)}>
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <BottomNav activeTab="profile" />
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
    fontWeight: '600',
    color: '#222',
  },
  scrollContent: {
    paddingBottom: 28,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff5a5f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8a8a8a',
  },
  sectionContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#717171',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#8a8a8a',
  },
  // Login/Register Styles
  logoWrapper: {
    alignItems: 'center',
    marginTop: 48,
  },
  brand: {
    marginTop: 4,
    fontSize: 24,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#efefef',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
  },
  forgotPasswordButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#ff5a5f',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 18,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff5a5f',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  registerCard: {
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerPrompt: {
    fontSize: 15,
    color: '#727272',
    marginBottom: 10,
  },
  registerButton: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ff5a5f',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  registerButtonText: {
    color: '#ff5a5f',
    fontSize: 16,
    fontWeight: '700',
  },
  // Modal Styles
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalButtonCancelText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ff5a5f',
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
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
});
