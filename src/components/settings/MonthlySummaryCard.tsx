import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LiquidGlass } from '../LiquidGlass';
import { getDateMetrics } from '../../domain/date-utils';

interface MonthlySummaryCardProps {
  incomeNum: number;
  totalFixedExpenses: number;
  savingsPercent: number;
  savingsAmount: number;
  monthlyVariableBudget: number;
  spentCurrentMonth: number;
  dailySpendingPool: number;
  calculatedDaily: number;
  accumulatedSavings: number;
  plannedDailyBudget: number;
  hasIncome: boolean;
}

const ProgressBar = ({
  label,
  value,
  color = '#fff',
  max = 100,
}: {
  label: string;
  value: number;
  color?: string;
  max?: number;
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{Math.round(percentage)}%</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

const StatRow = ({
  label,
  value,
  subValue,
  color = '#ccc',
  isNegative,
  icon,
}: {
  label: string;
  value: string;
  subValue?: string;
  color?: string;
  isNegative?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}) => (
  <View style={styles.statRow}>
    <View style={styles.labelContainer}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color={color}
          style={styles.icon}
        />
      )}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <View style={styles.statValueContainer}>
      <Text style={[styles.statValue, { color }]}>
        {isNegative ? '-' : ''}
        {value}
      </Text>
      {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
    </View>
  </View>
);

export const MonthlySummaryCard = ({
  incomeNum,
  totalFixedExpenses,
  savingsPercent,
  savingsAmount,
  monthlyVariableBudget,
  spentCurrentMonth,
  dailySpendingPool,
  plannedDailyBudget,
  calculatedDaily,
  accumulatedSavings,
  hasIncome,
}: MonthlySummaryCardProps) => {
  const now = new Date();
  const { daysInMonth, currentDayOfMonth: currentDay } = getDateMetrics(now);
  const daysPassedPercent = (currentDay / daysInMonth) * 100;
  const spentPercent = (spentCurrentMonth / monthlyVariableBudget) * 100;

  if (!hasIncome) {
    return (
      <LiquidGlass style={styles.container}>
        <Text style={styles.title}>RESUMEN MENSUAL</Text>
        <Text style={styles.placeholderText}>
          Ingresa tu ingreso para ver el resumen.
        </Text>
      </LiquidGlass>
    );
  }

  return (
    <LiquidGlass style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RESUMEN MENSUAL</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {now.toLocaleString('es-ES', { month: 'long' }).toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <StatRow
          label="Ingreso Total"
          value={`$${incomeNum.toLocaleString()}`}
          color="#4ade80"
        />
        <StatRow
          label="Gastos Fijos"
          value={`$${totalFixedExpenses.toLocaleString()}`}
          subValue={`($${Math.round(totalFixedExpenses / daysInMonth).toLocaleString()}/día)`}
          color="#f87171"
          isNegative
        />
        <StatRow
          label={`Ahorro (${savingsPercent}%)`}
          value={`$${savingsAmount.toLocaleString()}`}
          color="#60a5fa"
          isNegative
        />
        <StatRow
          label="Ahorro Acumulado"
          value={`$${accumulatedSavings.toLocaleString()}`}
          color="#ec4899"
          icon="piggy-bank"
        />
      </View>

      <View style={styles.separator} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PRESUPUESTO VARIABLE</Text>
        <Text style={styles.bigNumber}>
          ${monthlyVariableBudget.toLocaleString()}
        </Text>
        <Text style={styles.subtext}>
          Ideal: $
          {Math.round(monthlyVariableBudget / daysInMonth).toLocaleString()}/día
        </Text>
      </View>

      <View style={styles.progressSection}>
        <ProgressBar
          label="Gasto Acumulado"
          value={spentPercent}
          color={spentPercent > daysPassedPercent ? '#ef4444' : '#fbbf24'}
        />
        <ProgressBar
          label="Progreso del Mes"
          value={daysPassedPercent}
          color="#94a3b8"
        />
        <View style={styles.miniStats}>
          <Text style={styles.miniStatText}>
            Gastado: ${spentCurrentMonth.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>
            DISPONIBLE ({daysInMonth - currentDay + 1} días)
          </Text>
          <Text style={styles.footerValue}>
            ${dailySpendingPool.toLocaleString()}
          </Text>
        </View>
        <View style={styles.dailyBox}>
          <Text style={styles.dailyLabel}>DIARIO</Text>
          <Text style={styles.dailyValue}>
            ${plannedDailyBudget.toLocaleString()}
          </Text>
        </View>
      </View>
    </LiquidGlass>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#94a3b8',
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  placeholderText: {
    color: '#666',
    marginTop: 10,
  },
  section: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    // margin handled by gap
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  statValueContainer: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statSubValue: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bigNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -1,
  },
  subtext: {
    color: '#64748b',
    fontSize: 12,
  },
  progressSection: {
    marginTop: 16,
    gap: 12,
  },
  progressRow: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  progressValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  miniStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  miniStatText: {
    color: '#64748b',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  footerValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  dailyBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dailyLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  dailyValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
