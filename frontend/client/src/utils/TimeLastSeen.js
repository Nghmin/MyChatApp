export const TimeLastSeen = (date) => {
    if (!date) return "Ngoại tuyến";
    const now = new Date();
    const lastSeen = new Date(date);
    const diffInSeconds = Math.floor((now - lastSeen) / 1000);

    if (diffInSeconds < 60) return "Vừa hoạt động";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hoạt động ${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hoạt động ${diffInHours} giờ trước`;
    return lastSeen.toLocaleDateString();
};