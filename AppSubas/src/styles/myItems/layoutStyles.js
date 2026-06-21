import { palette } from '../../constants/palette';

export const layoutStyles = {
    stage: {
        flex: 1,
        backgroundColor: palette.paper,
    },
    // Área fuera del scroll
    stickyHeader: {
        backgroundColor: palette.paper,
        paddingHorizontal: 22,
        paddingTop: 24,
        paddingBottom: 0,
        zIndex: 10,
    },
    // Área scrollable
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 48,
    },
    // Estados vacíos / carga
    stateBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    stateText: {
        fontSize: 14,
        color: palette.muted,
        textAlign: 'center',
        lineHeight: 20,
    },
};