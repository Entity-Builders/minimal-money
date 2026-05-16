import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../screens/MainScreenStyles';
import { RiveReflection } from '../RiveReflection';

interface BudgetFocusDisplayProps {
  totalAvailable: number;
}

export const BudgetFocusDisplay = ({
  totalAvailable,
}: BudgetFocusDisplayProps) => {
  return (
    <View style={[styles.availableAmountContainer, { width: '100%' }]}>
      <Text style={styles.availableLabel}>DISPONIBLE</Text>
      <RiveReflection value={totalAvailable} />
    </View>
  );
};
