
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  Modal,
} from 'react-native';
import { axiosClient } from '@/api/axiosClient';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { deleteToken } from '@/utils/secureStore';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function ProfileScreen() {
  // Redux'tan kullanıcı bilgisi
  const user = useSelector((state: RootState) => state.auth.user);

  // Eğer kullanıcı yoksa (veri henüz yüklenmediyse) yükleniyor mesajı göster
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Animasyon için opacity kontrolü
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Modal durumları
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // Email modal inputları
  const [newEmail, setNewEmail] = useState('');
  const [currentPassForEmail, setCurrentPassForEmail] = useState('');
  const [showCurrentPassForEmail, setShowCurrentPassForEmail] = useState(false);

  // Password modal inputları
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  // Kullanıcı verilerini state'e aktar
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSurname(user.surname || '');
      setPhone(user.phoneNumber || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Animasyonu başlat
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  const handleProfileUpdate = async () => {
  try {
    const response = await axiosClient.put('/user', {
      name,
      surname,
      phoneNumber: phone,
      email,
    });
    alert('Profil güncellendi.');
  } catch (error) {
    alert('Güncelleme sırasında hata oluştu.');
    console.error(error);
  }
};


  const handleLogout = async () => {
    await deleteToken();
    dispatch(logout());
    router.replace('/userLogin/login');
  };

  const handleEmailUpdate = async () => {
  if (!newEmail.trim()) {
    alert('Yeni e-posta boş olamaz!');
    return;
  }
  if (!currentPassForEmail.trim()) {
    alert('Mevcut şifre boş olamaz!');
    return;
  }

  try {
    await axiosClient.put('/user', {
      email: email, // mevcut e-posta, state'de tutuyor olmalısın
      newEmail,
      password: currentPassForEmail,
    });
    setEmail(newEmail);
    setEmailModalVisible(false);
    alert('E-posta güncellendi.');
  } catch (error) {
    alert('E-posta güncelleme başarısız.');
    console.error(error);
  }
};


  const handlePasswordUpdate = async () => {
    if (!oldPass.trim()) {
      // alert('Eski şifre boş olamaz!');
      return;
    }
    if (!newPass.trim()) {
      // alert('Yeni şifre boş olamaz!');
      return;
    }
    if (newPass !== confirmPass) {
      // alert('Yeni şifre ve tekrar eşleşmiyor!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.put('/user/password', {
        oldPassword: oldPass,
        newPassword: newPass,
        confirmPassword: confirmPass,
      });
      setPasswordModalVisible(false);

      alert(response.data?.message || 'Şifre başarıyla güncellendi.');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Şifre güncelleme başarısız oldu.';
      // alert(errorMessage);
      setPasswordModalVisible(true);
      console.error('Şifre güncelleme hatası:', error);
    } finally {
      setIsLoading(false);
      // istersen burda inputları resetleyebilirsin
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#FFFFFF']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.innerContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
            <Text style={styles.title}>Profil Bilgileri</Text>
            <Text style={styles.subtitle}>Bilgilerinizi güncelleyin</Text>

            {/* Ad */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={22}
                color="#6A1B9A"
                style={styles.icon}
              />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ad"
                placeholderTextColor="#9E9E9E"
                style={styles.input}
              />
            </View>

            {/* Soyad */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-circle-outline"
                size={22}
                color="#6A1B9A"
                style={styles.icon}
              />
              <TextInput
                value={surname}
                onChangeText={setSurname}
                placeholder="Soyad"
                autoComplete="off"
                placeholderTextColor="#9E9E9E"
                style={styles.input}
              />
            </View>

            {/* Telefon */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={22}
                color="#6A1B9A"
                style={styles.icon}
              />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefon"
                autoComplete="off"
                placeholderTextColor="#9E9E9E"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            {/* E-posta */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={22}
                color="#6A1B9A"
                style={styles.icon}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="E-posta"
                placeholderTextColor="#9E9E9E"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                editable={false} // Direkt düzenleme kapalı, kalemle modal açılıyor
              />
              <TouchableOpacity onPress={() => setEmailModalVisible(true)}>
                <Ionicons
                  name="pencil-outline"
                  size={22}
                  color="#6A1B9A"
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>

            {/* Şifre */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#6A1B9A"
                style={styles.icon}
              />
              <TextInput
                value={password.replace(/./g, '*')} // Şifre gizli gösteriliyor
                placeholder="********"
                placeholderTextColor="#9E9E9E"
                editable={false}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setPasswordModalVisible(true)}>
                <Ionicons
                  name="pencil-outline"
                  size={22}
                  color="#6A1B9A"
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>

            {/* Kaydet Butonu */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleProfileUpdate}
            >
              <Text style={styles.loginButtonText}>Kaydet</Text>
            </TouchableOpacity>

            {/* Çıkış Yap Butonu */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>




        <Modal
  visible={emailModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setEmailModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>E-posta Güncelle</Text>

      {/* Mevcut E-posta */}
      <TextInput
        placeholder="Mevcut e-posta adresi"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        style={[styles.modalInput, { marginBottom: 12 }]} // Buraya marginBottom ekledim
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      {/* Yeni E-posta */}
      <TextInput
        placeholder="Yeni e-posta adresi"
        placeholderTextColor="#aaa"
        value={newEmail}
        onChangeText={setNewEmail}
        style={[styles.modalInput, { marginBottom: 12 }]} // Aynı boşluk buraya da
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Şifre */}
      <View style={{ width: '100%', position: 'relative', marginTop: 12 }}>
        <TextInput
          placeholder="Mevcut şifre"
          placeholderTextColor="#aaa"
          value={currentPassForEmail}
          onChangeText={setCurrentPassForEmail}
          secureTextEntry={!showCurrentPassForEmail}
          style={styles.modalInput}
          autoComplete="password"
        />
        <TouchableOpacity
          onPress={() => setShowCurrentPassForEmail(!showCurrentPassForEmail)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showCurrentPassForEmail ? 'eye-outline' : 'eye-off-outline'}
            size={22}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      {/* Butonlar */}
      <View style={styles.modalButtons}>
        <TouchableOpacity
          onPress={() => setEmailModalVisible(false)}
          style={[styles.modalButton, { backgroundColor: '#ccc' }]}
        >
          <Text>İptal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleEmailUpdate}
          style={[styles.modalButton, { backgroundColor: '#6A1B9A' }]}
        >
          <Text style={{ color: '#fff' }}>Güncelle</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


        {/* Şifre Güncelleme Modal */}
        <Modal
          visible={passwordModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPasswordModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Şifre Güncelle</Text>

              <View style={{ width: '100%', position: 'relative', marginTop: 12 }}>
                <TextInput
                  placeholder="Eski şifre"
                  placeholderTextColor="#aaa"
                  value={oldPass}
                  onChangeText={setOldPass}
                  secureTextEntry={!showOldPass}
                  style={styles.modalInput}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowOldPass(!showOldPass)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showOldPass ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#333"
                  />
                </TouchableOpacity>
              </View>

              <View style={{ width: '100%', position: 'relative', marginTop: 12 }}>
                <TextInput
                  placeholder="Yeni şifre"
                  placeholderTextColor="#aaa"
                  value={newPass}
                  onChangeText={setNewPass}
                  secureTextEntry={!showNewPass}
                  style={styles.modalInput}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPass(!showNewPass)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showNewPass ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#333"
                  />
                </TouchableOpacity>
              </View>

              <View style={{ width: '100%', position: 'relative', marginTop: 12 }}>
                <TextInput
                  placeholder="Şifre tekrarı"
                  placeholderTextColor="#aaa"
                  value={confirmPass}
                  onChangeText={setConfirmPass}
                  secureTextEntry={!showConfirmPass}
                  style={styles.modalInput}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPass(!showConfirmPass)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPass ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#333"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setPasswordModalVisible(false)}
                  style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                  disabled={isLoading}
                >
                  <Text>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePasswordUpdate}
                  style={[styles.modalButton, { backgroundColor: '#6A1B9A' }]}
                  disabled={isLoading}
                >
                  <Text style={{ color: '#fff' }}>
                    {isLoading ? 'Güncelleniyor...' : 'Güncelle'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 100, 
    marginTop: 25, // Dikey ortalama 
  },
  innerContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
    width: '100%',
    
  },
  title: {
    fontSize: 35,
    fontWeight: '700',
    color: '#6A1B9A',
    marginBottom: 6,
    
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6A1B9A',
    marginBottom: 20,

  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#6A1B9A',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginVertical: 6,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#6A1B9A',
    fontSize: 16,
  },
  loginButton: {
    marginTop: 30,
    width: '100%',
    backgroundColor: '#6A1B9A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 14,
    width: '100%',
    backgroundColor: '#a85dd7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    elevation: 10,
    justifyContent: 'center',  // modal içinde dikey ortala
    alignItems: 'center', 
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#6A1B9A',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#6A1B9A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',         // input içindeki yazılar ortada
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
});
