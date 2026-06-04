import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { palette } from '../constants/palette';
import { safeJson } from '../utils/safeJson';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const LOGIN_PATH = '/api/v1/auth/login';

export default function LoginScreen({ onBack, onRegister, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Credenciales requeridas', 'Ingresá tu email y contraseña para continuar.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}${LOGIN_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const payload = await safeJson(response);

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || `No pudimos iniciar sesión (${response.status})`);
      }

      setMessage('Sesión iniciada correctamente.');
      onLoginSuccess?.(payload);
      return <RegisterScreen onBack={() => setScreen('authChoice')} onRegisterSuccess={openUserDataScreen} />;
    } catch (error) {
      const errorMessage = error.message || 'No pudimos iniciar sesión.';
      setMessage(errorMessage);
      // Alert.alert('Error de inicio de sesión', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityLabel="Volver" onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.brand}>Vantage</Text>
            <Text style={styles.tagline}>LEGACY & CURATION</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Bienvenido de nuevo</Text>
            <Text style={styles.subtitle}>Acceda a su catálogo exclusivo y gestione sus pujas con total seguridad.</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL O USUARIO</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="nombre@ejemplo.com"
                  placeholderTextColor="#8e95a4"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.label}>CONTRASEÑA</Text>
                  <Pressable onPress={() => Alert.alert('Recuperar contraseña', 'Contactá al equipo de soporte para restablecer tu acceso.')}>
                    <Text style={styles.forgot}>OLVIDÉ MI CONTRASEÑA</Text>
                  </Pressable>
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••••••"
                  placeholderTextColor="#8e95a4"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  style={styles.input}
                />
              </View>
            </View>

            {message ? <Text style={styles.feedback}>{message}</Text> : null}

            <Pressable
              disabled={loading}
              onPress={handleLogin}
              style={({ pressed }) => [styles.loginButton, (pressed || loading) && styles.pressed]}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>INGRESAR</Text>}
            </Pressable>

            <View style={styles.separator} />

            <View style={styles.registerBlock}>
              <Text style={styles.registerPrompt}>¿Aún no forma parte de la herencia?</Text>
              <Pressable onPress={onRegister} style={styles.registerLinkWrap}>
                <Text style={styles.registerLink}>Solicitar Registro de Miembro</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footer}>© 2024 AUREUM HERITAGE AUCTION HOUSE. ALL{`\n`}RIGHTS RESERVED.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f9',
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    minHeight: '100%',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 12,
    paddingBottom: 28,
  },
  backButton: {
    alignSelf: 'flex-start',
    height: 39,
    width: 42,
    justifyContent: 'center',
    marginLeft: -12,
  },
  backIcon: {
    color: '#0b0c0f',
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 27,
    marginBottom: 41,
  },
  brand: {
    color: '#000',
    fontFamily: 'serif',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  tagline: {
    color: '#9d7a3a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 25,
  },
  card: {
    width: '100%',
    maxWidth: 296,
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 24,
  },
  title: {
    color: '#222',
    fontFamily: 'serif',
    fontSize: 23,
    fontWeight: '500',
    marginBottom: 8,
  },
  subtitle: {
    color: '#5c616a',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 12,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: '#7a7f89',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  forgot: {
    color: palette.gold,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  input: {
    minHeight: 34,
    paddingVertical: 0,
    paddingHorizontal: 0,
    color: palette.ink,
    fontSize: 14,
    outlineStyle: 'none',
  },
  feedback: {
    color: palette.gold,
    fontSize: 11,
    marginTop: 14,
    textAlign: 'center',
  },
  loginButton: {
    minHeight: 49,
    marginTop: 34,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#ececec',
    marginTop: 35,
    marginBottom: 29,
  },
  registerBlock: {
    alignItems: 'center',
  },
  registerPrompt: {
    color: '#44474e',
    fontSize: 12,
    marginBottom: 17,
  },
  registerLinkWrap: {
    borderBottomWidth: 1,
    borderBottomColor: '#a48448',
    paddingBottom: 3,
  },
  registerLink: {
    color: '#171717',
    fontFamily: 'serif',
    fontSize: 15,
  },
  footer: {
    color: '#9da1aa',
    fontSize: 8,
    letterSpacing: 2,
    lineHeight: 13,
    marginTop: 0,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});