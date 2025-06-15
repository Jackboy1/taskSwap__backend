import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  text: { type: String, required: true, trim: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Message', MessageSchema);