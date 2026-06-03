import { StyleSheet } from 'react-native';

import { palette } from '../../constants/palette';
import { registerStyleTokens } from './tokens';

const { pageMaxWidth } = registerStyleTokens;

export const dropdownStyles = {
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dropdownCard: {
    width: '100%',
    maxWidth: pageMaxWidth,
    maxHeight: '70%',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 16,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 20,
  },
  dropdownTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  countryOption: {
    borderBottomColor: '#eceff3',
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  countryOptionSelected: {
    backgroundColor: '#fbfaf4',
  },
  countryOptionText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  countryOptionMeta: {
    color: '#7f8792',
    fontSize: 11,
    marginTop: 3,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
};