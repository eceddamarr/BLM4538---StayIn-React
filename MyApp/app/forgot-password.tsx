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
import { forgotPasswordApi, verifyCodeApi, resetPasswordApi } from '@/services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSendCode() {
    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen email adresinizi girin.');
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPasswordApi(email.trim());

      if (!result.success) {
        Alert.alert('Hata', result.message || 'Bir hata oluştu.');
        return;
      }

      Alert.alert('Başarılı', 'Doğrulama kodu email adresinize gönderildi.');
      setStep(2);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Bağlantı hatası. Lütfen tekrar deneyin.';
      Alert.alert('Hata', errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!code.trim()) {
      Alert.alert('Hata', 'Lütfen doğrulama kodunu girin.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyCodeApi(email.trim(), code.trim());

      if (!result.success) {
        Alert.alert('Hata', result.message || 'Kod doğrulama başarısız.');
        return;
      }

      Alert.alert('Başarılı', 'Kod doğrulandı. Yeni şifrenizi belirleyebilirsiniz.');
      setStep(3);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Bağlantı hatası. Lütfen tekrar deneyin.';
      Alert.alert('Hata', errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPasswordApi(
        email.trim(),
        code.trim(),
        newPassword,
        confirmPassword
      );

      if (!result.success) {
        Alert.alert('Hata', result.message || 'Şifre sıfırlama başarısız.');
        return;
      }

      Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz.');
      router.back();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Bağlantı hatası. Lütfen tekrar deneyin.';
      Alert.alert('Hata', errorMsg);
    } finally {
      setLoading(false);
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
          <MaterialCommunityIcons name="lock-reset" size={56} color="#ff5a5f" />
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Email adresinizi girin'
              : step === 2
              ? 'Doğrulama kodunu girin'
              : 'Yeni şifrenizi belirleyin'}
          </Text>
        </View>

        <View style={styles.stepsIndicator}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[styles.step, { backgroundColor: s <= step ? '#ff5a5f' : '#e0e0e0' }]}
            />
          ))}
        </View>

        <View style={styles.formContainer}>
          {/* Step 1: Email */}
          {step >= 1 && (
            <>
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
                  editable={step === 1 && !loading}
                />
              </View>
              {step === 1 && (
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Kodu Gönder</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Step 2: Verification Code */}
          {step >= 2 && (
            <>
              <Text style={styles.label}>Doğrulama Kodu</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="numeric" size={20} color="#8a8a8a" />
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  placeholderTextColor="#ababab"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={setCode}
                  editable={step === 2 && !loading}
                />
              </View>
              {step === 2 && (
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Kodu Doğrula</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Step 3: New Password */}
          {step >= 3 && (
            <>
              <Text style={styles.label}>Yeni Şifre</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#8a8a8a" />
                <TextInput
                  style={styles.input}
                  placeholder="********"
                  placeholderTextColor="#ababab"
                  secureTextEntry={!isPasswordVisible}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={step === 3 && !loading}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible((prev) => !prev)}>
                  <Ionicons
                    name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#8a8a8a"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Şifre Tekrar</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#8a8a8a" />
                <TextInput
                  style={styles.input}
                  placeholder="********"
                  placeholderTextColor="#ababab"
                  secureTextEntry={!isConfirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={step === 3 && !loading}
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
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Şifre Değiştir</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  step: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  formContainer: {
    marginTop: 24,
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
});
