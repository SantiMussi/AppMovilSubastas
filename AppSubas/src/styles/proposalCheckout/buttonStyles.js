import { palette } from '../../constants/palette';

export const buttonStyles = {
    btnRow:        { flexDirection: 'row', gap: 10, marginTop: 24 },
    btnDark:       { flex: 1, backgroundColor: palette.ink, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    btnDarkText:   { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    btnOutline:    { flex: 1, borderWidth: 1.5, borderColor: palette.ink, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    btnOutlineText:{ color: palette.ink, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    btnDisabled:   { opacity: 0.5 },
};