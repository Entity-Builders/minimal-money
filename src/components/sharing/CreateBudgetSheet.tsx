import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsScreen } from '../../hooks/useSettingsScreen';

interface CreateBudgetSheetProps {
  onCreated: () => void;
  onClose: () => void;
}

export const CreateBudgetSheet: React.FC<CreateBudgetSheetProps> = ({ onCreated, onClose }) => {
  const {
    name,
    setName,
    limit,
    setLimit,
    loading,
    handleCreateBatch,
  } = useSettingsScreen();

  const handleCreate = async () => {
    await handleCreateBatch();
    onCreated();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crear un Budget</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="close" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Configura tu nuevo presupuesto.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre (ej. Supermercado)"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Límite Mensual (ej. 500)"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={limit}
        onChangeText={setLimit}
      />

      <TouchableOpacity
        style={[styles.createBtn, (!name || !limit) && styles.createBtnDisabled]}
        onPress={handleCreate}
        disabled={loading || !name || !limit}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.createBtnText}>Crear Budget</Text>
        )}
      </TouchableOpacity>
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
    backgroundColor: '#2C2C2C',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  createBtn: {
    backgroundColor: '#00D1FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
