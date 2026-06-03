import { registerStyleTokens } from './tokens';

const { pageMaxWidth } = registerStyleTokens;

export const layoutStyles = {
  stage: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboard: {
    flex: 1,
  },
  scrollShell: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 14,
  },
  centerShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
    backgroundColor: '#fff',
  },
  card: {
    width: '100%',
    maxWidth: pageMaxWidth,
    minHeight: 620,
    backgroundColor: '#fff',
    padding: 22,
  },
  roomyCard: {
    paddingHorizontal: 26,
  },
  dimmed: {
    opacity: 0.45,
  },
  tallCard: {
    width: '100%',
    maxWidth: pageMaxWidth,
    minHeight: 0,
    flexGrow: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 22,
    paddingVertical: 34,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
};