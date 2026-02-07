import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'space-between',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#222',
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center everything
  },
  question: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    marginBottom: 20,
    textAlign: 'center',
  },
  helper: {
    color: '#666',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  input: {
    fontSize: 50,
    color: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    width: '80%',
    textAlign: 'center',
    paddingVertical: 10,
  },
  percentage: {
    fontSize: 80,
    color: '#fff',
    fontWeight: '200',
    marginBottom: 10,
  },
  resultText: {
    color: '#888',
    fontSize: 18,
    marginVertical: 20,
  },
  bigTotal: {
    fontSize: 70,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#444',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  buttonPlaceholder: {
    flex: 1,
  },
  // Switcher styles
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    borderRadius: 25,
    padding: 4,
    marginBottom: 30,
  },
  switcherOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  switcherOptionActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  switcherText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  switcherTextActive: {
    color: '#000',
  },
  helperSmall: {
    color: '#666',
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
  },
  helperTiny: {
    color: '#555',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});
