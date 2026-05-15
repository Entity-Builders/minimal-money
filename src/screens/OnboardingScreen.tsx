import React from 'react';
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
import { useOnboarding } from '../hooks/useOnboarding';
import { styles } from './OnboardingStyles';

export const OnboardingScreen: React.FC = () => {
  const { name, setName, icon, setIcon, monthlyLimit, setMonthlyLimit, loading, finishOnboarding } = useOnboarding();

  const isFormValid = name.trim().length > 0 && monthlyLimit.trim().length > 0 && parseFloat(monthlyLimit) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: '100%' }]} />
          </View>

          <Text style={styles.headerText}>Create your first Budget</Text>

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
              onPress={finishOnboarding}
              disabled={loading || !isFormValid}
            >
              <Text style={[styles.buttonText, (!isFormValid || loading) && styles.buttonTextDisabled]}>
                {loading ? 'Creating...' : 'Start Budgeting'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
