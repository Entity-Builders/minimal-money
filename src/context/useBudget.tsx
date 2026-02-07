import React, { createContext, useContext, useReducer } from 'react';
import { BudgetContextType } from '../types';
import { calculateBudgetMetrics } from '../domain/budget';
import { budgetReducer, initialState } from './budgetReducer';
import { useBudgetCalculations } from '../hooks/useBudgetCalculations';
import { useBudgetSync } from '../hooks/useBudgetSync';
import { useBudgetActions } from '../hooks/useBudgetActions';

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Sync data (Auth, Loading, Listeners)
  const { loadData } = useBudgetSync(dispatch);

  // Actions (Add/Remove Expense, Set Config, etc)
  const actions = useBudgetActions(dispatch, loadData);

  // Derived state calculations using custom hook
  const { config, expenses } = state;
  const budgetCalculations = useBudgetCalculations(config, expenses);
  const { spentCurrentMonth } = budgetCalculations; // Needed for projection helper

  // Helper to project budget based on hypothetical config
  const calculateBudgetProjection = React.useCallback(
    (
      income: number,
      fixedExpenses: number,
      savingsPercentage: number,
      additionalSpent: number = 0,
    ) => {
      return calculateBudgetMetrics({
        config: { income, fixedExpenses, savingsPercentage },
        totalSpent: spentCurrentMonth + additionalSpent,
        currentDate: new Date(),
      });
    },
    [spentCurrentMonth],
  );

  return (
    <BudgetContext.Provider
      value={{
        ...state,
        ...budgetCalculations,
        remainingDays: budgetCalculations.daysRemaining,
        calculateBudgetProjection,
        ...actions,
        fixedExpensesList: state.fixedExpensesList,
      }}
    >
      {!state.loading && children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
