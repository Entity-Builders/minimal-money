import React from 'react';
import { StyleSheet } from 'react-native';
import { useBudget } from '../context/useBudget';
import { StatsCarousel } from './StatsCarousel';
import { StatCard } from './StatCard';

type StatItemData = {
  id: string;
  label: string;
  value: string;
  valueColor?: string;
  labelColor?: string;
  isTouchable?: boolean;
};

export const BudgetStatsCarousel = ({
  onOpenHistory,
  onOpenRecovery,
}: {
  onOpenHistory?: () => void;
  onOpenRecovery?: () => void;
}) => {
  const {
    dailyBudget,
    spentToday,
    accumulatedSavings,
    projectedSavings,
    monthlyFixedSavingsGoal,
    remainingDays,
    isRecoveryMode,
    totalDebt,
    effectiveDailyBudget,
  } = useBudget();
  const data: StatItemData[] = [
    {
      id: 'budget',
      label: isRecoveryMode ? 'PRESUP. (RED.)' : 'PRESUPUESTO',
      value: `$${(isRecoveryMode ? effectiveDailyBudget : dailyBudget).toFixed(0)}`,
      valueColor: isRecoveryMode ? '#FF9F0A' : undefined,
    },
    {
      id: 'spent',
      label: 'GASTADO HOY',
      value: `-$${spentToday.toFixed(0)}`,
      valueColor: spentToday > dailyBudget ? '#822' : '#FFF',
      labelColor: spentToday > dailyBudget ? '#822' : '#444',
      isTouchable: true,
    },
    {
      id: 'accumulated',
      label: isRecoveryMode ? 'EN ROJO ⚠️' : 'ACUMULADO',
      value: isRecoveryMode
        ? `-$${totalDebt.toFixed(0)}`
        : `${accumulatedSavings >= 0 ? '+' : ''}$${accumulatedSavings.toFixed(0)}`,
      valueColor: isRecoveryMode
        ? '#FF453A'
        : accumulatedSavings >= 0
          ? '#262'
          : '#822',
      labelColor: isRecoveryMode
        ? '#FF453A'
        : accumulatedSavings >= 0
          ? '#262'
          : '#822',
      isTouchable: isRecoveryMode,
    },
    {
      id: 'projected',
      label: 'PROYECTADO',
      value: `+$${projectedSavings.toFixed(0)}`,
      valueColor: projectedSavings >= monthlyFixedSavingsGoal ? '#262' : '#822',
    },
    {
      id: 'days',
      label: 'DÍAS RESTANTES',
      value: `${remainingDays}`,
    },
  ];

  return (
    <StatsCarousel
      data={data}
      keyExtractor={item => item.id}
      renderItem={(item, _index, width) => {
        const handlePress = item.isTouchable
          ? () => {
              if (item.id === 'spent') {
                onOpenHistory?.();
              } else if (item.id === 'accumulated') {
                onOpenRecovery?.();
              }
            }
          : undefined;

        return (
          <StatCard
            width={width}
            label={item.label}
            value={item.value}
            valueColor={item.valueColor}
            labelColor={item.labelColor}
            onPress={handlePress}
          />
        );
      }}
      containerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    height: 110,
    marginTop: 16,
  },
});
