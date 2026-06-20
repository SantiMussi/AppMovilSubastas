import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { TopBar }    from '../components/TopBar';
import { palette }   from '../constants/palette';
import { styles }    from '../styles/myItemsStyles';
import { safeJson }  from '../utils/safeJson';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

// ── Tabs ──────────────────────────────────────────────────────────

const TABS = [
    { key: 'en_revision',       label: 'En Revisión' },
    { key: 'pendiente',         label: 'Pendiente'   },
    { key: 'aceptado',          label: 'Aceptado'    },
    { key: 'rechazado_empresa', label: 'Rechazado'   }, // antes: 'rechazado'
    { key: 'rechazado_usuario', label: 'Devuelto'    }, // nuevo
];

const STATUS_MAP = {
    en_revision:           'en_revision',
    aceptada:              'pendiente',
    condiciones_aceptadas: 'aceptado',
    rechazada:             'rechazado_empresa',     // solo empresa
    condiciones_rechazadas:'rechazado_usuario',     // usuario rechazó precio, sin elegir aún
    retiro_sucursal:       'rechazado_usuario',     // ya eligió sucursal → misma pestaña
    envio_solicitado:      'rechazado_usuario',     // ya eligió envío → misma pestaña
};

const resolveTab = (status) => STATUS_MAP[status] ?? 'en_revision';

const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Screen ────────────────────────────────────────────────────────

export default function MyItemsScreen({ session, onMenuPress, onProductPress }) {
    const [activeTab,  setActiveTab]  = useState('en_revision');
    const [items,      setItems]      = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error,      setError]      = useState('');

    const [imageIndexes,     setImageIndexes]     = useState({});
    const [photosByProposal, setPhotosByProposal] = useState({});

    const accessToken = session?.accessToken;

    const fetchItems = useCallback(async ({ isRefresh = false } = {}) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError('');

        try {
            const headers = { Authorization: `Bearer ${accessToken}` };
            const response = await fetch(`${API_BASE}/api/v1/users/me/proposals`, { headers });
            const payload  = await safeJson(response);
            if (!response.ok) throw new Error(payload?.message ?? `Error ${response.status}`);

            const list = payload?.items ?? [];
            setItems(list);

            const photosMap = {};
            await Promise.all(
                list.map(async (item) => {
                    try {
                        const res    = await fetch(`${API_BASE}/api/v1/proposals/${item.proposalId}/photos`, { headers });
                        const photos = await safeJson(res);
                        if (res.ok && Array.isArray(photos)) {
                            photosMap[item.proposalId] = photos;
                        }
                    } catch (_) {}
                })
            );
            setPhotosByProposal(photosMap);

        } catch (e) {
            setError(e.message ?? 'No se pudieron cargar tus artículos.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [accessToken]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const filteredItems = items.filter((item) => resolveTab(item.status) === activeTab);

    // ── Carrusel de imágenes por tarjeta ─────────────────────────

    const getIndex = (proposalId) => imageIndexes[proposalId] ?? 0;

    const prevImage = (proposalId) => {
        setImageIndexes((prev) => ({
            ...prev,
            [proposalId]: Math.max(0, (prev[proposalId] ?? 0) - 1),
        }));
    };

    const nextImage = (proposalId, total) => {
        setImageIndexes((prev) => ({
            ...prev,
            [proposalId]: Math.min(total - 1, (prev[proposalId] ?? 0) + 1),
        }));
    };

    // ── Render tarjeta ────────────────────────────────────────────

    const renderItem = ({ item }) => {
        const images       = (photosByProposal[item.proposalId] ?? []).map(b64 => `data:image/jpeg;base64,${b64}`);
        const hasImages    = images.length > 0;
        const currentIndex = getIndex(item.proposalId);
        const currentImage = images[currentIndex];

        return (
            <View style={styles.card}>
                {/* ── Bloque imagen ── */}
                <View style={styles.imageWrap}>
                    {hasImages && currentImage ? (
                        <Image source={{ uri: currentImage }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>🖼</Text>
                        </View>
                    )}

                    {hasImages && images.length > 1 && (
                        <>
                            {currentIndex > 0 && (
                                <TouchableOpacity
                                    style={[styles.arrowBtn, styles.arrowLeft]}
                                    onPress={() => prevImage(item.proposalId)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.arrowText}>‹</Text>
                                </TouchableOpacity>
                            )}
                            {currentIndex < images.length - 1 && (
                                <TouchableOpacity
                                    style={[styles.arrowBtn, styles.arrowRight]}
                                    onPress={() => nextImage(item.proposalId, images.length)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.arrowText}>›</Text>
                                </TouchableOpacity>
                            )}
                            <View style={styles.imageCounter}>
                                <Text style={styles.imageCounterText}>{currentIndex + 1} / {images.length}</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* ── Bloque info (tappable → detalle) ── */}
                <Pressable
                    style={({ pressed }) => [styles.info, pressed && { opacity: 0.7 }]}
                    onPress={() => onProductPress?.(item)}
                >
                    <View style={styles.infoLeft}>
                        <Text style={styles.eyebrow}>LOTE EN CONSIGNACIÓN</Text>
                        <Text style={styles.productTitle}>{item.titulo}</Text>
                        <Text style={styles.createdAt}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </Pressable>
            </View>
        );
    };

    // ── Render vacío ─────────────────────────────────────────────

    const renderEmpty = () => {
        if (loading) return null;
        const messages = {
            en_revision:       'No tenés artículos en revisión.',
            pendiente:         'No tenés artículos pendientes de respuesta.',
            aceptado:          'No tenés artículos aceptados.',
            rechazado_empresa: 'No tenés artículos rechazados por la empresa.',
            rechazado_usuario: 'No tenés artículos devueltos.',
        };
        return (
            <View style={styles.stateBox}>
                <Text style={styles.stateText}>{messages[activeTab]}</Text>
            </View>
        );
    };

    // ── Layout ────────────────────────────────────────────────────

    return (
        <View style={styles.stage}>
            <TopBar onMenuPress={onMenuPress} />

            <View style={styles.stickyHeader}>
                <Text style={styles.screenTitle}>Mis Propuestas</Text>

                <View style={styles.tabsContainer}>
                    {TABS.map((tab) => {
                        const active = activeTab === tab.key;
                        return (
                            <Pressable
                                key={tab.key}
                                style={[styles.tab, active && styles.tabActive]}
                                onPress={() => setActiveTab(tab.key)}
                            >
                                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                                    {tab.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {loading ? (
                <View style={styles.stateBox}>
                    <ActivityIndicator size="large" color={palette.gold} />
                    <Text style={styles.stateText}>Cargando tus artículos...</Text>
                </View>
            ) : error ? (
                <View style={styles.stateBox}>
                    <Text style={styles.stateText}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    data={filteredItems}
                    keyExtractor={(item) => String(item.proposalId)}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchItems({ isRefresh: true })}
                            tintColor={palette.gold}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}