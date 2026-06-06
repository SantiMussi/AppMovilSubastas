import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../components/TopBar';
import { Colors } from '../themes/colors';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

/* ── Brand detection from first digit ── */
const detectBrand = (number) => {
  const clean = number.replace(/\s/g, '');
  if (!clean) return '';
  const first = clean[0];
  if (first === '4') return 'Visa';
  if (first === '5') return 'Mastercard';
  if (first === '3') return 'Amex';
  return '';
};

/* ── Format card number with spaces every 4 digits ── */
const formatCardNumber = (text) => {
  const clean = text.replace(/\D/g, '').slice(0, 16);
  const groups = clean.match(/.{1,4}/g);
  return groups ? groups.join(' ') : '';
};

/* ── Format expiry as MM/AA ── */
const formatExpiry = (text) => {
  const clean = text.replace(/\D/g, '').slice(0, 4);
  if (clean.length > 2) {
    return clean.slice(0, 2) + '/' + clean.slice(2);
  }
  return clean;
};

/* ── Display dots for card preview ── */
const getCardNumberDisplay = (number) => {
  const clean = number.replace(/\s/g, '');
  if (!clean) return '•••• •••• •••• ••••';
  const padded = clean.padEnd(16, '•');
  return padded.slice(0, 4) + ' ' + padded.slice(4, 8) + ' ' + padded.slice(8, 12) + ' ' + padded.slice(12, 16);
};

/* ── Validate Luhn Algorithm ── */
const validateLuhn = (number) => {
  const clean = number.replace(/\D/g, '');
  if (!clean) return false;
  let sum = 0;
  let isEven = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};

/* ── Validate Expiry Date (MM/AA) not in past ── */
const validateExpiry = (text) => {
  if (text.length < 5) return false;
  const [month, yearStr] = text.split('/');
  const m = parseInt(month, 10);
  const y = parseInt(yearStr, 10);
  if (m < 1 || m > 12) return false;
  
  const now = new Date();
  const currentYear = parseInt(now.getFullYear().toString().slice(-2), 10);
  const currentMonth = now.getMonth() + 1;

  if (y < currentYear) return false;
  if (y === currentYear && m < currentMonth) return false;
  return true;
};

