import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 30,
    justifyContent: 'center',
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
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 30,
    alignItems: 'center',
  },
  label: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    fontSize: 32,
    color: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    width: '100%',
    textAlign: 'center',
    paddingVertical: 10,
    fontWeight: '600',
  },
  iconInput: {
    fontSize: 48,
    width: '30%',
  },
  buttonRow: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  buttonTextDisabled: {
    color: '#888',
  },
});
