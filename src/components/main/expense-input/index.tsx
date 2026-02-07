import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../../screens/MainScreenStyles';
import { Currency } from '../../../types';
import { AmountStep } from './AmountStep';
import { DetailStep } from './DetailStep';

interface ExpenseInputProps {
  amount: string;
  handleAmountChange: (text: string) => void;
  handleExpenseSubmit: () => void;
  currency: Currency;
  handleCurrencyToggle: () => void;
  exchangeRate: number;
  step: 'amount' | 'detail';
  expenseDetail: string;
  handleDetailChange: (text: string) => void;
  handleBackToAmount: () => void;
  shouldAutoFocus: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const ExpenseInput = ({
  amount,
  handleAmountChange,
  handleExpenseSubmit,
  currency,
  handleCurrencyToggle,
  exchangeRate,
  step,
  expenseDetail,
  handleDetailChange,
  handleBackToAmount,
  shouldAutoFocus,
  onFocus,
  onBlur,
}: ExpenseInputProps) => {
  // Wrapper to handle step transition logic locally if needed,
  // currently purely driven by props as per original design.
  // The original component called handleExpenseSubmit for both steps,
  // expecting the parent hook to handle step transitions.

  return (
    <View style={styles.inputContainer}>
      {step === 'amount' ? (
        <AmountStep
          amount={amount}
          handleAmountChange={handleAmountChange}
          handleExpenseSubmit={handleExpenseSubmit} // Keep passing it through if strictly needed,
          // but conceptually AmountStep's "submit" is "go next"
          handleNextStep={handleExpenseSubmit} // The hook handles transitioning to detail on submit if amount > 0
          currency={currency}
          handleCurrencyToggle={handleCurrencyToggle}
          shouldAutoFocus={shouldAutoFocus}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      ) : (
        <DetailStep
          amount={amount}
          currency={currency}
          expenseDetail={expenseDetail}
          handleDetailChange={handleDetailChange}
          handleExpenseSubmit={handleExpenseSubmit}
          handleBackToAmount={handleBackToAmount}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}

      {step === 'amount' && (
        <>
          {/* Conversion Hint */}
          {currency !== 'USD' && amount && parseFloat(amount) > 0 && (
            <Text style={styles.conversionHint}>
              ≈ ${(parseFloat(amount) / exchangeRate).toFixed(2)} USD
            </Text>
          )}

          {/* New Warning/Hint: High amount on Strong Currency */}
          {currency !== 'ARS' && amount && parseFloat(amount) > 2000 && (
            <TouchableOpacity onPress={handleCurrencyToggle}>
              <Text
                style={[
                  styles.conversionHint,
                  { color: '#ff9800', marginTop: 4 },
                ]}
              >
                ¿Quisiste decir ARS?
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};
