import { palette } from '../../constants/palette';
import { registerStyleTokens } from './tokens';

const { serifFont } = registerStyleTokens;

export const headerStyles = {
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 12,
  },
  compactHeader: {
    alignItems: 'stretch',
    marginBottom: 18,
    paddingTop: 6,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    color: '#050505',
    fontFamily: serifFont,
    fontSize: 29,
    fontWeight: '800',
    lineHeight: 31,
    textAlign: 'center',
  },
  eyebrow: {
    color: palette.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: 13,
    textAlign: 'left',
  },
  steps: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  stepLine: {
    width: 42,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#d1d3d4',
  },
  activeLine: {
    backgroundColor: palette.gold,
  },
};