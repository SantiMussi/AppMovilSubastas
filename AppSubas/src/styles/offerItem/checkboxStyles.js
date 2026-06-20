import { palette } from '../../constants/palette';

export const checkboxStyles = {
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
    marginTop: 10,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: palette.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#fff',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: palette.navy,
    borderColor: palette.navy,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  declarationText: {
    flex: 1,
    fontSize: 13,
    color: palette.ink,
    lineHeight: 19,
  },
};