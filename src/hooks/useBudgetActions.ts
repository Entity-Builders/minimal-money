import { useCallback } from 'react';
import * as Sentry from '@sentry/react-native';
import { supabase } from '@eb-packages/logic';
import { BudgetService } from '../services/budgetService';
import { BudgetAction } from '../context/budgetReducer';
import { BudgetConfig, Currency } from '../types';

export const useBudgetActions = (
  dispatch: React.Dispatch<BudgetAction>,
  loadData: (userId: string) => Promise<void>,
) => {
  const setConfig = useCallback(
    async (newConfig: BudgetConfig, initialExpenses: number = 0) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user logged in');
        return;
      }

      try {
        await BudgetService.updateConfig(user.id, newConfig, initialExpenses);

        dispatch({
          type: 'SET_CONFIG',
          payload: { config: newConfig },
        });

        // If initial expenses were added, we need to reload or manually add them to state.
        if (initialExpenses > 0) {
          // Reload all data to be safe and simple
          loadData(user.id);
        }
      } catch (e) {
        console.error('Failed to save config', e);
        Sentry.captureException(e, { tags: { context: 'setConfig' } });
      }
    },
    [dispatch, loadData],
  );

  const addExpense = useCallback(
    async (
      amount: number,
      currency: Currency,
      exchangeRate: number,
      customTimestamp?: number,
      name: string = 'Gasto',
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      Sentry.addBreadcrumb({
        category: 'action',
        message: 'Adding expense',
        data: { amount, currency, customTimestamp },
        level: 'info',
      });

      try {
        const newExpense = await BudgetService.addExpense(user.id, {
          amount,
          currency,
          exchangeRate,
          timestamp: customTimestamp || Date.now(),
          name,
        });

        dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
      } catch (e) {
        console.error('Failed to add expense', e);
        Sentry.captureException(e, { tags: { context: 'addExpense' } });
      }
    },
    [dispatch],
  );

  const removeExpense = useCallback(
    async (id: string) => {
      Sentry.addBreadcrumb({
        category: 'action',
        message: 'Removing expense',
        data: { id },
        level: 'info',
      });
      try {
        await BudgetService.removeExpense(id);
        dispatch({ type: 'REMOVE_EXPENSE', payload: id });
      } catch (e) {
        console.error('Failed to delete expense', e);
        Sentry.captureException(e, { tags: { context: 'removeExpense' } });
      }
    },
    [dispatch],
  );

  const addFixedExpense = useCallback(
    async (name: string, amount: number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      Sentry.addBreadcrumb({
        category: 'action',
        message: 'Adding fixed expense',
        data: { name, amount },
        level: 'info',
      });

      try {
        const newExpense = await BudgetService.addFixedExpense(user.id, {
          name,
          amount,
        });
        dispatch({
          type: 'ADD_FIXED_EXPENSE',
          payload: { expense: newExpense },
        });
      } catch (e) {
        console.error('Failed to add fixed expense', e);
        Sentry.captureException(e, { tags: { context: 'addFixedExpense' } });
      }
    },
    [dispatch],
  );

  const removeFixedExpense = useCallback(
    async (id: string) => {
      Sentry.addBreadcrumb({
        category: 'action',
        message: 'Removing fixed expense',
        data: { id },
        level: 'info',
      });
      try {
        await BudgetService.removeFixedExpense(id);
        dispatch({
          type: 'REMOVE_FIXED_EXPENSE',
          payload: { id },
        });
      } catch (e) {
        console.error('Failed to remove fixed expense', e);
        Sentry.captureException(e, { tags: { context: 'removeFixedExpense' } });
      }
    },
    [dispatch],
  );

  const resetData = useCallback(async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    setConfig,
    addExpense,
    removeExpense,
    addFixedExpense,
    removeFixedExpense,
    resetData,
  };
};
