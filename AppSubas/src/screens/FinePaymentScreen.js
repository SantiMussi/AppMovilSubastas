import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../themes/colors';
import { useCurrency } from '../context/CurrencyContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;
const CARD_GAP = 12;

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const BRAND_COLORS = {
  visa: { bg: ['#1a1f71', '#2d338b'], gradient: '#1a1f71', accent: '#f7b600', text: '#FFFFFF', label: 'VISA' },
  mastercard: { bg: ['#1a1a2e', '#16213e'], gradient: '#1a1a2e', accent: '#eb001b', text: '#FFFFFF', label: 'MASTERCARD' },
  amex: { bg: ['#c5993e', '#d4af37'], gradient: '#c5993e', accent: '#FFFFFF', text: '#FFFFFF', label: 'AMERICAN EXPRESS' },
  american: { bg: ['#c5993e', '#d4af37'], gradient: '#c5993e', accent: '#FFFFFF', text: '#FFFFFF', label: 'AMERICAN EXPRESS' },
  default: { bg: ['#4a4a4a', '#6a6a6a'], gradient: '#4a4a4a', accent: '#c5a059', text: '#FFFFFF', label: '' },
};

const getBrandStyle = (entidad) => {
  if (!entidad) return BRAND_COLORS.default;
  const lower = entidad.toLowerCase();
  for (const key of Object.keys(BRAND_COLORS)) {
    if (lower.includes(key)) return BRAND_COLORS[key];
  }
  return { ...BRAND_COLORS.default, label: entidad.toUpperCase() };
};

const BANK_COLORS = { default: { bg: '#F0EDE8', icon: '#8B7355' } };

