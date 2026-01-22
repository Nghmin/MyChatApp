import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: ""},
  password: { type: String, required: true },
  gender: { type: String, default: 'Nam' },
  birthday: String,
  avatarPublicId: { type: String, default: '' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});
UserSchema.index({ friends: 1 });
export default mongoose.model('User', UserSchema);