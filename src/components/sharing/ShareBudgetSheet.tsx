import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import {
  generateInviteCode,
  InviteCode,
} from '@eb-packages/logic';

interface ShareBudgetSheetProps {
  batchId: string;
  batchName: string;
  batchIcon: string;
  members?: { id: string; email: string; role?: string }[];
  onClose: () => void;
}

export const ShareBudgetSheet: React.FC<ShareBudgetSheetProps> = ({
  batchId,
  batchName,
  batchIcon,
  members,
  onClose,
}) => {
  const [invite, setInvite] = useState<InviteCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const code = await generateInviteCode(batchId);
      setInvite(code);
    } catch (e: any) {
      console.error('Share error:', e);
      Alert.alert('Error', e.message || 'No se pudo generar el código. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  const handleCopy = async () => {
    if (!invite) return;
    await Clipboard.setStringAsync(invite.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!invite) return;
    await Share.share({
      message: `Únete a mi budget "${batchName}" en Minimal Money. Código: ${invite.code} (válido 24hs)`,
    });
  };

  const formatExpiry = (d: Date) => {
    const diff = d.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.batchPill}>
          <Text style={styles.batchIcon}>{batchIcon}</Text>
          <Text style={styles.batchName}>{batchName}</Text>
          {members && members.length > 1 && (
            <View style={styles.memberBadge}>
              <Ionicons name="people" size={12} color="#30D158" />
              <Text style={styles.memberCount}>{members.length}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="close" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Compartí este presupuesto con alguien. El código expira en 24 horas.
      </Text>

      {/* Members List */}
      {members && members.length > 1 && (
        <View style={{ marginBottom: 20, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 13, color: '#888', marginBottom: 8, fontWeight: '600' }}>MIEMBROS</Text>
          {members.map(member => (
            <View key={member.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="person-circle-outline" size={18} color="#888" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 14, color: '#E5E5EA' }}>
                {member.email} {member.role === 'owner' && <Text style={{ color: '#FFD60A', fontSize: 12 }}> (Dueño)</Text>}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Code Display */}
      {invite ? (
        <View style={styles.codeContainer}>
          <Text style={styles.code}>{invite.code}</Text>
          <Text style={styles.expiry}>Expira en {formatExpiry(invite.expiresAt)}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
              <Ionicons
                name={copied ? 'checkmark-circle' : 'copy-outline'}
                size={18}
                color={copied ? '#30D158' : '#fff'}
              />
              <Text style={styles.actionBtnText}>{copied ? 'Copiado!' : 'Copiar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={handleShare}>
              <Ionicons name="share-outline" size={18} color="#000" />
              <Text style={[styles.actionBtnText, { color: '#000' }]}>Compartir</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.regenBtn} onPress={handleGenerate}>
            <Text style={styles.regenText}>Generar nuevo código</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="link" size={18} color="#000" />
              <Text style={styles.generateBtnText}>Generar código de invitación</Text>
            </>
          )}
        </TouchableOpacity>
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
  batchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  batchIcon: {
    fontSize: 16,
  },
  batchName: {
    color: '#E5E5EA',
    fontSize: 14,
    fontWeight: '600',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  memberCount: {
    color: '#30D158',
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  codeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  code: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 8,
    fontVariant: ['tabular-nums'],
    marginBottom: 8,
  },
  expiry: {
    color: '#666',
    fontSize: 12,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
  shareBtn: {
    backgroundColor: '#30D158',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  regenBtn: {
    paddingVertical: 4,
  },
  regenText: {
    color: '#444',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#30D158',
    padding: 16,
    borderRadius: 14,
  },
  generateBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
});
