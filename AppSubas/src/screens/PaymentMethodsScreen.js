import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Alert,
  RefreshControl,
  Platform,
  Modal,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../components/TopBar';
import { Colors } from '../themes/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;
const CARD_GAP = 12;

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const BRAND_COLORS = {
  visa: {
    bg: ['#1a1f71', '#2d338b'],
    gradient: '#1a1f71',
    accent: '#f7b600',
    text: '#FFFFFF',
    label: 'VISA',
  },
  mastercard: {
    bg: ['#1a1a2e', '#16213e'],
    gradient: '#1a1a2e',
    accent: '#eb001b',
    text: '#FFFFFF',
    label: 'MASTERCARD',
  },
  amex: {
    bg: ['#c5993e', '#d4af37'],
    gradient: '#c5993e',
    accent: '#FFFFFF',
    text: '#FFFFFF',
    label: 'AMERICAN EXPRESS',
  },
  american: {
    bg: ['#c5993e', '#d4af37'],
    gradient: '#c5993e',
    accent: '#FFFFFF',
    text: '#FFFFFF',
    label: 'AMERICAN EXPRESS',
  },
  default: {
    bg: ['#4a4a4a', '#6a6a6a'],
    gradient: '#4a4a4a',
    accent: '#c5a059',
    text: '#FFFFFF',
    label: '',
  },
};

const getBrandStyle = (entidad) => {
  if (!entidad) return BRAND_COLORS.default;
  const lower = entidad.toLowerCase();
  for (const key of Object.keys(BRAND_COLORS)) {
    if (lower.includes(key)) return BRAND_COLORS[key];
  }
  return { ...BRAND_COLORS.default, label: entidad.toUpperCase() };
};

const BANK_COLORS = {
  default: { bg: '#F0EDE8', icon: '#8B7355' },
};

