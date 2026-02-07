import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface StatsCarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number, itemWidth: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  itemsPerScreen?: number;
  contentPadding?: number;
  containerStyle?: ViewStyle;
}

export function StatsCarousel<T>({
  data,
  renderItem,
  keyExtractor,
  itemsPerScreen = 3,
  contentPadding = 24,
  containerStyle,
}: StatsCarouselProps<T>) {
  const [containerWidth, setContainerWidth] = React.useState(0);

  const itemWidth = useMemo(() => {
    return containerWidth > 0 ? containerWidth / itemsPerScreen : 0;
  }, [containerWidth, itemsPerScreen]);

  return (
    <View
      style={[styles.container, containerStyle]}
      onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <ScrollView
          horizontal
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsHorizontalScrollIndicator={false}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          bounces={false}
        >
          {data.map((item, index) => (
            <View key={keyExtractor(item, index)}>
              {renderItem(item, index, itemWidth)}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // Alignment is handled by paddingHorizontal calculation
  },
});
