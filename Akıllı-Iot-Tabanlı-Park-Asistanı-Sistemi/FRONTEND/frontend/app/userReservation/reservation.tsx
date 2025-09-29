import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '@/api/axiosClient';

export default function ReservationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const spotId = params.id as string | undefined;

  const [spotInfo, setSpotInfo] = useState<{ name: string; floor: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reservationTime, setReservationTime] = useState<string | null>(null);

  useEffect(() => {
    if (spotId) {
      fetchSpotInfo(spotId);
    }
  }, [spotId]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.back();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.addEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const fetchSpotInfo = async (id: string) => {
    try {
      const response = await axiosClient.get(`/parking-spot/${id}`);
      if (response.data.success) {
        setSpotInfo(response.data.spot);
      } else {
        Alert.alert('Hata', 'Park yeri bilgisi alınamadı.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Park yeri bilgisi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async () => {
    try {
      const now = new Date().toISOString();
      setReservationTime(now);

      const response = await axiosClient.post('/reservation/add', {
        parkingSpotId: spotId,
        startTime: now,
      });

      if (response.data.success) {
        Alert.alert('Başarılı', 'Rezervasyonunuz oluşturuldu.');
        router.push('/(tabs)');
      } else {
        Alert.alert('Başarısız', 'Rezervasyon oluşturulamadı.');
        router.push('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Hata', 'Rezervasyon oluşturulurken hata oluştu.');
      router.push('/(tabs)');
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('tr-TR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (!spotInfo) {
    return (
      <View style={styles.container}>
        <Text>Park yeri bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Geri Dön Butonu */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Rezervasyon Oluştur</Text>
      <Text style={styles.spotName}>
        {spotInfo.name} - KAT {spotInfo.floor}
      </Text>
      <Text style={styles.infoText}>
        1 dakika içerisinde gelinmeyen rezervasyonlar iptal edilir.
      </Text>

      {reservationTime && (
        <Text style={styles.reservationTime}>
          Rezervasyon Zamanı: {formatDate(reservationTime)}
        </Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleCreateReservation}>
        <Text style={styles.buttonText}>Rezervasyon Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6A1B9A', // Mor renk
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  spotName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    color: '#4A148C',
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  reservationTime: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6A1B9A',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
