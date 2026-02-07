export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

export const isWorkday = (date: Date): boolean => {
  return !isWeekend(date);
};

export const getWeekendDaysInMonth = (date: Date): number => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = getDaysInMonth(date);
  let weekendDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDay = new Date(year, month, day);
    if (isWeekend(currentDay)) {
      weekendDays++;
    }
  }

  return weekendDays;
};

export const getWorkingDaysInMonth = (date: Date): number => {
  const daysInMonth = getDaysInMonth(date);
  const weekendDays = getWeekendDaysInMonth(date);
  return daysInMonth - weekendDays;
};

export interface DateMetrics {
  currentMonth: number;
  currentYear: number;
  currentDayOfMonth: number;
  daysInMonth: number;
  daysRemaining: number;
  workingDaysInMonth: number;
  weekendDaysInMonth: number;
  isTodayWeekend: boolean;
  isTodayWorkday: boolean;
}

export const getDateMetrics = (now: Date = new Date()): DateMetrics => {
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDayOfMonth = now.getDate();
  const daysInMonth = getDaysInMonth(now);
  const daysRemaining = Math.max(1, daysInMonth - currentDayOfMonth + 1);

  return {
    currentMonth,
    currentYear,
    currentDayOfMonth,
    daysInMonth,
    daysRemaining,
    workingDaysInMonth: getWorkingDaysInMonth(now),
    weekendDaysInMonth: getWeekendDaysInMonth(now),
    isTodayWeekend: isWeekend(now),
    isTodayWorkday: isWorkday(now),
  };
};
