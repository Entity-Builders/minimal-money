import { User } from '@supabase/supabase-js';

export type RootStackParamList = {
  Auth: undefined; // The Stack
  Login: undefined; // The Screen inside Auth Stack (renamed to avoid conflict)
  Onboarding: undefined;
  Main: undefined;
  Settings: undefined;
  History: undefined;
  App: undefined;
};

export type Currency = 'ARS' | 'USD' | 'MXN';

export interface FixedExpense {
  id: string; // uuid
  name: string;
  amount: number;
  created_at?: string;
  user_id?: string;
}

export interface BudgetConfig {
  income: number;
  fixedExpenses: number;
  fixedExpensesDetails?: FixedExpense[];
  savingsPercentage: number; // 0 to 50
  recoveryTargetDays?: number; // user preference for recovery speed
}

export interface Expense {
  id: string;
  amount: number; // siempre guardado en ARS
  originalAmount: number; // monto original ingresado
  currency: Currency; // moneda original
  timestamp: number;
  name: string;
  category?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  timestamp: Date | number; // Support both for flexibility in mocks vs real
  category?: string;
  name?: string;
}

export interface BudgetContextType {
  user: User | null;
  config: BudgetConfig | null;
  expenses: Expense[];
  // Fixed Expenses
  fixedExpensesList: FixedExpense[];
  addFixedExpense: (name: string, amount: number) => Promise<void>;
  removeFixedExpense: (id: string) => Promise<void>;

  // ... (rest implied, just adding loading)
  loading: boolean;
  expensesToday: Expense[];
  spentToday: number;
  spentCurrentMonth: number;
  dailyBudget: number;
  accumulatedSavings: number;
  totalAvailable: number;
  remainingDays: number;
  daysInMonth: number;
  projectedSavings: number;
  monthlyFixedSavingsGoal: number;
  hasOnboarded: boolean;
  isRecoveryMode: boolean;
  totalDebt: number;
  effectiveDailyBudget: number;
  recoveryQuota: number;
  daysToRecover: number;
  calculateBudgetProjection: (
    income: number,
    fixedExpenses: number,
    savingsPercentage: number,
    additionalSpent?: number,
  ) => {
    disposableIncome: number;
    savingsAmount: number;
    monthlyVariableBudget: number;
    dailySpendingPool: number;
    calculatedDaily: number;
  };
  setConfig: (config: BudgetConfig, initialExpenses?: number) => Promise<void>;
  addExpense: (
    amount: number,
    currency: Currency,
    exchangeRate: number,
    customTimestamp?: number,
    name?: string,
  ) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  resetData: () => Promise<void>;
}
