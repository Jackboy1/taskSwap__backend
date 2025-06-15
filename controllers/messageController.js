import Message from '../models/Message.js';
import Task from '../models/Task.js';

// @desc    Fetch messages for a task
// @route   GET /api/messages/:taskId
export const fetchMessages = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Verify the task exists and the user has access (either creator or involved in a swap)
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const messages = await Message.find({ taskId })
      .populate('sender', 'name')
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages: ' + error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { taskId, text } = req.body;
    const sender = req.user._id;
    const senderName = req.user.name; // Ensure name is available in req.user

    if (!taskId || !text || !sender) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newMessage = new Message({
      taskId,
      text,
      sender,
      senderName,
      timestamp: new Date(),
      status: 'sent',
    });
    const savedMessage = await newMessage.save();

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message: ' + error.message });
  }
};