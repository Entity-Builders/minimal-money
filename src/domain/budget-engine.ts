import { Expense, BudgetConfig } from '../types';
import { getDateMetrics } from './date-utils';

export interface BudgetState {
  // Core Time Context
  dateContext: {
    currentDate: Date;
    daysInMonth: number;
    daysRemaining: number; // Includes today
    currentDayOfMonth: number;
    workingDaysInMonth: number;
    weekendDaysInMonth: number;
    isTodayWeekend: boolean;
    isTodayWorkday: boolean;
  };

  // Spending context
  spending: {
    spentToday: number;
    spentBeforeToday: number;
    totalSpentMonth: number;
    expensesToday: Expense[];
  };

  // The Plan (Ideal)
  plan: {
    monthlyIncome: number;
    monthlyFixed: number;
    monthlyVariableBudget: number; // Income - Fixed - SavingsGoal results
    plannedDailyBudget: number; // ideal daily amount
    projectedSavings: number;
    monthlyFixedSavingsGoal: number;
  };

  // The Reality (History)
  historical: {
    // "Accumulated Savings" is strictly: (Planned * DaysPassed) - SpentBeforeToday
    accumulatedSavings: number;
    // If positive, this is "Real Savings". If negative, it is "Debt".
  };

  // The Adjustment (Current State)
  current: {
    // The budget for TODAY, calculated based on remaining funds and days.
    // If we have debt, this number is naturally lower (amortization).
    // If we have savings, we usually exclude them to keep the daily budget "stable" (unless accessed).
    dailyBudget: number;
    effectiveDailyBudget: number;

    // What is actually available to spend right now?
    // Usually: dailyBudget - spentToday + (PositiveSavings if any)
    totalAvailable: number;

    // If the user overspends today, this reflects the savings dip immediately.
    realTimeAccumulatedSavings: number;

    // Is the user effectively in overdraft *for the day* or *total*?
    isRecoveryMode: boolean;
    recoveryDetails: {
      totalDebt: number;
      recoveryQuota: number;
      daysToRecover: number;
    };
  };
}

/**
 * THE SINGLE SOURCE OF TRUTH
 *
 * Aggregates all budget logic into a single deterministic pass.
 */
