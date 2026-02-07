import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlass } from '../LiquidGlass';

interface RecoveryModalProps {
  visible: boolean;
  onDismiss: () => void;
  debtAmount: number;
  currentDaysToRecover: number;
  maxDays: number;
  dailyBudgetRaw: number;
  onSavePlan: (days: number) => Promise<void>;
}

export const RecoveryModal = ({
  visible,
  onDismiss,
  debtAmount,
  currentDaysToRecover,
  maxDays,
  dailyBudgetRaw,
  onSavePlan,
}: RecoveryModalProps) => {
  const [selectedDays, setSelectedDays] = useState(currentDaysToRecover);
  const [loading, setLoading] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (visible) {
      // Ensure at least 1 day, and default to current if valid
      const validCurrent = currentDaysToRecover > 0 ? currentDaysToRecover : 1;
      // If current > maxDays (e.g. end of month changed), cap it?
      // But maxDays might be small (e.g. 1 day left).
      // Let's ensure selectedDays is within [1, maxDays] mostly, but sometimes recovery can span next month?
      // For now, let's clamp to max(1, min(current, 30)).
      // Logic: allow up to 30 days regardless of month end? or stick to current month?
      // The app logic "daysRemaining" implies strictly current month context usually.
      // But for debt recovery, maybe we want to extend?

      // USER REQUEST: Limit max days so daily quota is at least 1 unit.
      // If Debt is $5, max days should be 5. (5/5 = 1).
      // If Debt is $100, max days can be 100 (if we allowed it).
      // So efficientMax = min(maxDays, debtAmount);
      // But ensure at least 1.
      const efficientMax = Math.min(
        maxDays,
        Math.max(1, Math.floor(debtAmount)),
      );

      const safeMax = Math.max(1, efficientMax);
      const safeCurrent = Math.min(validCurrent, safeMax);
      setSelectedDays(safeCurrent);
    }
  }, [visible, currentDaysToRecover, maxDays, debtAmount]);

  const efficientMax = Math.min(maxDays, Math.max(1, Math.floor(debtAmount)));
  const safeMax = Math.max(1, efficientMax);

  // Calculate preview
  // If selectedDays > debtAmount, then debt/days < 1. Ceil makes it 1.
  // But we clamped the slider so selectedDays <= debtAmount (mostly).
  const quota = selectedDays > 0 ? Math.ceil(debtAmount / selectedDays) : 0;
  const newRefBudget = Math.max(0, dailyBudgetRaw - quota);

  const handleSave = async () => {
    setLoading(true);
    await onSavePlan(selectedDays);
    setLoading(false);
    onDismiss();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
    >
      <View style={styles.centeredView}>
        <LiquidGlass variant="modal" style={styles.modalView} intensity={90}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="bandage-outline" size={32} color="#FF9F0A" />
            </View>
            <Text style={styles.modalTitle}>Plan de Recuperación</Text>
          </View>

          <Text style={styles.debtText}>
            Deuda Total:{' '}
            <Text style={styles.debtValue}>${debtAmount.toFixed(0)}</Text>
          </Text>

          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabels}>
              <Text style={styles.label}>Rápido (1d)</Text>
              <Text style={styles.label}>Lento ({safeMax}d)</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={safeMax}
              step={1}
              value={selectedDays}
              onValueChange={setSelectedDays}
              minimumTrackTintColor="#FF9F0A"
              maximumTrackTintColor="#555"
              thumbTintColor="#FF9F0A"
            />
            <Text style={styles.daysDisplay}>
              Recuperar en{' '}
              <Text style={styles.highlight}>{selectedDays} días</Text>
            </Text>
          </View>

          <View style={styles.previewBox}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Presupuesto Anterior:</Text>
              <Text style={styles.previewValueBase}>
                ${dailyBudgetRaw.toFixed(0)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>- Cuota Diaria:</Text>
              <Text style={styles.previewValueRed}>${quota.toFixed(0)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Nuevo Presupuesto:</Text>
              <Text style={styles.previewValuePrimary}>
                ${newRefBudget.toFixed(0)}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onDismiss}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveText}>
                {loading ? 'Guardando...' : 'Aplicar Plan'}
              </Text>
            </TouchableOpacity>
          </View>
        </LiquidGlass>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalView: {
    width: '90%',
    padding: 24,
    borderRadius: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 159, 10, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  debtText: {
    fontSize: 16,
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 30,
  },
  debtValue: {
    color: '#FF453A',
    fontWeight: 'bold',
  },
  sliderContainer: {
    width: '100%',
    marginBottom: 30,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#888',
    fontSize: 12,
  },
  daysDisplay: {
    textAlign: 'center',
    marginTop: 10,
    color: '#FFF',
    fontSize: 16,
  },
  highlight: {
    color: '#FF9F0A',
    fontWeight: 'bold',
  },
  previewBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
  previewLabel: {
    color: '#CCC',
    fontSize: 14,
  },
  previewValueBase: {
    color: '#FFF',
    fontSize: 16,
  },
  previewValueRed: {
    color: '#FF453A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewValuePrimary: {
    color: '#FF9F0A', // or white
    fontWeight: 'bold',
    fontSize: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  saveButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FF9F0A',
  },
  cancelText: {
    color: '#FFF',
    fontWeight: '600',
  },
  saveText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