export default function FinePaymentScreen({ session, fineId, onBack, onPaymentSuccess }) {
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payments, setPayments] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [error, setError] = useState('');
  const [fine, setFine] = useState(null);
  
  const { formatGlobalMoney } = useCurrency();

  const fetchData = useCallback(async () => {
    try {
      // Fetch fine detail
      const fineResponse = await fetch(`${API_BASE}/api/v1/users/me/fines/${fineId}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (!fineResponse.ok) {
        setError('No se pudo cargar el detalle de la multa.');
        setLoading(false);
        return;
      }
      const fineData = await fineResponse.json();
      setFine(fineData);

      // Fetch payment methods
      const paymentsResponse = await fetch(`${API_BASE}/api/v1/users/me/payments`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (paymentsResponse.ok) {
        const data = await paymentsResponse.json();
        const items = data.items || [];
        setPayments(items);
        if (items.length > 0) {
          setSelectedPaymentId(items[0].id); // Auto-select first method
        }
      } else {
        setError('No se pudieron cargar los medios de pago.');
      }
    } catch (err) {
      setError('Error de conexión al cargar datos.');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, fineId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePay = async () => {
    if (!selectedPaymentId) {
      Alert.alert('Atención', 'Debe seleccionar un método de pago.');
      return;
    }

    setPaying(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me/fines/${fine.identificador}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          medioPago: selectedPaymentId
        })
      });

      if (response.ok) {
        Alert.alert('Éxito', 'El pago se procesó correctamente.', [
          { text: 'OK', onPress: () => onPaymentSuccess(fine.identificador) }
        ]);
      } else {
        const errorData = await response.json().catch(() => null);
        Alert.alert('Error', errorData?.message || 'No se pudo procesar el pago.');
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un problema de red.');
    } finally {
      setPaying(false);
    }
  };

  const renderPaymentItem = (item) => {
    const isSelected = selectedPaymentId === item.id;

    if (item.tipo === 'tarjeta_credito') {
      const brand = getBrandStyle(item.entidad);
      return (
        <Pressable
          key={item.id}
          style={[styles.paymentItemContainer, { marginRight: CARD_GAP }]}
          onPress={() => setSelectedPaymentId(item.id)}
        >
          <View style={[
            styles.creditCard,
            { backgroundColor: brand.gradient },
            isSelected && styles.selectedBorder
          ]}>
            <View style={styles.creditCardTopRow}>
              <Text style={[styles.creditCardBrand, { color: brand.accent }]}>
                {brand.label || item.entidad?.toUpperCase()}
              </Text>
              <Ionicons name="card" size={28} color={brand.accent} />
            </View>
            <Text style={[styles.creditCardNumber, { color: brand.text }]}>
              {item.numeroIdentificacion || '•••• •••• •••• ••••'}
            </Text>
            <View style={styles.creditCardBottomRow}>
              <View>
                <Text style={[styles.creditCardLabel, { color: `${brand.text}99` }]}>ENTIDAD</Text>
                <Text style={[styles.creditCardValue, { color: brand.text }]}>
                  {item.entidad || '—'}
                </Text>
              </View>
            </View>
            <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: `${brand.accent}15` }]} />
            <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: `${brand.accent}10` }]} />

            {isSelected && (
              <View style={styles.selectedDotContainer}>
                <View style={styles.selectedDot} />
              </View>
            )}
          </View>
        </Pressable>
      );
    }

    if (item.tipo === 'cuenta_bancaria') {
      return (
        <Pressable
          key={item.id}
          style={[styles.paymentItemContainer, { marginRight: CARD_GAP }]}
          onPress={() => setSelectedPaymentId(item.id)}
        >
          <View style={[
            styles.bankCard,
            isSelected && styles.selectedBorder
          ]}>
            <View style={styles.bankCardRow}>
              <View style={styles.bankIcon}>
                <Ionicons name="business" size={22} color={BANK_COLORS.default.icon} />
              </View>
              <View style={styles.bankCardInfo}>
                <Text style={styles.bankName} numberOfLines={1}>{item.entidad || 'Banco'}</Text>
                <Text style={styles.bankAccount} numberOfLines={1}>{item.numeroIdentificacion || '—'}</Text>
              </View>
            </View>

            {isSelected && (
              <View style={styles.selectedDotContainerBank}>
                <View style={styles.selectedDot} />
              </View>
            )}
          </View>
        </Pressable>
      );
    }

    // Cheque (rarely used for fines but just in case)
    return (
      <Pressable
        key={item.id}
        style={[styles.paymentItemContainer, { marginRight: CARD_GAP, width: CARD_WIDTH * 0.55 }]}
        onPress={() => setSelectedPaymentId(item.id)}
      >
        <View style={[
          styles.chequeCard,
          isSelected && styles.selectedBorder
        ]}>
          <Ionicons name="document-text-outline" size={28} color="#999" style={{ marginBottom: 8 }} />
          <Text style={styles.chequeId} numberOfLines={1}>#{item.numeroIdentificacion}</Text>
          {isSelected && (
            <View style={styles.selectedDotContainerBank}>
              <View style={styles.selectedDot} />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  if (loading || !fine) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  const amount = Number(fine.monto || 0);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>

        {/* Header content */}
        <View style={styles.titleSection}>
          <View style={styles.warningIconContainer}>
            <Ionicons name="warning-outline" size={28} color="#B22222" />
          </View>
          <Text style={styles.mainTitle}>PAGO DE MULTA</Text>
          <Text style={styles.subTitle}>
            Multa por falta de fondos para cumplir con la oferta realizada.
          </Text>
        </View>

        {/* Lote card */}
        <View style={styles.loteCard}>
          <View style={styles.loteInfo}>
            <Text style={styles.loteLabel}>LOTE INCUMPLIDO</Text>
            <Text style={styles.loteTitle}>{fine.descProducto || `Subasta #${fine.subasta?.identificador || ''}`}</Text>
          </View>
          <View style={styles.loteAmountContainer}>
            <Text style={styles.loteAmount}>{formatGlobalMoney(amount)}</Text>
          </View>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MÉTODO DE PAGO</Text>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={Colors.secondary} />
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : payments.length === 0 ? (
            <View style={styles.noPaymentsContainer}>
              <Text style={styles.noPaymentsText}>
                No puedes proceder al pago porque no tienes métodos de pago registrados.
                Agrega uno en la sección "Medios de pago" de tu perfil.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH + CARD_GAP}
              snapToAlignment="start"
            >
              {payments.map(renderPaymentItem)}
            </ScrollView>
          )}
        </View>

      </ScrollView>

      {/* Footer / CTA */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.payButton,
            (paying || payments.length === 0 || !selectedPaymentId) && { opacity: 0.5 }
          ]}
          onPress={handlePay}
          disabled={paying || payments.length === 0 || !selectedPaymentId}
        >
          {paying ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.payButtonText}>PAGAR MULTA Y REGULARIZAR CUENTA</Text>
          )}
        </Pressable>
        <Text style={styles.footerNote}>
          Una vez abonada la multa, podrá volver a participar en subastas activas.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerRow: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFF',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },

  titleSection: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  warningIconContainer: {
    width: 48, height: 48, borderRadius: 8,
    backgroundColor: '#FDECEC', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontFamily: 'serif', fontSize: 24, fontWeight: '700', color: '#111',
    letterSpacing: 1, marginBottom: 8,
  },
  subTitle: {
    fontSize: 13, color: '#666', textAlign: 'center',
    lineHeight: 18, paddingHorizontal: 20,
  },

  loteCard: {
    flexDirection: 'row', backgroundColor: '#F7F7F9',
    borderRadius: 8, padding: 20, marginBottom: 40,
    alignItems: 'center', justifyContent: 'space-between',
  },
  loteInfo: { flex: 1, paddingRight: 16 },
  loteLabel: { fontSize: 9, fontWeight: '800', color: '#888', letterSpacing: 1.5, marginBottom: 6 },
  loteTitle: { fontFamily: 'serif', fontSize: 16, fontWeight: '600', color: '#111' },
  loteAmountContainer: {},
  loteAmount: { fontSize: 18, fontWeight: '700', color: '#111' },

  section: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 10, fontWeight: '800', color: '#888',
    letterSpacing: 2, marginBottom: 16,
  },
  loaderContainer: { padding: 20, alignItems: 'center' },
  errorText: { color: '#B22222', fontSize: 14, textAlign: 'center' },
  noPaymentsContainer: {
    padding: 16, backgroundColor: '#F9F9F9', borderRadius: 8,
    borderWidth: 1, borderColor: '#EEE'
  },
  noPaymentsText: { color: '#888', fontSize: 13, lineHeight: 20, textAlign: 'center' },
  horizontalScroll: { paddingBottom: 10 },

  paymentItemContainer: { width: CARD_WIDTH },
  selectedBorder: { borderWidth: 2, borderColor: '#111' },

  creditCard: {
    width: '100%', borderRadius: 12, padding: 20, minHeight: 160,
    justifyContent: 'space-between', overflow: 'hidden',
  },
  creditCardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  creditCardBrand: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  creditCardNumber: { fontSize: 18, fontWeight: '600', letterSpacing: 3, marginBottom: 16, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  creditCardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  creditCardLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 1.2, marginBottom: 3 },
  creditCardValue: { fontSize: 13, fontWeight: '700' },

  decorCircle: { position: 'absolute', borderRadius: 999 },
  decorCircle1: { width: 150, height: 150, top: -30, right: -40 },
  decorCircle2: { width: 100, height: 100, bottom: -20, left: -20 },

  selectedDotContainer: { position: 'absolute', bottom: 16, right: 16, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  selectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f7b600' }, // using yellow/orange for highlight

  bankCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F0F0F0', minHeight: 160 },
  bankCardRow: { flexDirection: 'row', alignItems: 'center' },
  bankIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: BANK_COLORS.default.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  bankCardInfo: { flex: 1 },
  bankName: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 2 },
  bankAccount: { fontSize: 12, color: '#888' },
  selectedDotContainerBank: { position: 'absolute', bottom: 16, right: 16 },

  chequeCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 160, borderWidth: 1, borderColor: '#F0F0F0' },
  chequeId: { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 6 },

  footer: { padding: 24, backgroundColor: '#FFF' },
  payButton: { backgroundColor: '#000', paddingVertical: 18, alignItems: 'center', borderRadius: 4, marginBottom: 16 },
  payButtonText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  footerNote: { fontSize: 11, color: '#888', textAlign: 'center', lineHeight: 16 },
});
