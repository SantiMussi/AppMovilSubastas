import { Dimensions, Platform } from 'react-native';
import { palette } from '../../constants/palette';

const serifFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
const CARD_WIDTH = Dimensions.get('window').width - 44; // pantalla - padding horizontal

export const cardStyles = {
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 4,
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    imageWrap: {
        width: '100%',
        height: CARD_WIDTH * 0.72,
        backgroundColor: palette.field,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.field,
    },
    imagePlaceholderText: {
        fontSize: 40,
        color: palette.line,
    },

    arrowBtn: {
        position: 'absolute',
        top: '50%',
        marginTop: -18,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowLeft:  { left: 10 },
    arrowRight: { right: 10 },
    arrowText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 22,
    },
    imageCounter: {
        position: 'absolute',
        bottom: 8,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    imageCounterText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },

    info: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoLeft: {
        flex: 1,
    },
    eyebrow: {
        color: palette.gold,
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1.8,
        marginBottom: 4,
    },
    productTitle: {
        fontFamily: serifFont,
        fontSize: 17,
        fontWeight: '700',
        color: palette.ink,
        lineHeight: 22,
    },
    createdAt: {
        fontSize: 11,
        color: palette.muted,
        marginTop: 4,
    },
    chevron: {
        fontSize: 20,
        color: palette.muted,
        marginLeft: 10,
    },
};