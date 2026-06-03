import { palette } from '../../constants/palette';

export const documentStyles = {
  documentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  docBox: {
    flex: 1,
    minHeight: 128,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderStyle: 'dashed',
    borderColor: '#b7bec8',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  docBoxSelected: {
    borderColor: palette.gold,
    backgroundColor: '#fbfaf4',
  },
  docCameraIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  docIcon: {
    color: '#69717d',
    fontSize: 26,
    marginBottom: 10,
  },
  docPreview: {
    width: '100%',
    height: 58,
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: '#d9dde3',
  },
  docTitle: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
    textAlign: 'center',
  },
  docHint: {
    color: '#6f747e',
    fontSize: 8,
    lineHeight: 11,
    textAlign: 'center',
  },
};