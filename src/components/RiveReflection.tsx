import React from 'react';
import Rive, { Alignment, AutoBind, Fit, RiveRef } from 'rive-react-native';
import { View, StyleSheet, ViewStyle, Image } from 'react-native';

// const ASSET_NAME = 'number_reflection_with_data_binding';
const riveSource = require('../../assets/number_reflection_with_data_binding.riv');
const riveUri = Image.resolveAssetSource(riveSource).uri;

interface RiveReflectionProps {
  value: number;
  style?: ViewStyle;
}

export const RiveReflection: React.FC<RiveReflectionProps> = ({
  value,
  style,
}) => {
  const riveRef = React.useRef<RiveRef>(null);

  React.useEffect(() => {
    if (riveRef.current) {
      console.log('RiveReflection: value', value);
      // We need to know the specific input name from the Rive file.
      // Usually it's "Number" or "Level" or similar.
      // For now I'll assume "number" based on the file name, but this might need adjustment.
      // The file name is 'number_reflection_with_data_binding', which implies 'number' might be the input.
      riveRef.current?.setNumber('Number property', value);
      riveRef.current?.play();
    }
  }, [value]);

  return (
    <View style={[styles.container, style]}>
      <Rive
        ref={riveRef}
        url={riveUri}
        artboardName="Artboard 2"
        stateMachineName="State Machine 1"
        fit={Fit.Contain}
        style={styles.rive}
        autoplay={true}
        dataBinding={AutoBind(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 170,
    width: '100%',
  },
  rive: {},
});
