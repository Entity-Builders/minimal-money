import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudget } from '../context/useBudget';
import { Transaction, Currency } from '../types';
import { TransactionItem } from '../components/TransactionItem';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { supabase } from '@eb-packages/logic';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

type HistoryExpense = {
  id: string;
  amount: number;
  originalAmount: number;
  currency: Currency;
  timestamp: number;
  name: string;
  category?: string;
};

import { useTheme } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';

import { HistoryHeader } from '../components/HistoryHeader';

export default function HistoryScreen() {
  const { user, dailyBudget, isRecoveryMode, spentToday } = useBudget();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [historyExpenses, setHistoryExpenses] = useState<HistoryExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: expensesData, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching history:', error);
          return;
        }

        const loadedExpenses: HistoryExpense[] = (expensesData || []).map(
          e => ({
            id: e.id.toString(),
            amount: Number(e.amount),
            originalAmount: Number(e.original_amount) || Number(e.amount),
            currency: (e.currency as Currency) || 'ARS',
            timestamp: new Date(e.date || e.created_at).getTime(),
            name: e.name,
            category: e.category || undefined,
          }),
        );

        setHistoryExpenses(loadedExpenses);
      } catch (e) {
        console.error('Failed to load history from Supabase', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Refined Logic with Filtering
  const sortedSections = useMemo(() => {
    // 1. Filter first
    let filtered = historyExpenses;
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          (e.name && e.name.toLowerCase().includes(query)) ||
          (e.category && e.category.toLowerCase().includes(query)),
      );
    }

    // 2. Sort
    const sortedExpenses = [...filtered].sort(
      (a, b) => b.timestamp - a.timestamp,
    );

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const groups: { title: string; data: Transaction[] }[] = [];

    sortedExpenses.forEach(expense => {
      const date = new Date(expense.timestamp);
      let title = '';

      if (isSameDay(date, today)) {
        title = 'Hoy';
      } else if (isSameDay(date, yesterday)) {
        title = 'Ayer';
      } else {
        title = date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
        });
      }

      const lastGroup = groups[groups.length - 1];
      const transaction: Transaction = {
        id: expense.id,
        amount: -expense.amount,
        currency: expense.currency,
        timestamp: expense.timestamp,
        name: expense.name,
        category: expense.category,
      };

      if (lastGroup && lastGroup.title === title) {
        lastGroup.data.push(transaction);
      } else {
        groups.push({ title, data: [transaction] });
      }
    });

    return groups;
  }, [historyExpenses, searchQuery]);

  if (loading) {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  // Calculate total saved to show in header title area potentially, or just use it for rendering logic
  const totalSavedToday = dailyBudget - spentToday; // spentToday is from context, but we might want the filtered list total?
  // Actually, the user just wants the visual update.

  return (
    <View style={styles.container}>
      {/* Deep, subtle gradient background */}
      <LinearGradient
        // Deep teal-black gradient for "Liquid" feel or just subtle gray
        colors={['#000000', '#111822', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* decorative blobs for glass effect */}
      <View
        style={{
          position: 'absolute',
          top: -100,
          left: -50,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: '#4facfe',
          opacity: 0.05,
          transform: [{ scale: 1.5 }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -50,
          right: -50,
          width: 250,
          height: 250,
          borderRadius: 125,
          backgroundColor: '#00f2fe',
          opacity: 0.05,
          transform: [{ scale: 1.5 }],
        }}
      />

      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(800)}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Historial</Text>
          </View>

          <View style={{ flex: 1 }}>
            <HistoryHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <SectionList
              sections={sortedSections}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <TransactionItem transaction={item} />}
              renderSectionHeader={({ section: { title, data } }) => {
                const totalExpense = data.reduce(
                  (acc, curr) => (curr.amount < 0 ? acc + curr.amount : acc),
                  0,
                );

                // Simplified calculations for display
                const dailySaved = dailyBudget + totalExpense;
                const isOverspent = dailySaved < 0;
                const isToday = title === 'Hoy';

                return (
                  <BlurView
                    intensity={80}
                    tint="dark"
                    style={styles.stickyHeaderContainer}
                  >
                    <View style={styles.sectionHeaderContent}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text style={styles.sectionTitle}>{title}</Text>
                        {isOverspent && (
                          <Text style={{ fontSize: 16 }}>⚠️</Text>
                        )}
                        {isToday && isRecoveryMode && (
                          <Text
                            style={[
                              styles.sectionTitle,
                              { fontSize: 12, color: '#FF9F0A' },
                            ]}
                          >
                            (Reducido)
                          </Text>
                        )}
                      </View>

                      <View style={styles.headerTotals}>
                        {/* Show net for the day/group */}
                        <Text
                          style={[
                            styles.incomeText,
                            { color: dailySaved >= 0 ? '#30D158' : '#FF453A' },
                          ]}
                        >
                          {dailySaved >= 0 ? '+' : ''}${dailySaved.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    {/* Bottom border for separation */}
                    <View style={styles.headerBorder} />
                  </BlurView>
                );
              }}
              contentContainerStyle={styles.listContent}
              stickySectionHeadersEnabled={true}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fallback
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 40,
  },
  stickyHeaderContainer: {
    overflow: 'hidden',
  },
  sectionHeaderContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', // Slight dark tint for readability
  },
  headerBorder: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTotals: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  incomeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  expenseText: {
    color: '#FF453A',
    fontSize: 14,
    fontWeight: '600',
  },
});
