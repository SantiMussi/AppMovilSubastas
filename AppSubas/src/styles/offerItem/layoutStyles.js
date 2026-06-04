import { palette } from '../../constants/palette';

export const layoutStyles = {
  stage: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 52,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248,248,250,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
};