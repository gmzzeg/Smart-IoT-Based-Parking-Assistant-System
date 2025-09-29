import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import axiosClient from '@/api/axiosClient';
import { useRouter } from 'expo-router';
import { ParkingSpot, Reservation } from '@/types/types';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Beklemede', color: '#FFA726' },
  confirmed: { label: 'Onaylandı', color: '#66BB6A' },
  cancelled: { label: 'İptal Edildi', color: '#E53935' },
  waiting: { label: 'Bekleniyor', color: '#29B6F6' },
  completed: { label: 'Tamamlandı', color: '#4CAF50' },
};

const windowHeight = Dimensions.get('window').height;

export default function HomeScreen() {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [userReservation, setUserReservation] = useState<Reservation | null>(null);
  const [barrierStatus, setBarrierStatus] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<'1' | '2'>('1');
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const userIdFromStore = useSelector((state: RootState) => state.auth.userId);
  const tokenFromStore = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    fetchUserReservation();
    fetchParkingSpots();

    const interval = setInterval(() => {
      fetchUserReservation();
      fetchParkingSpots();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log("Redux userId:", userIdFromStore);
  }, [userIdFromStore]);

  const fetchParkingSpots = async () => {
    try {
      const response = await axiosClient.get('/parking-spot/all');
      if (Array.isArray(response.data.spots)) {
        setParkingSpots(response.data.spots);
      } else {
        setParkingSpots([]);
      }
    } catch {
      setParkingSpots([]);
      Alert.alert('Hata', 'Park yerleri alınamadı.');
    } finally {
      setLoading(false);
    }
  };
  

  const fetchUserReservation = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userId = userIdFromStore;
      if (!token || !userId) return;

      const res = await axiosClient.get(`/reservation/details/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      

      const reservation: Reservation | null = res.data.reservation;
      setUserReservation(reservation);

    } catch {
      setUserReservation(null);
      setBarrierStatus(false);
    }
  };

  const handleReservationBarrierControl = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userId = userIdFromStore;
      console.log("🧠 Kullanıcı ID (Redux):", userId);

      if (!token || !userId) {
        Alert.alert('Yetkisiz', 'Lütfen giriş yapınız.');
        router.replace('/userLogin/login');
        return;
      }

      if (!userReservation) {
        Alert.alert('Rezervasyon bulunamadı', 'Aktif bir rezervasyon mevcut değil.');
        return;
      }

      const response = await axiosClient.put(
        `/parking-spot/control-barrier/${userId}/${userReservation.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        const isOpen = Boolean(response.data.isBarrierOpen);
        setBarrierStatus(isOpen);
        Alert.alert('Başarılı', isOpen ? 'Bariyer açıldı.' : 'Bariyer kapatıldı.');
      } else {
        Alert.alert('Hata', response.data?.message || 'Bariyer kontrolü başarısız oldu.');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Bariyer kontrolü sırasında bir hata oluştu.';
      Alert.alert('Hata', message);
    }
  };

  const handleCancelReservation = async () => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token || !userReservation) return;

    Alert.alert(
      'Rezervasyonu İptal Et',
      'Rezervasyonunuzu iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, İptal Et',
          onPress: async () => {
            const res = await axiosClient.put(`/reservation/cancel/${userReservation.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data?.success) {
              Alert.alert('Başarılı', 'Rezervasyon iptal edildi.');

              // Burada setUserReservation(null) yerine, rezervasyon objesinin durumunu güncelle
              setUserReservation(prev => prev ? { ...prev, status: 'cancelled' } : null);
            } else {
              Alert.alert('Hata', res.data?.message || 'İptal işlemi başarısız oldu.');
            }
          },
        },
      ]
    );
  } catch (error: any) {
    const message = error.response?.data?.message || 'İptal sırasında bir hata oluştu.';
    Alert.alert('Hata', message);
  }
};



  const renderReservationSummary = () => {
    if (!userReservation) return null;

    const { parkingSpot, startTime, endTime, status } = userReservation;

    const formatDate = (dateString: string | null | undefined) =>
      dateString ? new Date(dateString).toLocaleDateString('tr-TR') : 'Bilinmiyor';

    const formatTime = (dateString: string | null | undefined) =>
      dateString
        ? new Date(dateString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        : 'Bilinmiyor';

    const statusInfo = status ? statusLabels[status] : null;

    return (
      <View style={styles.reservationSummary}>
        <View style={styles.reservationHeaderRow}>
          <Text style={styles.reservationTitle}>Rezervasyon Özeti</Text>
          {statusInfo && (
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusText}>{statusInfo.label}</Text>
            </View>
          )}
        </View>

        <View style={styles.iconRow}>
          <MaterialIcons name="local-parking" size={22} color="#4B2C69" />
          <Text style={[styles.reservationText, styles.iconSpacing]}>
            Park Yeri: {parkingSpot?.name ?? 'Bilinmiyor'}
          </Text>
        </View>

        <View style={styles.iconRow}>
          <MaterialIcons name="calendar-today" size={22} color="#4B2C69" />
          <Text style={[styles.reservationText, styles.iconSpacing]}>
            Tarih: {formatDate(startTime)}
          </Text>
        </View>

        <View style={styles.iconRow}>
          <FontAwesome5 name="clock" size={20} color="#4B2C69" />
          <Text style={[styles.reservationText, styles.iconSpacing]}>
            Başlangıç Saati: {formatTime(startTime)}
          </Text>
        </View>

        <View style={styles.iconRow}>
          <FontAwesome5 name="clock" size={20} color="#4B2C69" />
          <Text style={[styles.reservationText, styles.iconSpacing]}>
            Bitiş Saati: {endTime ? formatTime(endTime) : 'Henüz bitiş yapılmadı'}
          </Text>
        </View>

        {!userReservation.endTime && (
  <>
    <TouchableOpacity style={styles.barrierButton} onPress={handleReservationBarrierControl}>
      <Text style={styles.barrierButtonText}>
        {barrierStatus ? 'Bariyer Açık (Kapat)' : 'Bariyer Kapalı (Aç)'}
      </Text>
    </TouchableOpacity>

    {userReservation.status !== 'confirmed' && (
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancelReservation}>
        <Text style={styles.cancelButtonText}>Rezervasyonu İptal Et</Text>
      </TouchableOpacity>
    )}
  </>
)}

      </View>
    );
  };

  const renderSpotsByFloor = (floor: string) =>
    parkingSpots
      .filter(spot => spot.floor === floor)
      .map(spot => (
        <View key={spot.id} style={styles.spotContainer}>
          <TouchableOpacity
            style={[
              styles.spotBox,
              {
                backgroundColor: spot.isAvailable ? '#E8F5E9' : '#FFCDD2',
                borderColor: spot.isAvailable ? '#66BB6A' : '#E53935',
              },
            ]}
            disabled={!spot.isAvailable}
            onPress={() =>
              router.push({
                pathname: './userReservation/reservation',
                params: { id: spot.id.toString() },
              })
            }
          >
            <Ionicons name="car-sport" size={30} color={spot.isAvailable ? '#388E3C' : '#B71C1C'} />
            <Text
              style={{
                color: spot.isAvailable ? '#388E3C' : '#B71C1C',
                fontWeight: '700',
                marginTop: 6,
                fontSize: 18,
              }}
            >
              {spot.name}
            </Text>
            <Text style={{ fontSize: 14, marginTop: 2 }}>
              {spot.isAvailable ? 'Müsait' : 'Dolu'}
            </Text>
          </TouchableOpacity>
        </View>
      ));

  return (
    <LinearGradient colors={['#FFFFFF', '#FFFFFF']} style={styles.container}>
      <Text style={styles.header}>Park Rezervasyon</Text>

      <View style={styles.tabContainer}>
        {['1', '2'].map(floor => (
          <TouchableOpacity
            key={floor}
            style={[styles.tabButton, selectedFloor === floor && styles.activeTabButton]}
            onPress={() => setSelectedFloor(floor as '1' | '2')}
          >
            <Text style={[styles.tabButtonText, selectedFloor === floor && styles.activeTabText]}>
              Kat {floor}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.spotGrid} style={{ flexGrow: 0, maxHeight: windowHeight * 0.58 }}>
        {loading ? <ActivityIndicator size="large" color="#6A1B9A" /> : renderSpotsByFloor(selectedFloor)}
      </ScrollView>

      {renderReservationSummary()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A148C',
    textAlign: 'center',
    marginBottom: 20,
  },
  reservationSummary: {
    backgroundColor: '#C8A4D8',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#6A1B9A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
    minHeight: 300,
  },
  reservationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reservationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A148D',
  },
  reservationText: {
    color: '#4B2C69',
    fontSize: 16,
    marginVertical: 4,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 25,
  },
  statusText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  iconSpacing: {
    marginLeft: 8,
    color: '#4B2C69',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginHorizontal: 10,
    borderRadius: 30,
    backgroundColor: '#E1BEE7',
  },
  activeTabButton: {
    backgroundColor: '#6A1B9A',
  },
  tabButtonText: {
    fontSize: 18,
    color: '#4A148C',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  spotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  spotContainer: {
    margin: 5,
    width: '45%',
    alignItems: 'center',
    marginVertical: 15,
    height: 120,
  },
  spotBox: {
    width: '100%',
    height: 100,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barrierButton: {
    marginTop: 20,
    paddingVertical: 20,
    paddingHorizontal: 100,
    backgroundColor: '#7B1FA2',
    borderRadius: 30,
    alignSelf: 'center',
  },
  barrierButtonText: {
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 16,
    paddingHorizontal: 100,
    backgroundColor: '#E53935',
    borderRadius: 30,
    alignSelf: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
