export const formatToVNPhone = (phone) => {
  if (!phone) return 'Chưa cập nhật';
  let cleanPhone = phone.trim();

  if (cleanPhone.startsWith('0')) {
    return `+84 ${cleanPhone.substring(1)}`;
  }
  return cleanPhone;
};