import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { TopBar } from '../components/TopBar';
import { Colors } from '../themes/colors';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export default function AddChequeScreen({ session, onMenuPress, onBack, onNavigate }) {
  const [banco, setBanco] = useState('');
  const [numeroCheque, setNumeroCheque] = useState('');
  const [monto, setMonto] = useState('');
  const [documentUri, setDocumentUri] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUploadPress = async () => {
    Alert.alert(
      'Seleccionar documento',
      'Elija el origen de la imagen',
      [
        {
          text: 'Cámara',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Permiso denegado', 'Se necesita permiso para usar la cámara');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setDocumentUri(result.assets[0].uri);
              setDocumentName(result.assets[0].uri.split('/').pop() || 'foto_cheque.jpg');
            }
          },
        },
        {
          text: 'Galería',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setDocumentUri(result.assets[0].uri);
              setDocumentName(result.assets[0].uri.split('/').pop() || 'cheque_escaneado.jpg');
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
    );
  };

  const parseMonto = (value) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSubmit = async () => {
    if (!banco.trim()) {
      Alert.alert('Campo requerido', 'Ingrese el banco emisor del cheque.');
      return;
    }
    if (!numeroCheque.trim()) {
      Alert.alert('Campo requerido', 'Ingrese el número de cheque.');
      return;
    }
    if (!monto.trim() || parseMonto(monto) <= 0) {
      Alert.alert('Campo requerido', 'Ingrese un monto válido mayor a 0.');
      return;
    }
    if (!documentUri) {
      Alert.alert('Campo requerido', 'Debe adjuntar una copia digital del cheque.');
      return;
    }

    setLoading(true);
    try {
      const body = {
        tipo: 'cheque_certificado',
        entidad: banco.trim(),
        numeroIdentificacion: numeroCheque.trim(),
        moneda: 'USD',
        montoGarantia: parseMonto(monto),
        comprobante: documentUri || null,
      };

      const response = await fetch(`${API_BASE}/api/v1/users/me/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 201) {
        onNavigate('paymentSuccess');
      } else {
        const data = await response.json().catch(() => null);
        Alert.alert(
          'Error',
          data?.message || 'No se pudo registrar el cheque. Intente nuevamente.',
        );
      }
    } catch (err) {
      Alert.alert('Error de conexión', 'Verifique su conexión a internet e intente nuevamente.');
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>Cargar Cheque Certificado</Text>
          <Text style={styles.subtitle}>
            Complete los datos del cheque que se utilizará como garantía para sus pujas.
          </Text>

          {/* ── Banco Emisor ── */}
          <Text style={styles.label}>BANCO EMISOR</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. JP Morgan Chase"
            placeholderTextColor="#BBB"
            value={banco}
            onChangeText={setBanco}
            autoCapitalize="words"
            returnKeyType="next"
          />

          {/* ── Número de Cheque ── */}
          <Text style={styles.label}>NÚMERO DE CHEQUE</Text>
          <TextInput
            style={styles.input}
            placeholder="0000000000"
            placeholderTextColor="#BBB"
            value={numeroCheque}
            onChangeText={setNumeroCheque}
            keyboardType="numeric"
            returnKeyType="next"
          />

          {/* ── Monto (USD) ── */}
          <Text style={styles.label}>MONTO (USD)</Text>
          <View style={styles.montoRow}>
            <Text style={styles.montoPrefix}>$</Text>
            <TextInput
              style={[styles.input, styles.montoInput]}
              placeholder="50,000.00"
              placeholderTextColor="#BBB"
              value={monto}
              onChangeText={setMonto}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>

          {/* ── Documentación ── */}
          <Text style={styles.label}>DOCUMENTACIÓN</Text>
          <Pressable style={styles.uploadArea} onPress={handleUploadPress}>
            {documentUri ? (
              <View style={styles.uploadedContent}>
                <Ionicons name="document-attach" size={32} color={Colors.secondary} />
                <Text style={styles.uploadedText} numberOfLines={1}>
                  {documentName}
                </Text>
                <Text style={styles.uploadChangeText}>Tocar para cambiar</Text>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="cloud-upload-outline" size={32} color="#CCC" />
                <Text style={styles.uploadText}>Subir copia digital del cheque</Text>
              </View>
            )}
          </Pressable>

          {/* ── Submit Button ── */}
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && styles.submitBtnPressed,
              loading && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>CARGAR GARANTÍA</Text>
            )}
          </Pressable>

          {/* ── Cancel Link ── */}
          <Pressable style={styles.cancelBtn} onPress={onBack} disabled={loading}>
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
    paddingBottom: 40,
  },

  /* ── Title & Subtitle ── */
  title: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    paddingTop: 24,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
    marginBottom: 28,
    marginTop: 6,
  },

  /* ── Labels ── */
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: 18,
  },

  /* ── Inputs ── */
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
  },

  /* ── Monto row with $ prefix ── */
  montoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  montoPrefix: {
    fontSize: 15,
    color: '#000',
    marginRight: 4,
    paddingVertical: 12,
  },
  montoInput: {
    flex: 1,
    borderBottomWidth: 0,
  },

  /* ── Upload Area ── */
  uploadArea: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginTop: 8,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 13,
    color: '#AAA',
    marginTop: 8,
  },
  uploadedContent: {
    alignItems: 'center',
  },
  uploadedText: {
    fontSize: 13,
    color: '#333',
    marginTop: 8,
    fontWeight: '600',
  },
  uploadChangeText: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 4,
  },

  /* ── Submit Button ── */
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
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

  /* ── Cancel Link ── */
  cancelBtn: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 12,
    color: '#999',
  },
});
