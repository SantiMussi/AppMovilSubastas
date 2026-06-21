import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../components';
import { useCurrency } from '../context/CurrencyContext';
import { safeJson } from '../utils/safeJson';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const TYPE_STYLES = {
    outbid: {
        label: 'PUJA SUPERADA',
        icon: 'trending-up-outline',
        accent: '#8D6B16',
        iconBg: '#F6F0E2',
        action: 'PUJAR AHORA',
    },
    won: {
        label: 'SUBASTA GANADA',
        icon: 'trophy-outline',
        accent: '#E7AD43',
        iconBg: '#F6C46E',
        action: 'VER COMPRA',
    },
    ending: {
        label: 'SUBASTA POR TERMINAR',
        icon: 'notifications-outline',
        accent: '#9CA3AF',
        iconBg: '#F5F6F8',
        action: 'VER SUBASTA',
    },
    accepted: {
        label: 'PRODUCTO ACEPTADO',
        icon: 'checkmark-done-outline',
        accent: '#6B7280',
        iconBg: '#F1F2F4',
        action: 'IR AL PRODUCTO',
    },
    rejected: {
        label: 'PRODUCTO RECHAZADO',
        icon: 'close-circle-outline',
        accent: '#6B7280',
        iconBg: '#F1F2F4',
        action: 'VER RAZONES',
    },
    fine: {
        label: 'MULTA RECIBIDA',
        icon: 'alert-circle-outline',
        accent: '#B54708',
        iconBg: '#FEF0C7',
        action: 'VER MULTA',
    },
};

