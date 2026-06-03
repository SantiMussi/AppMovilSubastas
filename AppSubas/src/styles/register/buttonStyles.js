import { palette } from '../../constants/palette';

export const buttonStyles = {
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  button: {
    flex: 1,
    minHeight: 49,
    paddingHorizontal: 14,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideButton: {
    width: '100%',
    flex: 0,
  },
  dangerButton: {
    backgroundColor: palette.danger,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.72,
  },
  buttonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3.2,
    textAlign: 'center',
  },
  ghostText: {
    color: '#9ea4ad',
  },
};