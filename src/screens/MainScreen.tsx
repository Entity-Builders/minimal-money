import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Text,
  Keyboard,
  AppState,
  FlatList,
  Dimensions,
  Pressable,
  Modal,
  ScrollView,
  InputAccessoryView,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { HistoryBottomSheet } from '../components/HistoryBottomSheet';
import { ShareBudgetSheet } from '../components/sharing/ShareBudgetSheet';
import { JoinBudgetSheet } from '../components/sharing/JoinBudgetSheet';
import { SharedAvatars } from '../components/sharing/SharedAvatars';

import { useMainScreen } from '../hooks/useMainScreen';
import { useOTAUpdate } from '../hooks/useOTAUpdate';
import { styles } from './MainScreenStyles';
import { ExpenseInput } from '../components/main/expense-input';
import { ContinueButton } from '../components/main/expense-input/ContinueButton';
import { SkipButton } from '../components/main/expense-input/SkipButton';
import { BudgetFocusDisplay } from '../components/main/BudgetFocusDisplay';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Batch } from '../types';
import { JoinResult } from '@entity-builders/logic';
import { getColorForBatch } from '../utils/colors';

const { width } = Dimensions.get('window');

export default function MainScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    batches,
    activeBatchId,
    setActiveBatchId,
    getRate,
    amount,
    currency,
    handleAmountChange,
    handleCurrencyToggle,
    handleExpenseSubmit,
    handleSettings,

    step,
    expenseDetail,
    handleDetailChange,
    handleBackToAmount,
    shouldAutoFocus,
    refreshData,
  } = useMainScreen();

  const { isDownloaded, reloadApp } = useOTAUpdate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [targetScrollBatchId, setTargetScrollBatchId] = useState<string | null>(null);

  // Dismiss keyboard when app goes to background to prevent
  // KeyboardAvoidingView layout corruption on foreground resume.
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'background' || nextState === 'inactive') {
        Keyboard.dismiss();
      }
    });
    return () => sub.remove();
  }, []);
  const flatListRef = useRef<FlatList>(null);
  const isScrollingProgrammatically = useRef(false);

  // When all batches are removed, go back to onboarding (empty state)
  useEffect(() => {
    if (!activeBatchId && batches.length === 0) {
      // Reset hasOnboarded so user can add a new budget
      navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    }
  }, [batches.length, activeBatchId, navigation]);

  // Sharing modal state
  const [shareTarget, setShareTarget] = useState<Batch | null>(null);
  const [showJoin, setShowJoin] = useState(false);

  const shareSheetRef = useRef<BottomSheetModal>(null);
  const joinSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (shareTarget) shareSheetRef.current?.present();
    else shareSheetRef.current?.dismiss();
  }, [shareTarget]);

  useEffect(() => {
    if (showJoin) joinSheetRef.current?.present();
    else joinSheetRef.current?.dismiss();
  }, [showJoin]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
      />
    ),
    [],
  );

  const insets = useSafeAreaInsets();

  // Focus Mode Animation State
  const focusOpacity = useSharedValue(1);

  const handleFocus = () => {
    setIsInputFocused(true);
    focusOpacity.value = withSpring(0);
  };

  const handleBlur = () => {
    setIsInputFocused(false);
    focusOpacity.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: focusOpacity.value,
    };
  });

  const activeBatchIdRef = useRef(activeBatchId);
  useEffect(() => {
    activeBatchIdRef.current = activeBatchId;
  }, [activeBatchId]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    // Skip if we triggered this scroll programmatically
    if (isScrollingProgrammatically.current) return;
    if (viewableItems.length > 0) {
      const newActiveId = viewableItems[0].item.id;
      if (newActiveId !== activeBatchIdRef.current) {
        setActiveBatchId(newActiveId);
      }
    }
  }).current;

  const handlePreviousBatch = useCallback(() => {
    const currentIndex = batches.findIndex(
      b => b.id === activeBatchIdRef.current,
    );
    if (currentIndex > 0) {
      isScrollingProgrammatically.current = true;
      const newActiveId = batches[currentIndex - 1].id;
      setActiveBatchId(newActiveId);
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 300);
    }
  }, [batches, setActiveBatchId]);

  const handleNextBatch = useCallback(() => {
    const currentIndex = batches.findIndex(
      b => b.id === activeBatchIdRef.current,
    );
    if (currentIndex < batches.length - 1) {
      isScrollingProgrammatically.current = true;
      const newActiveId = batches[currentIndex + 1].id;
      setActiveBatchId(newActiveId);
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 300);
    }
  }, [batches, setActiveBatchId]);

  const activeBatch = batches.find(b => b.id === activeBatchId) ?? null;

  const handleJoined = useCallback(async (result: JoinResult) => {
    setShowJoin(false);
    await refreshData();
    if (result.batchId) {
      setActiveBatchId(result.batchId);
      setTargetScrollBatchId(result.batchId);
    }
  }, [refreshData, setActiveBatchId]);

  useEffect(() => {
    if (targetScrollBatchId && batches.length > 0) {
      const index = batches.findIndex(b => b.id === targetScrollBatchId);
      if (index !== -1) {
        isScrollingProgrammatically.current = true;
        // Small delay to ensure FlatList has rendered the new item
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: true });
          setTimeout(() => {
            isScrollingProgrammatically.current = false;
          }, 300);
        }, 100);
        setTargetScrollBatchId(null);
      }
    }
  }, [targetScrollBatchId, batches.length, batches]);

  const renderBatchSlide = ({ item }: { item: Batch }) => {
    const bgColor = getColorForBatch(item.id);
    const isActive = activeBatchId === item.id;
    const memberCount = item.sharedWith?.length || 1;

    return (
      <View style={{ width, flex: 1, backgroundColor: bgColor }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={[
              styles.content,
              {
                flex: 1,
                paddingHorizontal: 24,
                paddingBottom: Platform.OS === 'ios' ? 20 : 20,
              },
            ]}
          >
            {/* HEADER: Settings */}
            <Animated.View
              style={[
                styles.header,
                animatedStyle,
                { pointerEvents: isInputFocused ? 'none' : 'auto' },
              ]}
            >
              {isDownloaded && (
                <TouchableOpacity
                  onPress={reloadApp}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
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
                  <Text
                    style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}
                  >
                    Update
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleSettings}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Ionicons name="settings-outline" size={20} color="#888" />
              </TouchableOpacity>
            </Animated.View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1, justifyContent: 'space-between' }}
            >
              <Pressable
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => Keyboard.dismiss()}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {/* Batch name pill */}
                  <View
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18, marginRight: 8 }}>
                      {item.icon}
                    </Text>
                    <Text
                      style={{
                        color: '#E5E5EA',
                        fontSize: 12,
                        fontWeight: '700',
                        letterSpacing: 1.5,
                      }}
                    >
                      {item.name.toUpperCase()}
                    </Text>
                    {/* Shared indicator */}
                    <SharedAvatars
                      members={item.sharedWith || []}
                      size={20}
                      borderColor={bgColor}
                      onPress={() => setShareTarget(item)}
                    />
                  </View>

                  {/* Share button */}
                  <TouchableOpacity
                    onPress={() => setShareTarget(item)}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      padding: 8,
                      borderRadius: 20,
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={15}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>
                <BudgetFocusDisplay
                  key={item.id}
                  totalAvailable={item.currentBalance}
                />
              </Pressable>

              {/* ACTION AREA: Input */}
              <View style={styles.inputContainer}>
                <ExpenseInput
                  amount={amount}
                  handleAmountChange={handleAmountChange}
                  handleExpenseSubmit={handleExpenseSubmit}
                  currency={currency}
                  handleCurrencyToggle={handleCurrencyToggle}
                  exchangeRate={getRate(currency)}
                  step={step}
                  expenseDetail={expenseDetail}
                  handleDetailChange={handleDetailChange}
                  handleBackToAmount={handleBackToAmount}
                  shouldAutoFocus={isActive && shouldAutoFocus && !isSheetOpen}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onPreviousBatch={handlePreviousBatch}
                  onNextBatch={handleNextBatch}
                  batchId={item.id}
                  activeBatchId={activeBatchId ?? ''}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        ref={flatListRef}
        data={batches}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={!isInputFocused}
        showsHorizontalScrollIndicator={false}
        renderItem={renderBatchSlide}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        extraData={activeBatchId}
        getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
      />

      <Animated.View
        style={[
          { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0 },
          animatedStyle,
        ]}
        pointerEvents={isInputFocused ? 'none' : 'box-none'}
      >
        <HistoryBottomSheet
          ref={bottomSheetRef}
          bgColor={getColorForBatch(activeBatch?.id ?? '')}
          navigateTo={() => navigation.navigate('History')}
          onChange={index => setIsSheetOpen(index > 0)}
        />
      </Animated.View>

      {/* ── Share Batch Modal ───────────────────────────── */}
      <BottomSheetModal
        ref={shareSheetRef}
        enableDynamicSizing={true}
        backdropComponent={renderBackdrop}
        onDismiss={() => setShareTarget(null)}
        backgroundStyle={{ backgroundColor: '#1C1C1E' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
      >
        <BottomSheetView style={{ paddingBottom: insets.bottom + 8 }}>
          {shareTarget && (
            <ShareBudgetSheet
              batchId={shareTarget.id}
              batchName={shareTarget.name}
              batchIcon={shareTarget.icon}
              members={shareTarget.sharedWith}
              onClose={() => setShareTarget(null)}
            />
          )}
        </BottomSheetView>
      </BottomSheetModal>

      {/* ── Join Batch Modal ────────────────────────────── */}
      <BottomSheetModal
        ref={joinSheetRef}
        enableDynamicSizing={true}
        backdropComponent={renderBackdrop}
        onDismiss={() => setShowJoin(false)}
        backgroundStyle={{ backgroundColor: '#1C1C1E' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          <JoinBudgetSheet
            onJoined={handleJoined}
            onClose={() => setShowJoin(false)}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}
