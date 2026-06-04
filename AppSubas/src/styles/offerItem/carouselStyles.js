import { palette } from '../../constants/palette';

export const carouselStyles = {
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  photosSubtitle: {
    flex: 1,
    fontSize: 13,
    color: palette.muted,
    lineHeight: 19,
  },
  photosCounter: {
    fontSize: 11,
    color: palette.muted,
    textAlign: 'right',
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  carousel: {
    marginHorizontal: -22,
    marginBottom: 28,
  },
  carouselContent: {
    paddingHorizontal: 22,
    paddingRight: 38,
  },
  photoSlot: {
    width: 108,
    height: 108,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
  },
  photoSlotFilled: {
    backgroundColor: palette.field,
  },
  photoSlotAdd: {
    backgroundColor: palette.field,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: palette.line,
    borderStyle: 'dashed',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 5,
    alignItems: 'center',
  },
  mainBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  addIcon: {
    fontSize: 30,
    color: palette.muted,
    fontWeight: '200',
  },
};