import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import dotenv from 'dotenv';
import ParkingSpot from '../models/parkingSpot.js';
import Reservation from '../models/reservation.js';
import ParkingSpotHistory from '../models/parkingSpotHistory.js';
import { Op } from 'sequelize';
import { sendCommandToArduino, barrierCommands } from '../controllers/parkingSpotController.js';

dotenv.config();

export const port = new SerialPort({
  path: process.env.SERIAL_PORT || 'COM6',
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

const spotMappings = {
  '1': { name: 'A1', status: true },
  '0': { name: 'A1', status: false },
  '2': { name: 'A2', status: false },
  '3': { name: 'A2', status: true },
  '4': { name: 'A3', status: false },
  '5': { name: 'A3', status: true },
  '6': { name: 'A4', status: false },
  '7': { name: 'A4', status: true },
  '8': { name: 'B1', status: false },
  '9': { name: 'B1', status: true },
  '10': { name: 'B2', status: false },
  '11': { name: 'B2', status: true },
  '12': { name: 'B3', status: false },
  '13': { name: 'B3', status: true },
  '14': { name: 'B4', status: false },
  '15': { name: 'B4', status: true },
};

let emptyCounters = {
  A1: 0, A2: 0, A3: 0, A4: 0,
  B1: 0, B2: 0, B3: 0, B4: 0,
};

let activeHistory = {
  A1: null, A2: null, A3: null, A4: null,
  B1: null, B2: null, B3: null, B4: null,
};

let reservationStatus = {
  A1: 'none', A2: 'none', A3: 'none', A4: 'none',
  B1: 'none', B2: 'none', B3: 'none', B4: 'none',
};

parser.on('data', async (data) => {
  const trimmed = data.trim();
  const now = new Date();

  const spotInfo = spotMappings[trimmed];
  if (!spotInfo) {
    console.log('Bilinmeyen veri:', trimmed);
    return;
  }

  const { name: spotName, status: sensorStatus } = spotInfo;

  try {
    const spot = await ParkingSpot.findOne({ where: { name: spotName } });
    if (!spot) {
      console.log(`Park yeri bulunamadı: ${spotName}`);
      return;
    }

    const activeReservation = await Reservation.findOne({
      where: {
        parkingSpotId: spot.id,
        userId: { [Op.not]: null },
        startTime: { [Op.lte]: now },
        endTime: { [Op.is]: null },
        status: { [Op.not]: 'cancelled' }
      }
    });

    if (activeReservation) {
      if (reservationStatus[spotName] === 'none') {
        reservationStatus[spotName] = 'waiting';
      }

      if (sensorStatus) {
        emptyCounters[spotName]++;

        if (reservationStatus[spotName] === 'waiting') {
          if (emptyCounters[spotName] >= 12) {
            // Rezervasyon iptal edildi
            await Reservation.update(
              { endTime: now, status: 'cancelled' },
              { where: { id: activeReservation.id } }
            );

            console.log(`${spotName} - Randevuya kimse gelmedi, iptal edildi.`);

            // Bariyer açma komutu
            const barrierId = spot.id;
            await sendCommandToArduino(barrierCommands[barrierId]?.open || barrierCommands.open);

            if (!spot.isBarrierOpen) {
              spot.isBarrierOpen = true;
              await spot.save();
            }

            reservationStatus[spotName] = 'none';
            emptyCounters[spotName] = 0;
            return;
          }
        } else if (reservationStatus[spotName] === 'arrived') {
          if (emptyCounters[spotName] >= 1) {
            // Araç çıkışı, rezervasyon tamamlandı
            await Reservation.update(
              { endTime: now, status: 'completed' },  // completed eklendi
              { where: { id: activeReservation.id } }
            );
            const barrierId = spot.id;
            await sendCommandToArduino(barrierCommands[barrierId]?.open || barrierCommands.open);

            if (activeHistory[spotName]) {
              activeHistory[spotName].endTime = now;
              await activeHistory[spotName].save();
              activeHistory[spotName] = null;
            }
            spot.isAvailable = true;
            await spot.save();
            console.log(`${spotName} - Randevulu çıkış sonrası kayıt tamamlandı.`);

            reservationStatus[spotName] = 'none';
            emptyCounters[spotName] = 0;
            return;
          }
        }
      } else {
        // Araç geldi
        emptyCounters[spotName] = 0;

        if (reservationStatus[spotName] !== 'arrived') {
          reservationStatus[spotName] = 'arrived';

          if (activeReservation.status !== 'confirmed') {
            activeReservation.status = 'confirmed';
            await activeReservation.save();
          }

          console.log(`${spotName} - Randevulu araç geldi ve confirmed oldu.`);
        }

        if (spot.isAvailable) {
          spot.isAvailable = false;
          await spot.save();
          console.log(`${spotName} randevulu olarak direkt dolu işaretlendi.`);
        }

        if (!activeHistory[spotName]) {
          activeHistory[spotName] = await ParkingSpotHistory.create({
            userId: activeReservation.userId,
            parkingSpotId: spot.id,
            startTime: activeReservation.startTime,
            endTime: null
          });
          console.log(`${spotName} için randevulu kayıt başlatıldı.`);
        }

        console.log(`${spotName} - Randevulu dolu.`);
      }

    } else {
      // === RANDEVUSUZ DURUM ===
      reservationStatus[spotName] = 'none';

      if (sensorStatus) {
        // Boş
        spot.isAvailable = true;
        await spot.save();

        if (activeHistory[spotName]) {
          activeHistory[spotName].endTime = now;
          await activeHistory[spotName].save();
          activeHistory[spotName] = null;
          console.log(`${spotName} - Randevusuz çıkış, kayıt sonlandı.`);
        }
      } else {
        // Dolu
        spot.isAvailable = false;
        await spot.save();

        if (!activeHistory[spotName]) {
          activeHistory[spotName] = await ParkingSpotHistory.create({
            userId: null,
            parkingSpotId: spot.id,
            startTime: now,
            endTime: null
          });
          console.log(`${spotName} - Randevusuz giriş, kayıt başlatıldı.`);
        }
      }
    }
    console.log(`Durum | ${spotName}: ${sensorStatus ? 'Boş' : 'Dolu'} | EmptyCounter: ${emptyCounters[spotName]} | Rezervasyon Durumu: ${reservationStatus[spotName]}`);

  } catch (err) {
    console.error('Hata:', err.message);
  }
});
