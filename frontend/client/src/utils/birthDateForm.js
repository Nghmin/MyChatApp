export const days = Array.from({ length: 31 }, (_, i) => i + 1);
export const months = Array.from({ length: 12 }, (_, i) => i + 1);
export const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

export const formatBirthDateToString = (dateObj) => {
  const { day, month, year } = dateObj;
  if (!day || !month || !year) return '';
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const parseBirthDateToObj = (dateString) => {
  if (!dateString) return { day: '', month: '', year: '' };
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return { day: '', month: '', year: '' };
  
  return {
    day: d.getDate(),
    month: d.getMonth() + 1,
    year: d.getFullYear()
  };
};

export const selectDateStyles = {
  control: (base) => ({
    ...base,
    minHeight: '32px',
    height: '32px',
    fontSize: '12px',
    borderRadius: '6px',
    borderColor: '#e5e7eb',
    '&:hover': { borderColor: '#3b82f6' }
  }),
  valueContainer: (base) => ({ ...base, padding: '0 2px',justifyContent: 'center' }),
  indicatorsContainer: (base) => ({ ...base, height: '30px' }),
  menu: (base) => ({
    ...base,
    maxHeight: '160px', 
    zIndex: 9999,
  }),
  indicatorSeparator: () => ({ 
    display: 'none' 
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '2px', 
    color: '#9ca3af'
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '160px',
    padding: 0,
    // Custom thanh cuộn 
    '&::-webkit-scrollbar': { width: '4px' },
    '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '10px' }
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '13px',
    padding: '4px 8px',
    backgroundColor: state.isSelected ? '#0068ff' : state.isFocused ? '#f1f5f9' : 'white',
  })
};