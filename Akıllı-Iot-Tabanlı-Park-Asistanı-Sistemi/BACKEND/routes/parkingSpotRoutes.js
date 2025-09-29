import express from "express";
import {
  getAllParkingSpotsController,
  addParkingSpotController,
  updateAvailabilityController,
  getParkingSpotByIdController,
  deleteParkingSpotController,
  getParkDurumu,
  toggleBarrierInSpotController,
  controlBarrierByUserId,
} from "../controllers/parkingSpotController.js";
import { isAuth } from '../middlewares/authMiddleware.js';

import { parkingSpotMiddleware } from '../middlewares/parkingSpotMiddleware.js';

const router = express.Router();

// Log eklerken, bu sadece bir kez görünecektir
console.log("parkingSpotRoutes yüklendi");

// Tüm park yerlerini getir
router.get("/all", getAllParkingSpotsController);

// Yeni park yeri ekle
router.post("/add", parkingSpotMiddleware, addParkingSpotController);

// Tek park yerini getir
router.get("/:id", getParkingSpotByIdController);

// Park yeri güncelle (doluluk durumu)
router.put("/:id", parkingSpotMiddleware, updateAvailabilityController);

// Park yeri sil
router.delete("/:id", deleteParkingSpotController);

// Park durumu
router.get('/park-durumu', getParkDurumu);

// Bariyer durumu güncelle
router.put("/toggle-barrier/:barrierId", toggleBarrierInSpotController);

// Kullanıcı ID ve rezervasyon ID'sine göre bariyer kontrolü yap
// router.put('/control-barrier/:userId/:reservationId',is controlBarrierByUserId);
router.put('/control-barrier/:userId/:reservationId', controlBarrierByUserId);

export default router;
