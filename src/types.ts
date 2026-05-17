import { User } from '@supabase/supabase-js';

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Onboarding: undefined;
  Main: undefined;
  Settings: undefined;
  History: undefined;
  App: undefined;
};

export type Currency = 'ARS' | 'USD' | 'MXN';

export interface Transaction {
  id: string;
  batchId: string;
  amount: number; // Stored in the base currency (e.g. ARS)
  originalAmount: number;
  currency: Currency;
  timestamp: number;
  name: string;
  category?: string;
  userId: string;
}

export interface BatchMember {
  id: string;
  batchId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: number;
  email: string;
}

export interface Batch {
  id: string;
  name: string;
  icon: string;
  monthlyLimit: number;
  currentBalance: number;
  sharedWith: BatchMember[];
  ownerId: string;
  createdAt: number;
}

export interface BudgetState {
  user: User | null;
  batches: Batch[];
  transactions: Transaction[];
  hasOnboarded: boolean;
  loading: boolean;
  activeBatchId: string | null;
}

export interface BudgetContextType extends BudgetState {
  // Actions
  addBatch: (name: string, icon: string, monthlyLimit: number) => Promise<{ success: boolean; error?: string } | undefined>;
  updateBatch: (id: string, updates: Partial<Batch>) => Promise<void>;
  removeBatch: (id: string) => Promise<void>;
  leaveBatch: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  addTransaction: (
    batchId: string,
    amount: number,
    currency: Currency,
    exchangeRate: number,
    name?: string,
    customTimestamp?: number
  ) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  
  setActiveBatch: (id: string) => void;
  resetData: () => Promise<void>;
  
  // Derived state / Getters
  activeBatch: Batch | null;
  activeBatchTransactions: Transaction[];
}
