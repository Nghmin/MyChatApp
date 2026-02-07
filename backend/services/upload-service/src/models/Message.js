import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: false },
  text: String,
  fileUrl: String,
  filePublicId: String,
  messageType: { type: String, default: 'text' },
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
MessageSchema.pre('save', function() {
    if (!this.receiver && !this.groupId) {
        throw new Error('Tin nhắn phải có người nhận hoặc nhóm nhận!');
    }
});
export default mongoose.model('Message', MessageSchema);