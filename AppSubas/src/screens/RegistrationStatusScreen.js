import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { palette } from '../constants/palette';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export default function RegistrationStatusScreen({ onBack, onContinueRegistration }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  const handleCheckStatus = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresá un email válido');
      return;
    }

    setLoading(true);
    setStatusResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/register/status?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (response.ok) {
        setStatusResult(data);
      } else {
        Alert.alert('Error', data.message || 'No se encontró el estado para ese email');
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No pudimos conectarnos al servidor. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (rawStatus) => {
    const status = String(rawStatus || '').toUpperCase();
    if (status === 'APROBADO' || status === 'APPROVED' || status === 'OK') return 'Aprobado';
    if (status === 'RECHAZADO' || status === 'REJECTED') return 'Rechazado';
    if (status === 'EN_PROCESO' || status === 'PENDIENTE' || status === 'PENDING' || status === 'PENDIENTE_VERIFICACION') return 'En proceso de validación';
    
    if (rawStatus) {
      return String(rawStatus)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }
    
    return 'Desconocido';
  };

  const getStatusVisuals = (rawStatus) => {
    const status = String(rawStatus || '').toUpperCase();
    if (status === 'APROBADO' || status === 'APPROVED' || status === 'OK') {
      return { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32', icon: 'checkmark-circle' };
    }
    if (status === 'RECHAZADO' || status === 'REJECTED') {
      return { bg: '#ffebee', border: '#f44336', text: '#c62828', icon: 'close-circle' };
    }
    // Default / Pending
    return { bg: '#fff3e0', border: '#ff9800', text: '#ef6c00', icon: 'time' };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Volver" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>ESTADO DE REGISTRO</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instructionText}>
          Ingresá el email con el que te registraste para consultar el estado de tu cuenta.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ingresar email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Pressable 
          onPress={handleCheckStatus} 
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, loading && styles.disabledButton]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>CONSULTAR ESTADO</Text>
          )}
        </Pressable>

        {statusResult && (() => {
          const visuals = getStatusVisuals(statusResult.status);
          return (
            <View style={[styles.resultCard, { backgroundColor: visuals.bg, borderColor: visuals.border, borderWidth: 2 }]}>
              <Ionicons name={visuals.icon} size={48} color={visuals.border} />
              <Text style={styles.resultTitle}>Estado de la cuenta</Text>
              <Text style={[styles.resultStatus, { color: visuals.text }]}>{getStatusText(statusResult.status)}</Text>
              {statusResult.categoria && (
                <Text style={[styles.resultDetails, { color: visuals.text, opacity: 0.8 }]}>Categoría: {statusResult.categoria}</Text>
              )}
              {(() => {
                if (!statusResult.puedeCompletarEtapa2) return null;

                return (
                  <View style={{ marginTop: 20, width: '100%', alignItems: 'center' }}>
                    <Text style={[styles.resultDetails, { color: visuals.text, opacity: 0.8, marginBottom: 12 }]}>
                      Podés completar la segunda etapa de tu registro.
                    </Text>
                    <Pressable 
                      onPress={() => onContinueRegistration?.(email)}
                      style={[styles.primaryButton, { backgroundColor: visuals.border, width: '100%' }]}
                    >
                      <Text style={styles.primaryText}>COMPLETAR REGISTRO</Text>
                    </Pressable>
                  </View>
                );
              })()}
            </View>
          );
        })()}
      </View>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eeeeef',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64 + STATUSBAR_HEIGHT,
    paddingTop: STATUSBAR_HEIGHT + 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: STATUSBAR_HEIGHT + 10,
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  backIcon: {
    color: '#202225',
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
  },
  primaryButton: {
    height: 50,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  primaryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  resultCard: {
    marginTop: 40,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.navy,
    marginBottom: 12,
  },
  resultDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  }
});
