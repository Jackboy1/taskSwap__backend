import express from 'express';
import { fetchMessages, sendMessage } from '../controllers/messageController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes for /api/messages
router.route('/')
  .post(protect, sendMessage); // Send a message

router.route('/:taskId')
  .get(protect, fetchMessages); // Fetch messages for a task

export default router;