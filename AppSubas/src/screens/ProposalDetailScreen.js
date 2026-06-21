import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { TopBar }   from '../components/TopBar';
import { styles }   from '../styles/proposalDetailStyles';
import { safeJson } from '../utils/safeJson';

const API = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

// Estado propuesta

const PS = {
    EN_REVISION:        'EN_REVISION',
    PENDIENTE:          'PENDIENTE',
    ACEPTADO_USUARIO:   'ACEPTADO_USUARIO',
    RECHAZADO_EMPRESA:  'RECHAZADO_EMPRESA',
    RECHAZADO_USUARIO:  'RECHAZADO_USUARIO',
    RETIRO_SUCURSAL:    'RETIRO_SUCURSAL',
    ENVIO_SOLICITADO:   'ENVIO_SOLICITADO',
};

const BADGE_LABEL = {
    [PS.EN_REVISION]:       'PENDING VALUATION',
    [PS.PENDIENTE]:         'PRICE PROPOSED',
    [PS.ACEPTADO_USUARIO]:  'ACCEPTED',
    [PS.RECHAZADO_EMPRESA]: 'REJECTED',
    [PS.RECHAZADO_USUARIO]: 'PRICE REJECTED',
    [PS.RETIRO_SUCURSAL]:   'PICKUP REQUESTED',
    [PS.ENVIO_SOLICITADO]:  'SHIPMENT REQUESTED',
};

function resolveProposalState(detail) {
    if (!detail) return null;
    const { status } = detail;
    if (status === 'en_revision')            return PS.EN_REVISION;
    if (status === 'aceptada')               return PS.PENDIENTE;
    if (status === 'condiciones_aceptadas')  return PS.ACEPTADO_USUARIO;
    if (status === 'rechazada')              return PS.RECHAZADO_EMPRESA;
    if (status === 'condiciones_rechazadas') return PS.RECHAZADO_USUARIO;
    if (status === 'retiro_sucursal')        return PS.RETIRO_SUCURSAL;
    if (status === 'envio_solicitado')       return PS.ENVIO_SOLICITADO;
    return PS.EN_REVISION;
}

function authHeader(session) {
    return { Authorization: `Bearer ${session?.accessToken}` };
}

// Screen

