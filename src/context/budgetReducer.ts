import { User } from '@supabase/supabase-js';
import { BudgetConfig, Expense, FixedExpense } from '../types';

// State Definition
export type BudgetState = {
  user: User | null;
  config: BudgetConfig | null;
  expenses: Expense[];
  // dailyBudget removed from state as it is derived
  hasOnboarded: boolean;
  loading: boolean;
  fixedExpensesList: FixedExpense[];
};

// Actions
export type BudgetAction =
  | { type: 'SET_USER'; payload: User | null }
  | {
      type: 'SET_DATA';
      payload: {
        config: BudgetConfig | null;
        expenses: Expense[];
        hasOnboarded: boolean;
      };
    }
  | {
      type: 'SET_CONFIG';
      payload: { config: BudgetConfig };
    }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'REMOVE_EXPENSE'; payload: string }
  | { type: 'RESET' }
  | { type: 'SET_FIXED_EXPENSES'; payload: FixedExpense[] }
  | {
      type: 'ADD_FIXED_EXPENSE';
      payload: { expense: FixedExpense };
    }
  | {
      type: 'REMOVE_FIXED_EXPENSE';
      payload: { id: string };
    };

// Initial State
export const initialState: BudgetState = {
  user: null,
  config: null,
  expenses: [],
  hasOnboarded: false,
  loading: true,
  fixedExpensesList: [],
};

// Reducer
export const budgetReducer = (
  state: BudgetState,
  action: BudgetAction,
): BudgetState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        loading: true, // Set loading true while we fetch data for this user
      };
    case 'SET_DATA':
      return {
        ...state,
        ...action.payload,
        loading: false,
      };
    case 'SET_CONFIG':
      return {
        ...state,
        config: action.payload.config,
        hasOnboarded: true,
      };
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [action.payload, ...state.expenses].sort(
          (a, b) => b.timestamp - a.timestamp,
        ),
      };
    case 'REMOVE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload),
      };
    case 'RESET':
      return {
        ...initialState,
        loading: false,
        hasOnboarded: false,
      };
    case 'SET_FIXED_EXPENSES':
      return {
        ...state,
        fixedExpensesList: action.payload,
      };
    case 'ADD_FIXED_EXPENSE': {
      const newList = [...state.fixedExpensesList, action.payload.expense];
      const newTotal = newList.reduce((sum, item) => sum + item.amount, 0);
      return {
        ...state,
        fixedExpensesList: newList,
        config: state.config
          ? { ...state.config, fixedExpenses: newTotal }
          : null,
      };
    }
    case 'REMOVE_FIXED_EXPENSE': {
      const newList = state.fixedExpensesList.filter(
        item => item.id !== action.payload.id,
      );
      const newTotal = newList.reduce((sum, item) => sum + item.amount, 0);
      return {
        ...state,
        fixedExpensesList: newList,
        config: state.config
          ? { ...state.config, fixedExpenses: newTotal }
          : null,
      };
    }
    default:
      return state;
  }
};
