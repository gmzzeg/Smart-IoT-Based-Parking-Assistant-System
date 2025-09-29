import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axiosClient from '@/api/axiosClient';
import { useRouter } from 'expo-router';

const RegisterScreen = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  // Şifre görünürlük state'leri
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });

  };

  const handleRegister = async () => {
    try {
      const res = await axiosClient.post('/user/register', formData);
      Alert.alert('Başarılı', res.data.message);
      router.replace('/userLogin/login'); // ✅ expo-router ile uyumlu yönlendirme
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.';
      Alert.alert('Hata', errorMessage);
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#FFFFFF']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Kayıt Ol</Text>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={22}
            color="#6A1B9A"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="İsim"
            placeholderTextColor="#9E9E9E"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={22}
            color="#6A1B9A"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Soyisim"
            placeholderTextColor="#9E9E9E"
            value={formData.surname}
            onChangeText={(value) => handleChange('surname', value)}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={22}
            color="#6A1B9A"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            placeholderTextColor="#9E9E9E"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="call-outline"
            size={22}
            color="#6A1B9A"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Telefon Numarası"
            placeholderTextColor="#9E9E9E"
            value={formData.phoneNumber}
            onChangeText={(value) => handleChange('phoneNumber', value)}
            keyboardType="phone-pad"
          />
        </View>

        {/* Şifre alanı - görünürlük toggle */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color="#6A1B9A"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#9E9E9E"
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={{ paddingHorizontal: 8 }}
          >
            <Ionicons
              name={passwordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color="#6A1B9A"
            />
          </TouchableOpacity>
        </View>

        {/* Şifre tekrar alanı - görünürlük toggle */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color="#6A1B9A"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre Tekrar"
            placeholderTextColor="#9E9E9E"
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            secureTextEntry={!confirmPasswordVisible}
          />
          <TouchableOpacity
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            style={{ paddingHorizontal: 8 }}
          >
            <Ionicons
              name={confirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color="#6A1B9A"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Kayıt Ol</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/userLogin/login')}>
          <Text style={styles.link}>Zaten hesabınız var mı? Giriş yapın.</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4A148C',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#9C27B0',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#4A148C',
  },
  button: {
    backgroundColor: '#6A1B9A',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  link: {
    color: '#9C27B0',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
});
