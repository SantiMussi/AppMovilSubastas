import { palette } from '../../constants/palette';

export const modalStyles = {
    // Fondo del modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(7, 13, 24, 0.62)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: {
        backgroundColor: '#fff',
        width: '100%',
        padding: 28,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
    },

    // Icono central
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: palette.field,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
    iconText: {
        fontSize: 24,
    },

    // Textos
    modalTitle: {
        color: palette.ink,
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 24,
    },
    modalSubtitle: {
        color: '#555',
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
        marginBottom: 28,
    },

    // Detalle de ubicación (modal retiro)
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: palette.line,
    },
    locationRowLabel: {
        color: palette.muted,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.1,
        flex: 1,
    },
    locationRowValue: {
        color: palette.ink,
        fontSize: 13,
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },
    locationUpdated: {
        color: palette.muted,
        fontSize: 11,
        marginTop: 12,
        textAlign: 'center',
    },

    // Botones
    modalBtnRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    modalBtnDark: {
        flex: 1,
        backgroundColor: palette.ink,
        paddingVertical: 15,
        alignItems: 'center',
    },
    modalBtnDarkText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.1,
    },
    modalBtnOutline: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: palette.ink,
        paddingVertical: 15,
        alignItems: 'center',
    },
    modalBtnOutlineText: {
        color: palette.ink,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.1,
    },
    modalBtnFull: {
        backgroundColor: palette.ink,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 24,
    },
    modalBtnFullText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.1,
    },
};