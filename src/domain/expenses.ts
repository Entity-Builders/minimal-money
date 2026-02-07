import { Expense } from '../types';

/**
 * Filter expenses that occurred on a specific date.
 */
export const getExpensesForDate = (
  expenses: Expense[],
  date: Date,
): Expense[] => {
  const dateStr = date.toDateString();
  return expenses.filter(e => {
    // Ensure we handle timestamp correctly (number or Date object if varied)
    // Expense interface says timestamp is number.
    return new Date(e.timestamp).toDateString() === dateStr;
  });
};

/**
 * Calculate the total amount for a list of expenses.
 */
export const calculateTotalAmount = (expenses: Expense[]): number => {
  return expenses.reduce((acc, curr) => acc + curr.amount, 0);
};

/**
 * Calculate the total spent in a specific month and year.
 */
export const calculateSpentInMonth = (
  expenses: Expense[],
  date: Date,
): number => {
  const targetMonth = date.getMonth();
  const targetYear = date.getFullYear();

  return expenses.reduce((sum, expense) => {
    const expenseDate = new Date(expense.timestamp);
    if (
      expenseDate.getMonth() === targetMonth &&
      expenseDate.getFullYear() === targetYear
    ) {
      return sum + expense.amount;
    }
    return sum;
  }, 0);
};
