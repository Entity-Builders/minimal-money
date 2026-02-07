import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 20 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    zIndex: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Or 'center' with gap if preferred
    alignItems: 'center',
    zIndex: 0,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#444', // Very subtle
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  statValue: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center the large amount
    marginTop: -60, // Visual adjustment to be slightly above true center if needed
  },
  availableAmountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  currencySymbol: {
    fontSize: 40,
    color: '#444',
    marginRight: 4,
    fontWeight: '300',
  },
  availableAmount: {
    fontSize: 80,
    fontWeight: '600',
    color: '#FFF',
    includeFontPadding: false,
  },
  availableLabel: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 10,
  },
  // Input Area styles
  inputContainer: {
    width: '100%',
    marginBottom: Platform.OS === 'ios' ? 40 : 20, // Bottom third area
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 32,
    color: '#FFF',
    fontWeight: '400',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  currencyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  currencyText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  conversionHint: {
    fontSize: 16,
    color: '#444',
    marginTop: 8,
    marginLeft: 2,
  },
  balanceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitleRecovery: {
    color: '#FF453A',
  },
  balance: {
    fontSize: 80,
    fontWeight: '600',
    color: '#FFF',
    includeFontPadding: false,
    textAlign: 'center',
  },
  balanceRecovery: {
    color: '#FF453A',
  },
  recoveryContainer: {
    width: '100%',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  recoveryText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#30D158',
    borderRadius: 4,
  },
});
