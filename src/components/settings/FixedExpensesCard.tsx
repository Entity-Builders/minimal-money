import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { styles } from '../../screens/SettingsScreenStyles';
import { FixedExpense } from '../../types';

interface FixedExpensesCardProps {
  totalFixedExpenses: number;
  toggleAccordion: () => void;
  accordionOpen: boolean;
  arrowRotation: AnimatedStyle<any>;
  expensesList: FixedExpense[];
  removeExpense: (id: string) => void;
  isAddingExpense: boolean;
  newExpenseName: string;
  setNewExpenseName: (v: string) => void;
  newExpenseAmount: string;
  setNewExpenseAmount: (v: string) => void;
  handleAddExpense: () => void;
  setIsAddingExpense: (v: boolean) => void;
  onOpenQuickAdd: () => void;
  onOpenScan: () => void;
}

export const FixedExpensesCard = ({
  totalFixedExpenses,
  toggleAccordion,
  accordionOpen,
  arrowRotation,
  expensesList,
  removeExpense,
  isAddingExpense,
  newExpenseName,
  setNewExpenseName,
  newExpenseAmount,
  setNewExpenseAmount,
  handleAddExpense,
  setIsAddingExpense,
  onOpenQuickAdd,
  onOpenScan,
}: FixedExpensesCardProps) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={toggleAccordion}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.label}>GASTOS FIJOS TOTALES</Text>
          <Text style={styles.totalValue}>
            $ {totalFixedExpenses.toLocaleString()}
          </Text>
        </View>
        <Animated.View style={arrowRotation}>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </Animated.View>
      </TouchableOpacity>

      {accordionOpen && (
        <View style={styles.accordionContent}>
          {expensesList.map(item => (
            <View key={item.id} style={styles.expenseItem}>
              <Text style={styles.expenseName}>{item.name}</Text>
              <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>$ {item.amount}</Text>
                <TouchableOpacity
                  onPress={() => removeExpense(item.id)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={16} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Inline Add Form */}
          {isAddingExpense ? (
            <View style={styles.addForm}>
              <TextInput
                style={[styles.smallInput, { flex: 2 }]}
                placeholder="Nombre (ej. Internet)"
                placeholderTextColor="#555"
                value={newExpenseName}
                onChangeText={setNewExpenseName}
                autoFocus
              />
              <TextInput
                style={[styles.smallInput, { flex: 1 }]}
                placeholder="$$$"
                placeholderTextColor="#555"
                value={newExpenseAmount}
                onChangeText={setNewExpenseAmount}
                keyboardType="numeric"
              />
              <TouchableOpacity
                onPress={handleAddExpense}
                style={styles.iconBtn}
              >
                <Ionicons name="checkmark-circle" size={28} color="#34c759" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsAddingExpense(false)}
                style={styles.iconBtn}
              >
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.gridButton, { backgroundColor: '#333' }]}
                onPress={onOpenScan}
              >
                <Ionicons name="scan" size={16} color="#fbbf24" />
                <Text style={[styles.gridButtonText, { color: '#fbbf24' }]}>
                  Carga Rápida
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridButton}
                onPress={onOpenQuickAdd}
              >
                <Ionicons name="create-outline" size={18} color="#ccc" />
                <Text style={styles.gridButtonText}>Manual</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
