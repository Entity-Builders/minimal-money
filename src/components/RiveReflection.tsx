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

  const applyValue = React.useCallback((v: number) => {
    riveRef.current?.setNumber('Number property', v);
    riveRef.current?.play();
  }, []);

  // Apply value on initial mount (retry a few times since Rive initialization time varies)
  React.useEffect(() => {
    const timers = [50, 150, 300, 500, 1000].map(delay =>
      setTimeout(() => applyValue(value), delay),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-apply when value changes (e.g. after adding a transaction)
  React.useEffect(() => {
    applyValue(value);
  }, [value, applyValue]);

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
