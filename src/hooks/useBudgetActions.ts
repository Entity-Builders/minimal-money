import { useCallback } from 'react';
import * as Sentry from '@sentry/react-native';
import { supabase } from '@eb-packages/logic';
import { BudgetService } from '../services/budgetService';
import { BudgetAction } from '../context/budgetReducer';
import { Batch, Currency } from '../types';

export const useBudgetActions = (
  dispatch: React.Dispatch<BudgetAction>,
  loadData: (userId: string) => Promise<void>,
) => {
  const addBatch = useCallback(
    async (name: string, icon: string, monthlyLimit: number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const newBatch = await BudgetService.addBatch(user.id, { name, icon, monthlyLimit });
        dispatch({ type: 'ADD_BATCH', payload: newBatch });
      } catch (e) {
        console.error('Failed to add batch', e);
        Sentry.captureException(e, { tags: { context: 'addBatch' } });
      }
    },
    [dispatch],
  );

  const updateBatch = useCallback(
    async (id: string, updates: Partial<Batch>) => {
      try {
        await BudgetService.updateBatch(id, updates);
        dispatch({ type: 'UPDATE_BATCH', payload: { id, updates } });
      } catch (e) {
        console.error('Failed to update batch', e);
        Sentry.captureException(e, { tags: { context: 'updateBatch' } });
      }
    },
    [dispatch],
  );

  const removeBatch = useCallback(
    async (id: string) => {
      try {
        await BudgetService.removeBatch(id);
        dispatch({ type: 'REMOVE_BATCH', payload: id });
      } catch (e) {
        console.error('Failed to remove batch', e);
        Sentry.captureException(e, { tags: { context: 'removeBatch' } });
      }
    },
    [dispatch],
  );

  const addTransaction = useCallback(
    async (
      batchId: string,
      amount: number,
      currency: Currency,
      exchangeRate: number,
      name: string = 'Gasto',
      customTimestamp?: number,
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      try {
        // We dispatch optimistically or wait for the service
        const newTransaction = await BudgetService.addTransaction(user.id, {
          batchId,
          amount,
          currency,
          exchangeRate,
          timestamp: customTimestamp || Date.now(),
          name,
        });

        dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
      } catch (e) {
        console.error('Failed to add transaction', e);
        Sentry.captureException(e, { tags: { context: 'addTransaction' } });
      }
    },
    [dispatch],
  );

  const removeTransaction = useCallback(
    async (id: string) => {
      try {
        await BudgetService.removeTransaction(id);
        dispatch({ type: 'REMOVE_TRANSACTION', payload: id });
      } catch (e) {
        console.error('Failed to delete transaction', e);
        Sentry.captureException(e, { tags: { context: 'removeTransaction' } });
      }
    },
    [dispatch],
  );

  const setActiveBatch = useCallback(
    (id: string) => {
      dispatch({ type: 'SET_ACTIVE_BATCH', payload: id });
    },
    [dispatch],
  );

  const resetData = useCallback(async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    addBatch,
    updateBatch,
    removeBatch,
    addTransaction,
    removeTransaction,
    setActiveBatch,
    resetData,
  };
};
