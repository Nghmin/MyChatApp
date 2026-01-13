export const getTimelineLabel = (currMsg, prevMsg) => {
  if (!currMsg) return null;

  const currDate = new Date(currMsg.createdAt);

  if (!prevMsg) {
    return formatTimelineDate(currDate);
  }

  const prevDate = new Date(prevMsg.createdAt);
  const diffInMinutes = (currDate - prevDate) / (1000 * 60);

  // Khoảng cách > 15 phút hoặc khác ngày thì hiện timeline
  if (
    diffInMinutes > 15 ||
    currDate.toDateString() !== prevDate.toDateString()
  ) {
    return formatTimelineDate(currDate);
  }

  return null;
};

const formatTimelineDate = (date) => {
  const today = new Date();

  // Hàm thêm số 0
  const pad = (n) => n.toString().padStart(2, "0");

  // Thứ
  const weekdays = [
    "CN",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  const weekdayStr = weekdays[date.getDay()];

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  const timeStr = `${hour}:${minute}`;

  // Hôm nay → chỉ hiện giờ + thứ
  if (date.toDateString() === today.toDateString()) {
    return `${weekdayStr} ${timeStr}`;
  }

  // Khác năm
  if (year !== today.getFullYear()) {
    return `${weekdayStr} ${day}/${month}/${year} ${timeStr}`;
  }

  // Cùng năm
  return `${weekdayStr} ${day}/${month} ${timeStr}`;
};