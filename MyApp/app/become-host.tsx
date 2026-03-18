import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';

export default function BecomeHostScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    placeType: 'Daire',
    accommodationType: 'Bütün mekan',
    guests: '2',
    bedrooms: '1',
    beds: '1',
    bathrooms: '1',
    price: '',
    city: '',
    district: '',
    street: '',
    amenities: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.title || !formData.description) {
        Alert.alert('Hata', 'Başlık ve açıklama gerekli');
        return;
      }
    } else if (step === 2) {
      if (!formData.price || !formData.city || !formData.district) {
        Alert.alert('Hata', 'Fiyat ve adres bilgileri gerekli');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!formData.amenities) {
      Alert.alert('Hata', 'En az bir olanağı seçin');
      return;
    }

    setLoading(true);
    try {
      // TODO: API call to submit listing
      Alert.alert('Başarı', 'İlanınız yayınlanmaya hazır!');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'İlan yayınlanırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#212121" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ev Sahipliği Yapın</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((num) => (
            <View key={num} style={styles.progressItem}>
              <View
                style={[
                  styles.progressCircle,
                  { backgroundColor: num <= step ? '#ff5a5f' : '#e5e5e5' },
                ]}
              >
                <Text style={styles.progressText}>{num}</Text>
              </View>
              {num < 3 && (
                <View
                  style={[
                    styles.progressLine,
                    { backgroundColor: num < step ? '#ff5a5f' : '#e5e5e5' },
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {/* Step 1: Temel Bilgiler */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Temel Bilgileriniz</Text>

            <Text style={styles.label}>İlan Başlığı</Text>
            <TextInput
              style={styles.input}
              placeholder="örn: Deniz Manzaralı Villa"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
            />

            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Eviniz hakkında detaylı bilgi..."
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Konaklama Türü</Text>
            <View style={styles.tabs}>
              {['Bütün mekan', 'Özel oda', 'Paylaşımlı'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.tab,
                    formData.accommodationType === type && styles.tabActive,
                  ]}
                  onPress={() => handleInputChange('accommodationType', type)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      formData.accommodationType === type && styles.tabTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Detaylar */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Detaylı Bilgiler</Text>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Konuklar</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  keyboardType="number-pad"
                  value={formData.guests}
                  onChangeText={(value) => handleInputChange('guests', value)}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Yatak Odaları</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  keyboardType="number-pad"
                  value={formData.bedrooms}
                  onChangeText={(value) => handleInputChange('bedrooms', value)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Yataklar</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  keyboardType="number-pad"
                  value={formData.beds}
                  onChangeText={(value) => handleInputChange('beds', value)}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Banyolar</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  keyboardType="number-pad"
                  value={formData.bathrooms}
                  onChangeText={(value) => handleInputChange('bathrooms', value)}
                />
              </View>
            </View>

            <Text style={styles.label}>Nightly Fiyatı (₺)</Text>
            <TextInput
              style={styles.input}
              placeholder="2500"
              keyboardType="decimal-pad"
              value={formData.price}
              onChangeText={(value) => handleInputChange('price', value)}
            />

            <Text style={styles.label}>Şehir</Text>
            <TextInput
              style={styles.input}
              placeholder="İstanbul"
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
            />

            <Text style={styles.label}>İlçe</Text>
            <TextInput
              style={styles.input}
              placeholder="Beyoğlu"
              value={formData.district}
              onChangeText={(value) => handleInputChange('district', value)}
            />

            <Text style={styles.label}>Cadde/Sokak</Text>
            <TextInput
              style={styles.input}
              placeholder="Örnek Caddesi No:123"
              value={formData.street}
              onChangeText={(value) => handleInputChange('street', value)}
            />
          </View>
        )}

        {/* Step 3: Olanaklar */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Olanaklar</Text>
            <Text style={styles.subtitle}>
              Konuklarınız hangi olanaklara erişebilecek?
            </Text>

            <View style={styles.amenitiesList}>
              {[
                { icon: 'wifi', label: 'Wi-Fi' },
                { icon: 'air-conditioner', label: 'Klima' },
                { icon: 'waves', label: 'Havuz' },
                { icon: 'fire', label: 'Şömine' },
                { icon: 'mountain', label: 'Dağ Manzarası' },
                { icon: 'water', label: 'Deniz Manzarası' },
              ].map((amenity) => (
                <TouchableOpacity
                  key={amenity.label}
                  style={styles.amenityItem}
                  onPress={() => {
                    const current = formData.amenities.split(',').filter(Boolean);
                    if (current.includes(amenity.label)) {
                      setFormData((prev) => ({
                        ...prev,
                        amenities: current.filter((a) => a !== amenity.label).join(','),
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        amenities: [...current, amenity.label].join(','),
                      }));
                    }
                  }}
                >
                  <View
                    style={[
                      styles.amenityCheckbox,
                      formData.amenities.includes(amenity.label) && styles.amenityCheckboxActive,
                    ]}
                  >
                    {formData.amenities.includes(amenity.label) && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.amenityLabel}>{amenity.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.backButtonText}>Geri</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextButton, step > 1 && { marginLeft: 12 }]}
            onPress={step === 3 ? handleSubmit : handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>
                {step === 3 ? 'İlanı Yayınla' : 'Devam'}
              </Text>
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
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  progressLine: {
    width: 20,
    height: 2,
    marginHorizontal: 8,
  },
  stepContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8a8a8a',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b3b3b',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#212121',
  },
  textArea: {
    height: 100,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#ff5a5f',
    borderColor: '#ff5a5f',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8a8a8a',
  },
  tabTextActive: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  amenityCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  amenityCheckboxActive: {
    backgroundColor: '#ff5a5f',
    borderColor: '#ff5a5f',
  },
  amenityLabel: {
    fontSize: 13,
    color: '#212121',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ff5a5f',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ff5a5f',
    fontSize: 15,
    fontWeight: '700',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ff5a5f',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
