import { User } from '@supabase/supabase-js';
import { BudgetState, Batch, Transaction } from '../types';

export type BudgetAction =
  | { type: 'SET_USER'; payload: User | null }
  | {
      type: 'SET_DATA';
      payload: {
        batches: Batch[];
        transactions: Transaction[];
        hasOnboarded: boolean;
      };
    }
  | { type: 'ADD_BATCH'; payload: Batch }
  | { type: 'UPDATE_BATCH'; payload: { id: string; updates: Partial<Batch> } }
  | { type: 'REMOVE_BATCH'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'REMOVE_TRANSACTION'; payload: string }
  | { type: 'SET_ACTIVE_BATCH'; payload: string }
  | { type: 'RESET' };

export const initialState: BudgetState = {
  user: null,
  batches: [],
  transactions: [],
  hasOnboarded: false,
  loading: true,
  activeBatchId: null,
};

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
      
    case 'SET_DATA': {
      const newBatches = action.payload.batches;
      let newActiveBatchId = state.activeBatchId;
      if (!newActiveBatchId || !newBatches.find(b => b.id === newActiveBatchId)) {
         newActiveBatchId = newBatches.length > 0 ? newBatches[0].id : null;
      }
      return {
        ...state,
        ...action.payload,
        activeBatchId: newActiveBatchId,
        loading: false,
      };
    }
      
    case 'ADD_BATCH':
      return {
        ...state,
        batches: [...state.batches, action.payload],
        hasOnboarded: true,
        activeBatchId: state.activeBatchId || action.payload.id,
      };
      
    case 'UPDATE_BATCH':
      return {
        ...state,
        batches: state.batches.map(batch => 
          batch.id === action.payload.id ? { ...batch, ...action.payload.updates } : batch
        ),
      };
      
    case 'REMOVE_BATCH':
      const newBatches = state.batches.filter(b => b.id !== action.payload);
      return {
        ...state,
        batches: newBatches,
        activeBatchId: state.activeBatchId === action.payload 
          ? (newBatches.length > 0 ? newBatches[0].id : null)
          : state.activeBatchId,
      };

    case 'ADD_TRANSACTION': {
      // Deduct from batch balance
      const updatedBatches = state.batches.map(batch => {
        if (batch.id === action.payload.batchId) {
          return {
            ...batch,
            currentBalance: batch.currentBalance - action.payload.amount,
          };
        }
        return batch;
      });

      return {
        ...state,
        batches: updatedBatches,
        transactions: [action.payload, ...state.transactions].sort(
          (a, b) => b.timestamp - a.timestamp,
        ),
      };
    }

    case 'REMOVE_TRANSACTION': {
      const transactionToRemove = state.transactions.find(t => t.id === action.payload);
      if (!transactionToRemove) return state;

      // Add back to batch balance
      const updatedBatches = state.batches.map(batch => {
        if (batch.id === transactionToRemove.batchId) {
          return {
            ...batch,
            currentBalance: batch.currentBalance + transactionToRemove.amount,
          };
        }
        return batch;
      });

      return {
        ...state,
        batches: updatedBatches,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    }

    case 'SET_ACTIVE_BATCH':
      return {
        ...state,
        activeBatchId: action.payload,
      };

    case 'RESET':
      return {
        ...initialState,
        loading: false,
        hasOnboarded: false,
      };

    default:
      return state;
  }
};
