import mongoose from 'mongoose';
import Task from '../models/Task.js';

// filter out completed tasks by default
export const getTasks = async (req, res) => {
  try {
    const { status, skill, sort } = req.query;

    const query = { status: { $ne: 'completed' } }; // Exclude completed by default
    if (status) query.status = status;
    if (skill) query.skillsNeeded = { $in: [skill] };

    const sortOptions = {};
    if (sort === 'newest') sortOptions.createdAt = -1;
    if (sort === 'oldest') sortOptions.createdAt = 1;

    const tasks = await Task.find(query)
      .sort(sortOptions)
      .populate('createdBy', 'name email skills location');

    if (!tasks.length) {
      return res.status(200).json([]);
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks: ' + err.message });
  }
};

//    Get a single task by ID
//    GET /api/tasks/:id
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email skills location');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task: ' + err.message });
  }
};

//   Create a task
//   POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { title, description, offeredSkill, skillsNeeded } = req.body;

    if (!title || !description || !offeredSkill || !skillsNeeded) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const task = new Task({
      title,
      description,
      offeredSkill,
      skillsNeeded,
      createdBy: req.user.id,
    });

    const savedTask = await task.save();
    const populatedTask = await Task.findById(savedTask._id).populate('createdBy', 'name email skills location');
    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create task: ' + err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task: ' + error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.deleteOne({ _id: req.params.id });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task: ' + err.message });
  }
};

// @desc    Get tasks by user
// @route   GET /api/tasks/user/:userId
export const getTasksByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure the requesting user can only see their own tasks
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view these tasks' });
    }

    const tasks = await Task.find({ createdBy: userId })
      .populate('createdBy', 'name email skills location')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user tasks: ' + error.message });
  }
};

export const proposeSwap = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { offeredSkills, message } = req.body;

    if (!userId || !offeredSkills || !message) {
      return res.status(400).json({ message: 'Missing required fields: userId, offeredSkills, or message' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.createdBy.toString() === userId.toString()) return res.status(400).json({ message: 'Cannot propose swap on your own task' });

    task.proposals = task.proposals || [];
    const newProposal = {
      _id: new mongoose.Types.ObjectId(),
      userId,
      offeredSkills,
      message,
      status: 'pending',
      timestamp: new Date(),
    };
    task.proposals.push(newProposal);
    const savedTask = await task.save();
    res.status(201).json({ message: 'Swap proposed successfully', task: savedTask });
  } catch (error) {
    res.status(500).json({ message: 'Failed to propose swap: ' + error.message });
  }
};

// Function to handle task completion
export const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    task.status = 'completed';
    const savedTask = await task.save();
    res.json(savedTask);
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete task: ' + error.message });
  }
};

// Function to get completed tasks
export const getCompletedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email skills location');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch completed tasks: ' + err.message });
  }
};