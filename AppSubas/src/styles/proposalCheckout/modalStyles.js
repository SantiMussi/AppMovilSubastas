import { palette } from '../../constants/palette';

export const modalStyles = {
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(7,13,24,0.62)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    modalCard:     { backgroundColor: '#fff', width: '100%', padding: 28 },
    successIcon:   { width: 56, height: 56, borderRadius: 28, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20 },
    successCheck:  { color: '#fff', fontSize: 26, fontWeight: '900' },
    modalTitle:    { color: palette.ink, fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
    modalBody:     { color: '#555', fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 24 },
    modalBtn:      { backgroundColor: '#070d18', paddingVertical: 16, alignItems: 'center', justifyContent: 'center', width: '100%'},
};