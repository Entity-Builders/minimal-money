import React from 'react';
import { View, StyleSheet, ViewStyle, Image, Platform, Text } from 'react-native';

interface RiveReflectionProps {
  value: number;
  style?: ViewStyle;
}

const WebRiveReflection: React.FC<RiveReflectionProps> = ({ value, style }) => {
  return (
    <View style={[styles.container, style, styles.webFallback]}>
      <Text style={styles.webFallbackText}>
        ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      </Text>
    </View>
  );
};

const NativeRiveReflection: React.FC<RiveReflectionProps> = ({ value, style }) => {
  // Require dynamically to prevent web bundler from evaluating native-only code
  const { default: Rive, Fit, AutoBind } = require('rive-react-native');
  const riveRef = React.useRef<any>(null);

  const riveSource = require('../../assets/number_reflection_with_data_binding.riv');
  const riveUri = Image.resolveAssetSource(riveSource).uri;

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

export const RiveReflection: React.FC<RiveReflectionProps> = (props) => {
  if (Platform.OS === 'web') {
    return <WebRiveReflection {...props} />;
  }
  return <NativeRiveReflection {...props} />;
};

const styles = StyleSheet.create({
  container: {
    height: 170,
    width: '100%',
  },
  rive: {},
  webFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webFallbackText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.8,
  },
});
