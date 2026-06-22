import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../components/TopBar';
import { useCurrency } from '../context/CurrencyContext';
import { styles } from '../styles/catalogStyles';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=900&auto=format&fit=crop';

// ─── helpers de normalización ────────────────────────────────────────────────

function normalizeList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

function normalizeItem(raw) {
    const producto = raw?.producto || raw?.product || {};
    const id = raw?.identificador || raw?.id || raw?.auctionItemId;
    const precioBase = raw?.precioBase ?? raw?.precio_base ?? raw?.basePrice;
    const subastado = raw?.subastado === 'si' || raw?.subastado === true || raw?.sold === true;
    const fotos = raw?.fotos || raw?.imagenes || raw?.images || producto?.fotos || [];
    const primeraFoto = producto?.imageUrl
        || (Array.isArray(fotos) && fotos.length > 0
            ? (typeof fotos[0] === 'string' ? fotos[0] : fotos[0]?.url || fotos[0]?.uri)
            : null);

    return {
        id,
        lotNumber: raw?.numeroLote || raw?.lotNumber || id || '—',
        title: producto?.descripcionCatalogo || producto?.descripcion_catalogo
            || producto?.nombre || raw?.descripcion || raw?.title
            || `Lote #${id}`,
        description: producto?.descripcionCompleta || producto?.descripcion_completa
            || raw?.descripcionCompleta || raw?.description || '',
        precioBase,
        subastado,
        imageUri: primeraFoto,
        productId: producto?.identificador || producto?.id || raw?.productId,
    };
}

// ─── componente ítem del catálogo ─────────────────────────────────────────────

function CatalogItemCard({ item, onPress, formatGlobalMoney }) {
    const disabled = item.subastado;

    return (
        <Pressable
            style={[styles.card, disabled && styles.cardDisabled]}
            onPress={() => !disabled && onPress(item)}
        >
            <View style={styles.thumb}>
                {item.imageUri ? (
                    <Image
                        source={{ uri: item.imageUri }}
                        style={styles.thumbImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.thumbFallback}>
                        <Ionicons name="image-outline" size={24} color="#B0A99A" />
                    </View>
                )}
            </View>

            <View style={styles.body}>
                <View style={styles.lotRow}>
                    <Text style={styles.lotLabel}>LOTE #{String(item.lotNumber).padStart(3, '0')}</Text>
                    {item.subastado ? (
                        <View style={styles.soldBadge}>
                            <Text style={styles.soldText}>ADJUDICADO</Text>
                        </View>
                    ) : null}
                </View>

                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>

                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Base:</Text>
                    <Text style={styles.priceValue}>
                        {item.precioBase != null
                            ? formatGlobalMoney(item.precioBase)
                            : '—'}
                    </Text>
                </View>
            </View>

            {!disabled && (
                <View style={styles.chevron}>
                    <Text style={styles.chevronText}>›</Text>
                </View>
            )}
        </Pressable>
    );
}

// ─── pantalla principal ──────────────────────────────────────────────────────

