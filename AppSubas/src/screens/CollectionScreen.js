import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../context/CurrencyContext';
import { TopBar } from '../components/TopBar';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get('window');
const CARD_GAP = 14;
const HORIZONTAL_PADDING = 14;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const SORT_OPTIONS = [
    { key: 'name', label: 'Nombre', description: 'Orden alfabético' },
    { key: 'price', label: 'Precio', description: 'Mayor a menor' },
];

export default function CollectionScreen({ session, onMenuPress, onOpenProduct }) {
    const { formatGlobalMoney } = useCurrency();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [filterOpen, setFilterOpen] = useState(false);

    const loadCollection = useCallback(async ({ showRefresh = false } = {}) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/api/v1/users/me/collection`, {
                headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {},
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(payload?.message || payload?.error || `No se pudo cargar la colección (${response.status}).`);
            }
            setCollection(normalizeCollection(payload));
        } catch (requestError) {
            setError(requestError.message || 'No se pudo cargar tu colección.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [session?.accessToken]);

    useEffect(() => {
        loadCollection();
    }, [loadCollection]);

    const items = useMemo(() => {
        const source = collection?.items || [];
        return [...source].sort((a, b) => {
            if (sortBy === 'price') return Number(b.price || 0) - Number(a.price || 0);
            return `${a.name || ''}`.localeCompare(`${b.name || ''}`, 'es', { sensitivity: 'base' });
        });
    }, [collection?.items, sortBy]);

    return (
        <View style={styles.container}>
            <TopBar onMenuPress={onMenuPress} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => loadCollection({ showRefresh: true })} tintColor="#C5A059" />
                }
            >
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>Mi Colección</Text>
                    <Pressable
                        onPress={() => setFilterOpen(true)}
                        hitSlop={10}
                        style={styles.filterBtn}
                        accessibilityLabel="Filtrar colección"
                    >
                        <Ionicons name="filter-outline" size={20} color="#111111" />
                    </Pressable>
                </View>
                <View style={styles.portfolioCard}>
                    <Text style={styles.portfolioLabel}>VALOR DEL PORTFOLIO</Text>
                    <Text style={styles.portfolioValue}>{formatGlobalMoney(collection?.portfolioValue || 0)}</Text>
                    <Text style={styles.portfolioCount}>{collection?.acquisitions || 0} Adquisiciones</Text>
                </View>

                {loading ? (
                    <StateBox icon="hourglass-outline" title="Cargando colección..." loading />
                ) : error ? (
                    <StateBox icon="alert-circle-outline" title={error} actionLabel="REINTENTAR" onAction={() => loadCollection()} />
                ) : items.length === 0 ? (
                    <StateBox icon="albums-outline" title="Todavía no tenés artículos adquiridos." />
                ) : (
                    <View style={styles.grid}>
                        {items.map((item, index) => (
                            <CollectionCard
                                key={`${item.productId || item.registryId}-${index}`}
                                item={item}
                                imageUri={item.imageUrl}
                                formatMoney={formatGlobalMoney}
                                onOpen={() => onOpenProduct?.(item.productId)}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            <SortModal
                visible={filterOpen}
                selected={sortBy}
                onClose={() => setFilterOpen(false)}
                onSelect={(key) => {
                    setSortBy(key);
                    setFilterOpen(false);
                }}
            />
        </View>
    );
}

function CollectionCard({ item, imageUri, formatMoney, onOpen }) {
    return (
        <View style={styles.itemCard}>
            <View style={styles.imageWrap}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.itemImage} resizeMode="cover" />
                ) : (
                    <ImagePlaceholder compact />
                )}
                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text style={[styles.statusText, isSentStatus(item.status) && styles.statusTextLight]}>{formatStatus(item.status)}</Text>
                </View>
            </View>
            <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>
            <Pressable onPress={onOpen} style={styles.detailsButton} disabled={!item.productId}>
                <Text style={styles.detailsText}>VER DETALLES</Text>
            </Pressable>
        </View>
    );
}

function ImagePlaceholder() {
    return (
        <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={30} color="#C5A059" />
            <Text style={styles.imagePlaceholderText}>SIN FOTO</Text>
        </View>
    );
}

function SortModal({ visible, selected, onClose, onSelect }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.modalBackdrop} onPress={onClose}>
                <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
                    <Text style={styles.modalTitle}>Ordenar colección</Text>
                    {SORT_OPTIONS.map((option) => {
                        const active = selected === option.key;
                        return (
                            <Pressable key={option.key} style={[styles.sortOption, active && styles.sortOptionActive]} onPress={() => onSelect(option.key)}>
                                <View>
                                    <Text style={[styles.sortLabel, active && styles.sortLabelActive]}>{option.label}</Text>
                                    <Text style={styles.sortDescription}>{option.description}</Text>
                                </View>
                                {active ? <Ionicons name="checkmark" size={20} color="#C5A059" /> : null}
                            </Pressable>
                        );
                    })}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

function StateBox({ icon, title, loading, actionLabel, onAction }) {
    return (
        <View style={styles.stateBox}>
            {loading ? <ActivityIndicator size="large" color="#C5A059" /> : <Ionicons name={icon} size={34} color="#C5A059" />}
            <Text style={styles.stateTitle}>{title}</Text>
            {actionLabel ? (
                <Pressable style={styles.retryButton} onPress={onAction}>
                    <Text style={styles.retryText}>{actionLabel}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

function normalizeCollection(payload = {}) {
    const rawItems = Array.isArray(payload.items) ? payload.items : [];
    return {
        portfolioValue: payload.valorPortfolio ?? payload.portfolioValue ?? 0,
        acquisitions: payload.adquisiciones ?? payload.acquisitions ?? rawItems.length,
        items: rawItems.map((item, index) => ({
            registryId: item.registroId ?? item.registryId ?? index,
            productId: item.productId ?? item.productoId,
            name: item.nombre || item.name || 'Artículo adquirido',
            price: item.precio ?? item.price ?? 0,
            status: item.estadoEntrega || item.status || 'en depósito',
            imageUrl: normalizeImageValue(item.imagenUrl || item.imageUrl || item.image),
        })),
    };
}

function normalizeImageValue(value) {
    if (!value) return null;
    if (typeof value === 'string') return value.startsWith('data:') || value.startsWith('http') ? value : `data:image/jpeg;base64,${value}`;
    return value.url || value.uri || null;
}

function formatStatus(status) {
    const normalized = `${status || 'en depósito'}`.trim().toUpperCase();
    return normalized.replace('DEPOSITO', 'DEPÓSITO');
}

function isSentStatus(status) {
    return `${status || ''}`.toLowerCase().includes('envi');
}

function getStatusStyle(status) {
    const normalized = `${status || ''}`.toLowerCase();
    if (normalized.includes('retir')) return styles.statusRetired;
    if (normalized.includes('envi')) return styles.statusSent;
    return styles.statusDeposit;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 18,
        marginBottom: 4,
    },
    pageTitle: { fontFamily: 'serif', fontSize: 24, fontWeight: '900', color: '#111111' },
    filterBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F0F0', borderRadius: 18 },
    iconButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    scrollContent: { paddingHorizontal: HORIZONTAL_PADDING, paddingBottom: 34 },
    portfolioCard: {
        marginTop: 30,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 6,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    portfolioLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 2.3, color: '#8B6A32', marginBottom: 6 },
    portfolioValue: { fontFamily: 'serif', fontSize: 24, fontWeight: '900', color: '#050505', lineHeight: 30 },
    portfolioCount: { fontSize: 11, color: '#4F4F4F', marginTop: 2 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: CARD_GAP, rowGap: 30 },
    itemCard: { width: CARD_WIDTH },
    imageWrap: { width: CARD_WIDTH, height: CARD_WIDTH * 0.94, backgroundColor: '#111111', borderRadius: 2, overflow: 'hidden' },
    itemImage: { width: '100%', height: '100%' },
    imagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111' },
    imagePlaceholderText: { color: '#C5A059', fontSize: 8, fontWeight: '900', letterSpacing: 1.6, marginTop: 8 },
    statusBadge: { position: 'absolute', top: 7, right: 7, paddingHorizontal: 8, paddingVertical: 4 },
    statusDeposit: { backgroundColor: '#FFFFFF' },
    statusRetired: { backgroundColor: '#F3F3F3' },
    statusSent: { backgroundColor: '#7A5A20' },
    statusText: { fontSize: 7, fontWeight: '900', letterSpacing: 1.2, color: '#6F5120' },
    statusTextLight: { color: '#FFFFFF' },
    itemName: { fontFamily: 'serif', fontSize: 14, fontWeight: '900', color: '#0B0B0B', marginTop: 10, minHeight: 34 },
    itemPrice: { fontSize: 12, color: '#8B6A32', marginTop: 2 },
    detailsButton: { alignSelf: 'flex-start', marginTop: 4, borderBottomWidth: 1, borderBottomColor: '#D7D7D7', paddingBottom: 3 },
    detailsText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.4, color: '#8B8B8B' },
    stateBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 54, paddingHorizontal: 22 },
    stateTitle: { color: '#555555', fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 20 },
    retryButton: { marginTop: 18, backgroundColor: '#0A1628', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 4 },
    retryText: { color: '#C5A059', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 62, paddingRight: 14 },
    modalCard: { width: 220, borderRadius: 10, backgroundColor: '#FFFFFF', padding: 14, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, elevation: 8 },
    modalTitle: { fontFamily: 'serif', fontSize: 17, fontWeight: '900', color: '#111111', marginBottom: 8 },
    sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, paddingHorizontal: 10, borderRadius: 8 },
    sortOptionActive: { backgroundColor: '#FAF6ED' },
    sortLabel: { fontSize: 13, fontWeight: '800', color: '#111111' },
    sortLabelActive: { color: '#8B6A32' },
    sortDescription: { fontSize: 11, color: '#777777', marginTop: 2 },
});