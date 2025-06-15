import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/me', authMiddleware, updateUserProfile);

export default router;