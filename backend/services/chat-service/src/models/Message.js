import mongoose from 'mongoose';

const Message = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: String,
  fileUrl: String,
  messageType: { type: String, default: 'text' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Message', Message);