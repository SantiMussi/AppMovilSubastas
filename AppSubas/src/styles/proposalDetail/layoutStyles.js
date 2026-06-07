import { palette } from '../../../constants/palette';

export const layoutStyles = {
    stage: {
        flex: 1,
        backgroundColor: palette.paper,
    },
    backRow: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: palette.paper,
    },
    backText: {
        color: palette.gold,
        fontSize: 13,
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 48,
    },
    stateBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 16,
    },
    errorText: {
        color: palette.danger,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    retryBtn: {
        backgroundColor: palette.ink,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    retryBtnText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
};