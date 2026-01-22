import mongoose from 'mongoose';

const FriendRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    message: {
        type: String, 
        default: 'Xin chào, mình kết bạn nhé!' 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

FriendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export default mongoose.model('FriendRequest', FriendRequestSchema);