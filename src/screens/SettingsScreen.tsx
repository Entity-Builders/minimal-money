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
} from 'react-native';
import BottomSheet, { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsScreen } from '../hooks/useSettingsScreen';
import { styles } from './SettingsScreenStyles';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import { Ionicons } from '@expo/vector-icons';
import { JoinBudgetSheet } from '../components/sharing/JoinBudgetSheet';
import { CreateBudgetSheet } from '../components/sharing/CreateBudgetSheet';

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
                <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: '500' }}>{batch.name}</Text>
                <Text style={{ fontSize: 14, color: '#A0A0A0' }}>${batch.monthlyLimit} / month</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteBatch(batch.id)} style={{ padding: 10 }}>
                <Ionicons name="trash-outline" size={20} color="#FF4444" />
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
        keyboardBehavior="extend"
      >
        <BottomSheetView style={{ paddingBottom: insets.bottom + 8 }}>
          <JoinBudgetSheet
            onJoined={() => setShowJoin(false)}
            onClose={() => setShowJoin(false)}
          />
        </BottomSheetView>
      </BottomSheetModal>

      {/* ── Create Modal ───────────────────────────────────── */}
      <BottomSheetModal
        ref={createSheetRef}
        enableDynamicSizing={true}
        backdropComponent={renderBackdrop}
        onDismiss={() => setShowCreate(false)}
        backgroundStyle={{ backgroundColor: '#1C1C1E' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
        keyboardBehavior="extend"
      >
        <BottomSheetView style={{ paddingBottom: insets.bottom + 8 }}>
          <CreateBudgetSheet
            onCreated={() => setShowCreate(false)}
            onClose={() => setShowCreate(false)}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
