export const TimeLastSeen = (date) => {
    if (!date) return "Ngoại tuyến";
    
    const now = new Date();
    const lastSeen = new Date(date);
    
    // Tính toán khoảng cách thời gian (ms)
    const diffInMs = now - lastSeen;
    const diffInSeconds = Math.floor(diffInMs / 1000);

    // Dưới 1 phút
    if (diffInSeconds < 60) return "Vừa hoạt động";
    
    // Dưới 1 tiếng
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hoạt động ${diffInMinutes} phút trước`;
    
    // Dưới 24 tiếng
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        // Kiểm tra nếu là ngày hôm qua (về mặt lịch sử)
        if (now.getDate() !== lastSeen.getDate()) {
            return `Hoạt động 1 ngày trước`;
        }
        return `Hoạt động ${diffInHours} giờ trước`;
    }

    // Tính số ngày
    const diffInDays = Math.floor(diffInHours / 24);
    
    // Nếu dưới 31 ngày thì hiện "số ngày trước"
    if (diffInDays < 31) {
        return `Hoạt động ${diffInDays} ngày trước`;
    }

    // Nếu quá lâu (trên 1 tháng) thì hiện ngày tháng năm cụ thể
    return `Hoạt động ngày ${lastSeen.toLocaleDateString('vi-VN')}`;
};