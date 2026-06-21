import { palette } from '../../constants/palette';

export const headerStyles = {
    eyebrow:      { color: palette.muted, fontSize: 9, letterSpacing: 1.8, fontWeight: '700', marginBottom: 6 },
    screenTitle:  { color: palette.ink, fontFamily: 'serif', fontSize: 28, lineHeight: 32, marginBottom: 4 },
    subtitle:     { color: palette.muted, fontSize: 12, lineHeight: 18, marginBottom: 20 },
    countBadge:   { alignSelf: 'flex-start', backgroundColor: palette.navy, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 20 },
    countText:    { color: '#fff', fontSize: 9, letterSpacing: 1.2, fontWeight: '700' },
    divider:      { height: 1, backgroundColor: '#E8E4DC', marginBottom: 18 },
};