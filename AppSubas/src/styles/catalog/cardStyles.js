import { palette } from '../../constants/palette';

export const cardStyles = {
    card:           { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 2, overflow: 'hidden' },
    cardDisabled:   { opacity: 0.55 },
    thumb:          { width: 88, height: 88 },
    thumbImage:     { width: 88, height: 88 },
    thumbFallback:  { width: 88, height: 88, backgroundColor: '#EDE9E1', alignItems: 'center', justifyContent: 'center' },
    body:           { flex: 1, paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'space-between' },
    lotRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    lotLabel:       { color: palette.gold, fontSize: 8, fontWeight: '900', letterSpacing: 1.6 },
    soldBadge:      { backgroundColor: '#F0EBE1', paddingHorizontal: 6, paddingVertical: 2 },
    soldText:       { color: palette.muted, fontSize: 7, fontWeight: '700', letterSpacing: 1 },
    itemTitle:      { color: palette.ink, fontSize: 13, fontWeight: '700', lineHeight: 17, marginBottom: 6 },
    priceRow:       { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    priceLabel:     { color: palette.muted, fontSize: 9 },
    priceValue:     { color: palette.ink, fontSize: 13, fontWeight: '900', fontFamily: 'serif' },
    chevron:        { paddingLeft: 10, paddingRight: 14, alignSelf: 'center' },
    chevronText:    { color: palette.muted, fontSize: 20 },
};