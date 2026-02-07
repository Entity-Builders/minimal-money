import { Expense } from '../types';
import { getDateMetrics } from './date-utils';

export const calculateAccumulatedSavings = (
  expenses: Expense[],
  plannedDailyBudget: number,
  currentDate: Date,
): number => {
  const {
    currentMonth: currentMonthIdx,
    currentYear,
    currentDayOfMonth: currentDay,
  } = getDateMetrics(currentDate);

  // Get expenses grouped by day for current month (excluding today)
  const expensesByDay = new Map<string, number>();
  for (const e of expenses) {
    const expenseDate = new Date(e.timestamp);
    if (
      expenseDate.getMonth() === currentMonthIdx &&
      expenseDate.getFullYear() === currentYear &&
      expenseDate.getDate() < currentDay
    ) {
      const dayKey = expenseDate.toDateString();
      expensesByDay.set(dayKey, (expensesByDay.get(dayKey) || 0) + e.amount);
    }
  }

  const daysPassed = Math.max(0, currentDay - 1);
  let totalSpentPreviousDays = 0;
  expensesByDay.forEach(spent => {
    totalSpentPreviousDays += spent;
  });

  let currentMonthAccumulated =
    daysPassed * plannedDailyBudget - totalSpentPreviousDays;

  return currentMonthAccumulated;
};
