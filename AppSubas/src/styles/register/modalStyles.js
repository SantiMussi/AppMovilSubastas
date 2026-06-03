import { palette } from '../../constants/palette';
import { registerStyleTokens } from './tokens';

const { serifFont } = registerStyleTokens;

export const modalStyles = {
  modalStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 42,
  },
  fakeBlur: {
    flex: 1,
    minHeight: 360,
    backgroundColor: '#d9d9d9',
    marginTop: 22,
  },
  modalBox: {
    position: 'absolute',
    width: '82%',
    maxWidth: 330,
    backgroundColor: '#fff',
    padding: 26,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 20,
  },
  modalIcon: {
    color: palette.gold,
    fontSize: 28,
    marginBottom: 18,
  },
  modalText: {
    color: '#111',
    fontFamily: serifFont,
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
    marginBottom: 22,
  },
  cancelLink: {
    paddingTop: 22,
  },
  cancelText: {
    color: palette.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
  },
};