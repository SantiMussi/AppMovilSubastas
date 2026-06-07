import { Platform } from 'react-native';
import { palette } from '../../constants/palette';

const serifFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export const headerStyles = {
    screenTitle: {
        fontFamily: serifFont,
        fontSize: 32,
        fontWeight: '800',
        color: palette.ink,
        marginBottom: 18,
        letterSpacing: -0.5,
    },
};