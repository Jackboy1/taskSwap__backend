import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // Will be hashed in the controller
  bio: { type: String, trim: true },
  skills: { type: [String], trim: true },
  location: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);