export const calculateBudgetState = (
  config: BudgetConfig | null,
  expenses: Expense[],
  now: Date = new Date(),
): BudgetState => {
  // 1. Basic Setup & TimeMetrics
  const {
    currentMonth,
    currentYear,
    currentDayOfMonth,
    daysInMonth,
    daysRemaining,
    workingDaysInMonth,
    weekendDaysInMonth,
    isTodayWeekend,
    isTodayWorkday,
  } = getDateMetrics(now);

  // 2. Spending Aggregation (Single Pass)
  let spentToday = 0;
  let spentBeforeToday = 0;
  let totalSpentMonth = 0;
  const expensesToday: Expense[] = [];

  expenses.forEach(e => {
    const d = new Date(e.timestamp);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      // It's this month
      totalSpentMonth += e.amount;

      if (d.getDate() === currentDayOfMonth) {
        spentToday += e.amount;
        expensesToday.push(e);
      } else if (d.getDate() < currentDayOfMonth) {
        spentBeforeToday += e.amount;
      }
    }
  });

  // 3. Plan Calculation
  // Default safe values if no config
  const income = config?.income ?? 0;
  const fixedExpenses = config?.fixedExpenses ?? 0;
  const savingsPercentage = config?.savingsPercentage ?? 0;

  const disposableIncome = Math.max(0, income - fixedExpenses);
  const monthlySavingsGoal = disposableIncome * (savingsPercentage / 100);
  const monthlyVariableBudget = Math.max(
    0,
    disposableIncome - monthlySavingsGoal,
  );

  // Planned Daily: what you strictly "should" spend evenly
  const plannedDailyBudget =
    daysInMonth > 0 ? Math.floor(monthlyVariableBudget / daysInMonth) : 0;

  // 4. Historical Savings (The "Piggy Bank")
  // (Planned * PreviousDays) - (SpentBeforeToday)
  // Note: PreviousDays = currentDayOfMonth - 1
  const daysPassed = Math.max(0, currentDayOfMonth - 1);
  const accumulatedSavings = plannedDailyBudget * daysPassed - spentBeforeToday;

  // 5. Current Daily Budget Calculation (Amortization Logic)
  // Pool available for remaining days = (TotalMonthBudget - SpentBeforeToday)
  // BUT we want to "hide" positive savings from this pool so you don't accidentally spend them.
  // If savings are negative (debt), we naturally want to include them (reduce pool) to pay it off.
  const savingsToPreserve = Math.max(0, accumulatedSavings);

  // Real money remaining for the month (mathematically)
  const realPoolRemaining = monthlyVariableBudget - totalSpentMonth; // Valid for End of Day
  // But for "Start of Day" budget setting:
  const poolAtStartOfDay = monthlyVariableBudget - spentBeforeToday;

  // Adjusted Pool: Hide savings.
  const amortizedPoolStartOfDay = Math.max(
    0,
    poolAtStartOfDay - savingsToPreserve,
  );

  // The Daily Budget for today (and future days) to stay on track (or pay debt)
  const dailyBudget = Math.floor(amortizedPoolStartOfDay / daysRemaining);

  // 6. Available to Spend (The "Big Number")
  // You can spend your daily budget, minus what you already spent today.
  // PLUS you can access your savings if you have them.
  const remainingDaily = dailyBudget - spentToday;
  const positiveSavingsAvailable = Math.max(0, accumulatedSavings);

  // Note: If accumulatedSavings was negative, it reduced 'dailyBudget' above.
  // So 'dailyBudget' is already "punished". We don't subtract debt again.
  const totalAvailable = remainingDaily + positiveSavingsAvailable;

  // 7. Recovery Mode Logic
  // Are we in a state where the plan is broken?

  // A. Global Debt: Are we overall negative relative to where we should be?
  const idealTotalSpentByNow = plannedDailyBudget * currentDayOfMonth;
  const globalDeficit = totalSpentMonth - idealTotalSpentByNow;
  // (Positive = Overspent)

  // B. Projected Failure: Is the Available Balance negative?
  // This happens if debt was so huge that 'dailyBudget' became 0 and we still have more debt?
  // Or simply if we spent too much today.
  const EPSILON = 0.01;
  const isRunningDeficit = totalAvailable < -EPSILON;

  // C. Daily structure check
  // Original logic: "Debt overall" AND "Daily Limit exceeded" AND "Perceived Limit Exceeded".
  // Let's verify 'Global Debt' is true (accumulatedSavings + plannedDaily - spentToday < 0)
  // effectively: accumulatedSavings - (spentToday - plannedDaily) ...
  // Let's stick to the simpler check:
  // "Is my math saying I have negative money available?" -> Recovery.
  // OR "Did I blow my daily budget AND I have no savings to cover it?" -> Recovery.

  let isRecoveryMode = false;
  let totalDebt = 0;
  let recoveryQuota = 0;
  let daysToRecover = 0;

  if (isRunningDeficit) {
    isRecoveryMode = true;
    totalDebt = Math.abs(totalAvailable);
  } else {
    // Edge case: Maybe we aren't negative available yet, but we are effectively in debt
    // and using "Recovery" to signal we are paying it off?
    // The previous app logic was strict about "Only show recovery if you break the daily limit".
    // If I have $1000 debt, and my daily budget dropped from $100 to $50. I am "paying it off".
    // I am NOT in recovery mode unless I spend >$50 today. This seems to be the desired behavior.
    // So 'isRunningDeficit' covers the "I broke the adjusted plan" case.
    isRecoveryMode = false;
  }

  // Refined Recovery: The user logic had (isGlobalDebt && isDailyOverspend && isPerceivedOverspend).
  // "isGlobalDebt": accumulatedSavings < 0 (mostly).

  // Let's enable Recovery Mode if we are carrying debt AND we overspent the managed daily limit.
  // If we assume 'dailyBudget' is the managed limit.
  const isDailyOverspend = remainingDaily < -EPSILON;
  // If we have savings, overspending daily is fine (eats savings).
  // If we have NO savings (or negative), overspending daily is BAD.

  if (
    !isRecoveryMode &&
    (isDailyOverspend || accumulatedSavings < -EPSILON) &&
    accumulatedSavings <= EPSILON
  ) {
    // Overspent daily AND no savings to back it up.
    // OR we have historical debt (accumulatedSavings < 0)
    isRecoveryMode = true;

    // If we are here due to pure historical debt, totalDebt might be 0 if we haven't spent today.
    // We should use the debt magnitude.
    if (totalDebt === 0 && accumulatedSavings < 0) {
      totalDebt = Math.abs(accumulatedSavings);
    } else {
      totalDebt = Math.abs(totalAvailable);
    }
  }

  // Recovery Metrics
  if (isRecoveryMode) {
    const userTargetDays = config?.recoveryTargetDays;

    if (userTargetDays && userTargetDays > 0) {
      // User Preference Strategy
      recoveryQuota = Math.ceil(totalDebt / userTargetDays);
      daysToRecover = userTargetDays;
    } else {
      // Default Strategy (Max 30% of planned daily budget)
      // How much do we tax the future?
      const maxQuota = plannedDailyBudget * 0.3;
      recoveryQuota = Math.min(totalDebt, maxQuota);
      daysToRecover =
        recoveryQuota > 0 ? Math.ceil(totalDebt / recoveryQuota) : 1;
    }
  }

  // D. Savings Visibility (Real Time)
  // If the user overspends today, it immediately eats into savings.
  // However, if they underspend, it doesn't add to savings until tomorrow.
  const surplusOrDeficitToday = dailyBudget - spentToday;
  const realTimeAccumulatedSavings =
    accumulatedSavings + Math.min(0, surplusOrDeficitToday);

  // 8. Projected Savings Logic
  const monthlyFixedSavingsGoal = monthlySavingsGoal; // Already calculated as part of plan
  const effectiveAccumulatedForProjection = Math.max(0, accumulatedSavings);
  const projectedSavings =
    monthlyFixedSavingsGoal + effectiveAccumulatedForProjection;

  // 9. Effective Daily Budget (for UI)
  // If in recovery mode, we might want to show a reduced amount explicitly?
  // The hook was doing: dailyBudget - recoveryQuota.
  const effectiveDailyBudget = dailyBudget - recoveryQuota;

  return {
    dateContext: {
      currentDate: now,
      daysInMonth,
      daysRemaining,
      currentDayOfMonth,
      workingDaysInMonth,
      weekendDaysInMonth,
      isTodayWeekend,
      isTodayWorkday,
    },
    spending: {
      spentToday,
      spentBeforeToday,
      totalSpentMonth,
      expensesToday,
    },
    plan: {
      monthlyIncome: income,
      monthlyFixed: fixedExpenses,
      monthlyVariableBudget,
      plannedDailyBudget,
      projectedSavings,
      monthlyFixedSavingsGoal,
    },
    historical: {
      accumulatedSavings,
    },
    current: {
      dailyBudget,
      effectiveDailyBudget,
      totalAvailable: totalAvailable - recoveryQuota,
      isRecoveryMode,
      realTimeAccumulatedSavings,
      recoveryDetails: {
        totalDebt,
        recoveryQuota,
        daysToRecover,
      },
    },
  };
};
