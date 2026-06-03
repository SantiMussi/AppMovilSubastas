import { palette } from '../../constants/palette';

export const formStyles = {
  sectionLabel: {
    marginTop: 10,
    marginBottom: 10,
    color: '#636976',
    fontSize: 9,
    letterSpacing: 2.4,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    color: '#777',
    fontSize: 8,
    letterSpacing: 1.6,
    marginBottom: 7,
    fontWeight: '700',
  },
  inputWrap: {
    minHeight: 43,
    backgroundColor: palette.field,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 43,
    paddingHorizontal: 12,
    color: palette.ink,
    fontSize: 14,
    outlineStyle: 'none',
  },
  inputRight: {
    paddingRight: 12,
  },
  eye: {
    color: palette.muted,
    fontSize: 18,
  },
  select: {
    minHeight: 43,
    marginBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: palette.field,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectError: {
    borderColor: palette.danger,
    borderWidth: 1,
  },
  selectText: {
    flex: 1,
    color: palette.ink,
    fontSize: 14,
  },
  selectPlaceholder: {
    color: '#8d95a1',
  },
  chevron: {
    color: '#65707f',
    fontSize: 18,
  },
  fieldError: {
    color: palette.danger,
    fontSize: 10,
    marginBottom: 8,
  },
};