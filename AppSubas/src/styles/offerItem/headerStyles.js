import { Platform } from 'react-native';
import { palette } from '../../constants/palette';

const serifFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export const headerStyles = {
  eyebrow: {
    color: palette.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  screenTitle: {
    fontFamily: serifFont,
    fontSize: 28,
    fontWeight: '800',
    color: palette.ink,
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontFamily: serifFont,
    fontSize: 20,
    fontWeight: '700',
    color: palette.ink,
    marginBottom: 18,
  },
  infoBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.field,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: {
    fontStyle: 'italic',
    fontSize: 17,
    color: palette.muted,
    fontWeight: '600',
  },
};