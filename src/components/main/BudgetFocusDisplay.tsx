import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../screens/MainScreenStyles';
import { RiveReflection } from '../RiveReflection';

interface BudgetFocusDisplayProps {
  totalAvailable: number;
  isRecoveryMode: boolean;
}

export const BudgetFocusDisplay = ({
  totalAvailable,
  isRecoveryMode,
}: BudgetFocusDisplayProps) => {
  const amountColor = isRecoveryMode ? '#FF9F0A' : '#FFFFFF';

  return (
    <View style={[styles.availableAmountContainer, { width: '100%' }]}>
      {isRecoveryMode ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.availableAmount, { color: amountColor }]}>
            ${totalAvailable.toFixed(0)}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 159, 10, 0.2)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              marginTop: 8,
            }}
          >
            <Ionicons
              name="warning-outline"
              size={14}
              color="#FF9F0A"
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                color: '#FF9F0A',
                fontSize: 13,
                fontWeight: '700',
                letterSpacing: 0.5,
              }}
            >
              MODO RECUPERACIÓN
            </Text>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.availableLabel}>DISPONIBLE</Text>
          <RiveReflection value={totalAvailable} />
        </>
      )}
    </View>
  );
};
