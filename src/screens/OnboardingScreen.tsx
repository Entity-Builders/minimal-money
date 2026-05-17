import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useOnboarding } from '../hooks/useOnboarding';
import { styles } from './OnboardingStyles';
import { JoinBudgetSheet } from '../components/sharing/JoinBudgetSheet';
import { useBudget } from '../context/useBudget';
import { safeHaptics as Haptics } from '../utils/haptics';

export const OnboardingScreen: React.FC = () => {
  const { name, setName, icon, setIcon, monthlyLimit, setMonthlyLimit, loading, error, finishOnboarding } = useOnboarding();
  const { refreshData } = useBudget();
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const joinSheetRef = useRef<BottomSheetModal>(null);

  const isFormValid = name.trim().length > 0 && monthlyLimit.trim().length > 0 && parseFloat(monthlyLimit) > 0;

  const handleJoinSuccess = async () => {
    joinSheetRef.current?.dismiss();
    // After joining, we consider onboarding complete.
    // The budget context will fetch the newly joined batch on refresh.
    await refreshData();
  };

  const renderSelect = () => (
    <View style={styles.selectContainer}>
      <View style={styles.headerSpacer} />
      <Text style={styles.heroTitle}>Minimal Money</Text>
      <Text style={styles.heroSubtitle}>Simplicity in every transaction.</Text>

      <View style={styles.cardGroup}>
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setMode('create');
          }}
        >
          <View style={styles.cardIconBox}>
            <Ionicons name="add" size={24} color="#000" />
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle}>Create Budget</Text>
            <Text style={styles.cardDescription}>Start fresh with a new minimal budget.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#444" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            joinSheetRef.current?.present();
          }}
        >
          <View style={[styles.cardIconBox, { backgroundColor: '#333' }]}>
            <Ionicons name="enter-outline" size={24} color="#fff" />
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle}>Join Budget</Text>
            <Text style={styles.cardDescription}>Enter a code to share expenses.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCreate = () => (
    <ScrollView 
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setMode('select');
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.headerText}>New Budget</Text>

      {error && (
        <Text style={{ color: '#FF453A', textAlign: 'center', marginBottom: 20, fontSize: 14 }}>
          {error}
        </Text>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Icon</Text>
        <TextInput
          style={[styles.input, styles.iconInput]}
          value={icon}
          onChangeText={setIcon}
          placeholder="🛒"
          placeholderTextColor="#444"
          maxLength={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Supermercado"
          placeholderTextColor="#444"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Monthly Limit</Text>
        <TextInput
          style={styles.input}
          value={monthlyLimit}
          onChangeText={setMonthlyLimit}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#444"
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await finishOnboarding();
          }}
          disabled={loading || !isFormValid}
        >
          <Text style={[styles.buttonText, (!isFormValid || loading) && styles.buttonTextDisabled]}>
            {loading ? 'Creating...' : 'Create Budget'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {mode === 'select' ? renderSelect() : renderCreate()}
      </KeyboardAvoidingView>

      <BottomSheetModal
        ref={joinSheetRef}
        snapPoints={['50%', '80%']}
        index={0}
        backgroundStyle={{ backgroundColor: '#111' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        )}
      >
        <JoinBudgetSheet 
          onJoined={handleJoinSuccess}
          onClose={() => joinSheetRef.current?.dismiss()}
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
};
