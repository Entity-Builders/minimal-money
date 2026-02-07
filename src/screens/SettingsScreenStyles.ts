import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
    marginRight: 8,
  },
  percentageSuffix: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
    marginLeft: 8,
  },
  bigInput: {
    flex: 1,
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
    padding: 0,
  },

  // Accordion Styles
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
  accordionContent: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  expenseName: {
    color: '#ccc',
    fontSize: 16,
    flex: 1,
  },
  expenseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  expenseAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 4,
  },
  // Button Grid
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
  },
  gridButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  gridButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
  },

  // Add Form
  addForm: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  smallInput: {
    backgroundColor: '#000',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  iconBtn: {
    padding: 4,
  },

  summaryText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  summaryResult: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryFinal: {
    color: '#34c759',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 6,
    width: '100%',
  },

  // Save Button
  saveButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#721515ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: 10,
    marginBottom: 40,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: '600',
  },
});
