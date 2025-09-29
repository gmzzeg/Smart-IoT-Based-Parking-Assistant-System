import express from 'express';
import { getUserByIdController, deleteUserController, getUserProfileController, registerController, updatePasswordController, updateProfileController } from '../controllers/userController.js';
import { isAuth } from '../middlewares/authMiddleware.js';
import { validateUserMiddleware } from '../middlewares/validateUserMiddleware.js';
import { validatePasswordUpdate } from '../middlewares/passwordUpdateMiddleware.js';


const router = express.Router();


// Register route
router.post('/register', validateUserMiddleware,registerController);

// route: /api/v1/user/
router.get('', isAuth, getUserProfileController);

//update profile
router.put('',isAuth,updateProfileController);

router.put('/password',isAuth,  validatePasswordUpdate, updatePasswordController);
// routes/userRoutes.js
// router.put('/password',isAuth, validateUserMiddleware, updatePasswordController);


//by ıd
router.get('/:id', getUserByIdController); 

//delete user
router.delete('', isAuth, deleteUserController);




export default router;
