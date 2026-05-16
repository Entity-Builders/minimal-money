import * as Sentry from '@sentry/react-native';
import { supabase } from '@eb-packages/logic';
import { Batch, Currency, Transaction, BatchMember } from '../types';

// Assuming we will use 'batches' and 'transactions' as tables in the minimal_money schema
export const BudgetService = {
  async loadInitialData(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).getTime(); // we use timestamp for simple filtering

    const [batchesResult, transactionsResult, membersResult] = await Promise.all([
      // RLS "batch_select" automatically restricts this to owned + member batches
      supabase.from('batches').select('*'),
      
      // RLS "tx_select" restricts this to transactions within those allowed batches
      // We only load transactions for the current month by default to keep it light
      supabase
        .from('transactions')
        .select('*')
        .gte('timestamp', startOfMonth)
        .order('timestamp', { ascending: false }),

      // RLS "members_select" allows reading all members of any batch the user is in
      supabase.rpc('get_my_batch_members'),
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
    if (membersResult.error) {
      console.error('membersResult error:', membersResult.error);
      Sentry.captureException(membersResult.error, {
        tags: { context: 'loadInitialData_members' },
      });
    }

    const loadedTransactions: Transaction[] = (transactionsResult.data || []).map(t => ({
      id: t.id.toString(),
      batchId: t.batch_id,
      amount: Number(t.amount),
      originalAmount: Number(t.original_amount) || Number(t.amount),
      currency: (t.currency as Currency) || 'ARS',
      timestamp: Number(t.timestamp),
      name: t.name,
      category: t.category || undefined,
      userId: t.user_id,
    }));

    // Derive currentBalance from transactions instead of trusting the stale DB column.
    // current_balance in the DB is never updated after addTransaction (no RPC/trigger yet).
    const spentPerBatch: Record<string, number> = {};
    for (const t of loadedTransactions) {
      spentPerBatch[t.batchId] = (spentPerBatch[t.batchId] ?? 0) + t.amount;
    }

    // Group members by batchId
    const membersPerBatch: Record<string, BatchMember[]> = {};
    if (membersResult.data) {
      for (const m of membersResult.data) {
        if (!membersPerBatch[m.batch_id]) {
          membersPerBatch[m.batch_id] = [];
        }
        membersPerBatch[m.batch_id].push({
          id: m.id,
          batchId: m.batch_id,
          userId: m.user_id,
          role: m.role,
          joinedAt: new Date(m.joined_at).getTime(),
          email: m.email,
        });
      }
    }

    const loadedBatches: Batch[] = (batchesResult.data || []).map(b => {
      const monthlyLimit = Number(b.monthly_limit);
      const spent = spentPerBatch[b.id] ?? 0;
      return {
        id: b.id,
        name: b.name,
        icon: b.icon,
        monthlyLimit,
        currentBalance: monthlyLimit - spent,
        sharedWith: membersPerBatch[b.id] || [],
        ownerId: b.user_id,
        createdAt: Number(b.created_at_ts),
      };
    });

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
      .from('batches')
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

    // Insert the creator into batch_members as owner
    await supabase.from('batch_members').insert({
      batch_id: data.id,
      user_id: userId,
      role: 'owner',
    });

    const newBatch: Batch = {
      id: data.id,
      name: data.name,
      icon: data.icon,
      monthlyLimit: Number(data.monthly_limit),
      currentBalance: Number(data.current_balance),
      sharedWith: data.shared_with || [],
      ownerId: userId,
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
      .from('batches')
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
      .from('batches')
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

  async leaveBatch(batchId: string, userId: string) {
    const { error } = await supabase
      .from('batch_members')
      .delete()
      .eq('batch_id', batchId)
      .eq('user_id', userId);

    if (error) {
      Sentry.captureException(error, {
        tags: { context: 'leaveBatch' },
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
      .from('transactions')
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
      userId: data.user_id,
    };

    return newTransaction;
  },

  async removeTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
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
