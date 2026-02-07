import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../../screens/OnboardingStyles';

interface StepFixedProps {
  fixed: string;
  setFixed: (value: string) => void;
}

export const StepFixed = ({ fixed, setFixed }: StepFixedProps) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.question}>¿Cuánto necesitas para vivir?</Text>
      <Text style={styles.helper}>Renta, servicios, comida. Algo redondo.</Text>
      <TextInput
        style={styles.input}
        placeholder="$0"
        placeholderTextColor="#555"
        keyboardType="numeric"
        value={fixed}
        onChangeText={setFixed}
      />
    </View>
  );
};
