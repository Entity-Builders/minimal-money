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
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../screens/MainScreenStyles';
import { useFocusGlow } from '../../../hooks/useFocusGlow';
import { ContinueButton } from './ContinueButton';
import { SkipButton } from './SkipButton';

interface DetailStepProps {
  amount: string;
  currency: string;
  expenseDetail: string;
  handleDetailChange: (text: string) => void;
  handleExpenseSubmit: () => void;
  handleBackToAmount: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const DetailStep = ({
  amount,
  currency,
  expenseDetail,
  handleDetailChange,
  handleExpenseSubmit,
  handleBackToAmount,
  onFocus,
  onBlur,
}: DetailStepProps) => {
  const {
    focusProgress: detailFocusProgress,
    onFocus: onFocusDetail,
    onBlur: onBlurDetail,
  } = useFocusGlow();

  const animatedDetailLabelStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      detailFocusProgress.value,
      [0, 1],
      ['#666666', '#FFFFFF'],
    );
    return {
      color,
    };
  });

  const animatedDetailTitleStyle = useAnimatedStyle(() => {
    return {
      opacity: detailFocusProgress.value,
      transform: [
        {
          translateY: interpolate(detailFocusProgress.value, [0, 1], [0, -25]),
        },
      ],
    };
  });

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
            animatedDetailTitleStyle,
          ]}
        >
          Agregar detalle
        </Animated.Text>
      </View>
      <TouchableOpacity
        onPress={handleBackToAmount}
        style={{ marginRight: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Animated.Text
          style={[{ fontSize: 16, marginRight: 8 }, animatedDetailLabelStyle]}
        >
          ${amount} {currency}
        </Animated.Text>
        <TextInput
          style={[styles.input, { fontSize: 12 }]}
          placeholder="Add detail (optional)..."
          placeholderTextColor="#666"
          value={expenseDetail}
          onChangeText={handleDetailChange}
          onSubmitEditing={handleExpenseSubmit}
          returnKeyType="done"
          autoFocus
          inputAccessoryViewID="detailInputAccessory"
          onFocus={() => {
            onFocusDetail();
            onFocus?.();
          }}
          onBlur={() => {
            onBlurDetail();
            onBlur?.();
          }}
        />
      </View>
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID="detailInputAccessory">
          <SkipButton onPress={handleExpenseSubmit} />
        </InputAccessoryView>
      )}
    </View>
  );
};
