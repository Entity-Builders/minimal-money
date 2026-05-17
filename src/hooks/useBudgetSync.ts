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
            batches: data.batches,
            transactions: data.transactions,
            hasOnboarded: data.hasOnboarded,
          },
        });
      } catch (e) {
        console.error('Failed to load budget data', e);
        Sentry.captureException(e, { tags: { context: 'loadData' } });
        dispatch({
          type: 'SET_DATA',
          payload: {
            batches: [],
            transactions: [],
            hasOnboarded: false,
          },
        });
      }
    },
    [dispatch],
  );

  useEffect(() => {
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = (userId: string) => {
      if (realtimeChannel) return;
      realtimeChannel = supabase
        .channel('minimal_money_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'minimal_money', table: 'transactions' },
          () => {
            console.log('Realtime update: transactions changed');
            loadData(userId);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'minimal_money', table: 'batches' },
          () => {
            console.log('Realtime update: batches changed');
            loadData(userId);
          }
        )
        .subscribe();
    };

    const cleanupRealtime = () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    };

    // Determine session and load data
    const init = async () => {
      // getSession reads the JWT from local storage
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // CRITICAL: We must verify the session is still valid against the current database.
        // If the user was logged into a local DB and OTA updated to cloud, the JWT is invalid here!
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          console.warn('Session found but user is invalid (likely swapped databases). Forcing sign out.', error);
          await supabase.auth.signOut();
          dispatch({ type: 'RESET' });
          return;
        }

        dispatch({ type: 'SET_USER', payload: user });
        loadData(user.id);
        setupRealtime(user.id);
      } else {
        dispatch({
          type: 'SET_DATA',
          payload: {
            batches: [],
            transactions: [],
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
          setupRealtime(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'RESET' });
          cleanupRealtime();
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
      cleanupRealtime();
    };
  }, [dispatch, loadData]);

  return { loadData };
};
