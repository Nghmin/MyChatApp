import mongoose from 'mongoose';
const GroupSchema = new mongoose.Schema({
 
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  avatar: { 
    type: String, 
    default: "https://img.icons8.com/fluency/48/group.png"
  },
  avatarPublicId: { 
    type: String, 
    default: null  
  },
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  pendingMembers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  lastMessage: {
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  },

  isGroup: { 
    type: Boolean, 
    default: true 
  },
  
}, { timestamps: true });

export default mongoose.model('Group', GroupSchema);