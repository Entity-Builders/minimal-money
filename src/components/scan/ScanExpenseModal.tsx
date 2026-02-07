import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { DropZone } from './DropZone';
import { DetectedExpenseCard } from './DetectedExpenseCard';

import Constants from 'expo-constants';

import { getBackendUrl } from '../../utils/backend';

const BACKEND_URL = getBackendUrl();

interface DetectedExpense {
  name: string;
  amount: number;
  category?: string;
  date?: string;
}

interface ScanExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExpenses: (expenses: DetectedExpense[]) => void;
}

export const ScanExpenseModal = ({
  visible,
  onClose,
  onAddExpenses,
}: ScanExpenseModalProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedExpenses, setDetectedExpenses] = useState<DetectedExpense[]>(
    [],
  );
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleFileSelect = async (
    files: DocumentPicker.DocumentPickerAsset[],
  ) => {
    setIsScanning(true);
    setDetectedExpenses([]); // Clear previous

    try {
      const formData = new FormData();

      files.forEach(file => {
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
        } as any);
      });

      // In a real scenario, we fetch from the backend
      // checking connection first to provide better error message
      console.log(BACKEND_URL);
      try {
        const response = await fetch(`${BACKEND_URL}/parse-invoice`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!response.ok) {
          throw new Error(`Server Error: ${response.status}`);
        }

        const data: DetectedExpense[] = await response.json();
        setDetectedExpenses(data);
        // Select all by default
        setSelectedIndices(data.map((_, i) => i));
      } catch (networkError) {
        console.error('Backend connection failed:', networkError);
        // Fallback to mock for demo purposes if backend is not running
        Alert.alert(
          'Modo Demo',
          'No se detectó el backend local. Usando datos de prueba.',
          [{ text: 'OK' }],
        );

        // Mock data logic (mirrors backend/parser.py)
        setTimeout(() => {
          const mockData = [
            { name: 'Netflix', amount: 15.99, category: 'Subscription' },
            { name: 'Spotify Premium', amount: 10.5, category: 'Subscription' },
            { name: 'Gimnasio Megatlon', amount: 80.0, category: 'Health' },
            { name: 'Uber Trip', amount: 12.3, category: 'Transport' },
            {
              name: 'MercadoPago *Adidas',
              amount: 120.0,
              category: 'Shopping',
            },
          ];
          setDetectedExpenses(mockData);
          setSelectedIndices(mockData.map((_, i) => i));
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo procesar el archivo.');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSelection = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index],
    );
  };

  const handleConfirm = () => {
    const selectedExpenses = detectedExpenses.filter((_, i) =>
      selectedIndices.includes(i),
    );
    onAddExpenses(selectedExpenses);
    handleClose();
  };

  const handleClose = () => {
    setDetectedExpenses([]);
    setSelectedIndices([]);
    setIsScanning(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan Recibo</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={30} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Drop Zone */}
          <DropZone onFileSelect={handleFileSelect} isScanning={isScanning} />

          {/* Results List */}
          {detectedExpenses.length > 0 && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Gastos Detectados</Text>
                <Text style={styles.resultsSubtitle}>
                  {selectedIndices.length} seleccionados
                </Text>
              </View>

              {detectedExpenses.map((expense, index) => (
                <DetectedExpenseCard
                  key={index}
                  item={expense}
                  isSelected={selectedIndices.includes(index)}
                  onToggle={() => toggleSelection(index)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        {detectedExpenses.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>
                Importar {selectedIndices.length} Gastos
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  resultsSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#1C1C1E', // solid background for footer
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  confirmButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
