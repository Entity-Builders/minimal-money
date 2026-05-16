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

// Use a simpler approach since reanimated might capture the background.

const CustomBackground: React.FC<BottomSheetBackgroundProps> = ({
  style,
  animatedIndex,
}) => {
  const containerAnimatedStyle = useAnimatedStyle(() => {
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
    return { intensity };
  });

  const glassAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0, 0.2, 1],
      [0, 1, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [-1, 0, 1],
      [0, 0, 0.7],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        style,
        containerAnimatedStyle,
        {
          overflow: 'hidden',
        },
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, glassAnimatedStyle]}>
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
    </Animated.View>
  );
};

interface HistoryBottomSheetProps {
  navigateTo: () => void;
  onChange?: (index: number) => void;
  bgColor?: string;
}

export const HistoryBottomSheet = forwardRef<
  BottomSheet,
  HistoryBottomSheetProps
>((props, ref) => {
  const insets = useSafeAreaInsets();
  const internalRef = React.useRef<BottomSheet>(null);

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

  const { activeBatchTransactions, removeTransaction, activeBatch } = useBudget();
  const contentOpacity = useSharedValue(1);
  const animatedIndex = useSharedValue(0);
  const theme = useTheme();

  const animatedContentStyle = useAnimatedStyle(() => {
    const visibilityOpacity = interpolate(
      animatedIndex.value,
      [0, 0.8],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: contentOpacity.value * visibilityOpacity,
    };
  });

  const snapPoints = useMemo(
    () => [insets.bottom + 40, '60%', '100%'],
    [insets.bottom],
  );

  const transactions: Transaction[] = useMemo(() => {
    return activeBatchTransactions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [activeBatchTransactions]);

  const spentInBatch = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const resetOpacity = () => {
    setTimeout(() => {
      contentOpacity.value = 1;
      internalRef.current?.snapToIndex(0);
    }, 500);
  };

  const handleExpandAndShowHistory = () => {
    internalRef.current?.snapToIndex(snapPoints.length - 1 + 1);
    contentOpacity.value = withTiming(0, { duration: 300 }, finished => {
      if (finished) {
        runOnJS(props.navigateTo)();
        runOnJS(resetOpacity)();
      }
    });
  };

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
          onPress={() => removeTransaction(id)}
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
    <>
      <BottomSheet
        ref={internalRef}
        index={0}
        snapPoints={snapPoints}
        backgroundComponent={CustomBackground}
        backgroundStyle={{ backgroundColor: props.bgColor ?? MinimalTheme.glass.background }}
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
          <View style={styles.header}>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}
            >
              Has gastado:{' '}
              <Text
                variant="titleLarge"
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: 'bold',
                }}
              >
                ${spentInBatch.toFixed(0)}
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
    </>
  );
});

const styles = StyleSheet.create({
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
    height: '100%',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});
