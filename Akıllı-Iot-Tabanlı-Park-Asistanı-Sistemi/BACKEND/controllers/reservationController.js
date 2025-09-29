import Reservation from "../models/reservation.js";
import ParkingSpot from "../models/parkingSpot.js";
import '../models/index.js';  // Modellerin ve ilişkilerin doğru şekilde yüklenmesi için
import jwt from "jsonwebtoken";
import moment from 'moment-timezone';
import { sendCommandToArduino, barrierCommands } from '../controllers/parkingSpotController.js';  // Bariyer komutları için
// Tüm rezervasyonları getirme
export const getAllreservationController = async (req, res) => {
    try {
        const reservations = await Reservation.findAll({});
        res.status(200).send({
            success: true,
            message: 'All Reservations fetched successfully',
            reservations
        });
    } catch (error) {
        console.error('Error in Get All Reservation API:', error);  // Detaylı hata loglama
        res.status(500).send({
            success: false,
            message: 'Error in Get All Reservation API',
            error: error.message  // Daha spesifik hata mesajı
        });
    }
};

// Rezervasyon ekleme
export const addReservationController = async (req, res) => {
    try {
        // Authorization header'ından token alıyoruz
        const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token; // "Bearer <token>"

        if (!token) {
            return res.status(401).json({ message: 'Token gereklidir.' });
        }

        // JWT token'ı doğrulama
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Token geçerli ise, kullanıcı bilgilerini alıyoruz
        const userId = decoded.id; // Token'dan userId'yi alıyoruz

        const { parkingSpotId } = req.body;

        if (!parkingSpotId ) {
            return res.status(400).send({
                success: false,
                message: 'parkingSpotId alanı zorunludur.'
            });
        }
        const startTime = moment().tz("Europe/Istanbul").toDate();

        const existingUserReservation = await Reservation.findOne({
            where: {
                userId,
                endTime: null
            }
        });

        if (existingUserReservation) {
            return res.status(400).send({
                success: false,
                message: 'Bu kullanıcı zaten aktif bir rezervasyona sahip.'
            });
        }

        const spot = await ParkingSpot.findOne({ where: { id: parkingSpotId } });

        if (!spot) {
            return res.status(404).send({
                success: false,
                message: 'Belirtilen park yeri bulunamadı.'
            });
        }

        // Park yeri fiziksel olarak doluysa rezervasyon yapılamaz
        if (!spot.isAvailable) {
            return res.status(400).send({
                success: false,
                message: 'Bu park yeri şu anda dolu (isAvailable = false).'
            });
        }

        const existingSpotReservation = await Reservation.findOne({
            where: {
                parkingSpotId,
                endTime: null
            }
        });

        if (existingSpotReservation) {
            return res.status(401).send({
                success: false,
                message: 'Bu park yeri şu anda başka biri tarafından rezerve edilmiş.'
            });
        }

        const newReservation = await Reservation.create({
            userId,
            parkingSpotId,
            startTime
        });
        
        spot.isAvailable = false;
        await spot.save();

        res.status(201).send({
            success: true,
            message: 'Rezervasyon başarıyla oluşturuldu.',
            reservation: newReservation,
            barrierStatus: spot.isBarrierOpen,
           
        });

    } catch (error) {
        console.error('Error in Create Reservation API:', error);
        res.status(500).send({
            success: false,
            message: 'Sunucu hatası oluştu.',
            error: error.message
        });
    }

};


// Belirli bir rezervasyonu silme
export const deleteReservationController = async (req, res) => {
    try {
        const { id } = req.params;

        // İlgili rezervasyonu bul
        const reservation = await Reservation.findByPk(id);
        if (!reservation) {
            return res.status(404).send({
                success: false,
                message: 'Reservation not found'
            });
        }

        // Rezervasyonu sil
        await reservation.destroy();

        res.status(200).send({
            success: true,
            message: 'Reservation deleted successfully'
        });
    } catch (error) {
        console.error('Error in Delete Reservation API:', error);  // Detaylı hata loglama
        res.status(500).send({
            success: false,
            message: 'Error in Delete Reservation API',
            error: error.message  // Daha spesifik hata mesajı
        });
    }
};

export const cancelReservationController = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).send({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Rezervasyonu iptal et (endTime ve status güncelle)
    reservation.endTime = new Date();
    reservation.status = 'cancelled';

    await reservation.save();

    // Park yeri bilgisi al
    const spot = await ParkingSpot.findByPk(reservation.parkingSpotId);

    if (spot) {
      // Bariyer kapalıysa aç komutu gönder
      if (!spot.isBarrierOpen) {
        await sendCommandToArduino(barrierCommands[spot.id]?.open || barrierCommands.open);

        // Bariyer durumu güncelle
        spot.isBarrierOpen = true;
        await spot.save();
      }
    }

    res.status(200).send({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation
    });
  } catch (error) {
    console.error('Error in Cancel Reservation API:', error);
    res.status(500).send({
      success: false,
      message: 'Error in Cancel Reservation API',
      error: error.message
    });
  }
};



// Reservation detayını ParkingSpot bilgisiyle çek
export const getReservationDetails = async (req, res) => {
    try {
        const { userId } = req.params;  // "id" yerine "userId" parametresini alıyoruz.
        console.log('User ID Parametresi:', userId);  // Kontrol için loglama

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Geçersiz kullanıcı ID'si."
            });
        }

        // Kullanıcıya ait rezervasyonu ve ilişkili park yerini çek
        const reservation = await Reservation.findOne({
            where: { userId },  // Kullanıcı ID'sine göre rezervasyon arıyoruz
            include: [
                {
                    model: ParkingSpot,
                    as: 'parkingSpot',  // İlişkiyi 'parkingSpot' alias'ı ile bağla
                    attributes: ['id', 'name', 'barrierId']  // Yalnızca gereken alanları çek
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Bu kullanıcıya ait rezervasyon bulunamadı."
            });
        }

        res.status(200).json({
            success: true,
            reservation
        });
    } catch (error) {
        console.error('Error in Get Reservation Details API:', error);
        res.status(500).json({
            success: false,
            message: "Bir hata oluştu.",
            error: error.message  // Daha spesifik hata mesajı
        });
    }
};






