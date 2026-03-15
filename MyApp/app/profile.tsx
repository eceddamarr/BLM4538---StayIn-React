import { useAuth } from '@/context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomNav from '../components/BottomNav';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoading, login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'E-posta ve şifre gerekli.');
      return;
    }
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Giriş başarısız.';
      Alert.alert('Giriş Hatası', message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Hesabınızdan çıkmak istediğinize emin misiniz?');
      if (confirmed) {
        await logout();
        router.replace('/');
      }
      return;
    }
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
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
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoWrapper}>
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account" size={48} color="#fff" />
            </View>
            <Text style={styles.brand}>{user.fullName}</Text>
            <Text style={styles.subtitle}>{user.role}</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#8a8a8a" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>E-posta</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone-outline" size={20} color="#8a8a8a" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Telefon</Text>
                <Text style={styles.infoValue}>{user.phoneNumber}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ff5a5f" />
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </ScrollView>
        <BottomNav activeTab="profile" />
      </SafeAreaView>
    );
  }

  // Giriş yapılmamış: login ekranı
  return (
    <SafeAreaView style={styles.container}>
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
              placeholder="örnek@email.com"
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
    backgroundColor: '#f5f5f5',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 28,
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: 48,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff5a5f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8a8a8a',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#212121',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ff5a5f',
    backgroundColor: '#fff',
  },
  logoutButtonText: {
    color: '#ff5a5f',
    fontSize: 16,
    fontWeight: '700',
  },
});
