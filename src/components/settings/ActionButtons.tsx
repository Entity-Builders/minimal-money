import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../../screens/SettingsScreenStyles';

interface ActionButtonsProps {
  handleSave: () => void;
  handleReset: () => void;
  hasChanges?: boolean;
}

export const ActionButtons = ({
  handleSave,
  handleReset,
  hasChanges = true,
}: ActionButtonsProps) => {
  return (
    <>
      {hasChanges && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            Actualizar mi presupuesto diario
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>Reiniciar presupuesto</Text>
      </TouchableOpacity>
    </>
  );
};
