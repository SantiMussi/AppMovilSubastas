import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../context/CurrencyContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export default function ProductDetailScreen({ session, productId, onBack }) {
    const { currency, formatGlobalMoney } = useCurrency();
    const [detail, setDetail] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchJson = useCallback(async (path) => {
        const response = await fetch(`${API_BASE}${path}`, {
            headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {},
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(payload?.message || payload?.error || `No se pudo cargar ${path} (${response.status}).`);
        }
        return payload;
    }, [session?.accessToken]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError('');
            try {
                const [productPayload, photosPayload] = await Promise.all([
                    fetchJson(`/api/v1/products/${productId}`),
                    fetchJson(`/api/v1/products/${productId}/photos`).catch(() => null),
                ]);
                setDetail(productPayload);
                const firstPhoto = Array.isArray(photosPayload?.items) ? photosPayload.items[0] : null;
                setImageUrl(firstPhoto?.url || null);
            } catch (requestError) {
                setError(requestError.message || 'No se pudo cargar el detalle del producto.');
            } finally {
                setLoading(false);
            }
        })();
    }, [fetchJson, productId]);

    const display = useMemo(() => buildDisplayData(detail), [detail]);

    return (
        <View style={styles.container}>
            <DetailTopBar onBack={onBack} currency={currency} />

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#C5A059" />
                    <Text style={styles.stateText}>Cargando detalle...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerBox}>
                    <Ionicons name="alert-circle-outline" size={34} color="#B22222" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.heroPlaceholder}>
                            <Ionicons name="image-outline" size={46} color="#C5A059" />
                            <Text style={styles.heroPlaceholderText}>SIN FOTO DISPONIBLE</Text>
                        </View>
                    )}

                    <Text style={styles.metaText}>{display.auctionLabel}</Text>
                    <Text style={styles.productName}>{display.title}</Text>

                    <InfoSection title="DESCRIPCIÓN">
                        <Text style={styles.description}>{display.description}</Text>
                    </InfoSection>

                    <PriceCard
                        detail={detail}
                        formatMoney={formatGlobalMoney}
                        currency={currency}
                    />
                </ScrollView>
            )}
        </View>
    );
}

function DetailTopBar({ onBack, currency }) {
    return (
        <View style={styles.topBar}>
            <Pressable onPress={onBack} hitSlop={10} style={styles.menuButton} accessibilityLabel="Volver">
                <Ionicons name="menu-outline" size={22} color="#111111" />
            </Pressable>
            <View style={styles.brandWrap}>
                <Text style={styles.brandIcon}>◇</Text>
                <View>
                    <Text style={styles.brandText}>VANTAGE</Text>
                    <Text style={styles.brandSub}>FINE AUCTIONS</Text>
                </View>
            </View>
            <View style={styles.currencyPill}>
                <Text style={styles.currencyText}>{currency || 'USD'}</Text>
            </View>
        </View>
    );
}

function InfoSection({ title, children }) {
    return (
        <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>{title}</Text>
            {children}
        </View>
    );
}

function PriceCard({ detail, formatMoney, currency }) {
    const mainPrice = detail?.precioBasePropuesto || detail?.precioAdjudicado || detail?.valorEstimado;
    const commission = detail?.comisionVenta;
    const estimated = detail?.valorEstimado || mainPrice;

    return (
        <View style={styles.priceCard}>
            <Text style={styles.priceEyebrow}>PRECIO BASE PROPUESTO</Text>
            <Text style={styles.priceMain}>{formatMoney(mainPrice || 0)}</Text>
            <Text style={styles.priceCurrency}>{currency || 'USD'}</Text>

            <View style={styles.priceRows}>
                <PriceRow label="Comisión de Venta (12%)" value={commission ? formatMoney(commission) : 'No informado'} />
                <PriceRow label="Seguro & Administración" value={detail?.seguroAdministracion || 'No incluido'} />
            </View>

            <View style={styles.estimatedRow}>
                <Text style={styles.estimatedLabel}>VALOR{`\n`}ESTIMADO</Text>
                <Text style={styles.estimatedValue}>{formatMoney(estimated || 0)}</Text>
            </View>
        </View>
    );
}