export default function AddCreditCardScreen({ session, onMenuPress, onBack, onNavigate }) {
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cvvFocused, setCvvFocused] = useState(false);
  const [moneda, setMoneda] = useState('ARS');

  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: cvvFocused ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [cvvFocused, flipAnim]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
  const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };

  const brand = detectBrand(numero);

  const handleCardNumberChange = (text) => {
    setNumero(formatCardNumber(text));
  };

  const handleExpiryChange = (text) => {
    // Allow backspace to delete the slash
    if (text.length < vencimiento.length) {
      const clean = text.replace(/\D/g, '');
      setVencimiento(formatExpiry(clean));
    } else {
      setVencimiento(formatExpiry(text));
    }
  };

  const handleSubmit = async () => {
    const cleanNumber = numero.replace(/\s/g, '');

    if (!nombre.trim()) {
      Alert.alert('Error', 'Ingrese el nombre del titular.');
      return;
    }
    if (cleanNumber.length < 13 || !validateLuhn(cleanNumber)) {
      Alert.alert('Error', 'El número de tarjeta no es válido (falló validación de red).');
      return;
    }
    if (!validateExpiry(vencimiento)) {
      Alert.alert('Error', 'Ingrese una fecha de vencimiento válida y que no haya expirado (MM/AA).');
      return;
    }
    if (cvv.length < 3) {
      Alert.alert('Error', 'Ingrese un código de seguridad válido.');
      return;
    }

    const last4 = cleanNumber.slice(-4);
    const maskedNumber = `**** **** **** ${last4}`;
    const entidad = brand || 'Desconocida';

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          tipo: 'tarjeta_credito',
          entidad,
          numeroIdentificacion: maskedNumber,
          moneda: moneda,
        }),
      });

      if (response.status === 201) {
        onNavigate('paymentSuccess');
      } else {
        const data = await response.json().catch(() => null);
        Alert.alert('Error', data?.message || 'No se pudo registrar la tarjeta. Intente nuevamente.');
      }
    } catch (err) {
      Alert.alert('Error de conexión', 'Verifique su conexión a internet e intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar onMenuPress={onMenuPress} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Live Card Preview ── */}
          <View style={styles.cardPreviewWrapper}>
            <View style={styles.cardFlipContainer}>
              {/* FRONT OF CARD */}
              <Animated.View style={[styles.cardPreview, frontAnimatedStyle]}>
                {/* Top row: chip + brand */}
                <View style={styles.cardTopRow}>
                  <View style={styles.cardChip} />
                  <Text style={styles.cardBrandText}>VANTAGE</Text>
                </View>

                {/* Card number */}
                <Text style={styles.cardNumberText}>
                  {getCardNumberDisplay(numero)}
                </Text>

                {/* Bottom row: name + expiry */}
                <View style={styles.cardBottomRow}>
                  <View style={styles.cardBottomLeft}>
                    <Text style={styles.cardLabel}>NOMBRE DEL TITULAR</Text>
                    <Text style={styles.cardValue} numberOfLines={1}>
                      {nombre.trim() ? nombre.toUpperCase() : 'NOMBRE APELLIDO'}
                    </Text>
                  </View>
                  <View style={styles.cardBottomRight}>
                    <Text style={styles.cardLabel}>EXPIRA</Text>
                    <Text style={styles.cardValue}>
                      {vencimiento || 'MM/AA'}
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* BACK OF CARD */}
              <Animated.View style={[styles.cardPreview, styles.cardPreviewBack, backAnimatedStyle]}>
                <View style={styles.magneticStripe} />
                <View style={styles.cvvStrip}>
                  <Text style={styles.cvvStripText}>{cvv || '***'}</Text>
                </View>
                <View style={styles.cardBackBottom}>
                  <Text style={styles.cardBrandText}>VANTAGE</Text>
                </View>
              </Animated.View>
            </View>
          </View>

          {/* ── Form ── */}
          <View style={styles.formContainer}>
            {/* Nombre del titular */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>NOMBRE DEL TITULAR</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Como aparece en la tarjeta"
                placeholderTextColor="#BBB"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {/* Número de tarjeta */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>NÚMERO DE TARJETA</Text>
              <View style={styles.fieldInputRow}>
                <Ionicons
                  name="card-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.fieldInput, styles.fieldInputWithIcon]}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#BBB"
                  value={numero}
                  onChangeText={handleCardNumberChange}
                  keyboardType="numeric"
                  maxLength={19}
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Row: Vencimiento + Código de seguridad */}
            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, styles.halfField]}>
                <Text style={styles.fieldLabel}>VENCIMIENTO</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="MM/AA"
                  placeholderTextColor="#BBB"
                  value={vencimiento}
                  onChangeText={handleExpiryChange}
                  keyboardType="numeric"
                  maxLength={5}
                  autoCorrect={false}
                />
              </View>
              <View style={styles.rowSpacer} />
              <View style={[styles.fieldGroup, styles.halfField]}>
                <Text style={styles.fieldLabel}>CÓD. SEGURIDAD</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="CVV"
                  placeholderTextColor="#BBB"
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/\D/g, ''))}
                  onFocus={() => setCvvFocused(true)}
                  onBlur={() => setCvvFocused(false)}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* ── Moneda toggle ── */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleTitle}>Moneda de la Tarjeta</Text>
                <Text style={styles.toggleSubtitle}>
                  {moneda === 'ARS' ? 'Tarjeta local en Pesos Argentinos' : 'Tarjeta internacional en Dólares'}
                </Text>
              </View>
              <Switch
                value={moneda === 'USD'}
                onValueChange={(val) => setMoneda(val ? 'USD' : 'ARS')}
                trackColor={{ false: '#E0E0E0', true: Colors.secondary }}
                thumbColor="#FFF"
                ios_backgroundColor="#E0E0E0"
                disabled={submitting}
              />
            </View>

          </View>

          {/* ── Submit Button ── */}
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && styles.submitBtnPressed,
              submitting && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>GUARDAR TARJETA</Text>
            )}
          </Pressable>

          {/* ── Cancel Link ── */}
          <Pressable style={styles.cancelBtn} onPress={onBack}>
            <Text style={styles.cancelBtnText}>CANCELAR Y VOLVER</Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ─────────────────────── styles ─────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 20,
  },

  /* ── Card Preview ── */
  cardPreviewWrapper: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    alignItems: 'center',
    width: '100%',
  },
  cardFlipContainer: {
    width: '100%',
    height: 195,
  },
  cardPreview: {
    width: '100%',
    height: 195,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 22,
    justifyContent: 'space-between',
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardPreviewBack: {
    justifyContent: 'flex-start',
    padding: 0,
  },
  magneticStripe: {
    width: '100%',
    height: 40,
    backgroundColor: '#050a12',
    marginTop: 24,
  },
  cvvStrip: {
    width: '80%',
    height: 36,
    backgroundColor: '#EAEAEA',
    alignSelf: 'center',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  cvvStripText: {
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  cardBackBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 22,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  cardChip: {
    width: 36,
    height: 26,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
  },
  cardBrandText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
    color: Colors.tertiary,
    fontFamily: 'serif',
  },
  cardNumberText: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 3,
    color: '#FFFFFF',
    marginBottom: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardBottomLeft: {
    flex: 1,
    marginRight: 16,
  },
  cardBottomRight: {
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ── Form ── */
  formContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  fieldGroup: {
    marginBottom: 22,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#333',
    letterSpacing: 1,
    marginBottom: 6,
  },
  fieldInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
  },
  fieldInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 10,
  },
  fieldInputWithIcon: {
    flex: 1,
  },
  rowFields: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  halfField: {
    flex: 1,
  },
  rowSpacer: {
    width: 20,
  },

  /* ── Buttons ── */
  submitBtn: {
    marginHorizontal: 24,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnPressed: {
    opacity: 0.85,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 12,
    color: '#999',
  },
  /* ── Toggle row ── */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 24,
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#888',
    lineHeight: 17,
  },
});
