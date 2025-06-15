import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Task from './models/Task.js';
import Message from './models/Message.js'; // Assuming a Message model exists

dotenv.config();

const app = express();
const server = createServer(app);
const corsOptions = {
  origin: 'https://taskswapfrontend.onrender.com', // Match your deployed frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow all necessary methods
  credentials: true, // Allow cookies or auth tokens if needed
};

// Apply CORS to Express app
app.use(cors(corsOptions));
app.use(express.json());

// Set Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' https://fonts.googleapis.com; style-src-elem 'self' https://fonts.googleapis.com; connect-src 'self' https://taskswap-backend-23oy.onrender.com wss://taskswap-backend-23oy.onrender.com;"
  );
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);

const io = new Server(server, {
  cors: corsOptions, // Use the same CORS options for Socket.IO
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinTaskRoom', (taskId) => {
    if (!taskId) {
      console.warn('No taskId provided for joinTaskRoom');
      return;
    }
    socket.join(taskId);
    console.log(`User ${socket.id} joined task room ${taskId}`);
  });

  socket.on('sendMessage', async (messageData, callback) => {
    try {
      const { taskId, text, sender, senderName } = messageData;
      if (!taskId || !text || !sender) {
        throw new Error('Missing required fields: taskId, text, or sender');
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

      io.to(taskId).emit('receiveMessage', {
        ...savedMessage.toObject(),
        sender: { _id: sender, name: senderName },
      });
      callback({ success: true, message: savedMessage });
    } catch (error) {
      console.error('Message send error:', error);
      callback({ success: false, error: error.message });
    }
  });

  socket.on('updateProposal', async ({ taskId, proposalId, status }) => {
    try {
      const task = await Task.findById(taskId);
      if (task) {
        const proposal = task.proposals.id(proposalId);
        if (proposal) {
          proposal.status = status;
          await task.save();
          io.to(taskId).emit('receiveProposalUpdate', task.proposals);
        }
      }
    } catch (error) {
      console.error('Proposal update error:', error);
    }
  });

  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Server startup error:', error);
  }
});