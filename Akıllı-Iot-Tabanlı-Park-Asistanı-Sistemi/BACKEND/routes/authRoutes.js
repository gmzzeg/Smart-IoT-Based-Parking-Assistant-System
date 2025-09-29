import express from 'express';
import { loginController, logoutController } from '../controllers/authController.js';
import { isAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Giriş (login) işlemi – authMiddleware gerekmez
router.post('/login', loginController);

// Çıkış (logout) işlemi – kullanıcı giriş yapmış mı kontrol etmek için middleware kullanılabilir
router.post('/logout', logoutController);

export default router;
