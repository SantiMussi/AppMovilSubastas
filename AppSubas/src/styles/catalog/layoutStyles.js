import { palette } from '../../constants/palette';

export const layoutStyles = {
    stage:        { flex: 1, backgroundColor: palette.paper },
    scroll:       { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 48 },
    stateBox:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
    stateText:    { color: palette.muted, fontSize: 13, textAlign: 'center', paddingHorizontal: 32 },
    retryButton:  { marginTop: 4, paddingVertical: 10, paddingHorizontal: 28, backgroundColor: palette.navy },
    retryText:    { color: '#fff', fontSize: 10, letterSpacing: 1.4, fontWeight: '700' },
};