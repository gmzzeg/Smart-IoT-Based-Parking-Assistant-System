import express from 'express';
import {
    getAllreservationController,
    addReservationController,
    deleteReservationController,
    getReservationDetails,
    cancelReservationController
} from '../controllers/reservationController.js';
import { isAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Tüm rezervasyonları getir
router.get('/get-all', isAuth,getAllreservationController);

// Yeni rezervasyon ekle
router.post('/add', isAuth,addReservationController);

// Belirli bir rezervasyonu sil (ID ile)
router.delete('/delete/:id',isAuth, deleteReservationController);


// Reservation detayını ParkingSpot bilgisiyle çek
router.get('/details/:userId',getReservationDetails);

router.put('/cancel/:id', cancelReservationController);

export default router;
