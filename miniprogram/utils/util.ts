const formatNumber = (n: number) => n.toString().padStart(2, '0');

export const formatTime = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${[year, month, day].map(formatNumber).join('/')}` +
    ` ${[hour, minute, second].map(formatNumber).join(':')}`;
};
