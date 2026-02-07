import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DetectedExpense {
  name: string;
  amount: number;
  category?: string;
}

interface DetectedExpenseCardProps {
  item: DetectedExpense;
  isSelected: boolean;
  onToggle: () => void;
}

export const DetectedExpenseCard = ({
  item,
  isSelected,
  onToggle,
}: DetectedExpenseCardProps) => {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.container, isSelected && styles.selectedContainer]}>
        <View style={styles.left}>
          <View
            style={[styles.checkbox, isSelected && styles.selectedCheckbox]}
          >
            {isSelected && <Ionicons name="checkmark" size={14} color="#000" />}
          </View>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            {item.category && (
              <Text style={styles.category}>{item.category}</Text>
            )}
          </View>
        </View>
        <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedContainer: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckbox: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  name: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  category: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
