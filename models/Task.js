import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  offeredSkills: {
    type: [String],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  offeredSkill: {
    type: String,
    required: true,
  },
  skillsNeeded: {
    type: [String],
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed'],
    default: 'open',
  },
  proposals: [proposalSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);