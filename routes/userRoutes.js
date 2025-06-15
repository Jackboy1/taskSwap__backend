import express from 'express';
import { protect } from '../middleware/auth.js';
import { getUserRatings } from '../controllers/userController.js';

const router = express.Router();

router.get('/:id/ratings', protect, getUserRatings);

export default router;