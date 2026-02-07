import * as Sentry from '@sentry/react-native';
import { supabase } from '@eb-packages/logic';
import { BudgetConfig, Currency, Expense, FixedExpense } from '../types';
import { calculateBudgetMetrics } from '../domain/budget';

export const BudgetService = {
  /**
   * Loads all necessary initial data for the user:
   * - Profile (Config)
   * - Fixed Expenses
   * - Expenses (Current Month)
   * - Monthly Summary (Current Month)
   */
  async loadInitialData(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();

    // Parallel fetching for performance
    const [profileResult, fixedExpensesResult, summaryResult, expensesResult] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('fixed_expenses').select('*').eq('user_id', userId),
        supabase
          .from('monthly_summaries')
          .select('*')
          .eq('user_id', userId)
          .eq('month', startOfMonth)
          .single(),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startOfMonth)
          .order('date', { ascending: false }),
      ]);

    // Log any errors from initial data load
    if (profileResult.error) {
      Sentry.captureException(profileResult.error, {
        tags: { context: 'loadInitialData_profile' },
      });
    }
    if (fixedExpensesResult.error) {
      Sentry.captureException(fixedExpensesResult.error, {
        tags: { context: 'loadInitialData_fixedExpenses' },
      });
    }
    if (summaryResult.error) {
      Sentry.captureException(summaryResult.error, {
        tags: { context: 'loadInitialData_summary' },
      });
    }
    if (expensesResult.error) {
      Sentry.captureException(expensesResult.error, {
        tags: { context: 'loadInitialData_expenses' },
      });
    }

    // Handle Fixed Expenses
    const loadedFixedExpenses: FixedExpense[] = (
      fixedExpensesResult.data || []
    ).map(e => ({
      id: e.id,
      name: e.name,
      amount: Number(e.amount),
      created_at: e.created_at,
      user_id: e.user_id,
    }));

    const totalFixedExpenses = loadedFixedExpenses.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );

    // Handle Config/Profile
    let loadedConfig: BudgetConfig | null = null;

    if (profileResult.data) {
      const profile = profileResult.data;
      const currentMonthSummary = summaryResult.data;

      // Prioritize current month summary income if available, else use profile default
      const currentIncome =
        currentMonthSummary?.total_income != null &&
        currentMonthSummary.total_income > 0
          ? currentMonthSummary.total_income
          : profile.monthly_income || 0;

      loadedConfig = {
        income: currentIncome,
        fixedExpenses: totalFixedExpenses,
        savingsPercentage: profile.savings_percentage || 0,
      };
    }

    // Handle Expenses
    const loadedExpenses: Expense[] = (expensesResult.data || []).map(e => ({
      id: e.id.toString(),
      amount: Number(e.amount),
      originalAmount: Number(e.original_amount) || Number(e.amount),
      currency: (e.currency as Currency) || 'ARS',
      timestamp: new Date(e.date || e.created_at).getTime(),
      name: e.name,
      category: e.category || undefined,
    }));

    return {
      config: loadedConfig,
      expenses: loadedExpenses,
      fixedExpenses: loadedFixedExpenses,
      hasOnboarded: !!loadedConfig,
    };
  },

  async updateConfig(
    userId: string,
    newConfig: BudgetConfig,
    initialExpenses: number = 0,
  ) {
    const { income, fixedExpenses, savingsPercentage } = newConfig;
    const now = new Date();

    // 1. Upsert Profile (Global defaults)
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      monthly_income: income,
      fixed_expenses: fixedExpenses,
      savings_percentage: savingsPercentage,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      Sentry.captureException(profileError, {
        tags: { context: 'updateConfig_profile' },
      });
      throw profileError;
    }

    // 2. Upsert Monthly Summary (Snapshot for current month)
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();

    const { error: summaryError } = await supabase
      .from('monthly_summaries')
      .upsert(
        {
          user_id: userId,
          month: startOfMonth,
          total_income: income,
        },
        { onConflict: 'user_id, month' },
      );

    if (summaryError) {
      if (summaryError) {
        console.error(
          'Failed to update monthly summary snapshot',
          summaryError,
        );
        Sentry.captureException(summaryError, {
          tags: { context: 'updateConfig_summary' },
        });
      }
    }

    // 3. Add Initial Expenses if any
    if (initialExpenses > 0) {
      await this.addExpense(userId, {
        amount: initialExpenses,
        currency: 'ARS', // Defaulting to ARS for initial expenses setup
        timestamp: Date.now(),
        name: 'Gastos Iniciales',
        category: 'General',
        originalAmount: initialExpenses,
      });
    }

    return true;
  },

  async addExpense(
    userId: string,
    expenseData: {
      amount: number;
      currency: Currency;
      timestamp: number;
      name: string;
      category?: string;
      originalAmount?: number;
      exchangeRate?: number;
    },
  ) {
    const dateObj = new Date(expenseData.timestamp);
    const exchangeRate = expenseData.exchangeRate || 1;

    // Convert to USD/Base currency if needed, or store as is.
    // If currency is not USD, we assume we need to convert to USD (base).
    // ARS -> 1100 ARS/USD -> 1100 / 1100 = 1 USD
    // MXN -> 20 MXN/USD -> 20 / 20 = 1 USD
    const amountInBase =
      expenseData.currency !== 'USD'
        ? Math.round((expenseData.amount / exchangeRate) * 100) / 100
        : expenseData.amount;

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        amount: amountInBase,
        original_amount: expenseData.originalAmount || expenseData.amount,
        currency: expenseData.currency,
        name: expenseData.name,
        date: dateObj.toISOString(),
        category: expenseData.category || 'General',
      })
      .select()
      .single();

    if (error) {
      Sentry.captureException(error, {
        tags: { context: 'addExpense' },
      });
      throw error;
    }

    const newExpense: Expense = {
      id: data.id.toString(),
      amount: Number(data.amount),
      originalAmount: Number(data.original_amount),
      currency: data.currency as Currency,
      timestamp: new Date(data.date).getTime(),
      name: data.name,
      category: data.category || undefined,
    };

    return newExpense;
  },

  async removeExpense(expenseId: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      Sentry.captureException(error, {
        tags: { context: 'removeExpense' },
      });
      throw error;
    }
    return true;
  },

  async addFixedExpense(
    userId: string,
    expenseData: { name: string; amount: number },
  ) {
    const { data, error } = await supabase
      .from('fixed_expenses')
      .insert({
        user_id: userId,
        name: expenseData.name,
        amount: expenseData.amount,
      })
      .select()
      .single();

    if (error) {
      Sentry.captureException(error, {
        tags: { context: 'addFixedExpense' },
      });
      throw error;
    }

    const newExpense: FixedExpense = {
      id: data.id,
      name: data.name,
      amount: Number(data.amount),
      created_at: data.created_at,
      user_id: data.user_id,
    };

    return newExpense;
  },

  async removeFixedExpense(id: string) {
    const { error } = await supabase
      .from('fixed_expenses')
      .delete()
      .eq('id', id);

    if (error) {
      Sentry.captureException(error, {
        tags: { context: 'removeFixedExpense' },
      });
      throw error;
    }
    return true;
  },
};
