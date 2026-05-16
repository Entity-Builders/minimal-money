import React, { useState } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import BottomSheet, { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsScreen } from '../hooks/useSettingsScreen';
import { styles } from './SettingsScreenStyles';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import { Ionicons } from '@expo/vector-icons';
import { JoinBudgetSheet } from '../components/sharing/JoinBudgetSheet';
import { CreateBudgetSheet } from '../components/sharing/CreateBudgetSheet';
import { generateInviteCode } from '@eb-packages/logic';
import { SharedAvatars } from '../components/sharing/SharedAvatars';
import * as Clipboard from 'expo-clipboard';

export default function SettingsScreen() {
  const {
    user,
    batches,
    name,
    setName,
    limit,
    setLimit,
    loading,
    handleCreateBatch,
    handleDeleteBatch,
    handleLogout,
    refreshData,
  } = useSettingsScreen();

  const insets = useSafeAreaInsets();
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const joinSheetRef = React.useRef<BottomSheetModal>(null);
  const createSheetRef = React.useRef<BottomSheetModal>(null);

  React.useEffect(() => {
    if (showJoin) joinSheetRef.current?.present();
    else joinSheetRef.current?.dismiss();
  }, [showJoin]);

  React.useEffect(() => {
    if (showCreate) createSheetRef.current?.present();
    else createSheetRef.current?.dismiss();
  }, [showCreate]);

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
      />
    ),
    []
  );

  const handleShare = async (batch: any) => {
    try {
      const { code } = await generateInviteCode(batch.id);
      Alert.alert(
        'Código de Invitación',
        `Comparte este código para que otros se unan a tu budget:\n\n${code}\n\n(Válido por 24 horas)`,
        [
          { text: 'Copiar', onPress: async () => {
            await Clipboard.setStringAsync(code);
            Alert.alert('Copiado', 'El código se ha copiado al portapapeles');
          }},
          { text: 'Cerrar', style: 'cancel' }
        ]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo generar el código');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SettingsHeader />

      <ScrollView contentContainerStyle={[styles.scrollContent, { padding: 20 }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Text style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 15 }}>
            Account
          </Text>
          <Text style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 20 }}>
            {user?.email}
          </Text>

          <Text style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 15, marginTop: 20 }}>
            Tus Budgets
          </Text>

          {batches.map(batch => (
            <View key={batch.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 24, marginRight: 15 }}>{batch.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: '500' }}>{batch.name}</Text>
                  {batch.sharedWith && batch.sharedWith.length > 1 && (
                    <SharedAvatars 
                      members={batch.sharedWith} 
                      size={18} 
                      borderColor="#1C1C1E" 
                    />
                  )}
                </View>
                <Text style={{ fontSize: 14, color: '#A0A0A0' }}>${batch.monthlyLimit} / month</Text>
                
                {batch.sharedWith && batch.sharedWith.length > 1 && (
                  <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#333' }}>
                    <Text style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Miembros:</Text>
                    {batch.sharedWith.map(member => (
                      <Text key={member.id} style={{ fontSize: 13, color: '#CCC' }}>
                        {member.email} {member.role === 'owner' ? '(Dueño)' : ''}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
              {batch.ownerId === user?.id && (
                <TouchableOpacity onPress={() => handleShare(batch)} style={{ padding: 10 }}>
                  <Ionicons name="share-outline" size={20} color="#00D1FF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleDeleteBatch(batch.id)} style={{ padding: 10 }}>
                <Ionicons name={batch.ownerId === user?.id ? "trash-outline" : "log-out-outline"} size={20} color="#FF4444" />
              </TouchableOpacity>
            </View>
          ))}



          <TouchableOpacity style={[styles.logoutButton, { marginTop: 40 }]} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>

      {/* ── Actions CTA ──────────────────────────────── */}
      <View style={{ flexDirection: 'row', margin: 20, gap: 10 }}>
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: 'rgba(0,209,255,0.12)',
            borderWidth: 1,
            borderColor: 'rgba(0,209,255,0.3)',
            borderRadius: 14,
            padding: 14,
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color="#00D1FF" />
          <Text style={{ color: '#00D1FF', fontWeight: '700', fontSize: 15 }}>
            Crear
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowJoin(true)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: 'rgba(48,209,88,0.12)',
            borderWidth: 1,
            borderColor: 'rgba(48,209,88,0.3)',
            borderRadius: 14,
            padding: 14,
          }}
        >
          <Ionicons name="enter-outline" size={18} color="#30D158" />
          <Text style={{ color: '#30D158', fontWeight: '700', fontSize: 15 }}>
            Unirme
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Join Modal ───────────────────────────────────── */}
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
            onJoined={() => {
              setShowJoin(false);
              refreshData();
            }}
            onClose={() => setShowJoin(false)}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>

      {/* ── Create Modal ───────────────────────────────────── */}
      <BottomSheetModal
        ref={createSheetRef}
        enableDynamicSizing={true}
        backdropComponent={renderBackdrop}
        onDismiss={() => setShowCreate(false)}
        backgroundStyle={{ backgroundColor: '#1C1C1E' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          <CreateBudgetSheet
            onCreated={() => setShowCreate(false)}
            onClose={() => setShowCreate(false)}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
