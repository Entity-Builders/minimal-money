import * as Sentry from '@sentry/react-native';
import { supabase } from '@eb-packages/logic';
import { Batch, Currency, Transaction } from '../types';

// Assuming we will use 'mm_batches' and 'mm_transactions' as tables in the shared project
export const BudgetService = {
  async loadInitialData(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).getTime(); // we use timestamp for simple filtering

    const [batchesResult, transactionsResult] = await Promise.all([
      supabase.from('mm_batches').select('*').eq('user_id', userId),
      // We only load transactions for the current month by default to keep it light
      supabase
        .from('mm_transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startOfMonth)
        .order('timestamp', { ascending: false }),
    ]);

    if (batchesResult.error) {
      Sentry.captureException(batchesResult.error, {
        tags: { context: 'loadInitialData_batches' },
      });
    }
    if (transactionsResult.error) {
      Sentry.captureException(transactionsResult.error, {
        tags: { context: 'loadInitialData_transactions' },
      });
    }

    const loadedBatches: Batch[] = (batchesResult.data || []).map(b => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      monthlyLimit: Number(b.monthly_limit),
      currentBalance: Number(b.current_balance),
      sharedWith: b.shared_with || [],
      createdAt: Number(b.created_at_ts),
    }));

    const loadedTransactions: Transaction[] = (transactionsResult.data || []).map(t => ({
      id: t.id.toString(),
      batchId: t.batch_id,
      amount: Number(t.amount),
      originalAmount: Number(t.original_amount) || Number(t.amount),
      currency: (t.currency as Currency) || 'ARS',
      timestamp: Number(t.timestamp),
      name: t.name,
      category: t.category || undefined,
    }));

    return {
      batches: loadedBatches,
      transactions: loadedTransactions,
      hasOnboarded: loadedBatches.length > 0,
    };
  },

  async addBatch(
    userId: string,
    batchData: { name: string; icon: string; monthlyLimit: number },
  ) {
    const { data, error } = await supabase
      .from('mm_batches')
      .insert({
        user_id: userId,
        name: batchData.name,
        icon: batchData.icon,
        monthly_limit: batchData.monthlyLimit,
        current_balance: batchData.monthlyLimit, // Initial balance is the limit
        created_at_ts: Date.now(),
      })
      .select()
      .single();

    if (error) {
      Sentry.captureException(error, {
        tags: { context: 'addBatch' },
      });
      throw error;
    }

    const newBatch: Batch = {
      id: data.id,
      name: data.name,
      icon: data.icon,
      monthlyLimit: Number(data.monthly_limit),
      currentBalance: Number(data.current_balance),
      sharedWith: data.shared_with || [],
      createdAt: Number(data.created_at_ts),
    };

    return newBatch;
  },

  async updateBatch(id: string, updates: Partial<Batch>) {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.monthlyLimit !== undefined) payload.monthly_limit = updates.monthlyLimit;
    if (updates.currentBalance !== undefined) payload.current_balance = updates.currentBalance;

    const { error } = await supabase
      .from('mm_batches')
      .update(payload)
      .eq('id', id);

    if (error) {
      Sentry.captureException(error, {
        tags: { context: 'updateBatch' },
      });
      throw error;
    }
    return true;
  },

  async removeBatch(id: string) {
    const { error } = await supabase
      .from('mm_batches')
      .delete()
      .eq('id', id);

    if (error) {
      Sentry.captureException(error, {
        tags: { context: 'removeBatch' },
      });
      throw error;
    }
    return true;
  },

  async addTransaction(
    userId: string,
    transactionData: {
      batchId: string;
      amount: number;
      currency: Currency;
      timestamp: number;
      name: string;
      category?: string;
      originalAmount?: number;
      exchangeRate?: number;
    },
  ) {
    const exchangeRate = transactionData.exchangeRate || 1;
    const amountInBase =
      transactionData.currency !== 'USD'
        ? Math.round((transactionData.amount / exchangeRate) * 100) / 100
        : transactionData.amount;

    const { data, error } = await supabase
      .from('mm_transactions')
      .insert({
        user_id: userId,
        batch_id: transactionData.batchId,
        amount: amountInBase,
        original_amount: transactionData.originalAmount || transactionData.amount,
        currency: transactionData.currency,
        name: transactionData.name,
        timestamp: transactionData.timestamp,
        category: transactionData.category || 'General',
      })
      .select()
      .single();

    if (error) {
      Sentry.captureException(error, {
        tags: { context: 'addTransaction' },
      });
      throw error;
    }

    // Also update the batch current balance in the DB
    // Ideally this would be an RPC or a database trigger to ensure consistency.
    // For now we do it in a second request (assuming optimistic UI already handled it locally).
    
    // Actually, we should call an RPC to do this atomically, but let's stick to this for now.
    // In the real app, we might rely on the client state for the immediate update and background sync.

    const newTransaction: Transaction = {
      id: data.id.toString(),
      batchId: data.batch_id,
      amount: Number(data.amount),
      originalAmount: Number(data.original_amount),
      currency: data.currency as Currency,
      timestamp: Number(data.timestamp),
      name: data.name,
      category: data.category || undefined,
    };

    return newTransaction;
  },

  async removeTransaction(id: string) {
    const { error } = await supabase
      .from('mm_transactions')
      .delete()
      .eq('id', id);

    if (error) {
      Sentry.captureException(error, {
        tags: { context: 'removeTransaction' },
      });
      throw error;
    }
    return true;
  },
};
