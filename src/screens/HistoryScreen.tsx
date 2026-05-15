import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBudget } from '../context/useBudget';
import { Transaction } from '../types';
import { TransactionItem } from '../components/TransactionItem';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { HistoryHeader } from '../components/HistoryHeader';

export default function HistoryScreen() {
  const { activeBatchTransactions, activeBatch } = useBudget();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');

  // Refined Logic with Filtering
  const sortedSections = useMemo(() => {
    // 1. Filter first
    let filtered = activeBatchTransactions;
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
        ...expense,
        amount: -expense.amount,
      };

      if (lastGroup && lastGroup.title === title) {
        lastGroup.data.push(transaction);
      } else {
        groups.push({ title, data: [transaction] });
      }
    });

    return groups;
  }, [activeBatchTransactions, searchQuery]);


  return (
    <View style={styles.container}>
      {/* Deep, subtle gradient background */}
      <LinearGradient
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

      <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(800)}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial ({activeBatch?.name})</Text>
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
                    </View>

                    <View style={styles.headerTotals}>
                      <Text
                        style={[
                          styles.incomeText,
                          { color: '#FF453A' },
                        ]}
                      >
                        ${Math.abs(totalExpense).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  {/* Bottom border for separation */}
                  <View style={styles.headerBorder} />
                </BlurView>
              );
            }}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
            stickySectionHeadersEnabled={true}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fallback
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