export default function PaymentMethodsScreen({ session, onMenuPress, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Modal State
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (message) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastMessage(''));
  };

  const fetchPayments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me/payments`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data.items || []);
        setError('');
      } else {
        setError('No se pudieron cargar los medios de pago.');
      }
    } catch (err) {
      setError('Error de conexión al cargar medios de pago.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleDelete = (paymentId, tipo) => {
    setItemToDelete({ id: paymentId, tipo });
    setIsDeleteModalVisible(true);
  };

  const performDelete = async () => {
    if (!itemToDelete) return;
    const { id: paymentId, tipo } = itemToDelete;
    setIsDeleteModalVisible(false);
    setDeletingId(paymentId);
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me/payments/${paymentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok || response.status === 204) {
        setPayments((prev) => prev.filter((p) => p.id !== paymentId));
        showToast(tipo === 'cuenta_bancaria' ? 'Cuenta desvinculada con éxito' : 'Método de pago eliminado con éxito');
      } else if (response.status === 409) {
        Alert.alert('No se puede eliminar', 'Este medio de pago está asociado a una operación activa.');
      } else {
        Alert.alert('Error', 'No se pudo eliminar el medio de pago.');
      }
    } catch (err) {
      Alert.alert('Error', 'Error de conexión al eliminar.');
    } finally {
      setDeletingId(null);
      setItemToDelete(null);
    }
  };

  const tarjetas = payments.filter((p) => p.tipo === 'tarjeta_credito');
  const cuentas = payments.filter((p) => p.tipo === 'cuenta_bancaria');
  const cheques = payments.filter((p) => p.tipo === 'cheque_certificado');

  const renderCreditCard = (item) => {
    const brand = getBrandStyle(item.entidad);
    const isDeleting = deletingId === item.id;

    return (
      <View key={item.id} style={[styles.creditCardOuter, { marginRight: CARD_GAP }]}>
        <Pressable
          style={styles.cardActionBtn}
          onPress={() => handleDelete(item.id, item.tipo)}
          disabled={isDeleting}
        >
          <Text style={styles.cardActionDelete}>- ELIMINAR</Text>
        </Pressable>

        <View style={[styles.creditCard, { backgroundColor: brand.gradient }]}>
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
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.creditCardLabel, { color: `${brand.text}99` }]}>MONEDA</Text>
              <Text style={[styles.creditCardValue, { color: brand.text }]}>
                {item.moneda || '—'}
              </Text>
            </View>
          </View>

          <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: `${brand.accent}15` }]} />
          <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: `${brand.accent}10` }]} />
        </View>

        {isDeleting && (
          <View style={styles.cardOverlay}>
            <ActivityIndicator color="#FFF" />
          </View>
        )}
      </View>
    );
  };

  const renderBankAccount = (item) => {
    const isDeleting = deletingId === item.id;

    return (
      <View key={item.id} style={[styles.bankCardOuter, { marginRight: CARD_GAP }]}>
        {/* Action label */}
        <Pressable
          style={styles.cardActionBtn}
          onPress={() => handleDelete(item.id, item.tipo)}
          disabled={isDeleting}
        >
          <Text style={styles.cardActionDelete}>- DESVINCULAR</Text>
        </Pressable>

        <View style={styles.bankCard}>
          <View style={styles.bankCardRow}>
            <View style={styles.bankIcon}>
              <Ionicons name="business" size={22} color={BANK_COLORS.default.icon} />
            </View>
            <View style={styles.bankCardInfo}>
              <Text style={styles.bankName} numberOfLines={1}>{item.entidad || 'Banco'}</Text>
              <Text style={styles.bankAccount} numberOfLines={1}>{item.numeroIdentificacion || '—'}</Text>
            </View>
            {item.verificado && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>VERIFICADO</Text>
              </View>
            )}
          </View>
        </View>

        {isDeleting && (
          <View style={styles.cardOverlayBank}>
            <ActivityIndicator color="#FFF" />
          </View>
        )}
      </View>
    );
  };

  const renderCheque = (item) => {
    return (
      <View key={item.id} style={[styles.chequeCardOuter, { marginRight: CARD_GAP }]}>
        <View style={styles.chequeCard}>
          <Ionicons name="document-text-outline" size={28} color="#999" style={{ marginBottom: 8 }} />
          {item.numeroIdentificacion ? (
            <>
              <Text style={styles.chequeLabel}>FOLIO</Text>
              <Text style={styles.chequeId} numberOfLines={1}>#{item.numeroIdentificacion}</Text>
              {item.montoGarantia != null && (
                <Text style={styles.chequeAmount}>
                  ${Number(item.montoGarantia).toLocaleString('en-US', { minimumFractionDigits: 2 })} {item.moneda || 'USD'}
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.chequeUploadText}>Subir copia digital para garantía</Text>
          )}
        </View>
      </View>
    );
  };

  const renderSection = (title, items, renderItem, actionLabel, onAction) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable style={styles.sectionAction} onPress={onAction}>
          <Text style={styles.sectionActionText}>+ {actionLabel}</Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <Pressable style={styles.emptySection} onPress={onAction}>
          <Ionicons name="add-circle-outline" size={32} color="#CCC" />
          <Text style={styles.emptySectionText}>
            No hay {title.toLowerCase()} registradas
          </Text>
        </Pressable>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_GAP}
          snapToAlignment="start"
        >
          {items.map(renderItem)}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar onMenuPress={onMenuPress} />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : error ? (
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => { setLoading(true); fetchPayments(); }}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPayments(true)}
              colors={[Colors.secondary]}
              tintColor={Colors.secondary}
            />
          }
        >
          <Text style={styles.pageTitle}>Medios de Pago</Text>

          <View style={styles.warningBox}>
            <View style={styles.warningIconWrap}>
              <Ionicons name="warning" size={20} color="#B22222" />
            </View>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>AVISO IMPORTANTE</Text>
              <Text style={styles.warningText}>
                Se aplicará una multa del 10% sobre el valor del lote adjudicado en caso de falta de fondos o rechazo del medio de pago seleccionado.
              </Text>
            </View>
          </View>

          {renderSection('Tarjetas de Crédito', tarjetas, renderCreditCard, 'AGREGAR', () => onNavigate('addCreditCard'))}

          {renderSection('Cuentas Vinculadas', cuentas, renderBankAccount, 'VINCULAR', () => onNavigate('linkBankAccount'))}

          {renderSection('Cheques Certificados', cheques, renderCheque, 'CARGAR', () => onNavigate('addCheque'))}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons name="warning-outline" size={60} color="#D32F2F" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>¡Atención!</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro que quieres eliminar el método?{'\n'}¡Esta acción es irreversible!
            </Text>
            <View style={styles.modalButtonsRow}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelBtn]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>CANCELAR</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalConfirmBtn]}
                onPress={performDelete}
              >
                <Text style={styles.modalConfirmText}>ELIMINAR MÉTODO</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {toastMessage ? (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Ionicons name="checkmark-circle" size={24} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}

    </View>
  );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  pageTitle: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },

  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#F0E0CC',
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 16,
    marginBottom: 28,
  },
  warningIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FCECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B22222',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  warningText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },

  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  sectionAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderStyle: 'dashed',
  },
  emptySectionText: {
    fontSize: 13,
    color: '#AAA',
    marginTop: 8,
  },

  creditCardOuter: {
    width: CARD_WIDTH,
  },
  cardActionBtn: {
    alignSelf: 'flex-end',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  cardActionDelete: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B22222',
    letterSpacing: 0.3,
  },
  creditCard: {
    width: '100%',
    borderRadius: 14,
    padding: 20,
    minHeight: 180,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  creditCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  creditCardBrand: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  creditCardNumber: {
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  creditCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  creditCardLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  creditCardValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  decorCircle1: {
    width: 150,
    height: 150,
    top: -30,
    right: -40,
  },
  decorCircle2: {
    width: 100,
    height: 100,
    bottom: -20,
    left: -20,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    top: 22,
  },

  bankCardOuter: {
    width: CARD_WIDTH,
  },
  bankCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bankCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: BANK_COLORS.default.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankCardInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  bankAccount: {
    fontSize: 12,
    color: '#888',
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  cardOverlayBank: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    top: 22,
  },

  chequeCardOuter: {
    width: CARD_WIDTH * 0.55,
  },
  chequeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  chequeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#AAA',
    letterSpacing: 1,
    marginBottom: 2,
  },
  chequeId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  chequeAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
    marginTop: 4,
  },
  chequeUploadText: {
    fontSize: 12,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtonsRow: {
    width: '100%',
    flexDirection: 'column',
  },
  modalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalCancelBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  modalCancelText: {
    color: '#D32F2F',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  },
  modalConfirmBtn: {
    backgroundColor: '#990000',
    marginBottom: 0,
  },
  modalConfirmText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  },

  toastContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