export default function ProposalDetailScreen({ proposalId, session, onBack, onMenuPress, onNavigate }) {
    const [detail,  setDetail]  = useState(null);
    const [photos,  setPhotos]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const [photoIndex, setPhotoIndex] = useState(0);

    const [showRejectModal,   setShowRejectModal]   = useState(false);
    const [submitting,        setSubmitting]        = useState(false);

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = authHeader(session);
            const [detailRes, photosRes] = await Promise.all([
                fetch(`${API}/api/v1/proposals/${proposalId}`, { headers }),
                fetch(`${API}/api/v1/proposals/${proposalId}/photos`, { headers }),
            ]);
            const detailJson = await safeJson(detailRes);
            const photosJson = await safeJson(photosRes);
            if (!detailRes.ok) throw new Error(detailJson?.message ?? 'Error al cargar la propuesta');
            setDetail(detailJson);
            setPhotos(Array.isArray(photosJson) ? photosJson : []);
        } catch (e) {
            setError(e.message ?? 'Error de conexión');
        } finally {
            setLoading(false);
        }
    }, [proposalId, session]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const respondTerms = useCallback(async (accept) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${API}/api/v1/proposals/${proposalId}/terms`, {
                method:  'PATCH',
                headers: { ...authHeader(session), 'Content-Type': 'application/json' },
                body:    JSON.stringify({ acceptBasePriceAndCommission: accept }),
            });
            if (!res.ok) {
                const j = await safeJson(res);
                throw new Error(j?.message ?? 'No se pudo procesar la respuesta');
            }
            await fetchDetail();
        } catch (e) {
            setError(e.message);
        } finally {
            setSubmitting(false);
            setShowRejectModal(false);
        }
    }, [proposalId, session, fetchDetail]);

    const solicitarDevolucion = useCallback(async (tipo) => {
    setSubmitting(true);
    setError(null);
    try {
        const res = await fetch(`${API}/api/v1/proposals/${proposalId}/return`, {
            method:  'PATCH',
            headers: { ...authHeader(session), 'Content-Type': 'application/json' },
            body:    JSON.stringify({ tipo }),
        });
        if (!res.ok) {
            const j = await safeJson(res);
            throw new Error(j?.message ?? 'No se pudo registrar la devolución');
        }
        await fetchDetail();
    } catch (e) {
        setError(e.message);
    } finally {
        setSubmitting(false);
    }
}, [proposalId, session, fetchDetail]);

    const openLocationModal = useCallback(async () => {
        setShowLocationModal(true);
        setLocationLoading(true);
        setLocationData(null);
        try {
            const res = await fetch(
                `${API}/api/v1/users/me/consigned-items/${proposalId}/location`,
                { headers: authHeader(session) }
            );
            const json = await safeJson(res);
            if (!res.ok) throw new Error(json?.message ?? 'No se encontró la ubicación');
            setLocationData(json);
        } catch (e) {
            setLocationData({ error: e.message });
        } finally {
            setLocationLoading(false);
        }
    }, [proposalId, session]);

    const ps         = resolveProposalState(detail);
    const badgeLabel = ps ? BADGE_LABEL[ps] : '';
    const imageUri   = photos[photoIndex]
        ? `data:image/jpeg;base64,${photos[photoIndex]}`
        : null;

    if (loading) {
        return (
            <SafeAreaView style={styles.stage}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.stateBox}>
                    <ActivityIndicator color="#0b1a30" />
                </View>
            </SafeAreaView>
        );
    }

    if (error && !detail) {
        return (
            <SafeAreaView style={styles.stage}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.backRow}>
                    <TouchableOpacity onPress={onBack}>
                        <Text style={styles.backText}>← Volver</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.stateBox}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={fetchDetail}>
                        <Text style={styles.retryBtnText}>REINTENTAR</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const renderPriceBlock = () => {
        if (!detail?.basePrice) return null;
        const moneda    = detail.moneda ?? 'ARS';
        const commission = Number(detail.commission ?? 0);
        const base       = Number(detail.basePrice);
        const estimated  = (base * (1 - commission / 100)).toFixed(2);
        return (
            <View style={styles.priceBlock}>
                <Text style={styles.priceLabel}>PRECIO BASE PROPUESTO</Text>
                <Text style={styles.priceAmount}>
                    {base.toLocaleString('es-AR')}
                </Text>
                <Text style={styles.priceCurrency}>{moneda}</Text>
                <View style={styles.priceDivider} />
                <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>Comisión de la casa</Text>
                    <Text style={styles.priceRowValue}>{commission}%</Text>
                </View>
                <View style={styles.priceRow}>
                    <Text style={styles.priceEstLabel}>
                        {'MONTO ESTIMADO\nA RECIBIR'}
                    </Text>
                    <Text style={styles.priceEstValue}>
                        {moneda} {parseFloat(estimated).toLocaleString('es-AR')}
                    </Text>
                </View>
            </View>
        );
    };

    const renderFeedback = () => {
        if (!detail?.feedback) return null;
        return (
            <View style={styles.notasSection}>
                <Text style={styles.notasLabel}>NOTAS DE CURACIÓN DE EXPERTOS</Text>
                <Text style={styles.notasText}>{detail.feedback}</Text>
            </View>
        );
    };

    const renderBottomSection = () => {
        switch (ps) {
            case PS.EN_REVISION:
                return null;

            case PS.PENDIENTE:
                return (
                    <>
                        {renderPriceBlock()}
                        {renderFeedback()}
                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={styles.btnDark}
                                onPress={() => respondTerms(true)}
                                disabled={submitting}
                            >
                                <Text style={styles.btnDarkText}>
                                    {submitting ? '...' : 'ACEPTAR'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.btnOutline}
                                onPress={() => setShowRejectModal(true)}
                                disabled={submitting}
                            >
                                <Text style={styles.btnOutlineText}>RECHAZAR</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                );

            case PS.ACEPTADO_USUARIO:
                return (
                    <>
                        {renderPriceBlock()}
                        {renderFeedback()}
                        <TouchableOpacity
                            style={styles.btnPoliza}
                            onPress={() => onNavigate?.(`insurancePolicy:${proposalId}`)}
                        >
                            <Text style={styles.btnPolizaText}>CONSULTAR PÓLIZA</Text>
                        </TouchableOpacity>
                    </>
                );

            case PS.RECHAZADO_EMPRESA:
                return (
                    <>
                        {renderFeedback()}
                        <View style={styles.notaDevolucionBox}>
                            <Text style={styles.notaDevolucionTitle}>NOTA SOBRE DEVOLUCIÓN</Text>
                            <Text style={styles.notaDevolucionText}>
                                Lamentablemente tu artículo no fue seleccionado para nuestra colección.
                                Podés retirarlo en nuestra sucursal sin cargo adicional o solicitar el
                                envío a domicilio. Los gastos de envío corren por cuenta del propietario.
                            </Text>
                        </View>
                        <View style={styles.actionsRow}>
                            <TouchableOpacity style={styles.btnDark} onPress={() => solicitarDevolucion('sucursal')} disabled={submitting}>
                                <Text style={styles.btnDarkText}>{'RETIRAR EN\nSUCURSAL'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnOutline} onPress={() => onNavigate?.('proposalCheckout', { proposalId })} disabled={submitting}>
                                <Text style={styles.btnOutlineText}>{'SOLICITAR\nENVÍO'}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                );

            case PS.RECHAZADO_USUARIO:
                return (
                    <>
                        {renderPriceBlock()}
                        {renderFeedback()}
                        <View style={styles.actionsRow}>
                            <TouchableOpacity style={styles.btnDark} onPress={() => solicitarDevolucion('sucursal')} disabled={submitting}>
                                <Text style={styles.btnDarkText}>{'RETIRAR EN\nSUCURSAL'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnOutline} onPress={() => onNavigate?.('proposalCheckout', { proposalId })} disabled={submitting}>
                                <Text style={styles.btnOutlineText}>{'SOLICITAR\nENVÍO'}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                );

            case PS.RETIRO_SUCURSAL:
                return (
                    <>
                        {renderPriceBlock()}
                        {renderFeedback()}
                        <View style={styles.rejectedBanner}>
                            <Text style={styles.rejectedBannerText}>
                                ARTÍCULO RECHAZADO · RETIRO EN SUCURSAL SOLICITADO
                            </Text>
                            <Text style={styles.rejectedBannerSub}>
                                Podés pasar a retirarlo por nuestras oficinas. Te contactaremos para coordinar el horario.
                            </Text>
                        </View>
                    </>
                );

            case PS.ENVIO_SOLICITADO:
                return (
                    <>
                        {renderPriceBlock()}
                        {renderFeedback()}
                        <View style={styles.rejectedBanner}>
                            <Text style={styles.rejectedBannerText}>
                                ARTÍCULO RECHAZADO · ENVÍO A DOMICILIO SOLICITADO
                            </Text>
                            {detail?.direccionDevolucion ? (
                                <Text style={styles.rejectedBannerSub}>
                                    Dirección de envío: {detail.direccionDevolucion}
                                </Text>
                            ) : null}
                        </View>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.stage}>
            {/* <StatusBar barStyle="dark-content" /> */}

            <TopBar onMenuPress={onMenuPress} />

            <View style={styles.backRow}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backText}>← Volver</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* ── Imagen con badge y carrusel ── */}
                <View style={styles.imageWrap}>
                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.imageFallback} />
                    )}

                    {badgeLabel ? (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{badgeLabel}</Text>
                        </View>
                    ) : null}

                    {photos.length > 1 && (
                        <>
                            <TouchableOpacity
                                style={[styles.arrowBtn, styles.arrowLeft]}
                                onPress={() => setPhotoIndex(i => Math.max(0, i - 1))}
                            >
                                <Text style={styles.arrowText}>‹</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.arrowBtn, styles.arrowRight]}
                                onPress={() => setPhotoIndex(i => Math.min(photos.length - 1, i + 1))}
                            >
                                <Text style={styles.arrowText}>›</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View style={styles.headerSection}>
                    <Text style={styles.eyebrow}>VANTAGE FINE AUCTIONS</Text>
                    <Text style={styles.title}>{detail?.titulo ?? ''}</Text>
                </View>

                {detail?.descripcion ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>DESCRIPCIÓN</Text>
                        <Text style={styles.sectionText}>{detail.descripcion}</Text>
                    </View>
                ) : null}

                {detail?.historia ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>PROCEDENCIA</Text>
                        <Text style={styles.sectionText}>{detail.historia}</Text>
                    </View>
                ) : null}

                {renderBottomSection()}

                {error ? (
                    <View style={styles.inlineErrorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

            </ScrollView>

            <Modal
                visible={showRejectModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowRejectModal(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconText}>✕</Text>
                        </View>
                        <Text style={styles.modalTitle}>¿Rechazar precio acordado?</Text>
                        <Text style={styles.modalSubtitle}>
                            Una vez rechazado el precio no podrás revertir esta acción.
                            Podrás retirar tu artículo en sucursal o solicitar el envío a domicilio.
                        </Text>
                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity
                                style={styles.modalBtnOutline}
                                onPress={() => setShowRejectModal(false)}
                                disabled={submitting}
                            >
                                <Text style={styles.modalBtnOutlineText}>CANCELAR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalBtnDark}
                                onPress={() => respondTerms(false)}
                                disabled={submitting}
                            >
                                {submitting
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={styles.modalBtnDarkText}>RECHAZAR</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}