import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { TopBar }  from '../components/TopBar';
import { safeJson } from '../utils/safeJson';
import { styles as s } from '../styles/proposalCheckoutStyles';
import { Ionicons } from '@expo/vector-icons';

const API       = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
const { width } = Dimensions.get('window');
const CARD_W    = width * 0.72;
const CARD_GAP  = 12;

// ── Helpers ───────────────────────────────────────────────────────
function authHeader(session) {
    return { Authorization: `Bearer ${session?.accessToken}` };
}

const BRAND_COLORS = {
    visa:       { gradient: '#1a1f71', accent: '#f7b600', text: '#FFF', label: 'VISA' },
    mastercard: { gradient: '#1a1a2e', accent: '#eb001b', text: '#FFF', label: 'MASTERCARD' },
    amex:       { gradient: '#c5993e', accent: '#FFF',    text: '#FFF', label: 'AMEX' },
    american:   { gradient: '#c5993e', accent: '#FFF',    text: '#FFF', label: 'AMEX' },
    default:    { gradient: '#4a4a4a', accent: '#c5a059', text: '#FFF', label: '' },
};

function getBrandStyle(entidad) {
    if (!entidad) return BRAND_COLORS.default;
    const lower = entidad.toLowerCase();
    for (const key of Object.keys(BRAND_COLORS)) {
        if (lower.includes(key)) return BRAND_COLORS[key];
    }
    return { ...BRAND_COLORS.default, label: entidad.toUpperCase() };
}

function formatPaymentLabel(p) {
    if (!p) return '—';
    const last = String(p.numeroIdentificacion || '').slice(-4);
    const entity = p.entidad || p.tipo || 'Medio de pago';
    return `${entity}${last ? ` · •••• ${last}` : ''}`;
}

// ── Shipping options ──────────────────────────────────────────────
const SHIPPING_OPTIONS = [
    {
        key:   'estandar',
        label: 'Envío Estándar Especializado',
        desc:  'Embalaje reforzado y transporte con clima controlado. Entrega en 5-7 días.',
        price: 180,
    },
    {
        key:    'express',
        label:  'Envío Express Asegurado',
        desc:   'Prioridad absoluta, seguro de valor total incluido y custodia 24h. Entrega en 48h.',
        price:  450,
        badge:  'PREMIUM',
    },
];