export default function CatalogScreen({
    session,
    auctionId,
    auctionTitle,
    onMenuPress,
    onBack,
    onSelectItem,
}) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const mounted = useRef(true);
    const { formatGlobalMoney } = useCurrency();

    const headers = useMemo(() => {
        if (!session?.accessToken) return {};
        return { Authorization: `Bearer ${session.accessToken}` };
    }, [session?.accessToken]);

    // ── carga de datos ──────────────────────────────────────────────────────

    const loadCatalog = useCallback(async () => {
        if (!auctionId) {
            setError('No se recibió un ID de subasta válido.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. obtener los catálogos de la subasta
            const catalogResponse = await fetch(
                `${API_BASE}/api/v1/auctions/${auctionId}/catalog`,
                { headers },
            );

            if (catalogResponse.status === 204) {
                setItems([]);
                setLoading(false);
                return;
            }

            if (!catalogResponse.ok) {
                throw new Error('No se pudo obtener el catálogo de la subasta.');
            }

            const catalogPayload = await catalogResponse.json();
            const catalogs = normalizeList(catalogPayload);

            if (catalogs.length === 0) {
                setItems([]);
                setLoading(false);
                return;
            }

            // 2. obtener los ítems de cada catálogo y aplanar
            const itemArrays = await Promise.all(
                catalogs.map(async (catalog) => {
                    const catalogId = catalog?.identificador || catalog?.id;
                    if (!catalogId) return [];

                    const itemsResponse = await fetch(
                        `${API_BASE}/api/v1/catalogs/${catalogId}/items`,
                        { headers },
                    );

                    if (!itemsResponse.ok || itemsResponse.status === 204) return [];

                    const itemsPayload = await itemsResponse.json();
                    return normalizeList(itemsPayload).map(normalizeItem);
                }),
            );

            const allItems = itemArrays.flat();


            if (mounted.current) {
                setItems(allItems);
            }
        } catch (err) {
            if (mounted.current) {
                setError(err.message || 'No se pudo cargar el catálogo.');
            }
        } finally {
            if (mounted.current) {
                setLoading(false);
            }
        }
    }, [auctionId, headers]);

    useEffect(() => {
        mounted.current = true;
        loadCatalog();
        return () => { mounted.current = false; };
    }, [loadCatalog]);

    // ── render de estado ────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={styles.stage}>
                <TopBar onMenuPress={onMenuPress} onBack={onBack} />
                <View style={styles.stateBox}>
                    <ActivityIndicator size="large" color="#9A7720" />
                    <Text style={styles.stateText}>Cargando catálogo…</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.stage}>
                <TopBar onMenuPress={onMenuPress} onBack={onBack} />
                <View style={styles.stateBox}>
                    <Ionicons name="alert-circle-outline" size={36} color="#B22222" />
                    <Text style={styles.stateText}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={loadCatalog}>
                        <Text style={styles.retryText}>REINTENTAR</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    const available = items.filter((i) => !i.subastado);
    const sold = items.filter((i) => i.subastado);

    return (
        <View style={styles.stage}>
            <TopBar onMenuPress={onMenuPress} onBack={onBack} />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Encabezado */}
                <Text style={styles.eyebrow}>SUBASTA · CATÁLOGO</Text>
                <Text style={styles.screenTitle}>{auctionTitle || `Subasta #${auctionId}`}</Text>
                <Text style={styles.subtitle}>
                    Seleccioná un lote para ver el detalle y pujar.
                </Text>

                <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                        {items.length} {items.length === 1 ? 'LOTE' : 'LOTES'} EN CATÁLOGO
                    </Text>
                </View>

                <View style={styles.divider} />

                {items.length === 0 ? (
                    <View style={styles.emptySection}>
                        <Ionicons name="layers-outline" size={36} color="#B0A99A" />
                        <Text style={styles.emptyText}>Este catálogo no tiene ítems disponibles.</Text>
                    </View>
                ) : (
                    <>
                        {/* Ítems disponibles */}
                        {available.length > 0 && (
                            <>
                                <Text style={styles.listHeader}>DISPONIBLES PARA PUJAR</Text>
                                {available.map((item, index) => (
                                    <React.Fragment key={item.id ?? index}>
                                        <CatalogItemCard
                                            item={item}
                                            onPress={(selected) =>
                                                onSelectItem?.(`auctionItemDetail:${auctionId}:${selected.id}`)
                                            }
                                            formatGlobalMoney={formatGlobalMoney}
                                        />
                                        {index < available.length - 1 && <View style={styles.separator} />}
                                    </React.Fragment>
                                ))}
                            </>
                        )}

                        {/* Ítems adjudicados */}
                        {sold.length > 0 && (
                            <>
                                <Text style={[styles.listHeader, { marginTop: available.length > 0 ? 28 : 0 }]}>
                                    ADJUDICADOS
                                </Text>
                                {sold.map((item, index) => (
                                    <React.Fragment key={item.id ?? index}>
                                        <CatalogItemCard
                                            item={item}
                                            onPress={() => {}}
                                            formatGlobalMoney={formatGlobalMoney}
                                        />
                                        {index < sold.length - 1 && <View style={styles.separator} />}
                                    </React.Fragment>
                                ))}
                            </>
                        )}
                    </>
                )}

            </ScrollView>
        </View>
    );
}