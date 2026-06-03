import { palette } from '../../constants/palette';

export const profileStyles = {
  profilePanel: {
    marginTop: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 0,
    paddingTop: 2,
  },
  profileRow: {
    borderBottomColor: '#e5e5e5',
    borderBottomWidth: 1,
    paddingVertical: 15,
  },
  profileLabel: {
    color: palette.gold,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  profileValue: {
    color: '#111',
    fontSize: 15,
    lineHeight: 22,
  },
  legalBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#f2f2f4',
    marginHorizontal: -26,
    paddingHorizontal: 26,
    paddingVertical: 18,
  },
  legalText: {
    flex: 1,
    color: '#60656f',
    fontSize: 12,
    lineHeight: 18,
  },
};