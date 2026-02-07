import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HistoryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        {/* Search Bar */}
        <BlurView intensity={30} tint="light" style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#rgba(255,255,255,0.6)"
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: '#fff' }]}
            placeholder="Buscar"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <Ionicons
                name="close-circle"
                size={18}
                color="rgba(255,255,255,0.6)"
              />
            </TouchableOpacity>
          )}
        </BlurView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
});
