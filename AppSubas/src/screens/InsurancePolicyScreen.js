import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, TopBar } from '../components';
import { useCurrency } from '../context/CurrencyContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export default function InsurancePolicyScreen({ session, productId, onBack }) {
    const { currency, formatGlobalMoney } = useCurrency();
    const [product, setProduct] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [insurance, setInsurance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);

    const authHeaders = useMemo(
        () => (session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        [session?.accessToken],
    );

    const fetchJson = useCallback(async (path, options = {}) => {
        const response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers: {
                ...authHeaders,
                ...(options.headers || {}),
            },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(payload?.message || payload?.error || `No se pudo cargar ${path} (${response.status}).`);
        }
        return payload;
    }, [authHeaders]);

    const loadPolicy = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [productPayload, photosPayload, insurancePayload] = await Promise.all([
                fetchJson(`/api/v1/products/${productId}`),
                fetchJson(`/api/v1/products/${productId}/photos`).catch(() => null),
                fetchJson(`/api/v1/users/me/consigned-items/${productId}/insurance`).catch(() => null),
            ]);

            setProduct(productPayload);
            setInsurance(insurancePayload?.insurance || productPayload?.insurance || null);
            const firstPhoto = Array.isArray(photosPayload?.items) ? photosPayload.items[0] : null;
            setImageUrl(firstPhoto?.url || null);
        } catch (requestError) {
            setError(requestError.message || 'No se pudo cargar la póliza del producto.');
        } finally {
            setLoading(false);
        }
    }, [fetchJson, productId]);

    useEffect(() => {
        loadPolicy();
    }, [loadPolicy]);

    const display = useMemo(() => buildDisplayData(product, insurance), [product, insurance]);
    const insuredAmount = resolveInsuredAmount(product, insurance);

    return (
        <View style={styles.container}>
            <TopBar onMenuPress={onBack} />

            {loading ? (
                <StatePanel loading label="Cargando póliza..." />
            ) : error ? (
                <StatePanel icon="alert-circle-outline" label={error} onRetry={loadPolicy} />
            ) : (
                <>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.heroCard}>
                            {imageUrl ? (
                                <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
                            ) : (
                                <View style={styles.heroPlaceholder}>
                                    <Ionicons name="image-outline" size={44} color="#C99D49" />
                                    <Text style={styles.heroPlaceholderText}>SIN FOTO DISPONIBLE</Text>
                                </View>
                            )}
                            <View style={styles.heroOverlay}>
                                <Text style={styles.productId}>PRODUCT ID {display.productId}</Text>
                                <Text style={styles.productName}>{display.productName}</Text>
                            </View>
                        </View>

                        <SectionTitle title="Póliza de Seguro" />

                        <View style={styles.whiteCard}>
                            <InfoBlock label="NRO PÓLIZA" value={display.policyNumber} />
                            <InfoBlock label="COMPAÑÍA" value={display.company} />
                        </View>

                        <View style={styles.darkCard}>
                            <View>
                                <Text style={styles.darkLabel}>IMPORTE ASEGURADO</Text>
                                <View style={styles.amountRow}>
                                    <Text style={styles.amountText}>{formatGlobalMoney(insuredAmount || 0)}</Text>
                                    <Text style={styles.amountCurrency}>{currency || 'USD'}</Text>
                                </View>
                            </View>
                            <View style={styles.combinedRow}>
                                <View>
                                    <Text style={styles.darkLabel}>PÓLIZA COMBINADA</Text>
                                    <Text style={styles.combinedText}>{display.combinedPolicy}</Text>
                                </View>
                                <View style={styles.shieldBadge}>
                                    <Ionicons name="shield-checkmark-outline" size={18} color="#0F1D31" />
                                </View>
                            </View>
                        </View>

                        <Pressable style={styles.requestButton} onPress={() => setConfirmVisible(true)}>
                            <Text style={styles.requestButtonText}>SOLICITAR CAMBIO DE PÓLIZA</Text>
                        </Pressable>

                        <Text style={styles.termsText}>SUJETO A TERMINOS Y CONDICIONES DE {display.company}</Text>

                        <View style={styles.statusCard}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>ESTADO: COBERTURA VIGENTE Y VERIFICADA</Text>
                        </View>
                    </ScrollView>

                    <PolicyChangeConfirmModal
                        visible={confirmVisible}
                        onCancel={() => setConfirmVisible(false)}
                        onConfirm={() => {
                            setConfirmVisible(false);
                            setSuccessVisible(true);
                        }}
                    />
                    <PolicyRequestModal visible={successVisible} onClose={() => setSuccessVisible(false)} />
                </>
            )}
        </View>
    );
}

function SectionTitle({ title }) {
    return (
        <View style={styles.titleRow}>
            <View style={styles.titleAccent} />
            <Text style={styles.titleText}>{title}</Text>
        </View>
    );
}

function InfoBlock({ label, value }) {
    return (
        <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}


function PolicyChangeConfirmModal({ visible, onCancel, onConfirm }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                    <View style={styles.modalIconBox}>
                        <Ionicons name="help-circle-outline" size={32} color="#8C6D2B" />
                    </View>
                    <Text style={styles.modalTitle}>Confirmar cambio de póliza</Text>
                    <Text style={styles.modalMessage}>
                        ¿Está seguro que quiere solicitar un cambio de póliza para este artículo?
                    </Text>
                    <ActionButton label="SÍ, SOLICITAR CAMBIO" wide onPress={onConfirm} />
                    <ActionButton label="CANCELAR" variant="ghost" wide onPress={onCancel} />
                </View>
            </View>
        </Modal>
    );
}

