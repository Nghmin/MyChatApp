// controllers/friendController.js
import FriendRequest from '../models/FriendRequest.js';
import User from '../models/User.js';

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body; 
    console.log("Accepting friend request ID:", requestId);

    // Tìm lời mời bạn bè
    const request = await FriendRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: "Lời mời không tồn tại hoặc đã xử lý" });
    }

    // Cập nhật trạng thái lời mời
    request.status = 'accepted';
    await request.save();

    // Cập nhật mảng bạn bè cho cả 2 User
    await User.findByIdAndUpdate(request.sender, { 
      $addToSet: { friends: request.receiver } 
    });
    await User.findByIdAndUpdate(request.receiver, { 
      $addToSet: { friends: request.sender } 
    });
    await FriendRequest.findByIdAndDelete(requestId);
    res.status(200).json({ message: "Đã trở thành bạn bè!" });
  } catch (error) {
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
    .populate('sender', 'username avatar phone') // Lấy thông tin người gửi (chỉ lấy field cần thiết)
    .sort({ createdAt: -1 }); // Mới nhất hiện lên đầu
    console.log("Lời mời nhận được cho user", userId, ":", requests);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy lời mời" });
  }
};

// Lấy danh sách lời mời ĐÃ GỬI (cho người gửi - sender)
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

    // Kiểm tra lời mời đã tồn tại chưa 
    const existing = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiver._id,
      status: 'pending'
    });
    if (existing) return res.status(400).json({ message: "Lời mời đã được gửi trước đó" });

    // 4. Lưu lời mời mới
    const newRequest = new FriendRequest({ sender: senderId, receiver: receiver._id });
    await newRequest.save();

    // Trả về receiverId để Frontend dùng gửi Socket Real-time
    res.status(201).json({ 
      message: "Gửi lời mời thành công", 
      receiverId: receiver._id,
      receiverName: receiver.username 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    console.log("Xóa/Từ chối lời mời ID:", requestId);

    // Tìm và xóa bản ghi lời mời
    const request = await FriendRequest.findByIdAndDelete(requestId);

    if (!request) {
      return res.status(404).json({ message: "Lời mời không tồn tại hoặc đã được xử lý" });
    }

    res.status(200).json({ message: "Đã xóa lời mời kết bạn" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};