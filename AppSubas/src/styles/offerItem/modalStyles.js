import { Platform } from 'react-native';
import { palette } from '../../constants/palette';

const serifFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export const modalStyles = {
  // Generic modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7,13,24,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 28,
    paddingVertical: 32,
    width: '100%',
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    gap: 16,
  },
  modalTitle: {
    fontFamily: serifFont,
    fontSize: 20,
    fontWeight: '700',
    color: palette.ink,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  cancelLink: {
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 10,
    color: palette.gold,
    fontWeight: '800',
    letterSpacing: 3,
  },
  // Photo preview modal
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7,13,24,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImg: {
    width: '92%',
    height: '72%',
  },
  previewCloseBtn: {
    marginTop: 28,
    paddingVertical: 11,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  previewCloseText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  // Success modal
  successIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheck: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 44,
  },
  successTitle: {
    fontFamily: serifFont,
    fontSize: 22,
    fontWeight: '800',
    color: palette.ink,
    textAlign: 'center',
  },
};