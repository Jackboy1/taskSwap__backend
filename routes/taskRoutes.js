import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksByUser, proposeSwap,
  completeTask,
  getCompletedTasks
} from '../controllers/taskController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes for /api/tasks
router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

// Routes for /api/tasks/:id
router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask)
  .post(protect, completeTask);

router.route('/:id/propose').post(protect, proposeSwap);

// New route for /api/tasks/user/:userId
router.route('/user/:userId')
  .get(protect, getTasksByUser);

router.route('/completed')
  .get(protect, getCompletedTasks);

export default router;