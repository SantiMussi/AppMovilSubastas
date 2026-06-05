import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import { TopBar } from '../components/TopBar';
import { palette } from '../constants/palette';

const emptyValue = '—';

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return emptyValue;
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value, null, 2);
};

const DataRow = ({ label, value, monospace }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text selectable style={[styles.value, monospace && styles.monospace]}>
      {formatValue(value)}
    </Text>
  </View>
);

export default function UserDataScreen({ session, onLogout, onMenuPress }) {
  const authPayload = session?.authPayload || {};
  const profile = session?.profile || authPayload.user || {};
  const token = session?.accessToken || authPayload.accessToken || authPayload.access_token;

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f9' }}>
      <TopBar onMenuPress={onMenuPress} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.brand}>Vantage</Text>
          <Text style={styles.kicker}>PANTALLA PLACEHOLDER</Text>
          <Text style={styles.title}>Datos completos del usuario</Text>
          <Text style={styles.subtitle}>
            Vista temporal para verificar la información recibida después de iniciar sesión o completar el registro.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Perfil</Text>
          <DataRow label="ID" value={profile.identificador ?? profile.id} />
          <DataRow label="Documento" value={profile.documento} />
          <DataRow label="Nombre" value={profile.nombre} />
          <DataRow label="Apellido" value={profile.apellido} />
          <DataRow label="Email" value={profile.email ?? authPayload.email} />
          <DataRow label="Dirección" value={profile.direccion ?? profile.domicilio} />
          <DataRow label="Categoría" value={profile.categoria ?? authPayload.user?.categoria} />
          <DataRow label="Foto" value={profile.foto} monospace />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Access token</Text>
          <DataRow label="Token" value={token} monospace />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Respuesta completa de autenticación</Text>
          <DataRow label="JSON" value={authPayload} monospace />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Respuesta completa de perfil</Text>
          <DataRow label="JSON" value={profile} monospace />
        </View>

        {session?.profileError ? (
          <View style={[styles.card, styles.warningCard]}>
            <Text style={styles.sectionTitle}>Aviso</Text>
            <Text style={styles.warningText}>{session.profileError}</Text>
          </View>
        ) : null}

        <Pressable onPress={onLogout} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>CERRAR SESIÓN</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f9',
  },
  scroll: {
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  header: {
    marginBottom: 20,
  },
  brand: {
    color: '#000',
    fontFamily: 'serif',
    fontSize: 30,
    fontWeight: '900',
  },
  kicker: {
    color: palette.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.4,
    marginTop: 10,
  },
  title: {
    color: '#0b0c0f',
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: '#616875',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderColor: '#ebecef',
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  warningCard: {
    borderColor: '#f1d48a',
    backgroundColor: '#fff9ea',
  },
  sectionTitle: {
    color: '#111',
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  row: {
    borderTopColor: '#f0f1f3',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  label: {
    color: palette.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  value: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  warningText: {
    color: '#6b4f00',
    fontSize: 13,
    lineHeight: 19,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0b1020',
    marginTop: 4,
    paddingVertical: 15,
  },
  pressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
});