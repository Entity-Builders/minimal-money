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
  selectContainer: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  headerSpacer: {
    height: '10%',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#888',
    fontSize: 18,
    marginBottom: 48,
    lineHeight: 24,
  },
  cardGroup: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDescription: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  backButton: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  headerText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 40,
    letterSpacing: -0.5,
  },
  formContainer: {
    gap: 16,
    marginTop: 10,
  },
  inputCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  iconNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconPickerBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInputBox: {
    fontSize: 32,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  nameInputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameInputLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  nameInput: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    padding: 0,
  },
  limitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  limitInputLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  limitInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    color: '#888',
    fontSize: 32,
    fontWeight: '600',
    marginRight: 8,
  },
  limitInput: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '700',
    flex: 1,
    padding: 0,
  },
  buttonWrapper: {
    marginTop: 32,
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
