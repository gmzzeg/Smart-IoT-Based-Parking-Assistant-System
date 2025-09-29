import express from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import testRoutes from './testRoutes.js';
import reservationRoutes from './reservationRoutes.js';
import parkingSpotRoutes from './parkingSpotRoutes.js';
import { validateUserMiddleware } from '../middlewares/validateUserMiddleware.js';
import { validatePasswordUpdate } from '../middlewares/passwordUpdateMiddleware.js';




const router = express.Router();

router.use('/user', authRoutes); 
router.use('/user', validateUserMiddleware,userRoutes);   
router.use('/user',validatePasswordUpdate,userRoutes);
router.use('/test', testRoutes);  
router.use('/reservation', reservationRoutes);
router.use('/parking-spot', parkingSpotRoutes);

export default router;
