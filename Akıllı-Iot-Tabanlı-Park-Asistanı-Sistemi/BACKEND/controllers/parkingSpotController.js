import ParkingSpot from "../models/parkingSpot.js";
import Reservation from "../models/reservation.js";
import { port } from '../utils/serialReader.js';
import { Op } from "sequelize";

// Bariyer komutları (Aç - Kapat)
export const barrierCommands = {
  1: { open: '1\n', close: '0\n' },   // A1
  2: { open: '3\n', close: '2\n' },   // A2
  3: { open: '5\n', close: '4\n' },   // A3
  4: { open: '7\n', close: '6\n' },   // A4
  5: { open: '9\n', close: '8\n' },   // B1
  6: { open: '11\n', close: '10\n' }, // B2
  7: { open: '13\n', close: '12\n' }, // B3
  8: { open: '15\n', close: '14\n' }  // B4
};

// Arduino'ya komut gönderme
export const sendCommandToArduino = async (command) => {
  return new Promise((resolve, reject) => {
    port.write(command, (err) => {
      if (err) {
        console.error('Arduino yazma hatası:', err.message);
        reject(err);
      } else {
        console.log(`Arduino'ya komut gönderildi: ${command}`);
        resolve();
      }
    });
  });
};

// ============================
// 🔹 Tüm park yerlerini getir
// ============================
export const getAllParkingSpotsController = async (req, res) => {
  try {
    const spots = await ParkingSpot.findAll();
    res.status(200).json({ success: true, spots });
  } catch (error) {
    console.error("getAllParkingSpotsController Hatası:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================
// 🔹 Son 20 park yeri durumunu getir
// ============================
export const getParkDurumu = async (req, res) => {
  try {
    const spots = await ParkingSpot.findAll({
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    res.status(200).json({ success: true, spots });
  } catch (error) {
    console.error("getParkDurumu Hatası:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================
// 🔹 Yeni park yeri ekle
// ============================
export const addParkingSpotController = async (req, res) => {
  try {
    const { barrierId, name,floor } = req.body;

    if (!barrierId || !name || !floor ) {
      return res.status(400).json({ success: false, message: "'barrierId' , 'name' ve 'floor' zorunludur." });
    }

    const existingSpot = await ParkingSpot.findOne({ where: { name } });
    if (existingSpot) {
      return res.status(409).json({ success: false, message: "Bu isimde bir park yeri zaten var." });
    }

    const existingBarrier = await ParkingSpot.findOne({ where: { barrierId } });
    if (existingBarrier) {
      return res.status(409).json({ success: false, message: "Bu barrierId zaten kullanımda." });
    }

    const newSpot = await ParkingSpot.create({
      barrierId,
      name,
      floor,
      isAvailable: true,
    });

    res.status(201).json({ success: true, spot: newSpot });
  } catch (error) {
    console.error("addParkingSpotController Hatası:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================
// 🔹 ID ile tek park yerini getir
// ============================
export const getParkingSpotByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const spot = await ParkingSpot.findByPk(id);
    if (!spot) {
      return res.status(404).json({ success: false, message: "Park yeri bulunamadı." });
    }

    res.status(200).json({ success: true, spot });
  } catch (error) {
    console.error("getParkingSpotByIdController Hatası:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================
// 🔹 Park yerini sil
// ============================
export const deleteParkingSpotController = async (req, res) => {
  try {
    const { id } = req.params;

    const spot = await ParkingSpot.findByPk(id);
    if (!spot) {
      return res.status(404).json({ success: false, message: "Park yeri bulunamadı." });
    }

    await spot.destroy();
    res.status(200).json({ success: true, message: "Park yeri silindi." });
  } catch (error) {
    console.error("deleteParkingSpotController Hatası:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================
// 🔹 Bariyer durumu tersine çevir (manuel kontrol)
// ============================
export const toggleBarrierInSpotController = async (req, res) => {
  try {
    const { barrierId } = req.params;

    const spot = await ParkingSpot.findOne({ where: { barrierId: parseInt(barrierId) } });
    if (!spot) {
      return res.status(404).json({ success: false, message: "Bariyer ID'li park yeri bulunamadı." });
    }

    const commands = barrierCommands[spot.barrierId];
    if (!commands) {
      return res.status(400).json({ success: false, message: "Desteklenmeyen barrierId." });
    }

    spot.isBarrierOpen = !spot.isBarrierOpen;
    await spot.save();

    const command = spot.isBarrierOpen ? commands.open : commands.close;
    await sendCommandToArduino(command);

    res.status(200).json({ success: true, isBarrierOpen: spot.isBarrierOpen });
  } catch (error) {
    console.error("toggleBarrierInSpotController Hatası:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================
// 🔹 Park yerinin doluluk durumunu güncelle
// ============================
export const updateAvailabilityController = async (sensorData) => {
  try {
    const spots = await ParkingSpot.findAll();

    for (const spot of spots) {
      const sensorStatus = sensorData[spot.name];

      if (sensorStatus === undefined) {
        continue; // Sensör verisi yoksa devam et
      }

      // Şu anki zamanı al
      const now = new Date();

      // Aktif randevuyu kontrol et
      const activeReservation = await Reservation.findOne({
        where: {
          parkingSpotId: spot.id,
          userId: { [Op.not]: null },
          startTime: { [Op.lte]: now },
          [Op.or]: [
            { endTime: { [Op.is]: null } },
            { endTime: { [Op.gte]: now } }
          ]
        }
      });

      let finalAvailability = sensorStatus;
      let statusSource = "SENSÖR"; // Ön tanımlı sensör

      if (activeReservation) {
        finalAvailability = false; // Rezervasyon varsa her zaman DOLU
        statusSource = "REZERVASYON"; // Kaynağı değiştir
      }

      // Eğer sensör durumu ile rezervasyon durumu farklıysa, bilgileri güncelle
      if (spot.isAvailable !== finalAvailability) {
        spot.isAvailable = finalAvailability;
        await spot.save();

        // Eğer park yerinde bir değişiklik varsa, geçmiş bilgileri kaydet
        if (finalAvailability === false) {
          // Dolu durumda ise, geçmiş bilgileri kaydet
          await ParkingSpotHistory.create({
            userId: activeReservation ? activeReservation.userId : null, // Eğer randevu varsa, userId'yi kaydet
            parkingSpotId: spot.id,
            startTime: now, // Şu anki zamanı kaydet
            endTime: null
          });
        } else {
          // Boş durumda ise, endTime'ı güncelle
          const activeHistory = await ParkingSpotHistory.findOne({
            where: { parkingSpotId: spot.id, endTime: null }
          });

          if (activeHistory) {
            activeHistory.endTime = now;
            await activeHistory.save();
          }
        }
      }

      const statusText = spot.isAvailable ? "BOŞ" : `DOLU(${statusSource})`; 
      console.log(`${spot.name}: ${statusText}`);  
    }

  } catch (error) {
    console.error("Park yerleri güncellenirken hata oluştu:", error.message);
  }
};

// ============================
// 🔹 Kullanıcı ID'ye göre bariyer aç/kapa (rezervasyon bazlı kontrol)
export const controlBarrierByUserId = async (req, res) => {
  try {
    const { userId, reservationId } = req.params;
    console.log("Kullanıcı ID:", req.params.userId);
    console.log("Rezervasyon ID:", req.params.reservationId);

    const reservation = await Reservation.findOne({
      where: { id: reservationId, userId },
      include: [{ model: ParkingSpot, as: 'parkingSpot' }]
    });

    if (!reservation || !reservation.parkingSpot) {
      return res.status(404).json({ success: false, message: "Geçerli rezervasyon veya park yeri bulunamadı." });
    }

    // Eğer endTime varsa ve süresi geçmişse, bariyer kontrolüne izin verme
    const now = new Date();
    if (reservation.endTime !== null && new Date(reservation.endTime) <= now) {
      return res.status(403).json({
        success: false,
        message: "Rezervasyon süresi sona ermiş. Bariyer kontrolüne izin verilmiyor."
      });
    }

    const spot = reservation.parkingSpot;
    const commands = barrierCommands[spot.barrierId];
    if (!commands) {
      return res.status(400).json({ success: false, message: "Desteklenmeyen barrierId." });
    }

    // Bariyer durumunu değiştir
    spot.isBarrierOpen = !spot.isBarrierOpen;
    await spot.save();

    const command = spot.isBarrierOpen ? commands.open : commands.close;
    await sendCommandToArduino(command);

    res.status(200).json({ success: true, isBarrierOpen: spot.isBarrierOpen });
  } catch (error) {
    console.error("controlBarrierByUserId Hatası:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};