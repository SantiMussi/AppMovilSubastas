import { Dimensions, Platform } from 'react-native';
import { palette } from '../../constants/palette';

const { width, height } = Dimensions.get('window');
const serifFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export const headerStyles = {
    // Imagen
    imageWrap: {
        width: '100%',
        height: height * 0.46,
        backgroundColor: palette.ink,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: '#1a2035',
    },

    // Badge de estado
    badge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(7, 13, 24, 0.78)',
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.4,
    },

    // Flechas del carrusel
    arrowBtn: {
        position: 'absolute',
        top: '50%',
        marginTop: -18,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.42)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowLeft:  { left: 12 },
    arrowRight: { right: 12 },
    arrowText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '400',
        lineHeight: 26,
    },

    // Encabezado textual
    headerSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    eyebrow: {
        color: palette.muted,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.6,
        marginBottom: 6,
    },
    title: {
        fontFamily: serifFont,
        fontSize: 32,
        lineHeight: 38,
        color: palette.ink,
    },

    // Secciones de texto
    section: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 4,
        borderTopWidth: 1,
        borderTopColor: palette.line,
        marginTop: 12,
    },
    sectionLabel: {
        color: palette.gold,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.6,
        marginBottom: 8,
    },
    sectionText: {
        color: palette.ink,
        fontSize: 14,
        lineHeight: 21,
    },
};