// ── Screen ────────────────────────────────────────────────────────
export default function ProposalCheckoutScreen({ proposalId, session, onBack, onMenuPress, onSuccess }) {
    const [step, setStep] = useState('shipping'); // 'shipping' | 'payment'

    // Sección 1 — datos de envío
    const [form, setForm] = useState({
        telefono:    '',
        calle:       '',
        piso:        '',
        ciudad:      '',
        provincia:   '',
        codigoPostal:'',
    });
    const [shippingOption, setShippingOption] = useState('estandar');
    const [formErrors,     setFormErrors]     = useState({});

    // Sección 2 — pago
    const [payments,          setPayments]          = useState([]);
    const [loadingPayments,   setLoadingPayments]   = useState(true);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [submitting,        setSubmitting]        = useState(false);
    const [successVisible,    setSuccessVisible]    = useState(false);

    const update = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (formErrors[key]) setFormErrors(prev => ({ ...prev, [key]: '' }));
    };

    // ── Fetch métodos de pago ──────────────────────────────────────
    const fetchPayments = useCallback(async () => {
        setLoadingPayments(true);
        try {
            const res  = await fetch(`${API}/api/v1/users/me/payments`, { headers: authHeader(session) });
            const json = await safeJson(res);
            const list = json?.items ?? [];
            setPayments(list);
            if (list.length > 0) setSelectedPaymentId(list[0].id);
        } catch (_) {
            setPayments([]);
        } finally {
            setLoadingPayments(false);
        }
    }, [session]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    // ── Validación sección 1 ───────────────────────────────────────
    const validateShipping = () => {
        const required = { telefono: 'Teléfono', calle: 'Dirección', ciudad: 'Ciudad', provincia: 'Estado / Provincia', codigoPostal: 'Código postal' };
        const next = {};
        let valid = true;
        for (const [k, label] of Object.entries(required)) {
            if (!form[k].trim()) { next[k] = `${label} es obligatorio.`; valid = false; }
        }
        setFormErrors(next);
        return valid;
    };

    // ── Confirmar envío ────────────────────────────────────────────
    const confirmShipment = useCallback(async () => {
        if (!selectedPaymentId) {
            Alert.alert('Medio de pago', 'Seleccioná un medio de pago antes de continuar.');
            return;
        }
        const selected = SHIPPING_OPTIONS.find(o => o.key === shippingOption);
        const direccion = [
            form.calle.trim(),
            form.piso.trim(),
            form.ciudad.trim(),
            form.provincia.trim(),
            form.codigoPostal.trim(),
        ].filter(Boolean).join(', ');

        setSubmitting(true);
        try {
            const res = await fetch(`${API}/api/v1/proposals/${proposalId}/return`, {
                method:  'PATCH',
                headers: { ...authHeader(session), 'Content-Type': 'application/json' },
                body:    JSON.stringify({ tipo: 'envio', direccion }),
            });
            if (!res.ok) {
                const j = await safeJson(res);
                throw new Error(j?.message ?? 'No se pudo registrar el envío');
            }
            setSuccessVisible(true);
        } catch (e) {
            Alert.alert('Error', e.message ?? 'Ocurrió un error. Intentá de nuevo.');
        } finally {
            setSubmitting(false);
        }
    }, [proposalId, session, form, shippingOption, selectedPaymentId]);

    // ── Render carrusel de tarjetas ────────────────────────────────
    const renderPaymentCard = ({ item }) => {
    const selected = String(selectedPaymentId) === String(item.id);
    const brand    = getBrandStyle(item.entidad);

    if (item.tipo === 'tarjeta_credito') {
        return (
            <Pressable onPress={() => setSelectedPaymentId(item.id)} style={[s.cardOuter, selected && s.cardSelected]}>
                <View style={[s.creditCard, { backgroundColor: brand.gradient }]}>
                    <View style={s.creditCardTopRow}>
                        <Text style={[s.creditCardBrand, { color: brand.accent }]}>
                            {brand.label || item.entidad?.toUpperCase()}
                        </Text>
                        <Ionicons name="card" size={28} color={brand.accent} />
                    </View>
                    <Text style={[s.creditCardNumber, { color: brand.text }]}>
                        {'•••• •••• •••• '}{String(item.numeroIdentificacion || '').slice(-4)}
                    </Text>
                    <View style={s.creditCardBottomRow}>
                        <View>
                            <Text style={[s.creditCardLabel, { color: `${brand.text}99` }]}>ENTIDAD</Text>
                            <Text style={[s.creditCardValue, { color: brand.text }]}>{item.entidad || '—'}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[s.creditCardLabel, { color: `${brand.text}99` }]}>MONEDA</Text>
                            <Text style={[s.creditCardValue, { color: brand.text }]}>{item.moneda || '—'}</Text>
                        </View>
                    </View>
                    <View style={[s.decorCircle, s.decorCircle1, { backgroundColor: `${brand.accent}15` }]} />
                    <View style={[s.decorCircle, s.decorCircle2, { backgroundColor: `${brand.accent}10` }]} />
                    {selected && (
                        <View style={s.selectedDotContainer}>
                            <View style={s.selectedDot} />
                        </View>
                    )}
                </View>
            </Pressable>
        );
    }

    if (item.tipo === 'cuenta_bancaria') {
        return (
            <Pressable onPress={() => setSelectedPaymentId(item.id)} style={[s.cardOuter, selected && s.cardSelected]}>
                <View style={s.bankCard}>
                    <View style={s.bankCardRow}>
                        <View style={s.bankIcon}>
                            <Ionicons name="business" size={22} color="#8B7355" />
                        </View>
                        <View style={s.bankCardInfo}>
                            <Text style={s.bankName} numberOfLines={1}>{item.entidad || 'Banco'}</Text>
                            <Text style={s.bankAccount} numberOfLines={1}>{item.numeroIdentificacion || '—'}</Text>
                        </View>
                        {item.verificado && (
                            <View style={s.verifiedBadge}>
                                <Text style={s.verifiedText}>VERIFICADO</Text>
                            </View>
                        )}
                    </View>
                    {selected && (
                        <View style={s.selectedDotContainerBank}>
                            <View style={s.selectedDot} />
                        </View>
                    )}
                </View>
            </Pressable>
        );
    }

    // Cheque certificado
    return (
        <Pressable onPress={() => setSelectedPaymentId(item.id)} style={[s.chequeCardOuter, selected && s.cardSelected]}>
            <View style={s.chequeCard}>
                <Ionicons name="document-text-outline" size={28} color="#999" style={{ marginBottom: 8 }} />
                <Text style={s.chequeId} numberOfLines={1}>#{item.numeroIdentificacion}</Text>
                {selected && (
                    <View style={s.selectedDotContainerBank}>
                        <View style={s.selectedDot} />
                    </View>
                )}
            </View>
        </Pressable>
    );
};

    // ── Sección 1: Datos de envío ──────────────────────────────────
    const renderShipping = () => (
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={s.eyebrow}>DEVOLUCIÓN DE ARTÍCULO</Text>
            <Text style={s.screenTitle}>Datos de Envío</Text>
            <Text style={s.subtitle}>Asegure su producto proporcionando una dirección de destino certificada.</Text>

            <Field label="TELÉFONO DE CONTACTO"    value={form.telefono}     onChangeText={v => update('telefono', v)}     keyboardType="phone-pad"   error={formErrors.telefono} />
            <Field label="DIRECCIÓN (CALLE Y NÚMERO)" value={form.calle}     onChangeText={v => update('calle', v)}         error={formErrors.calle} />
            <Field label="PISO / DEPARTAMENTO (OPCIONAL)" value={form.piso}  onChangeText={v => update('piso', v)} />
            <Field label="CIUDAD"                   value={form.ciudad}       onChangeText={v => update('ciudad', v)}        error={formErrors.ciudad} />
            <Field label="ESTADO / PROVINCIA"       value={form.provincia}    onChangeText={v => update('provincia', v)}     error={formErrors.provincia} />
            <Field label="CÓDIGO POSTAL"            value={form.codigoPostal} onChangeText={v => update('codigoPostal', v)} keyboardType="numeric" error={formErrors.codigoPostal} />

            <Text style={s.sectionLabel}>MÉTODO DE ENVÍO</Text>
            {SHIPPING_OPTIONS.map(opt => (
                <Pressable key={opt.key} style={[s.shippingOption, shippingOption === opt.key && s.shippingSelected]} onPress={() => setShippingOption(opt.key)}>
                    <View style={s.shippingRow}>
                        <View style={s.shippingInfo}>
                            <View style={s.shippingLabelRow}>
                                <Text style={s.shippingLabel}>{opt.label}</Text>
                                {opt.badge && <View style={s.premiumBadge}><Text style={s.premiumBadgeText}>{opt.badge}</Text></View>}
                            </View>
                            <Text style={s.shippingDesc}>{opt.desc}</Text>
                        </View>
                        <Text style={s.shippingPrice}>${opt.price.toFixed(2)}</Text>
                    </View>
                </Pressable>
            ))}

            <Text style={s.termsNote}>Al confirmar, usted acepta nuestros términos de transporte de obras de arte y la política de seguros de Vantage.</Text>

            <View style={s.btnRow}>
                <TouchableOpacity style={s.btnOutline} onPress={onBack}>
                    <Text style={s.btnOutlineText}>VOLVER</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnDark} onPress={() => { if (validateShipping()) setStep('payment'); }}>
                    <Text style={s.btnDarkText}>IR AL CHECKOUT →</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    // ── Sección 2: Pago ────────────────────────────────────────────
    const selected      = SHIPPING_OPTIONS.find(o => o.key === shippingOption);
    const shippingPrice = selected?.price ?? 0;

    const renderPayment = () => (
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={s.eyebrow}>DEVOLUCIÓN DE ARTÍCULO</Text>
            <Text style={s.screenTitle}>Confirmar Pago</Text>

            {/* Método de pago */}
            <Text style={s.sectionLabel}>SELECCIONAR MÉTODO DE PAGO</Text>
            {loadingPayments ? (
                <ActivityIndicator color="#0b1a30" style={{ marginVertical: 20 }} />
            ) : payments.length === 0 ? (
                <View style={s.emptyPayments}>
                    <Text style={s.emptyPaymentsText}>No tenés métodos de pago registrados. Agregá uno en Métodos de Pago.</Text>
                </View>
            ) : (
                <FlatList
                    data={payments}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderPaymentCard}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.carouselContent}
                    snapToInterval={CARD_W + CARD_GAP}
                    decelerationRate="fast"
                    style={s.carousel}
                />
            )}

            {/* Dirección de envío */}
            <Text style={s.sectionLabel}>DIRECCIÓN DE ENVÍO</Text>
            <View style={s.addressBox}>
                <Text style={s.addressText}>
                    {[form.calle, form.piso, form.ciudad, form.provincia, form.codigoPostal].filter(Boolean).join(', ')}
                </Text>
            </View>

            {/* Resumen */}
            <Text style={s.sectionLabel}>RESUMEN DE ORDEN</Text>
            <View style={s.summaryBox}>
                <View style={s.summaryRow}>
                    <Text style={s.summaryLabel}>Tipo de envío</Text>
                    <Text style={s.summaryValue}>{selected?.label}</Text>
                </View>
                <View style={s.divider} />
                <View style={s.summaryRow}>
                    <Text style={[s.summaryLabel, s.totalLabel]}>Total</Text>
                    <Text style={[s.summaryValue, s.totalValue]}>${shippingPrice.toFixed(2)}</Text>
                </View>
            </View>

            <View style={s.btnRow}>
                <TouchableOpacity style={s.btnOutline} onPress={() => setStep('shipping')}>
                    <Text style={s.btnOutlineText}>VOLVER</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btnDark, submitting && s.btnDisabled]} onPress={confirmShipment} disabled={submitting}>
                    {submitting
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={s.btnDarkText}>CONFIRMAR Y PAGAR ENVÍO →</Text>
                    }
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    // ── Modal de éxito ─────────────────────────────────────────────
    const renderSuccessModal = () => (
        <Modal visible={successVisible} transparent animationType="fade" onRequestClose={() => {}}>
            <View style={s.modalBackdrop}>
                <View style={s.modalCard}>
                    <View style={s.successIcon}><Text style={s.successCheck}>✓</Text></View>
                    <Text style={s.modalTitle}>¡Envío Confirmado!</Text>
                    <Text style={s.modalBody}>
                        Tu solicitud de envío fue registrada correctamente. Nos contactaremos para coordinar la logística.
                    </Text>
                    <TouchableOpacity style={s.btnDark} onPress={() => { setSuccessVisible(false); onSuccess?.(); }}>
                        <Text style={s.btnDarkText}>IR A MIS ARTÍCULOS</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={s.stage}>
            <StatusBar barStyle="dark-content" />
            <TopBar onMenuPress={onMenuPress} />
            {step === 'shipping' ? renderShipping() : renderPayment()}
            {renderSuccessModal()}
        </SafeAreaView>
    );
}

// ── Campo de formulario ───────────────────────────────────────────
function Field({ label, error, ...inputProps }) {
    return (
        <View style={s.inputGroup}>
            <Text style={s.label}>{label}</Text>
            <View style={s.inputWrap}>
                <TextInput
                    {...inputProps}
                    placeholderTextColor="#c5c7cb"
                    style={s.input}
                />
            </View>
            {error ? <Text style={s.fieldError}>{error}</Text> : null}
        </View>
    );
}