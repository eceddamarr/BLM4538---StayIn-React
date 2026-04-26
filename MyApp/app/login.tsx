import { useAuth } from '@/context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setSubmitting(true);
    try {
      await login({
        email: email.trim(),
        password,
      });
      // Giriş başarılı → AuthContext user'ı set eder
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Giriş başarısız.';
      Alert.alert('Giriş Hatası', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#303030" />
          </TouchableOpacity>
        </View>

        <View style={styles.logoWrapper}>
          <MaterialCommunityIcons name="login" size={56} color="#ff5a5f" />
          <Text style={styles.title}>Giriş Yap</Text>
          <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>E-posta</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#8a8a8a" />
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
            <MaterialCommunityIcons name="lock-outline" size={20} color="#8a8a8a" />
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
                size={22}
                color="#8a8a8a"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register')}
            disabled={submitting}
          >
            <Text style={styles.registerButtonText}>Hesap Oluştur</Text>
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#dddddd',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#8a8a8a',
  },
  registerButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff5a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#ff5a5f',
    fontSize: 16,
    fontWeight: '700',
  },
});
