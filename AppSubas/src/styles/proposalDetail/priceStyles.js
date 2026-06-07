import { palette } from '../../../constants/palette';

export const priceStyles = {
    priceBlock: {
        marginHorizontal: 20,
        marginTop: 24,
        backgroundColor: '#fff',
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    priceLabel: {
        color: palette.muted,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.4,
        marginBottom: 6,
    },
    priceAmount: {
        color: palette.ink,
        fontSize: 36,
        fontWeight: '900',
        lineHeight: 40,
    },
    priceCurrency: {
        color: palette.muted,
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
        marginBottom: 16,
    },
    priceDivider: {
        height: 1,
        backgroundColor: palette.line,
        marginVertical: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceRowLabel: {
        color: '#555',
        fontSize: 13,
        flex: 1,
    },
    priceRowValue: {
        color: palette.ink,
        fontSize: 13,
        fontWeight: '600',
    },
    priceEstLabel: {
        color: palette.ink,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
        lineHeight: 15,
        flex: 1,
    },
    priceEstValue: {
        color: palette.gold,
        fontSize: 15,
        fontWeight: '900',
    },
};