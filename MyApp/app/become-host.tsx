import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { createListing, CreateListingDTO, getMyListingDetail, updateListing } from '@/services/listingService';
import { uploadPhotos } from '@/services/uploadService';
import { transformImageUrl } from '@/services/apiClient';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BecomeHostScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams();
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(!!editId); // editId varsa başta loading true
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [showExitModal, setShowExitModal] = useState(false);
  const [alertModal, setAlertModal] = useState({
    visible: false,
    type: 'error' as 'error' | 'success',
    title: '',
    message: '',
  });

  const showAlert = (type: 'error' | 'success', title: string, message: string) => {
    setAlertModal({ visible: true, type, title, message });
  };

  // editId varsa ilanı yükle
  useEffect(() => {
    const loadListingData = async () => {
      if (!editId) {
        // Yeni listing oluştur
        setInitialLoading(false);
        return;
      }

      if (!token) {
        console.log('Token yok');
        setInitialLoading(false);
        return;
      }

      try {
        console.log('Loading listing with editId:', editId);
        const listingId = parseInt(editId as string, 10);
        if (isNaN(listingId)) {
          throw new Error('Invalid listing ID');
        }
        const listingData = await getMyListingDetail(listingId, token);
        console.log('Loaded listing data:', listingData);
        if (listingData) {
          // Form fieldlarını doldur (undefined değerleri handle et)
          setFormData({
            title: listingData.title || '',
            description: listingData.description || '',
            placeType: listingData.placeType || 'Daire',
            accommodationType: listingData.accommodationType || 'Bütün mekan',
            guests: (listingData.guests || 2).toString(),
            bedrooms: (listingData.bedrooms || 1).toString(),
            beds: (listingData.beds || 1).toString(),
            bathrooms: (listingData.bathrooms || 1).toString(),
            price: (listingData.price || 0).toString(),
            amenities: Array.isArray(listingData.amenities) ? listingData.amenities.join(', ') : '',
            AddressCountry: listingData.address?.addressCountry || '',
            AddressCity: listingData.address?.addressCity || '',
            AddressDistrict: listingData.address?.addressDistrict || '',
            AddressStreet: listingData.address?.addressStreet || '',
            AddressBuilding: listingData.address?.addressBuilding || '',
            AddressPostalCode: listingData.address?.addressPostalCode || '',
            AddressRegion: listingData.address?.addressRegion || '',
          });
          setExistingPhotos(listingData.photoUrls || []);
        }
      } catch (error) {
        console.error('Error loading listing:', error);
        showAlert('error', 'Hata', 'İlan yüklenirken hata oluştu');
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    };

    loadListingData();
  }, [editId, token]);

  const handleExitConfirm = () => {
    setShowExitModal(true);
  };

  const handleExitYes = () => {
    setShowExitModal(false);
    router.push('/');
  };

  const handleExitNo = () => {
    setShowExitModal(false);
  };

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
    amenities: '',
    AddressCountry: '',
    AddressCity: '',
    AddressDistrict: '',
    AddressStreet: '',
    AddressBuilding: '',
    AddressPostalCode: '',
    AddressRegion: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        selectionLimit: 10 - photos.length,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhotos = result.assets.map(asset => asset.uri);
        const totalPhotos = photos.length + newPhotos.length;
        
        if (totalPhotos <= 10) {
          setPhotos([...photos, ...newPhotos]);
        } else {
          showAlert('error', 'Hata', `Maksimum 10 fotoğraf yükleyebilirsiniz. ${10 - photos.length} fotoğraf boşluğu kaldı.`);
        }
      }
    } catch {
      showAlert('error', 'Hata', 'Fotoğraf seçilirken hata oluştu');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.title || !formData.description || !formData.placeType) {
        showAlert('error', 'Hata', 'Başlık, açıklama ve mekan türü seçimi gerekli');
        return;
      }
    }
    if (step === 4) {
      if (!formData.AddressCountry || !formData.AddressCity || !formData.AddressDistrict || !formData.AddressStreet) {
        showAlert('error', 'Hata', 'Lütfen tam adres bilgisini girin');
        return;
      }
    }
    if (step === 5) {
      const totalPhotos = existingPhotos.length + photos.length;
      const minRequired = editId ? 1 : 3; // Düzenle modunda yalnızca 1 fotoğraf gerekli
      if (totalPhotos < minRequired) {
        showAlert('error', 'Hata', editId
          ? 'En az 1 fotoğraf gerekli'
          : 'En az 3 fotoğraf yüklemek gerekli');
        return;
      }
    }
    if (step === 6) {
      if (!formData.price) {
        showAlert('error', 'Hata', 'Lütfen fiyat belirleyin');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!formData.price) {
      showAlert('error', 'Hata', 'Lütfen fiyat belirleyin');
      return;
    }

    if (!token) {
      showAlert('error', 'Hata', 'Giriş yapmanız gerekiyor');
      return;
    }

    const totalPhotos = existingPhotos.length + photos.length;
    const minRequired = editId ? 1 : 3;
    if (totalPhotos < minRequired) {
      showAlert('error', 'Hata', editId
        ? 'En az 1 fotoğraf gerekli'
        : 'En az 3 fotoğraf yüklemek gerekli');
      return;
    }

    setLoading(true);
    try {
      let allPhotoUrls = [...existingPhotos]; // Var olan fotoğraflar

      // Sadece yeni Photos varsa yükle
      if (photos.length > 0) {
        showAlert('success', 'Yükleniyor', 'Fotoğraflar yükleniyor...');
        const newPhotoUrls = await uploadPhotos(photos, token, (current, total) => {
          setUploadProgress({ current, total });
        });
        allPhotoUrls = [...existingPhotos, ...newPhotoUrls];
      }

      // İlan verilerini hazırla
      const listingData = {
        placeType: formData.placeType,
        accommodationType: formData.accommodationType,
        guests: parseInt(formData.guests) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        beds: parseInt(formData.beds) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        addressCountry: formData.AddressCountry,
        addressCity: formData.AddressCity,
        addressDistrict: formData.AddressDistrict,
        addressStreet: formData.AddressStreet,
        addressBuilding: formData.AddressBuilding || undefined,
        addressPostalCode: formData.AddressPostalCode || undefined,
        addressRegion: formData.AddressRegion || undefined,
        amenities: formData.amenities ? formData.amenities.split(',').filter(Boolean) : [],
        photoUrls: allPhotoUrls,
      };

      let result;
      if (editId) {
        // Var olan ilanı güncelle
        const listingId = parseInt(editId as string, 10);
        result = await updateListing(listingId, listingData, token);
      } else {
        // Yeni ilan oluştur
        result = await createListing(listingData, token);
      }

      if (result.success) {
        showAlert('success', 'Başarı', editId ? 'İlanınız başarıyla güncellendi!' : 'İlanınız başarıyla yayınlandı!');
        setTimeout(() => {
          router.replace('/my-listings');
        }, 1500);
      } else {
        showAlert('error', 'Hata', result.message);
      }
    } catch (error) {
      console.error('Listing error:', error);
      showAlert('error', 'Hata', 'İlan işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="warning-outline" size={48} color="#ff5a5f" />
            </View>
            <Text style={styles.modalTitle}>İlan Düzenlemekten Vazgeç</Text>
            <Text style={styles.modalMessage}>
              İlan düzenlemekten vazgeçmek istediğinize emin misiniz? Kaydetmeden ana sayfaya döneceksiniz.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={handleExitNo}
              >
                <Text style={styles.modalButtonCancelText}>Hayır</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleExitYes}
              >
                <Text style={styles.modalButtonConfirmText}>Evet, Vazgeç</Text>
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
              <Ionicons
                name={alertModal.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                size={48}
                color={alertModal.type === 'success' ? '#34C759' : '#ff5a5f'}
              />
            </View>
            <Text style={styles.modalTitle}>{alertModal.title}</Text>
            <Text style={styles.modalMessage}>{alertModal.message}</Text>
            <TouchableOpacity
              style={styles.modalButtonConfirm}
              onPress={() => setAlertModal({ ...alertModal, visible: false })}
            >
              <Text style={styles.modalButtonConfirmText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loading State */}
      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff5a5f" />
          <Text style={styles.loadingText}>İlan yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleExitConfirm}>
            <Ionicons name="chevron-back" size={28} color="#212121" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ev Sahipliği Yapın</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <View key={num} style={styles.progressItem}>
              <View
                style={[
                  styles.progressCircle,
                  { backgroundColor: num <= step ? '#ff5a5f' : '#e5e5e5' },
                ]}
              >
                <Text style={styles.progressText}>{num}</Text>
              </View>
              {num < 6 && (
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

            <Text style={styles.label}>Aşağıdakilerden hangisi yerinizi en iyi tanımlıyor?</Text>
            <View style={styles.placeTypeGrid}>
              {[
                { label: 'Ev', icon: 'home' },
                { label: 'Daire', icon: 'home-variant' },
                { label: 'Ambar', icon: 'warehouse' },
                { label: 'Oda-Kahvaltı', icon: 'bed' },
                { label: 'Tekne', icon: 'ferry' },
                { label: 'Kulübe', icon: 'tent' },
                { label: 'Kamp Aracı', icon: 'caravan' },
                { label: 'Casa Particular', icon: 'home-group' },
              ].map((place) => (
                <TouchableOpacity
                  key={place.label}
                  style={[
                    styles.placeTypeButton,
                    formData.placeType === place.label && styles.placeTypeButtonActive,
                  ]}
                  onPress={() => handleInputChange('placeType', place.label)}
                >
                  <MaterialCommunityIcons
                    name={place.icon as any}
                    size={24}
                    color={formData.placeType === place.label ? '#ff5a5f' : '#8a8a8a'}
                  />
                  <Text
                    style={[
                      styles.placeTypeLabel,
                      formData.placeType === place.label && styles.placeTypeLabelActive,
                    ]}
                  >
                    {place.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
            <Text style={styles.stepTitle}>Kapasite Bilgileri</Text>

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
          </View>
        )}

        {/* Step 3: Olanaklar */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Olanaklar</Text>
            <Text style={styles.subtitle}>
              Konuklarınız hangi olanaklara erişebilecek?
            </Text>

            <View style={styles.amenitiesGrid}>
              {[
                { icon: 'wifi', label: 'Wifi' },
                { icon: 'television', label: 'TV' },
                { icon: 'silverware-fork-knife', label: 'Mutfak' },
                { icon: 'washing-machine', label: 'Çamaşır makinesi' },
                { icon: 'parking', label: 'Binada ücretsiz otopark' },
                { icon: 'currency-usd', label: 'Mülkte ücretli otopark' },
                { icon: 'air-conditioner', label: 'Klima' },
                { icon: 'waves', label: 'Havuz' },
                { icon: 'sofa', label: 'Veranda' },
                { icon: 'grill', label: 'Mangal' },
                { icon: 'desk', label: 'Özel çalışma alanı' },
                { icon: 'hot-tub', label: 'Jakuzi' },
                { icon: 'billiards', label: 'Bilarido masası' },
                { icon: 'fire', label: 'Şömine' },
                { icon: 'piano', label: 'Piyano' },
                { icon: 'table-furniture', label: 'Açık havada yemek alanı' },
                { icon: 'dumbbell', label: 'Egzersiz ekipmanı' },
                { icon: 'water', label: 'Göle erişim' },
                { icon: 'beach', label: 'Plaja erişim' },
              ].map((amenity) => (
                <TouchableOpacity
                  key={amenity.label}
                  style={[
                    styles.amenityPill,
                    formData.amenities.includes(amenity.label) && styles.amenityPillActive,
                  ]}
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
                  {formData.amenities.includes(amenity.label) && (
                    <Ionicons name="checkmark" size={16} color="#ff5a5f" style={styles.amenityCheckmark} />
                  )}
                  <MaterialCommunityIcons
                    name={amenity.icon as any}
                    size={18}
                    color={formData.amenities.includes(amenity.label) ? '#ff5a5f' : '#8a8a8a'}
                  />
                  <Text
                    style={[
                      styles.amenityPillLabel,
                      formData.amenities.includes(amenity.label) && styles.amenityPillLabelActive,
                    ]}
                  >
                    {amenity.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 4: Adres Bilgileri */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Adres Bilgileri</Text>
            <Text style={styles.subtitle}>
              Lütfen kalacağınız yerin tam adresini girin
            </Text>

            <Text style={styles.label}>Ülke</Text>
            <TextInput
              style={styles.input}
              placeholder="örn: Türkiye"
              value={formData.AddressCountry}
              onChangeText={(value) => handleInputChange('AddressCountry', value)}
            />

            <Text style={styles.label}>Bölge</Text>
            <TextInput
              style={styles.input}
              placeholder="örn: Marmara"
              value={formData.AddressRegion}
              onChangeText={(value) => handleInputChange('AddressRegion', value)}
            />

            <Text style={styles.label}>İl</Text>
            <TextInput
              style={styles.input}
              placeholder="örn: İstanbul"
              value={formData.AddressCity}
              onChangeText={(value) => handleInputChange('AddressCity', value)}
            />

            <Text style={styles.label}>İlçe</Text>
            <TextInput
              style={styles.input}
              placeholder="örn: Beyoğlu"
              value={formData.AddressDistrict}
              onChangeText={(value) => handleInputChange('AddressDistrict', value)}
            />

            <Text style={styles.label}>Sokak/Cadde/Mahalle</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Sokak, cadde veya mahalle bilgisini girin. Örneğin: İstiklal Caddesi No: 45, Daire 5"
              value={formData.AddressStreet}
              onChangeText={(value) => handleInputChange('AddressStreet', value)}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Bina/Bölüm Numarası</Text>
            <TextInput
              style={styles.input}
              placeholder="örn: No: 45"
              value={formData.AddressBuilding}
              onChangeText={(value) => handleInputChange('AddressBuilding', value)}
            />

            <Text style={styles.label}>Posta Kodu</Text>
            <TextInput
              style={styles.input}
              placeholder="örn: 34437"
              value={formData.AddressPostalCode}
              onChangeText={(value) => handleInputChange('AddressPostalCode', value)}
            />
          </View>
        )}

        {/* Step 5: Fotoğraf Yükleme */}
        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Fotoğraf Yükle</Text>
            <Text style={styles.subtitle}>
              {editId
                ? `Mevcut ${existingPhotos.length} fotoğraf var. Daha fazla eklemek için (maksimum 10)`
                : 'En az 3 fotoğraf seçin (Maksimum 10)'}
            </Text>

            {/* Mevcut Fotoğraflar */}
            {existingPhotos.length > 0 && (
              <View style={styles.photoListContainer}>
                <Text style={styles.photoListTitle}>Mevcut Fotoğraflar</Text>
                <View style={styles.photoList}>
                  {existingPhotos.map((photo, index) => (
                    <View key={`existing-${index}`} style={styles.photoListItem}>
                      <Image source={{ uri: transformImageUrl(photo) }} style={styles.photoListImage} />
                      <View style={styles.photoListInfo}>
                        <Text style={styles.photoListItemNumber}>Fotoğraf {index + 1}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickImage}
            >
              <MaterialCommunityIcons name="cloud-upload" size={32} color="#ff5a5f" />
              <Text style={styles.uploadButtonText}>Fotoğraf Seç</Text>
              <Text style={styles.uploadButtonSubtext}>{existingPhotos.length + photos.length}/10 fotoğraf</Text>
            </TouchableOpacity>

            {photos.length > 0 && (
              <View style={styles.photoListContainer}>
                <Text style={styles.photoListTitle}>Yeni Fotoğraflar</Text>
                <View style={styles.photoList}>
                  {photos.map((photo, index) => (
                    <View key={`new-${index}`} style={styles.photoListItem}>
                      <Image source={{ uri: photo }} style={styles.photoListImage} />
                      <View style={styles.photoListInfo}>
                        <Text style={styles.photoListItemNumber}>Yeni {index + 1}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleRemovePhoto(index)}
                      >
                        <Ionicons name="trash" size={20} color="#ff5a5f" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {(existingPhotos.length + photos.length) < (editId ? 1 : 3) && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={18} color="#ff9500" />
                <Text style={styles.warningText}>
                  {editId
                    ? 'En az 1 fotoğraf gerekli'
                    : 'En az 3 fotoğraf yüklemek gerekli'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Step 6: Fiyat Belirleme */}
        {step === 6 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Fiyat Belirleyin</Text>
            <Text style={styles.subtitle}>
              Konuklarınız için gece başına fiyatı belirleyin
            </Text>

            <View style={styles.priceCard}>
              <Text style={styles.label}>Gece Başına Fiyat (₺)</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>₺</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  keyboardType="number-pad"
                  value={formData.price}
                  onChangeText={(value) => handleInputChange('price', value)}
                />
              </View>
              <Text style={styles.priceInfo}>
                Listelemenizin başarılı olması için rekabetçi bir fiyat belirlemek önemlidir.
              </Text>
            </View>

            {formData.price && (
              <View style={styles.priceCalculation}>
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>1 Gece</Text>
                  <Text style={styles.calculationValue}>₺{parseInt(formData.price).toLocaleString('tr-TR')}</Text>
                </View>
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>3 Gece</Text>
                  <Text style={styles.calculationValue}>₺{(parseInt(formData.price) * 3).toLocaleString('tr-TR')}</Text>
                </View>
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>7 Gece</Text>
                  <Text style={styles.calculationValue}>₺{(parseInt(formData.price) * 7).toLocaleString('tr-TR')}</Text>
                </View>
              </View>
            )}
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
            style={[styles.nextButton, step > 1 && { flex: 1 }]}
            onPress={step === 6 ? handleSubmit : handleNext}
            disabled={loading}
          >
            {loading ? (
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator color="#fff" />
                {uploadProgress.total > 0 && (
                  <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>
                    Fotoğraflar yükleniyor {uploadProgress.current}/{uploadProgress.total}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.nextButtonText}>
                {step === 6 ? (editId ? 'Güncelle' : 'İlanı Yayınla') : 'Devam'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#717171',
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
    marginVertical: 16,
    paddingHorizontal: 12,
    flexWrap: 'wrap',
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  progressText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  progressLine: {
    width: 12,
    height: 2,
    marginHorizontal: 1,
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
  placeTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  placeTypeButton: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeTypeButtonActive: {
    backgroundColor: '#fff3f2',
    borderColor: '#ff5a5f',
  },
  placeTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8a8a8a',
    marginTop: 6,
    textAlign: 'center',
  },
  placeTypeLabelActive: {
    color: '#ff5a5f',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  amenityPillActive: {
    backgroundColor: '#fff3f2',
    borderColor: '#ff5a5f',
  },
  amenityCheckmark: {
    marginRight: 4,
  },
  amenityPillLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8a8a8a',
  },
  amenityPillLabelActive: {
    color: '#ff5a5f',
    fontWeight: '600',
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
  uploadButton: {
    backgroundColor: '#fff3f2',
    borderWidth: 2,
    borderColor: '#ff5a5f',
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff5a5f',
    marginTop: 8,
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: '#8a8a8a',
    marginTop: 4,
  },
  photoListContainer: {
    marginTop: 20,
  },
  photoListTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  photoList: {
    gap: 8,
  },
  photoListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  photoListImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  photoListInfo: {
    flex: 1,
  },
  photoListItemNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  deleteButton: {
    padding: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff3f2',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
    marginTop: 16,
  },
  warningText: {
    fontSize: 13,
    color: '#ff9500',
    fontWeight: '600',
    flex: 1,
  },
  priceCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#ff5a5f',
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff5a5f',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#212121',
    paddingVertical: 12,
  },
  priceInfo: {
    fontSize: 12,
    color: '#8a8a8a',
    marginTop: 8,
    fontStyle: 'italic',
  },
  priceInfoBox: {
    backgroundColor: '#fff3f2',
    borderRadius: 10,
    padding: 12,
    marginVertical: 16,
  },
  priceInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  priceInfoTextContainer: {
    flex: 1,
  },
  priceInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  priceInfoText: {
    fontSize: 13,
    color: '#8a8a8a',
    lineHeight: 18,
  },
  priceCalculation: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    padding: 16,
    marginVertical: 16,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  calculationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8a8a8a',
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
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
    padding: 28,
    width: '100%',
    maxWidth: 420,
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
    marginBottom: 14,
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
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
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#ff5a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalButtonSingle: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#ff5a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSuccess: {
    backgroundColor: '#34c759',
  },
});
