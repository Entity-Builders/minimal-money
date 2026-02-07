import { useEffect, useCallback } from 'react';
import * as Sentry from '@sentry/react-native';
import { supabase } from '@eb-packages/logic';
import { BudgetService } from '../services/budgetService';
import { BudgetAction } from '../context/budgetReducer';

/**
 * Sync data (Auth, Loading, Listeners)
 */
export const useBudgetSync = (dispatch: React.Dispatch<BudgetAction>) => {
  const loadData = useCallback(
    async (userId: string) => {
      try {
        const data = await BudgetService.loadInitialData(userId);
        dispatch({
          type: 'SET_DATA',
          payload: {
            config: data.config,
            expenses: data.expenses,
            hasOnboarded: data.hasOnboarded,
          },
        });
        dispatch({
          type: 'SET_FIXED_EXPENSES',
          payload: data.fixedExpenses,
        });
      } catch (e) {
        console.error('Failed to load budget data', e);
        Sentry.captureException(e, { tags: { context: 'loadData' } });
        dispatch({
          type: 'SET_DATA',
          payload: {
            config: null,
            expenses: [],
            hasOnboarded: false,
          },
        });
      }
    },
    [dispatch],
  );

  useEffect(() => {
    // Determine session and load data
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        dispatch({ type: 'SET_USER', payload: session.user });
        loadData(session.user.id);
      } else {
        dispatch({
          type: 'SET_DATA',
          payload: {
            config: null,
            expenses: [],
            hasOnboarded: false,
          },
        });
      }
    };
    init();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          dispatch({ type: 'SET_USER', payload: session.user });
          loadData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'RESET' });
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [dispatch, loadData]);

  return { loadData };
};