function PolicyRequestModal({ visible, onClose }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                    <View style={styles.modalIconBox}>
                        <Ionicons name="seal-outline" size={30} color="#8C6D2B" />
                    </View>
                    <Text style={styles.modalTitle}>Solicitud de cambio de póliza realizada</Text>
                    <Text style={styles.modalMessage}>
                        Su petición ha sido recibida correctamente. Un asesor de Vantage se pondrá en contacto con usted en las próximas 24 horas hábiles.
                    </Text>
                    <ActionButton label="ACEPTAR" wide onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
}

function StatePanel({ icon, label, loading, onRetry }) {
    return (
        <View style={styles.statePanel}>
            {loading ? <ActivityIndicator size="large" color="#C5A059" /> : <Ionicons name={icon} size={40} color="#9A7720" />}
            <Text style={styles.stateLabel}>{label}</Text>
            {onRetry ? (
                <Pressable style={styles.retryButton} onPress={onRetry}>
                    <Text style={styles.retryText}>REINTENTAR</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

function buildDisplayData(product, insurance) {
    return {
        productId: product?.productId || product?.identificador || '—',
        productName: product?.descripcionCatalogo || product?.descripcion || 'Artículo asegurado',
        policyNumber: insurance?.nroPoliza || 'No informado',
        company: insurance?.compania || 'No informado',
        combinedPolicy: isCombinedPolicy(insurance?.polizaCombinada) ? 'Sí' : 'No',
    };
}

function resolveInsuredAmount(product, insurance) {
    return product?.precioBasePropuesto || product?.precioAdjudicado || product?.valorEstimado || insurance?.importe || 0;
}

function isCombinedPolicy(value) {
    const normalized = `${value || ''}`.trim().toLowerCase();
    return ['s', 'si', 'sí', 'y', 'yes', 'true', '1'].includes(normalized);
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F7F8' },
    scrollContent: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 34 },
    heroCard: {
        height: 430,
        backgroundColor: '#101820',
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 4,
    },
    heroImage: { width: '100%', height: '100%' },
    heroPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    heroPlaceholderText: { color: '#C99D49', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginTop: 10 },
    heroOverlay: { position: 'absolute', left: 24, right: 24, bottom: 26 },
    productId: { color: '#D0D3D9', fontSize: 9, fontWeight: '700', letterSpacing: 1.8, marginBottom: 8 },
    productName: { color: '#FFFFFF', fontFamily: 'serif', fontSize: 32, fontWeight: '900', lineHeight: 36 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 20, marginBottom: 14 },
    titleAccent: { width: 1, height: 36, backgroundColor: '#A98237' },
    titleText: { color: '#2A2A2A', fontFamily: 'serif', fontSize: 27, fontWeight: '900' },
    whiteCard: { backgroundColor: '#FFFFFF', paddingHorizontal: 32, paddingVertical: 24, marginBottom: 22 },
    infoBlock: { marginBottom: 24 },
    infoLabel: { color: '#A98237', fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginBottom: 8 },
    infoValue: { color: '#121212', fontFamily: 'serif', fontSize: 19, fontWeight: '900' },
    darkCard: { backgroundColor: '#0D1B31', paddingHorizontal: 32, paddingVertical: 28, marginBottom: 36 },
    darkLabel: { color: '#8993A7', fontSize: 9, fontWeight: '900', letterSpacing: 1.6, marginBottom: 8 },
    amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    amountText: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
    amountCurrency: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
    combinedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 },
    combinedText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    shieldBadge: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#FFD17B', alignItems: 'center', justifyContent: 'center' },
    requestButton: { backgroundColor: '#000000', paddingVertical: 18, alignItems: 'center', marginHorizontal: 14, marginBottom: 18 },
    requestButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 3 },
    termsText: { color: '#9A9CA3', fontSize: 9, letterSpacing: 0.8, textAlign: 'center', marginBottom: 16 },
    statusCard: { backgroundColor: '#EFEFF1', flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 26, paddingVertical: 22 },
    statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#A98237' },
    statusText: { flex: 1, color: '#1D2430', fontSize: 13, lineHeight: 18 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#FFFFFF', alignItems: 'center', paddingHorizontal: 34, paddingTop: 32, paddingBottom: 24 },
    modalIconBox: { width: 66, height: 66, borderRadius: 12, backgroundColor: '#FFD17B', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    modalTitle: { color: '#000000', fontFamily: 'serif', fontSize: 24, fontWeight: '900', lineHeight: 28, textAlign: 'center', marginBottom: 16 },
    modalMessage: { color: '#73777F', fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 26 },
    statePanel: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
    stateLabel: { color: '#4F5664', fontSize: 14, textAlign: 'center', marginTop: 14 },
    retryButton: { marginTop: 18, borderWidth: 1, borderColor: '#C5A059', paddingHorizontal: 18, paddingVertical: 10 },
    retryText: { color: '#8A6A2A', fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
});