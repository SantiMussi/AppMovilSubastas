import { Platform } from 'react-native';

export const registerStyleTokens = {
  pageMaxWidth: 360,
  serifFont: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};