import FriendRequest from '../models/FriendRequest.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.body;
    console.log("Accepting friend request ID:", requestId);

    // Tìm lời mời bạn bè
    const request = await FriendRequest.findById(requestId).session(session);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: "Lời mời không tồn tại hoặc đã xử lý" });
    }

    // Cập nhật mảng bạn bè cho cả 2 User
    await User.findByIdAndUpdate(request.sender, 
      { $addToSet: { friends: request.receiver } }, { session });
    const receiverData = await User.findByIdAndUpdate(request.receiver, 
      { $addToSet: { friends: request.sender } }, { session })
      .select('_id username avatar email phone');

    // Xóa lời mời sau khi đã thành bạn bè
    await FriendRequest.findByIdAndDelete(requestId).session(session);

    await session.commitTransaction();
    session.endSession();

    
    const senderData = await User.findById(request.sender)
      .select('_id username avatar email phone');

    res.status(200).json({ 
      message: "Đã trở thành bạn bè!",
      friendData: senderData,  
      receiverId: request.receiver  
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách lời mời đã nhận 
export const getReceivedRequests = async (req, res) => {
  try {
    const { userId } = req.params; 
    const requests = await FriendRequest.find({ 
      receiver: userId, 
      status: 'pending' 
    })
    .populate('sender', 'username avatar phone') 
    .sort({ createdAt: -1 }); 
    
    console.log("Lời mời nhận được cho user", userId, ":", requests);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy lời mời" });
  }
};

// Lấy danh sách lời mời đã gửi
export const getSentRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await FriendRequest.find({ 
      sender: userId, 
      status: 'pending' 
    })
    .populate('receiver', 'username avatar phone') 
    .sort({ createdAt: -1 });
    
    console.log("Lời mời đã gửi từ user", userId, ":", requests);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};



// Gửi lời mời kết bạn
export const sendFriendRequest = async (req, res) => {
  try {
    const { senderId, receiverPhone } = req.body;

    // Tìm người nhận qua số điện thoại
    const receiver = await User.findOne({ phone: receiverPhone });
    if (!receiver) return res.status(404).json({ message: "Không tìm thấy số điện thoại này!" });

    if (senderId === receiver._id.toString()) {
      return res.status(400).json({ message: "Bạn không thể tự kết bạn với chính mình" });
    }

    // Kiểm tra xem đã là bạn bè chưa
    if (receiver.friends.includes(senderId)) {
      return res.status(400).json({ message: "Hai người đã là bạn bè rồi" });
    }

    // Kiểm tra xem người kia đã gửi lời mời cho mình chưa (Tránh gửi chéo)
    const crossRequest = await FriendRequest.findOne({
      sender: receiver._id,
      receiver: senderId,
      status: 'pending'
    });
    if (crossRequest) {
      return res.status(400).json({ message: "Người này đã gửi lời mời cho bạn, hãy chấp nhận nó" });
    }

    const existing = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiver._id,
      status: 'pending'
    });
    if (existing) return res.status(400).json({ message: "Lời mời đã được gửi trước đó" });

    // Lưu lời mời mới
    const newRequest = new FriendRequest({ sender: senderId, receiver: receiver._id });
    await newRequest.save();

    const populatedRequest = await FriendRequest.findById(newRequest._id)
      .populate('sender', 'username avatar phone');

    res.status(201).json({ 
      message: "Gửi lời mời thành công", 
      receiverId: receiver._id,
      receiverName: receiver.username,
      request: populatedRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Từ chối hoặc thu hồi lời mời kết bạn
export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    console.log("Xóa/Từ chối lời mời ID:", requestId);

    const request = await FriendRequest.findByIdAndDelete(requestId);

    if (!request) {
      return res.status(404).json({ message: "Lời mời không tồn tại hoặc đã được xử lý" });
    }

    res.status(200).json({ message: "Đã xóa lời mời kết bạn" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tìm kiếm người dùng qua số điện thoại
export const searchUserByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    const user = await User.findOne({ phone }).select('username avatar phone _id friends');
    
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi tìm kiếm" , error});
  }
};