import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { joinBatchWithCode, JoinResult } from '@eb-packages/logic';
import * as Haptics from 'expo-haptics';

interface JoinBudgetSheetProps {
  onJoined: (result: JoinResult) => void;
  onClose: () => void;
}

export const JoinBudgetSheet: React.FC<JoinBudgetSheetProps> = ({ onJoined, onClose }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<JoinResult | null>(null);

  const handleJoin = async () => {
    if (code.trim().length < 6) return;
    setLoading(true);
    setError(null);
    try {
      const result = await joinBatchWithCode(code);
      setSuccess(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        onJoined(result);
      }, 1200);
    } catch (e: any) {
      setError(e.message ?? 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ingresar a un Budget</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="close" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Ingresá el código de 6 caracteres que te compartieron.
      </Text>

      {success ? (
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>{success.batchIcon}</Text>
          <Text style={styles.successText}>¡Te uniste a {success.batchName}!</Text>
          <Ionicons name="checkmark-circle" size={28} color="#30D158" />
        </View>
      ) : (
        <>
          <BottomSheetTextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={code}
            onChangeText={(t) => {
              setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
              setError(null);
            }}
            placeholder="ABC123"
            placeholderTextColor="#444"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            keyboardType="default"
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity
            style={[styles.joinBtn, code.length < 6 && styles.joinBtnDisabled]}
            onPress={handleJoin}
            disabled={loading || code.length < 6}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="enter-outline" size={18} color="#000" />
                <Text style={styles.joinBtnText}>Unirme</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
    paddingVertical: 16,
    marginBottom: 12,
    fontVariant: ['tabular-nums'],
  },
  inputError: {
    borderColor: '#FF453A',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#30D158',
    padding: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  joinBtnDisabled: {
    opacity: 0.4,
  },
  joinBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  successIcon: {
    fontSize: 40,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
