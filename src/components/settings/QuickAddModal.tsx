import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ParsedExpense {
  name: string;
  amount: number;
}

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExpenses: (expenses: ParsedExpense[]) => void;
}

export const QuickAddModal = ({
  visible,
  onClose,
  onAddExpenses,
}: QuickAddModalProps) => {
  const [inputText, setInputText] = useState('');
  const [parsedExpenses, setParsedExpenses] = useState<ParsedExpense[]>([]);

  // Reset state when opening
  useEffect(() => {
    if (visible) {
      setInputText('');
      setParsedExpenses([]);
    }
  }, [visible]);

  // Reactive parsing logic
  useEffect(() => {
    if (!inputText.trim()) {
      setParsedExpenses([]);
      return;
    }

    const parseText = (text: string) => {
      const results: ParsedExpense[] = [];

      // First split by newlines to handle row-based data (Excel, CSV per line)
      const lines = text.split(/\r?\n/);

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Check how many potential amounts are in this line
        // This helps distinguish between "Name, 10" (1 amount) vs "Coffee 5, Bread 3" (2 amounts)
        const amountRegex = /\$?(\d+([.,]\d{1,2})?)/g;
        const potentialAmounts = trimmedLine.match(amountRegex) || [];

        // STRATEGY 1: Multiple items in one line (old behavior)
        // If there are multiple numbers, assume it's a natural language list: "Coffee 5, Bread 3"
        if (potentialAmounts.length > 1) {
          // Split by commas, " y ", or " and "
          const parts = trimmedLine.split(/,|\s+y\s+|\s+and\s+/i);
          parts.forEach(part => parseSingleItem(part, results));
        }
        // STRATEGY 2: Single item per line (CSV/Excel friendly)
        // "Netflix, 15" or "Netflix 	 15" or "Netflix; 15"
        else {
          // Pass the whole line to be parsed as one item
          // The parser needs to be smart enough to ignore commas/semicolons used as separators
          parseSingleItem(trimmedLine, results);
        }
      });

      setParsedExpenses(results);
    };

    const parseSingleItem = (
      rawText: string,
      resultsArray: ParsedExpense[],
    ) => {
      const cleanPart = rawText.trim();
      if (!cleanPart) return;

      // Try to find a number in the string
      // Supports: 100, 100.50, 100,50, $100
      const numberMatch = cleanPart.match(/\$?(\d+([.,]\d{1,2})?)/);

      if (numberMatch) {
        const amountStr = numberMatch[1].replace(',', '.');
        const amount = parseFloat(amountStr);

        // Remove the number and clean up the name
        let name = cleanPart
          .replace(numberMatch[0], '') // Remove number
          .replace(/\$/g, '') // Remove dollar sign if separate
          .replace(/\s+de\s+/i, ' ') // Remove " de " connector
          // Remove common CSV/Excel separators that might remain being treated as text
          .replace(/^[\s,;\t]+|[\s,;\t]+$/g, '')
          .trim();

        // If name is empty or just symbols, ignore
        if (name.length > 1) {
          // Capitalize first letter
          name = name.charAt(0).toUpperCase() + name.slice(1);
          resultsArray.push({ name, amount });
        }
      }
    };

    parseText(inputText);
  }, [inputText]);

  const handleConfirm = () => {
    if (parsedExpenses.length > 0) {
      onAddExpenses(parsedExpenses);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Carga Rápida</Text>
            <Text style={styles.subtitle}>
              Pega una lista o escribe como hablas.{'\n'}
              Ej: "Netflix 15, Spotify 10, Gimnasio 80".
            </Text>
          </View>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Escribe aquí..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              autoFocus
              textAlignVertical="top"
            />
          </View>

          {/* Preview List */}
          {parsedExpenses.length > 0 && (
            <View style={styles.previewContainer}>
              <ScrollView
                style={styles.previewList}
                showsVerticalScrollIndicator={true}
              >
                {parsedExpenses.map((item, index) => (
                  <View key={index} style={styles.previewItem}>
                    <View style={styles.itemLeft}>
                      <Ionicons name="checkbox" size={20} color="#34c759" />
                      <Text style={styles.itemName}>{item.name}</Text>
                    </View>
                    <Text style={styles.itemAmount}>— ${item.amount}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                parsedExpenses.length === 0 && styles.disabledButton,
              ]}
              onPress={handleConfirm}
              disabled={parsedExpenses.length === 0}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  parsedExpenses.length === 0 && styles.disabledButtonText,
                ]}
              >
                {parsedExpenses.length > 0
                  ? `Confirmar y Agregar ${parsedExpenses.length} Gastos`
                  : 'Escribe para detectar gastos...'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#1C1C1E', // Dark background as requested (#1A1A1A approx)
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    minHeight: 100,
  },
  input: {
    color: '#FFF',
    fontSize: 16,
    padding: 16,
    minHeight: 100,
  },
  previewContainer: {
    maxHeight: 200,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 8,
  },
  previewList: {
    flexGrow: 0,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  itemName: {
    color: '#FFF',
    fontSize: 16,
    flexShrink: 1,
  },
  itemAmount: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  footer: {
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: 'rgba(255,255,255,0.3)',
  },
});
