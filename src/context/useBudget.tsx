import React, { createContext, useContext, useReducer } from 'react';
import { BudgetContextType } from '../types';
import { budgetReducer, initialState } from './budgetReducer';
import { useBudgetSync } from '../hooks/useBudgetSync';
import { useBudgetActions } from '../hooks/useBudgetActions';

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Sync data (Auth, Loading, Listeners)
  const { loadData } = useBudgetSync(dispatch);

  // Actions
  const actions = useBudgetActions(dispatch, loadData);

  // Derived state
  const activeBatch = state.batches.find(b => b.id === state.activeBatchId) || null;
  const activeBatchTransactions = state.transactions.filter(t => t.batchId === state.activeBatchId);

  return (
    <BudgetContext.Provider
      value={{
        ...state,
        ...actions,
        activeBatch,
        activeBatchTransactions,
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
