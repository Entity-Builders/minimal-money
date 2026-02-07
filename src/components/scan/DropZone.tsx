import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface DropZoneProps {
  onFileSelect: (files: DocumentPicker.DocumentPickerAsset[]) => void;
  isScanning: boolean;
}

export const DropZone = ({ onFileSelect, isScanning }: DropZoneProps) => {
  const handlePickDocument = async () => {
    if (isScanning) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onFileSelect(result.assets);
      }
    } catch (err) {
      console.warn('Error pick document', err);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePickDocument}
      disabled={isScanning}
    >
      <View style={[styles.container, isScanning && styles.scanningContainer]}>
        {isScanning ? (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.content}
          >
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.scanningText}>Analizando Resumen...</Text>
            <Text style={styles.subText}>Detectando gastos recurrentes</Text>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.content}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="cloud-upload-outline" size={48} color="#4ECDC4" />
            </View>
            <Text style={styles.title}>Sube tu Resumen</Text>
            <Text style={styles.subtitle}>Toca para buscar el PDF</Text>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(78, 205, 196, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  scanningContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderColor: '#4ECDC4',
    borderStyle: 'solid',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 14,
  },
  scanningText: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  subText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});
