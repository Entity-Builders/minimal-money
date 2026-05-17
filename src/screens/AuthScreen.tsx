import * as Sentry from '@sentry/react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase, supabaseUrl } from '@eb-packages/logic';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu email.');
      return;
    }
    setLoading(true);

    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'Attempting to send OTP',
      level: 'info',
    });

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      if (error) throw error;
      setOtpSent(true);
    } catch (error: any) {
      console.log('OTP send error caught', error);
      Sentry.captureException(error, {
        tags: { context: 'send_otp' },
        extra: { rawError: JSON.stringify(error) },
      });

      const errorDetails = [
        error.message,
        error.cause ? `Cause: ${error.cause}` : '',
        `Env: ${process.env.EXPO_PUBLIC_APP_ENV}`,
        `DB URL: ${supabaseUrl}`,
      ]
        .filter(Boolean)
        .join('\n');

      Alert.alert('Error enviando código', errorDetails);
    } finally {
      Sentry.logger.info('Send OTP completed');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!token) {
      Alert.alert('Error', 'Por favor ingresa el código.');
      return;
    }
    setLoading(true);

    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'Attempting to verify OTP',
      level: 'info',
    });

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) throw error;
      // successful login will automatically update the session and trigger navigation in App.tsx
    } catch (error: any) {
      console.log('OTP verify error caught', error);
      Sentry.captureException(error, {
        tags: { context: 'verify_otp' },
        extra: { rawError: JSON.stringify(error) },
      });

      Alert.alert('Código incorrecto', error.message);
    } finally {
      Sentry.logger.info('Verify OTP completed');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Minimal Money</Text>
        <Text style={styles.subtitle}>
          {otpSent ? 'Ingresa tu código' : 'Ingresa con tu email'}
        </Text>

        <View style={styles.inputContainer}>
          {!otpSent ? (
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Código de 6 dígitos"
              placeholderTextColor="#666"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={otpSent ? handleVerifyOtp : handleSendOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>
              {otpSent ? 'Verificar código' : 'Enviar código'}
            </Text>
          )}
        </TouchableOpacity>

        {otpSent && !loading && (
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setOtpSent(false)}
          >
            <Text style={styles.switchText}>Usar otro email</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 48,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
  },
  switchText: {
    color: '#888',
    fontSize: 14,
  },
});
