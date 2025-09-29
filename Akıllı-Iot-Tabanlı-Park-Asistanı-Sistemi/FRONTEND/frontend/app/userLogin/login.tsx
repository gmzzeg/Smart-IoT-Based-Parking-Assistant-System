import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { saveToken } from '@/utils/secureStore';
import { login, setLoggedInUser } from '@/store/slices/authSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axiosClient, { setAuthorizationHeader } from '@/api/axiosClient';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  // Animasyonlar için
  const moveAnim = useRef(new Animated.Value(0)).current;
  const smokeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Araba ileri geri hareket animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: screenWidth * 0.25,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Duman yukarı çıkma animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(smokeAnim, {
          toValue: -30,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(smokeAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    setErrorMessage('');
    try {
      const res = await axiosClient.post('/user/login', { email, password });
      const { token, user } = res.data;
      if (token) {
        await saveToken(token);
        setAuthorizationHeader({ isLoggedIn: true, token });
      }
      dispatch(login({ email, token }));
      dispatch(setLoggedInUser({ user, token }));
      router.replace('/(tabs)');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setErrorMessage(err.response.data.message || 'Bir hata oluştu.');
      } else {
        setErrorMessage('Sunucuya bağlanırken hata oluştu.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>

          {/* Araba sağa sola hareket */}
          <Animated.View style={{ transform: [{ translateX: moveAnim }] }}>
            <MaterialCommunityIcons name="car-sports" size={120} color="#6A1B9A" />
          </Animated.View>

          {/* Arabanın arkasından yukarı çıkan dumanlar */}
          <Animated.View
            style={[
              styles.smoke,
              {
                transform: [
                  { translateX: moveAnim },
                  { translateY: smokeAnim },
                ],
              },
            ]}
          >
            <MaterialCommunityIcons name="cloud" size={30} color="#AAA" />
          </Animated.View>

          <Animated.View
            style={[
              styles.smoke,
              {
                transform: [
                  { translateX: Animated.add(moveAnim, new Animated.Value(-15)) },
                  { translateY: Animated.add(smokeAnim, new Animated.Value(-10)) },
                ],
                opacity: 0.7,
              },
            ]}
          >
            <MaterialCommunityIcons name="cloud" size={25} color="#BBB" />
          </Animated.View>

          <Animated.View
            style={[
              styles.smoke,
              {
                transform: [
                  { translateX: Animated.add(moveAnim, new Animated.Value(20)) },
                  { translateY: Animated.add(smokeAnim, new Animated.Value(-20)) },
                ],
                opacity: 0.5,
              },
            ]}
          >
            <MaterialCommunityIcons name="cloud" size={20} color="#CCC" />
          </Animated.View>

          <Text style={styles.title}>ParkNova</Text>
          <Text style={styles.subtitle}>Aracınızı Güvenle Park Edin</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="email-outline"
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
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color="#6A1B9A"
              style={styles.icon}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Şifre"
              placeholderTextColor="#9E9E9E"
              secureTextEntry={!showPassword}
              style={styles.input}
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye' : 'eye-off'}
                size={22}
                color="#6A1B9A"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>

          {errorMessage.length > 0 && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Hesabınız yok mu? </Text>
            <TouchableOpacity onPress={() => router.push('/userRegister/register')}>
              <Text style={styles.signupLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A148C',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6A1B9A',
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
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
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#6A1B9A',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  signupText: {
    color: '#4A148C',
    fontSize: 14,
  },
  signupLink: {
    color: '#9C27B0',
    fontWeight: '700',
    fontSize: 14,
  },
  smoke: {
    position: 'absolute',
    left: 80,
    top: 80,
    zIndex: 10,
  },
});