export default function NotificationsScreen({ session, onMenuPress, onNavigate }) {
    const { currency } = useCurrency();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const accessToken = session?.accessToken;

    const headers = useMemo(() => (
        accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    ), [accessToken]);

    const fetchJson = useCallback(async (path) => {
        const response = await fetch(`${API_BASE}${path}`, { headers });
        const payload = await safeJson(response);
        if (!response.ok) {
            throw new Error(payload?.message || payload?.error || `No se pudo cargar ${path} (${response.status}).`);
        }
        return payload;
    }, [headers]);

    const loadNotifications = useCallback(async ({ isRefresh = false } = {}) => {
        if (!accessToken) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError('');

        try {
            const [bidsPayload, winsPayload, proposalsPayload, finesPayload] = await Promise.all([
                fetchJson('/api/v1/users/me/bids/history').catch(() => ({ items: [] })),
                fetchJson('/api/v1/users/me/wins').catch(() => ({ ventas: [] })),
                fetchJson('/api/v1/users/me/proposals').catch(() => ({ items: [] })),
                fetchJson('/api/v1/users/me/fines').catch(() => ({ multas: [] })),
            ]);

            const bids = bidsPayload?.items || [];
            const topBidsByItem = await fetchTopBidsForActiveBids(bids, fetchJson);
            const dynamicNotifications = [
                ...buildBidNotifications(bids, topBidsByItem, currency),
                ...buildWinNotifications(winsPayload?.ventas || [], currency),
                ...buildProposalNotifications(proposalsPayload?.items || []),
                ...buildFineNotifications(finesPayload?.multas || [], currency),
            ].sort((a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt));

            setNotifications(dynamicNotifications);
        } catch (loadError) {
            setError(loadError.message || 'No se pudieron cargar las notificaciones.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [accessToken, fetchJson, currency]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const groupedNotifications = useMemo(() => groupNotifications(notifications), [notifications]);

    const handleActionPress = (notification) => {
        if (!notification.route) return;
        onNavigate?.(notification.route);
    };

    return (
        <View style={styles.screen}>
            <TopBar onMenuPress={onMenuPress} />

            <View style={styles.titleRow}>
                <Text style={styles.title}>Notificaciones</Text>
                <Pressable accessibilityLabel="Más opciones" hitSlop={10} style={styles.headerButton}>
                    <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
                </Pressable>
            </View>

            {loading ? (
                <View style={styles.stateBox}>
                    <ActivityIndicator size="large" color="#8D6B16" />
                    <Text style={styles.stateText}>Cargando notificaciones...</Text>
                </View>
            ) : error ? (
                <View style={styles.stateBox}>
                    <Ionicons name="alert-circle-outline" size={32} color="#B54708" />
                    <Text style={styles.stateText}>{error}</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={[styles.content, notifications.length === 0 && styles.emptyContent]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications({ isRefresh: true })} tintColor="#8D6B16" />}
                    showsVerticalScrollIndicator={false}
                >
                    {notifications.length === 0 ? (
                        <EmptyNotifications />
                    ) : (
                        groupedNotifications.map((section) => (
                            <View key={section.title} style={styles.section}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                {section.data.map((item) => (
                                    <NotificationCard key={item.id} item={item} onActionPress={handleActionPress} />
                                ))}
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}

function NotificationCard({ item, onActionPress }) {
    const visual = TYPE_STYLES[item.kind];

    return (
        <View style={styles.card}>
            <View style={styles.iconColumn}>
                <View style={[styles.iconBox, { backgroundColor: visual.iconBg }]}>
                    <Ionicons name={visual.icon} size={19} color={visual.accent} />
                </View>
                <View style={[styles.unreadDot, { backgroundColor: visual.accent }]} />
            </View>
            <View style={styles.cardBody}>
                <View style={styles.metaRow}>
                    <Text style={[styles.type, { color: visual.accent }]}>{visual.label}</Text>
                    <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
                </View>
                <Text style={styles.message}>{item.message}</Text>
                {visual.action && item.route && (
                    <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]} onPress={() => onActionPress?.(item)}>
                        <Text style={styles.actionText}>{visual.action}</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

function EmptyNotifications() {
    return (
        <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}>
                <Ionicons name="notifications-outline" size={34} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No tenés notificaciones</Text>
            <Text style={styles.emptyText}>Cuando haya novedades sobre tus pujas, subastas ganadas, artículos o multas, las vas a ver acá.</Text>
        </View>
    );
}

async function fetchTopBidsForActiveBids(bids, fetchJson) {
    const activeBids = bids.filter((bid) => String(bid.status || '').toUpperCase() !== 'CERRADA');
    const entries = await Promise.all(activeBids.map(async (bid) => {
        const auctionItemId = getAuctionItemIdFromBid(bid);
        if (!auctionItemId) return null;
        try {
            const topBid = await fetchJson(`/api/v1/auction-items/${auctionItemId}/top-bid`);
            return [String(auctionItemId), topBid];
        } catch (_) {
            return null;
        }
    }));

    return entries.reduce((acc, entry) => {
        if (entry) acc[entry[0]] = entry[1];
        return acc;
    }, {});
}

function buildBidNotifications(bids, topBidsByItem, currency) {
    return bids.flatMap((bid) => {
        const auctionItemId = getAuctionItemIdFromBid(bid);
        const topBid = auctionItemId ? topBidsByItem[String(auctionItemId)] : null;
        const ownAmount = Number(bid.price || bid.importe || 0);
        const topAmount = Number(topBid?.currentBid ?? topBid?.pujaActual ?? topBid?.ofertaActual ?? topBid?.importe ?? 0);
        const title = bid.title || `Lote #${bid.lotNumber || auctionItemId || '—'}`;
        const createdAt = getLatestBidDate(bid) || new Date().toISOString();
        const items = [];

        if (topAmount > ownAmount) {
            items.push({
                id: `outbid-${bid.id || auctionItemId}`,
                kind: 'outbid',
                createdAt,
                route: auctionItemId ? `auctionItemDetail:${auctionItemId}` : 'historial',
                message: `Tu puja por “${title}” fue superada. Tu mejor puja fue ${formatMoneyForCurrency(ownAmount, currency)} y la puja actual es ${formatMoneyForCurrency(topAmount, currency)}.`,
            });
        }

        if (String(bid.status || '').toUpperCase() === 'ACTIVA') {
            items.push({
                id: `ending-${bid.id || auctionItemId}`,
                kind: 'ending',
                createdAt,
                route: auctionItemId ? `auctionItemDetail:${auctionItemId}` : 'auctions',
                message: `La subasta de “${title}” sigue activa. Revisá el lote para no perder la oportunidad.`,
            });
        }

        return items;
    });
}

function buildWinNotifications(wins, currency) {
    return wins.map((win) => {
        const title = win.nombre || `Subasta #${win.subastaId || '—'}`;
        const total = win.total ?? win.montoGanador;
        return {
            id: `won-${win.saleId || win.registroId || win.auctionItemId}`,
            kind: 'won',
            createdAt: new Date().toISOString(),
            route: win.productId ? `productDetail:${win.productId}` : 'coleccion',
            message: `Ganaste la subasta de “${title}” por ${formatMoneyForCurrency(total || 0, currency)}. Completá el pago para sumarlo a tu colección.`,
        };
    });
}

function buildProposalNotifications(proposals) {
    return proposals
        .filter((proposal) => ['aceptada', 'condiciones_aceptadas', 'rechazada', 'condiciones_rechazadas'].includes(String(proposal.status || '').toLowerCase()))
        .map((proposal) => {
            const status = String(proposal.status || '').toLowerCase();
            const accepted = status === 'aceptada' || status === 'condiciones_aceptadas';
            const title = proposal.titulo || `Propuesta #${proposal.proposalId || '—'}`;
            return {
                id: `${accepted ? 'accepted' : 'rejected'}-${proposal.proposalId}`,
                kind: accepted ? 'accepted' : 'rejected',
                createdAt: proposal.createdAt || new Date().toISOString(),
                route: 'misArticulos',
                message: `El producto “${title}” fue ${accepted ? 'aceptado' : 'rechazado'} por nuestros peritos.`,
            };
        });
}

function buildFineNotifications(fines, currency) {
    return fines
        .filter((fine) => String(fine.estado || '').toLowerCase() !== 'paga')
        .map((fine) => {
            const title = fine.descProducto || `Subasta #${fine.subasta?.identificador || '—'}`;
            return {
                id: `fine-${fine.identificador}`,
                kind: 'fine',
                createdAt: fine.fechaEmision || new Date().toISOString(),
                route: fine.identificador ? `fineDetail:${fine.identificador}` : 'fines',
                message: `Recibiste una multa de ${formatMoneyForCurrency(fine.monto || 0, currency)} por no pagar la subasta ganada de “${title}”. Regularizala antes del vencimiento.`,
            };
        });
}


function formatMoneyForCurrency(value, currency) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '';
    }

    let numericalValue = Number(value);
    if (currency === 'ARS') {
        numericalValue *= 1600;
        return numericalValue.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    return numericalValue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function groupNotifications(notifications) {
    const groups = [
        { title: 'HOY', data: [] },
        { title: 'AYER', data: [] },
        { title: 'ESTA SEMANA', data: [] },
        { title: 'ANTERIORES', data: [] },
    ];

    notifications.forEach((notification) => {
        groups[getDateBucketIndex(notification.createdAt)].data.push(notification);
    });

    return groups.filter((group) => group.data.length > 0);
}

function getDateBucketIndex(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 3;
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startNotificationDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const diffDays = Math.floor((startToday - startNotificationDay) / 86400000);
    if (diffDays <= 0) return 0;
    if (diffDays === 1) return 1;
    if (diffDays <= 7) return 2;
    return 3;
}

function getLatestBidDate(bid) {
    const firstHistoryItem = Array.isArray(bid.bidHistory) ? bid.bidHistory[0] : null;
    return firstHistoryItem?.fecha || bid.fecha || bid.createdAt || null;
}

function getAuctionItemIdFromBid(bid) {
    return bid.auctionItemId || bid.itemSubastaId || bid.lotNumber || bid.itemId || null;
}

function getTimeValue(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatRelativeTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 14,
        backgroundColor: '#FFFFFF',
    },
    headerButton: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flex: 1,
        color: '#111827',
        fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
        fontSize: 28,
        fontWeight: '400',
        marginLeft: 3,
    },
    scroll: { flex: 1 },
    content: {
        paddingHorizontal: 14,
        paddingBottom: 34,
    },
    emptyContent: {
        flexGrow: 1,
    },
    section: {
        marginTop: 10,
    },
    sectionTitle: {
        color: '#B5B0A8',
        fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
        fontSize: 12,
        letterSpacing: 4,
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        marginBottom: 22,
    },
    iconColumn: {
        width: 40,
        alignItems: 'center',
        marginRight: 12,
    },
    iconBox: {
        width: 37,
        height: 37,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadDot: {
        position: 'absolute',
        top: -2,
        right: 0,
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    cardBody: {
        flex: 1,
        paddingRight: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    type: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    time: {
        color: '#6B7280',
        fontSize: 9,
    },
    message: {
        color: '#333842',
        fontSize: 13,
        lineHeight: 19,
    },
    actionButton: {
        alignSelf: 'flex-start',
        backgroundColor: '#0B1B2F',
        borderRadius: 1,
        marginTop: 13,
        paddingHorizontal: 22,
        paddingVertical: 10,
    },
    actionButtonPressed: {
        opacity: 0.82,
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.9,
    },
    stateBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 28,
    },
    stateText: {
        color: '#5D6472',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    emptyBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyIcon: {
        width: 66,
        height: 66,
        borderRadius: 18,
        backgroundColor: '#F5F6F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    emptyTitle: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center',
    },
});