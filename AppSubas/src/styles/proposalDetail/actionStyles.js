import { palette } from '../../constants/palette';

export const actionStyles = {
    // ── Botones principales ───────────────────────────────────────────
    actionsRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 16,
        gap: 12,
    },
    btnDark: {
        flex: 1,
        backgroundColor: palette.ink,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnDarkText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.2,
    },
    btnOutline: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: palette.ink,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnOutlineText: {
        color: palette.ink,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.2,
    },
    btnPoliza: {
        marginHorizontal: 20,
        marginTop: 12,
        borderWidth: 1.5,
        borderColor: palette.gold,
        paddingVertical: 14,
        alignItems: 'center',
    },
    btnPolizaText: {
        color: palette.gold,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.2,
    },

    // ── Feedback / Notas de curación ──────────────────────────────────
    notasSection: {
        marginHorizontal: 20,
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: palette.line,
        paddingTop: 16,
    },
    notasLabel: {
        color: palette.gold,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.6,
        marginBottom: 8,
    },
    notasText: {
        color: palette.ink,
        fontSize: 14,
        lineHeight: 21,
    },

    // ── Nota de devolución (empresa rechazó) ──────────────────────────
    notaDevolucionBox: {
        marginHorizontal: 20,
        marginTop: 24,
        borderWidth: 1,
        borderColor: palette.line,
        padding: 20,
    },
    notaDevolucionTitle: {
        color: palette.ink,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    notaDevolucionText: {
        color: '#555',
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 16,
    },
    btnEntendido: {
        backgroundColor: palette.ink,
        paddingVertical: 13,
        alignItems: 'center',
    },
    btnEntendidoText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.2,
    },

    // ── Banner "Precio rechazado" (rechazado_usuario en vista retiro) ──
    rejectedBanner: {
        marginHorizontal: 20,
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    rejectedBannerText: {
        color: palette.danger,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
        textAlign: 'center',
    },
    rejectedBannerSub: {
        color: palette.ink,
        fontSize: 12,
        marginTop: 6,
        textAlign: 'center',
        lineHeight: 18,
    },
};