function PriceRow({ label, value }) {
    return (
        <View style={styles.priceRow}>
            <Text style={styles.priceRowLabel}>{label}</Text>
            <Text style={styles.priceRowValue}>{value}</Text>
        </View>
    );
}

function buildDisplayData(detail) {
    const title = detail?.descripcionCatalogo || detail?.descripcion || 'Artículo adquirido';
    const description = detail?.descripcionCompleta || detail?.historia || 'Sin descripción disponible.';
    const category = formatCategory(detail?.categoriaSubasta);
    const auctionNumber = detail?.subastaId || detail?.productId || '';
    const auctionLabel = `SUBASTA ${auctionNumber}${category ? ` / ${category}` : ''}`;

    return {
        title,
        description,
        auctionLabel,
    };
}

function formatCategory(value) {
    if (!value) return '';
    return `${value}`.replace(/_/g, ' ').toUpperCase();
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    topBar: {
        height: 76,
        paddingTop: 16,
        paddingHorizontal: 18,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    menuButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
    },
    brandWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        flex: 1,
    },
    brandIcon: {
        color: '#C5A059',
        fontSize: 22,
        marginRight: 5,
        lineHeight: 22,
    },
    brandText: {
        color: '#C5A059',
        fontFamily: 'serif',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.5,
        lineHeight: 15,
    },
    brandSub: {
        color: '#C5A059',
        fontSize: 5.5,
        fontWeight: '900',
        letterSpacing: 1.1,
        lineHeight: 7,
    },
    currencyPill: {
        minWidth: 64,
        height: 31,
        backgroundColor: '#F2F2F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    currencyText: {
        color: '#111111',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    centerBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    stateText: {
        color: '#555555',
        fontSize: 14,
        marginTop: 12,
    },
    errorText: {
        color: '#B22222',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
    },
    scrollContent: {
        paddingHorizontal: 22,
        paddingTop: 30,
        paddingBottom: 38,
    },
    heroImage: {
        width: '100%',
        height: 430,
        backgroundColor: '#101010',
    },
    heroPlaceholder: {
        width: '100%',
        height: 430,
        backgroundColor: '#101010',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroPlaceholderText: {
        color: '#C5A059',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.8,
        marginTop: 10,
    },
    metaText: {
        marginTop: 35,
        color: '#7E7E7E',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    productName: {
        marginTop: 18,
        color: '#171717',
        fontFamily: 'serif',
        fontSize: 32,
        fontWeight: '900',
        lineHeight: 35,
    },
    sectionBlock: {
        marginTop: 28,
    },
    sectionLabel: {
        color: '#9B7A3C',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.1,
        marginBottom: 12,
    },
    description: {
        color: '#575757',
        fontSize: 13,
        lineHeight: 21,
    },
    priceCard: {
        marginTop: 30,
        backgroundColor: '#FFFFFF',
        paddingTop: 27,
        paddingHorizontal: 36,
        paddingBottom: 26,
        shadowColor: '#000000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 12,
        elevation: 2,
    },
    priceEyebrow: {
        color: '#B0B0B0',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 3.2,
        textAlign: 'center',
        marginBottom: 12,
    },
    priceMain: {
        color: '#050505',
        fontFamily: 'serif',
        fontSize: 38,
        fontWeight: '900',
        lineHeight: 43,
    },
    priceCurrency: {
        color: '#111111',
        fontSize: 18,
        lineHeight: 22,
        marginBottom: 18,
    },
    priceRows: {
        borderTopWidth: 1,
        borderTopColor: '#ECECEC',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    priceRowLabel: {
        color: '#565656',
        fontSize: 10.5,
    },
    priceRowValue: {
        color: '#111111',
        fontSize: 10.5,
        fontWeight: '800',
        maxWidth: '45%',
        textAlign: 'right',
    },
    estimatedRow: {
        marginTop: 21,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    estimatedLabel: {
        color: '#111111',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1.2,
        lineHeight: 13,
    },
    estimatedValue: {
        color: '#8B6A32',
        fontSize: 13,
        fontWeight: '900',
    },
});