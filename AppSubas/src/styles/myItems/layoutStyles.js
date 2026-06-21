import { palette } from '../../constants/palette';

export const layoutStyles = {
    stage: {
        flex: 1,
        backgroundColor: palette.paper,
    },
    stickyHeader: {
        backgroundColor: palette.paper,
        paddingHorizontal: 22,
        paddingTop: 24,
        paddingBottom: 0,
        zIndex: 10,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 48,
    },
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