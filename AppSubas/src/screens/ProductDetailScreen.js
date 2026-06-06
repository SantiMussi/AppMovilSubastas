import React, { useCallback, useEffect, useState } from 'react';
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

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export default function ProductDetailScreen({ session, productId, onBack }) {
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

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Pressable onPress={onBack} hitSlop={10} style={styles.iconButton} accessibilityLabel="Volver">
                    <Ionicons name="arrow-back" size={24} color="#111111" />
                </Pressable>
                <Text style={styles.headerTitle}>Detalle del Producto</Text>
                <View style={styles.iconButton} />
            </View>

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
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.heroPlaceholder}>
                            <Ionicons name="image-outline" size={42} color="#C5A059" />
                            <Text style={styles.heroPlaceholderText}>SIN FOTO DISPONIBLE</Text>
                        </View>
                    )}
                    <Text style={styles.productName}>{detail?.descripcionCatalogo || detail?.descripcion || 'Artículo adquirido'}</Text>
                    <Text style={styles.sectionLabel}>DESCRIPCIÓN</Text>
                    <Text style={styles.description}>{detail?.descripcionCompleta || detail?.historia || 'Sin descripción disponible.'}</Text>
                    <View style={styles.infoCard}>
                        <InfoRow label="Estado" value={detail?.disponible ? 'Disponible' : 'Adquirido'} />
                        <InfoRow label="Fecha de registro" value={detail?.fechaRegistro || 'No informada'} />
                        <InfoRow label="Fotos" value={`${detail?.photosCount ?? 0}`} />
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

function InfoRow({ label, value }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, paddingHorizontal: 18, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    iconButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: 'serif', fontSize: 18, fontWeight: '900', color: '#111111' },
    centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
    stateText: { color: '#555555', fontSize: 14, marginTop: 12 },
    errorText: { color: '#B22222', fontSize: 14, textAlign: 'center', marginTop: 12 },
    scrollContent: { padding: 18, paddingBottom: 38 },
    heroImage: { width: '100%', height: 280, borderRadius: 4, backgroundColor: '#111111' },
    heroPlaceholder: { width: '100%', height: 280, borderRadius: 4, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center' },
    heroPlaceholderText: { color: '#C5A059', fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginTop: 10 },
    productName: { fontFamily: 'serif', fontSize: 24, fontWeight: '900', color: '#111111', marginTop: 20, lineHeight: 30 },
    sectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, color: '#8B6A32', marginTop: 22, marginBottom: 8 },
    description: { fontSize: 14, color: '#333333', lineHeight: 22 },
    infoCard: { marginTop: 24, borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 8, paddingHorizontal: 14, backgroundColor: '#FFFFFF' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F1F1F1' },
    infoLabel: { fontSize: 12, color: '#777777', fontWeight: '700' },
    infoValue: { fontSize: 12, color: '#111111', fontWeight: '800', maxWidth: '58%', textAlign: 'right' },
});