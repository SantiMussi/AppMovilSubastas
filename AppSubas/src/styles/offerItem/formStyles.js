import { palette } from '../../constants/palette';

export const formStyles = {
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#777',
    fontSize: 8,
    letterSpacing: 1.6,
    marginBottom: 7,
    fontWeight: '700',
  },
  inputWrap: {
    backgroundColor: palette.field,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    minHeight: 43,
    paddingHorizontal: 12,
    paddingTop: 12,
    color: palette.ink,
    fontSize: 14,
    outlineStyle: 'none',
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  fieldError: {
    color: palette.danger,
    fontSize: 11,
    marginTop: 5,
  },
};