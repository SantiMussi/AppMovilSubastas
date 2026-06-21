import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../components/TopBar';
import { Colors } from '../themes/colors';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const ACCOUNT_TYPES = [
  { label: 'Cuenta Corriente', value: 'Checking' },
  { label: 'Caja de Ahorro', value: 'Savings' },
];

export default function LinkBankAccountScreen({ session, onMenuPress, onBack, onNavigate }) {
  const [banco, setBanco] = useState('');
  const [tipoCuenta, setTipoCuenta] = useState('');
  const [cbu, setCbu] = useState('');
  const [alias, setAlias] = useState('');
  const [cuentaPrincipal, setCuentaPrincipal] = useState(false);
  const [moneda, setMoneda] = useState('ARS');
  const [submitting, setSubmitting] = useState(false);

  const tipoCuentaLabel = ACCOUNT_TYPES.find((t) => t.value === tipoCuenta)?.label || '';

  const handleSelectTipoCuenta = () => {
    Alert.alert(
      'Tipo de Cuenta',
      'Seleccione el tipo de cuenta',
      [
        ...ACCOUNT_TYPES.map((opt) => ({
          text: opt.label,
          onPress: () => setTipoCuenta(opt.value),
        })),
        { text: 'Cancelar', style: 'cancel' },
      ],
    );
  };

  const handleSubmit = async () => {
    if (!banco.trim()) {
      Alert.alert('Campo requerido', 'Ingrese el nombre de la entidad bancaria.');
      return;
    }
    if (!tipoCuenta) {
      Alert.alert('Campo requerido', 'Seleccione el tipo de cuenta.');
      return;
    }
    if (cbu.trim().length !== 22) {
      Alert.alert('Campo inválido', 'El CBU/CVU debe tener exactamente 22 dígitos.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          tipo: 'cuenta_bancaria',
          entidad: banco.trim(),
          numeroIdentificacion: `CBU ${cbu.trim()}`,
          moneda: moneda,
        }),
      });

      if (response.status === 201) {
        onNavigate('paymentSuccess');
      } else {
        const data = await response.json().catch(() => ({}));
        Alert.alert(
          'Error',
          data.message || 'No se pudo vincular la cuenta bancaria. Intente nuevamente.',
        );
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
          {/* ── Title ── */}
          <Text style={styles.title}>Vincular Cuenta Bancaria</Text>
          <Text style={styles.subtitle}>
            Configure su medio de pago preferido para transacciones inmediatas.
          </Text>

          {/* ── BANCO ── */}
          <Text style={styles.label}>BANCO</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la entidad"
              placeholderTextColor="#BBB"
              value={banco}
              onChangeText={setBanco}
              autoCapitalize="words"
              editable={!submitting}
            />
          </View>

          {/* ── TIPO DE CUENTA ── */}
          <Text style={styles.label}>TIPO DE CUENTA</Text>
          <Pressable
            style={styles.inputContainer}
            onPress={handleSelectTipoCuenta}
            disabled={submitting}
          >
            <View style={styles.pickerRow}>
              <Text
                style={[
                  styles.input,
                  !tipoCuentaLabel && styles.placeholderText,
                ]}
              >
                {tipoCuentaLabel || 'Seleccionar tipo'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </View>
          </Pressable>

          {/* ── NÚMERO DE CBU/CVU ── */}
          <Text style={styles.label}>NÚMERO DE CBU/CVU</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="0000000000000000000000"
              placeholderTextColor="#BBB"
              value={cbu}
              onChangeText={setCbu}
              keyboardType="numeric"
              maxLength={22}
              editable={!submitting}
            />
          </View>

          {/* ── ALIAS ── */}
          <Text style={styles.label}>ALIAS</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="EJEMPLO.ALIAS.VANTAGE"
              placeholderTextColor="#BBB"
              value={alias}
              onChangeText={setAlias}
              autoCapitalize="characters"
              editable={!submitting}
            />
          </View>

          {/* ── Cuenta Principal toggle ── */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Cuenta Principal</Text>
              <Text style={styles.toggleSubtitle}>
                Se usará por defecto para garantías de subasta
              </Text>
            </View>
            <Switch
              value={cuentaPrincipal}
              onValueChange={setCuentaPrincipal}
              trackColor={{ false: '#E0E0E0', true: Colors.secondary }}
              thumbColor={cuentaPrincipal ? '#FFF' : '#FFF'}
              ios_backgroundColor="#E0E0E0"
              disabled={submitting}
            />
          </View>

          {/* ── Moneda toggle ── */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Moneda de la Cuenta</Text>
              <Text style={styles.toggleSubtitle}>
                {moneda === 'ARS' ? 'Cuenta local en Pesos Argentinos' : 'Cuenta internacional en Dólares'}
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

          {/* ── Submit Button ── */}
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && !submitting && styles.submitBtnPressed,
              submitting && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>VINCULAR AHORA</Text>
            )}
          </Pressable>

          {/* ── Cancel link ── */}
          <Pressable style={styles.cancelBtn} onPress={onBack} disabled={submitting}>
            <Text style={styles.cancelBtnText}>CANCELAR Y VOLVER</Text>
          </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  /* ── Title / Subtitle ── */
  title: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
    marginBottom: 28,
  },

  /* ── Labels ── */
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#333',
    letterSpacing: 1,
    marginBottom: 6,
  },

  /* ── Input container ── */
  inputContainer: {
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  /* ── Text input ── */
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
    backgroundColor: 'transparent',
  },
  placeholderText: {
    color: '#BBB',
  },

  /* ── Picker row ── */
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  /* ── Toggle row ── */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    marginTop: 4,
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

  /* ── Submit button ── */
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0A192F',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitBtnPressed: {
    opacity: 0.85,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  /* ── Cancel link ── */
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 12,
    color: '#999',
  },
});
