import { palette } from '../../constants/palette';

export const shippingStyles = {
    shippingOption:   { borderWidth: 1, borderColor: palette.line, padding: 16, marginBottom: 10, backgroundColor: '#fff' },
    shippingSelected: { borderColor: palette.navy, backgroundColor: palette.field },
    shippingRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    shippingInfo:     { flex: 1 },
    shippingLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    shippingLabel:    { color: palette.ink, fontSize: 13, fontWeight: '700' },
    shippingDesc:     { color: palette.muted, fontSize: 12, lineHeight: 17 },
    shippingPrice:    { color: palette.ink, fontSize: 14, fontWeight: '900' },
    premiumBadge:     { backgroundColor: palette.navy, paddingHorizontal: 6, paddingVertical: 2 },
    premiumBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
    termsNote:        { color: palette.muted, fontSize: 11, lineHeight: 16, marginTop: 20, marginBottom: 8, textAlign: 'center' },
};