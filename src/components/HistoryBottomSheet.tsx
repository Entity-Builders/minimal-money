import React, { useMemo, forwardRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackgroundProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useSharedValue,
  withTiming,
  runOnJS,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Transaction } from '../types';
import { TransactionItem } from './TransactionItem';
import { useBudget } from '../context/useBudget';
import { MinimalTheme } from '../theme';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const CustomBackground: React.FC<BottomSheetBackgroundProps> = ({
  style,
  animatedIndex,
}) => {
  const containerAnimatedStyle = useAnimatedStyle(() => {
    // Animate border radius from 24 (at index 1 or below) to 0 (at index 2 - full screen)
    const borderRadius = interpolate(
      animatedIndex.value,
      [1, 2],
      [24, 0],
      Extrapolation.CLAMP,
    );

    return {
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    };
  });

  const animatedProps = useAnimatedProps(() => {
    const intensity = interpolate(
      animatedIndex.value,
      [0, 2],
      [10, 50],
      Extrapolation.CLAMP,
    );
    return {
      intensity,
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [-1, 0, 1],
      [0, 0.7, 0.7], // Fade in to 0.7 at index 0, stay 0.7
      Extrapolation.CLAMP,
    );
    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        style,
        containerAnimatedStyle,
        {
          backgroundColor: MinimalTheme.glass.background,
          overflow: 'hidden',
        },
      ]}
    >
      <AnimatedBlurView
        animatedProps={animatedProps}
        tint="systemMaterialDark"
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          MinimalTheme.glass.gradient.start,
          MinimalTheme.glass.gradient.end,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle border */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          containerAnimatedStyle,
          {
            borderWidth: 1,
            borderColor: MinimalTheme.glass.border,
          },
        ]}
      />
      <Animated.View
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'black',
          },
          overlayAnimatedStyle,
        ]}
      />
    </Animated.View>
  );
};

interface HistoryBottomSheetProps {
  navigateTo: () => void;
  onChange?: (index: number) => void;
}

export const HistoryBottomSheet = forwardRef<
  BottomSheet,
  HistoryBottomSheetProps
>((props, ref) => {
  const insets = useSafeAreaInsets();
  // removed internal navigation usages in favor of prop
  const internalRef = React.useRef<BottomSheet>(null);

  // Expose the internal ref to the parent
  React.useImperativeHandle(
    ref,
    () =>
      ({
        snapToIndex: (index: number) => internalRef.current?.snapToIndex(index),
        snapToPosition: (position: string | number) =>
          internalRef.current?.snapToPosition(position),
        expand: () => internalRef.current?.expand(),
        collapse: () => internalRef.current?.collapse(),
        close: () => internalRef.current?.close(),
        forceClose: () => internalRef.current?.forceClose(),
      }) as any,
  );

  const { expensesToday, spentToday, removeExpense, dailyBudget } = useBudget();
  const contentOpacity = useSharedValue(1);
  const animatedIndex = useSharedValue(0);
  const theme = useTheme();

  const animatedContentStyle = useAnimatedStyle(() => {
    // Hide content at index 0 (collapsed), show at index 1 (expanded)
    const visibilityOpacity = interpolate(
      animatedIndex.value,
      [0, 0.8], // Start fading in immediately after index 0, fully visible by 0.8
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: contentOpacity.value * visibilityOpacity,
    };
  });

  // variables
  // Snap points:
  // First point: Safe area bottom + 40px for handle visibility
  // '60%': The open state
  const snapPoints = useMemo(
    () => [insets.bottom + 40, '60%', '100%'],
    [insets.bottom],
  );

  // Transform expenses to transactions for display
  const transactions: Transaction[] = useMemo(() => {
    return expensesToday
      .map(e => ({
        id: e.id,
        // Expenses are stored as positive numbers but we typically show them as negative in transaction lists
        amount: -e.amount,
        currency: e.currency,
        timestamp: e.timestamp,
        name: e.name,
      }))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [expensesToday]);

  const resetOpacity = () => {
    // Small delay to ensure navigation transition has started effectively
    setTimeout(() => {
      contentOpacity.value = 1;
      // Optionally snap back to default state?
      internalRef.current?.snapToIndex(0);
    }, 500);
  };

  const handleExpandAndShowHistory = () => {
    // 1. Expand fully (using the last snap point programmatically)
    internalRef.current?.snapToIndex(snapPoints.length - 1 + 1);

    // 2. Fade out content
    contentOpacity.value = withTiming(0, { duration: 300 }, finished => {
      if (finished) {
        // 3. Navigate after animation
        runOnJS(props.navigateTo)();

        // 4. Reset opacity after a short delay so it's visible next time
        runOnJS(resetOpacity)();
      }
    });
  };

  // render item
  const renderRightActions = (id: string, progress: any, drag: any) => {
    return (
      <View
        style={[
          styles.deleteActionContainer,
          { backgroundColor: theme.colors.error },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeExpense(id)}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={theme.colors.onError}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <ReanimatedSwipeable
      renderRightActions={(progress, drag) =>
        renderRightActions(item.id, progress, drag)
      }
      friction={1}
      enableTrackpadTwoFingerGesture
      rightThreshold={50}
      overshootRight={true}
    >
      <TransactionItem transaction={item} />
    </ReanimatedSwipeable>
  );

  useEffect(() => {
    return () => {
      internalRef.current?.close();
    };
  }, []);

  return (
    <BottomSheet
      ref={internalRef}
      index={0}
      snapPoints={snapPoints}
      backgroundComponent={CustomBackground}
      handleIndicatorStyle={styles.indicator}
      animatedIndex={animatedIndex}
      onChange={props.onChange}
    >
      <Animated.View
        style={[
          styles.contentContainer,
          { paddingTop: insets.top },
          animatedContentStyle,
        ]}
      >
        {/* Sticky Header inside the sheet */}
        <View style={styles.header}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}
          >
            Hoy has gastado:{' '}
            <Text
              variant="titleLarge"
              style={{
                color:
                  spentToday > dailyBudget
                    ? theme.colors.error
                    : theme.colors.onSurface,
                fontWeight: 'bold',
              }}
            >
              ${spentToday.toFixed(0)}
            </Text>
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {transactions.length} transacciones
          </Text>
        </View>

        <BottomSheetFlatList
          data={transactions}
          keyExtractor={(item: Transaction) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          ListFooterComponent={() => (
            <Button
              mode="text"
              onPress={handleExpandAndShowHistory}
              contentStyle={{
                flexDirection: 'row-reverse',
                paddingVertical: 8,
              }}
              labelStyle={{
                fontSize: 14,
                color: theme.colors.onSurfaceVariant,
              }}
              icon="arrow-right"
              textColor={theme.colors.onSurfaceVariant}
            >
              Ver historial completo
            </Button>
          )}
        />
      </Animated.View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  // background style removed as it is handled by CustomBackground
  indicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 15,
  },
  headerTitle: {
    // Removed specific styles in favor of Paper Text variants
  },
  headerAmount: {
    // Removed specific styles in favor of Paper Text variants
  },
  headerCount: {
    // Removed specific styles in favor of Paper Text variants
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  deleteActionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    // backgroundColor handled by theme
    height: '100%',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});
