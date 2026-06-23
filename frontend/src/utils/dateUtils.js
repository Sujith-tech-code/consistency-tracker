// Returns 'YYYY-MM-DD' in local time (avoids UTC offset bugs)
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isToday = (dateStr) => dateStr === formatDate(new Date());

export const isPast = (dateStr) => {
  const today = formatDate(new Date());
  return dateStr < today;
};

export const isFuture = (dateStr) => {
  const today = formatDate(new Date());
  return dateStr > today;
};