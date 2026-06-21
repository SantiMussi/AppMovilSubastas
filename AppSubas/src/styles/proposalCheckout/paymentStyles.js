import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;
const CARD_GAP   = 12;
const BANK_COLORS = { default: { bg: '#F0EDE8', icon: '#8B7355' } };

export const paymentStyles = {
    // ── Carrusel ──────────────────────────────────────────────────────
    carousel:        { marginHorizontal: -22, marginBottom: 4 },
    carouselContent: { paddingHorizontal: 22, paddingRight: 38 },

    // ── Outer wrappers ────────────────────────────────────────────────
    cardOuter:     { width: CARD_WIDTH, marginRight: CARD_GAP },
    cardSelected:  { borderWidth: 2, borderColor: '#111' },

    // ── Tarjeta de crédito ────────────────────────────────────────────
    creditCard: {
        width: '100%',
        borderRadius: 14,
        padding: 20,
        minHeight: 180,
        justifyContent: 'space-between',
        overflow: 'hidden',
        ...Platform.select({
            ios:     { shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12 },
            android: { elevation: 6 },
        }),
    },
    creditCardTopRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    creditCardBrand:     { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    creditCardNumber:    { fontSize: 19, fontWeight: '600', letterSpacing: 3, marginBottom: 20, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    creditCardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    creditCardLabel:     { fontSize: 8, fontWeight: '700', letterSpacing: 1.2, marginBottom: 3 },
    creditCardValue:     { fontSize: 13, fontWeight: '700' },
    decorCircle:         { position: 'absolute', borderRadius: 999 },
    decorCircle1:        { width: 150, height: 150, top: -30, right: -40 },
    decorCircle2:        { width: 100, height: 100, bottom: -20, left: -20 },

    // ── Indicador de selección ────────────────────────────────────────
    selectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f7b600' },
    selectedDotContainer: { position: 'absolute', bottom: 16, right: 16, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },

    // ── Cuenta bancaria ───────────────────────────────────────────────
    bankCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        ...Platform.select({
            ios:     { shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    bankCardRow:  { flexDirection: 'row', alignItems: 'center' },
    bankIcon:     { width: 44, height: 44, borderRadius: 10, backgroundColor: BANK_COLORS.default.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    bankCardInfo: { flex: 1 },
    bankName:     { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 2 },
    bankAccount:  { fontSize: 12, color: '#888' },
    selectedDotContainerBank: { position: 'absolute', bottom: 16, right: 16 },
    verifiedBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#C8E6C9' },
    verifiedText:  { fontSize: 9, fontWeight: '900', color: '#2E7D32', letterSpacing: 0.5 },

    // ── Cheque ────────────────────────────────────────────────────────
    chequeCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 130,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        ...Platform.select({
            ios:     { shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    chequeCardOuter: { width: CARD_WIDTH * 0.55, marginRight: CARD_GAP },
    chequeId:        { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 6 },

    // ── Sin métodos ───────────────────────────────────────────────────
    emptyPayments:     { backgroundColor: '#F9F9F9', borderRadius: 8, borderWidth: 1, borderColor: '#EEE', padding: 16 },
    emptyPaymentsText: { color: '#888', fontSize: 13, lineHeight: 20, textAlign: 'center' },

    // ── Dirección ─────────────────────────────────────────────────────
    addressBox:  { backgroundColor: '#f1f1f3', padding: 16, marginBottom: 4 },
    addressText: { color: '#070d18', fontSize: 13, lineHeight: 20 },

    // ── Resumen ───────────────────────────────────────────────────────
    summaryBox:   { borderWidth: 1, borderColor: '#dddddf', padding: 16, marginBottom: 4 },
    summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
    summaryLabel: { color: '#7b8089', fontSize: 13 },
    summaryValue: { color: '#070d18', fontSize: 13, fontWeight: '700' },
    totalLabel:   { color: '#070d18', fontWeight: '700' },
    totalValue:   { color: '#070d18', fontSize: 16, fontWeight: '900' },
    divider:      { height: 1, backgroundColor: '#dddddf', marginVertical: 4 },
};