import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  InputAccessoryView,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';
import { styles } from '../../../screens/MainScreenStyles';
import { Currency } from '../../../types';
import { useFocusGlow } from '../../../hooks/useFocusGlow';
import { LiquidGlass } from '../../LiquidGlass';
import { ContinueButton } from './ContinueButton';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AmountStepProps {
  amount: string;
  handleAmountChange: (text: string) => void;
  handleExpenseSubmit: () => void;
  currency: Currency;
  handleCurrencyToggle: () => void;
  shouldAutoFocus: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  handleNextStep: () => void;
}

export const AmountStep = ({
  amount,
  handleAmountChange,
  handleExpenseSubmit,
  currency,
  handleCurrencyToggle,
  shouldAutoFocus,
  onFocus,
  onBlur,
  handleNextStep,
}: AmountStepProps) => {
  const inputRef = React.useRef<TextInput>(null);

  const {
    focusProgress,
    onFocus: onFocusAmount,
    onBlur: onBlurAmount,
    animatedInputProps: animatedAmountProps,
  } = useFocusGlow();

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      focusProgress.value,
      [0, 1],
      ['#666666', '#FFFFFF'],
    );
    return {
      color,
      fontWeight: focusProgress.value > 0.5 ? '400' : '300',
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: focusProgress.value,
      transform: [
        {
          translateY: interpolate(focusProgress.value, [0, 1], [0, -25]),
        },
      ],
    };
  });

  React.useEffect(() => {
    if (shouldAutoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoFocus]);

  return (
    <View style={styles.inputRow}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
        pointerEvents="none"
      >
        <Animated.Text
          style={[
            {
              fontSize: 10,
              color: '#888',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 1,
            },
            animatedLabelStyle,
          ]}
        >
          Agregar gasto
        </Animated.Text>
      </View>

      <AnimatedTextInput
        ref={inputRef}
        style={styles.input}
        placeholder="0"
        animatedProps={animatedAmountProps}
        keyboardType="numeric"
        value={amount}
        onChangeText={handleAmountChange}
        onSubmitEditing={handleNextStep}
        returnKeyType="done"
        autoFocus={shouldAutoFocus}
        inputAccessoryViewID="amountInputAccessory"
        onFocus={() => {
          onFocusAmount();
          onFocus?.();
        }}
        onBlur={() => {
          onBlurAmount();
          onBlur?.();
        }}
      />
      <TouchableOpacity
        onPress={handleCurrencyToggle}
        style={styles.currencyToggle}
      >
        <Animated.Text style={[styles.currencyText, animatedTextStyle]}>
          {currency}
        </Animated.Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID="amountInputAccessory">
          <ContinueButton onPress={handleNextStep} />
        </InputAccessoryView>
      )}
    </View>
  );
};
