import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { styles } from '../../screens/MainScreenStyles';
import { BudgetStatsCarousel } from '../BudgetStatsCarousel';
import { useBudget } from '../../context/useBudget';

interface DailyBalanceProps {
  totalAvailable: number;
  handleOpenHistory: () => void;
}

export const DailyBalance = ({
  totalAvailable,
  handleOpenHistory,
}: DailyBalanceProps) => {
  const {
    isRecoveryMode,
    totalDebt,
    dailyBudget,
    spentToday,
    recoveryQuota,
    daysToRecover,
  } = useBudget();

  const recoveryPaymentToday = Math.max(0, dailyBudget - spentToday);

  if (isRecoveryMode) {
    return (
      <View style={styles.balanceContainer}>
        <Text style={[styles.subtitle, styles.subtitleRecovery]}>
          ⚠️ MODO RECUPERACIÓN
        </Text>
        <Text style={[styles.balance, styles.balanceRecovery]}>
          ${totalDebt.toFixed(0)}
        </Text>
        <Text style={[styles.subtitle, { marginBottom: 10 }]}>A RECUPERAR</Text>

        {/* Recovery Progress Bar context */}
        <View style={styles.recoveryContainer}>
          <Text style={styles.recoveryText}>
            Recuperado hoy: ${recoveryPaymentToday.toFixed(0)}
          </Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, (recoveryPaymentToday / (dailyBudget * 0.5)) * 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.recoveryText}>
            Presupuesto reducido en ${recoveryQuota?.toFixed(0) || 0}/día.
            {'\n'}Estimado: {daysToRecover || 1} días restantes.
          </Text>
        </View>

        <BudgetStatsCarousel onOpenHistory={handleOpenHistory} />
      </View>
    );
  }

  return (
    <View style={styles.balanceContainer}>
      <Text
        style={[
          styles.balance,
          { color: totalAvailable < 0 ? '#ff3b30' : '#fff' },
        ]}
      >
        ${totalAvailable.toFixed(0)}
      </Text>
      <Text style={styles.subtitle}>DISPONIBLE HOY</Text>
      <BudgetStatsCarousel onOpenHistory={handleOpenHistory} />
    </View>
  );
};
