import { palette } from '../../constants/palette';
import { registerStyleTokens } from './tokens';

const { pageMaxWidth, serifFont } = registerStyleTokens;

export const statusStyles = {
  caption: {
    width: '100%',
    maxWidth: pageMaxWidth,
    color: '#969696',
    fontSize: 13,
    marginBottom: 8,
  },
  pendingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: '#020202',
    fontFamily: serifFont,
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 31,
    marginBottom: 18,
    textAlign: 'center',
  },
  heroText: {
    marginHorizontal: 14,
    marginBottom: 18,
    color: '#676b73',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  feedback: {
    color: palette.gold,
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 10,
  },
  securityFields: {
    marginTop: 8,
  },
  policy: {
    color: '#9a9da4',
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
    marginTop: 22,
    paddingHorizontal: 30,
  },
};