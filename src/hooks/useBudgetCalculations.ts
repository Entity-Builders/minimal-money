import { useMemo } from 'react';
import { calculateBudgetState } from '../domain/budget-engine';
import { BudgetConfig, Expense } from '../types';

export type BudgetCalculationsReturnType = {
  dailyBudget: number;
  spentToday: number;
  accumulatedSavings: number;
  projectedSavings: number;
  monthlyFixedSavingsGoal: number;
  isRecoveryMode: boolean;
  totalDebt: number;
  expensesToday: Expense[];
  spentCurrentMonth: number;
  plannedDailyBudget: number;
  monthlyVariableBudget: number;
  daysInMonth: number;
  daysRemaining: number;
  effectiveDailyBudget: number;
  recoveryQuota: number;
  daysToRecover: number;
  totalAvailable: number;
};

export const useBudgetCalculations = (
  config: BudgetConfig | null,
  expenses: Expense[],
): BudgetCalculationsReturnType => {
  const now = new Date();
  const dayStr = now.toDateString();
  const monthStr = `${now.getMonth()}-${now.getFullYear()}`;

  // We memoize the engine call to ensure stability across renders
  // dependent on expenses array identity or date changes.
  const budgetState = useMemo(() => {
    return calculateBudgetState(config, expenses, now);
  }, [config, expenses, dayStr, monthStr]);

  const { dateContext, spending, plan, historical, current } = budgetState;

  // No separate logic needed now, everything is in the engine.

  return {
    expensesToday: spending.expensesToday,
    spentToday: spending.spentToday,
    spentCurrentMonth: spending.totalSpentMonth,

    dailyBudget: current.dailyBudget,
    plannedDailyBudget: plan.plannedDailyBudget,
    monthlyVariableBudget: plan.monthlyVariableBudget,

    // We only expose positive accumulated savings to "add" to the pot.
    // Negative savings are already handled in 'dailyBudget'.
    // We use realTimeAccumulatedSavings so the user sees their savings go down
    // if they overspend today.
    accumulatedSavings: current.realTimeAccumulatedSavings,

    totalAvailable: current.totalAvailable,

    isRecoveryMode: current.isRecoveryMode,
    totalDebt: current.recoveryDetails.totalDebt,
    recoveryQuota: current.recoveryDetails.recoveryQuota,
    daysToRecover: current.recoveryDetails.daysToRecover,

    effectiveDailyBudget: current.effectiveDailyBudget,

    daysInMonth: dateContext.daysInMonth,
    daysRemaining: dateContext.daysRemaining,

    projectedSavings: plan.projectedSavings,
    monthlyFixedSavingsGoal: plan.monthlyFixedSavingsGoal,
  };
};
