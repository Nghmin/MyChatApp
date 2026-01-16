import mongoose from 'mongoose';

const User = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: ""},
  password: { type: String, required: true },
  gender: { type: String, default: 'Nam' },
  birthday: String,
  phone: String,
  avatarPublicId: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', User);