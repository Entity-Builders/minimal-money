export interface BudgetConfig {
  income: number;
  fixedExpenses: number;
  savingsPercentage: number;
}

import { getDateMetrics } from './date-utils';

export interface BudgetProjectionInput {
  config: BudgetConfig;
  totalSpent: number; // Total variable spent in the month
  currentDate: Date;
  accumulatedSavings?: number; // Optional context for validation logic
  spentToday?: number; // Amount spent specifically today, used to stabilize daily budget calculation
}

export interface BudgetMetrics {
  disposableIncome: number;
  savingsAmount: number;
  monthlyVariableBudget: number;
  dailySpendingPool: number;
  daysRemaining: number;
  daysInMonth: number;
  dailyBudget: number;
  plannedDailyBudget: number;
  calculatedDaily: number;
}

/**
 * Calculates the core budget metrics for the application based on the user's configuration
 * and current spending status.
 *
 * This function serves as the single source of truth for budget math, ensuring consistency
 * across different views (Dashboard, History, etc.).
 *
 * Key behaviors:
 * - Uses `Math.floor` for daily budgets to provide conservative estimates (never suggesting
 *   money that might not exist).
 * - `dailyBudget` is dynamic: it adjusts based on how much has been spent so far and
 *   how many days are left in the month.
 * - `plannedDailyBudget` is static: it represents the ideal daily spending limit if
 *   expenses were perfectly distributed across the entire month.
 *
 * @param input - The input parameters including budget config, total spent so far, and the current date.
 * @returns An object containing all derived budget figures (disposable income, savings, daily limits, etc.).
 */
export const calculateBudgetMetrics = ({
  config,
  totalSpent,
  currentDate,
  accumulatedSavings,
  spentToday = 0,
}: BudgetProjectionInput): BudgetMetrics => {
  const { income, fixedExpenses, savingsPercentage } = config;

  // Basic Budget Calculations
  const disposableIncome = Math.max(0, income - fixedExpenses);
  const savingsAmount = disposableIncome * (savingsPercentage / 100);
  const monthlyVariableBudget = Math.max(0, disposableIncome - savingsAmount);

  // Daily Calculations
  const dailySpendingPool = Math.max(0, monthlyVariableBudget - totalSpent);

  const {
    daysInMonth,
    currentDayOfMonth: currentDay,
    daysRemaining,
  } = getDateMetrics(currentDate);

  // Stabilized Daily Budget Calculation
  // We calculate the daily budget based on the funds available *at the start of the day*
  // to prevent the budget from decreasing as the user spends money during the day.
  // Pool at start of day = (Total Pool Now) + (Spent Today).
  // Or: (Monthly Budget) - (Total Spent - Spent Today).
  const spentBeforeToday = Math.max(0, totalSpent - spentToday);

  // Stabilize Piggy Bank:
  // If we have accumulated savings (positive), exclude them from the daily pool
  // so they don't incorrectly inflate the daily budget.
  // If we are in debt (negative), we DO include it (implied) to lower the daily budget naturally.
  const savingsToSetAside = Math.max(0, accumulatedSavings || 0);

  const poolAtStartOfDay = Math.max(
    0,
    monthlyVariableBudget - spentBeforeToday - savingsToSetAside,
  );

  // Core consistency fix: Using Math.floor everywhere for conservative estimates
  // or Math.round if we want "closest dollar".
  // MonthlySummaryCard used round, useBudget used floor.
  // We standardize on Math.floor to never suggest spending money you don't fully have?
  // Actually, for UI niceness, round is often better, but floor is safer.
  // Let's use Math.floor() to be consistent with original dailyBudget logic.
  const dailyBudgetNaive = Math.floor(poolAtStartOfDay / daysRemaining);
  const plannedDailyBudget =
    daysInMonth > 0 ? Math.floor(monthlyVariableBudget / daysInMonth) : 0;

  // Core logic:
  // 1. dailyBudgetNaive: The raw mathematical reality (Remaining Money / Remaining Days).
  // 2. plannedDailyBudget: The ideal daily spend.

  // Stability & Accumulated Savings Logic:
  // We determine if the user is "On Track" or has "Savings" by comparing TotalSpent vs PlannedAccumulated.
  // PlannedAccumulated = plannedDailyBudget * currentDay. (Total expected spend by end of today).

  const plannedAccumulatedSpend = plannedDailyBudget * currentDay;

  // Simplification: Always use the naive calculation (Remaining Money / Remaining Days).
  // This matches the user's mental model: "If I have $X left and Y days, I can spend X/Y per day".
  // It also implicitly handles "rolling over" savings into the daily budget if desired.
  const dailyBudget = dailyBudgetNaive;

  const calculatedDaily = dailyBudgetNaive;

  return {
    disposableIncome,
    savingsAmount,
    monthlyVariableBudget,
    dailySpendingPool,
    daysRemaining,
    daysInMonth,
    dailyBudget,
    plannedDailyBudget,
    calculatedDaily,
  };
};

export const calculatePreFlightMetrics = (
  income: number,
  expenses: number,
  savings: number,
) => {
  const now = new Date();
  // Use the 1st of the month to give a correct daily budget projection (as if starting the month)
  // Otherwise, calculating on the 30th gives 30x the daily budget.
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return calculateBudgetMetrics({
    config: { income, fixedExpenses: expenses, savingsPercentage: savings },
    totalSpent: 0,
    currentDate: firstOfMonth,
  });
};

export interface AvailableBalanceInput {
  dailyBudget: number;
  spentToday: number;
  accumulatedSavings: number;
  isRecoveryMode: boolean;
}

export const calculateAvailableBalance = ({
  dailyBudget,
  spentToday,
  accumulatedSavings,
  isRecoveryMode,
}: AvailableBalanceInput) => {
  if (isRecoveryMode) {
    return {
      totalAvailable: 0,
      adjustedAccumulatedSavings: 0,
    };
  }

  const remainingDaily = dailyBudget - spentToday;

  // If there is a deficit today, it eats into the accumulated savings
  const deficit = Math.max(0, -remainingDaily);
  const adjustedAccumulatedSavings = Math.max(0, accumulatedSavings - deficit);

  // Total available is sum of remaining daily + savings left
  // CRITICAL FIX: If accumulatedSavings is negative, it is already amortized into the 'dailyBudget'
  // (which is reduced to spread the debt over the month).
  // We MUST NOT subtract it again here, otherwise we double-count the penalty.
  const effectiveAccumulated = Math.max(0, accumulatedSavings);
  const totalAvailable = remainingDaily + effectiveAccumulated;

  return {
    totalAvailable,
    adjustedAccumulatedSavings,
  };
};
