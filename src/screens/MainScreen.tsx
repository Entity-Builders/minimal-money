import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { HistoryBottomSheet } from '../components/HistoryBottomSheet';
import { ScanExpenseModal } from '../components/scan/ScanExpenseModal';
import { useMainScreen } from '../hooks/useMainScreen';
import { useOTAUpdate } from '../hooks/useOTAUpdate';
import { styles } from './MainScreenStyles';
import { ExpenseInput } from '../components/main/expense-input';
import { RecoveryModal } from '../components/recovery/RecoveryModal';
import { BudgetStatsCarousel } from '../components/BudgetStatsCarousel';
import { BudgetFocusDisplay } from '../components/main/BudgetFocusDisplay';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { RiveReflection } from '../components/RiveReflection';

export default function MainScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    totalAvailable,
    getRate,
    dailyBudget,
    spentToday,
    daysToRecover,
    recoveryQuota,
    amount,
    currency,
    handleAmountChange,
    handleCurrencyToggle,
    handleExpenseSubmit,
    handleSettings,
    scanModalVisible,
    handleOpenScan, // Preserving scan functionality (though no button in new UI yet, user likely drags or via settings, or I should add it back if space permits or implicitly)
    handleCloseScan,
    handleAddScannedExpenses,
    step,
    expenseDetail,
    handleDetailChange,
    handleBackToAmount,
    shouldAutoFocus,
    isRecoveryMode,
    totalDebt,
    setConfig,
    config,
    remainingDays,
  } = useMainScreen();

  const handleSaveRecoveryPlan = async (days: number) => {
    if (config) {
      await setConfig({ ...config, recoveryTargetDays: days });
    }
  };

  const handleOpenRecovery = () => {
    if (isRecoveryMode) {
      setRecoveryModalVisible(true);
    } else {
      handleOpenHistory(); // Fallback if user taps history
    }
  };

  const { isDownloaded, reloadApp } = useOTAUpdate();

  const [recoveryModalVisible, setRecoveryModalVisible] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Focus Mode Animation State
  const focusOpacity = useSharedValue(1);

  const handleFocus = () => {
    focusOpacity.value = withSpring(0.2);
  };

  const handleBlur = () => {
    focusOpacity.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: focusOpacity.value,
    };
  });

  // Derived Statistics
  // Accumulated logic is now handled inside BudgetStatsCarousel

  // Show recovery modal once if in recovery mode
  useEffect(() => {
    if (isRecoveryMode) {
      setRecoveryModalVisible(true);
    }
  }, [isRecoveryMode]);

  const handleOpenHistory = () => {
    bottomSheetRef.current?.snapToIndex(2);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* TouchableWithoutFeedback removed to allow ScrollView interaction */}
      <View style={styles.content}>
        {/* HEADER: Settings (Always visible) */}
        <View style={styles.header}>
          {isDownloaded && (
            <TouchableOpacity
              onPress={reloadApp}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#000',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                marginRight: 12,
              }}
            >
              <Ionicons
                name="cloud-download-outline"
                size={14}
                color="#FFF"
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>
                Update
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSettings}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="settings-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* STATS ROW (Carrousel) */}
        <Animated.View
          style={[styles.statsRow, animatedStyle, { paddingHorizontal: 0 }]}
        >
          <BudgetStatsCarousel
            onOpenHistory={handleOpenHistory}
            onOpenRecovery={() => setRecoveryModalVisible(true)}
          />
        </Animated.View>

        {/* MAIN FOCUS: Available Today (Fades out in Focus Mode) */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Animated.View style={[animatedStyle]}>
            <BudgetFocusDisplay
              totalAvailable={totalAvailable}
              isRecoveryMode={isRecoveryMode}
              onPress={handleOpenHistory}
            />
          </Animated.View>

          {/* ACTION AREA: Input */}
          <View style={styles.inputContainer}>
            <ExpenseInput
              amount={amount}
              handleAmountChange={handleAmountChange}
              handleExpenseSubmit={() => {
                handleExpenseSubmit();
                Keyboard.dismiss();
              }}
              currency={currency}
              handleCurrencyToggle={handleCurrencyToggle}
              exchangeRate={getRate(currency)}
              step={step}
              expenseDetail={expenseDetail}
              handleDetailChange={handleDetailChange}
              handleBackToAmount={handleBackToAmount}
              shouldAutoFocus={shouldAutoFocus && !isSheetOpen}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </View>
        </KeyboardAvoidingView>
      </View>

      <HistoryBottomSheet
        ref={bottomSheetRef}
        navigateTo={() => navigation.navigate('History')}
        onChange={index => setIsSheetOpen(index > 0)}
      />
      <ScanExpenseModal
        visible={scanModalVisible}
        onClose={handleCloseScan}
        onAddExpenses={handleAddScannedExpenses}
      />
      <RecoveryModal
        visible={isRecoveryMode && recoveryModalVisible}
        onDismiss={() => setRecoveryModalVisible(false)}
        debtAmount={totalDebt}
        currentDaysToRecover={daysToRecover}
        maxDays={remainingDays}
        dailyBudgetRaw={dailyBudget}
        onSavePlan={handleSaveRecoveryPlan}
      />
    </SafeAreaView>
  );
}
