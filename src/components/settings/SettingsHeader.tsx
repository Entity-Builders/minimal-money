import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../screens/SettingsScreenStyles';
import { useNavigation } from '@react-navigation/native';

export const SettingsHeader = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Configuración</Text>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};
