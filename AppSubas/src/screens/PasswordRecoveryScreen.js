import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
const AUTH_PATH = '/api/v1/auth';
const CODE_LENGTH = 6;

export default function PasswordRecoveryScreen({ onBack, onFinished }) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [codeDigits, setCodeDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const inputs = useRef([]);

  const normalizedEmail = email.trim().toLowerCase();
  const code = codeDigits.join('');
  const passwordsMatch = Boolean(confirmPassword) && password === confirmPassword;
  const passwordMeetsRules = useMemo(() => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password), [password]);

  const request = async (path, body) => {
    const response = await fetch(`${API_BASE}${AUTH_PATH}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await safeJson(response);

    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || `La solicitud falló (${response.status})`);
    }

    return payload;
  };

  const handleForgot = async () => {
    if (!normalizedEmail) {
      Alert.alert('Correo requerido', 'Ingresá tu correo electrónico para recibir el código de verificación.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = await request('/forgot', { email: normalizedEmail });
      const pushCode = payload?.pushNotification?.code;
      setStep('code');
      setMessage(payload?.message || 'Se envió un código de recuperación al email.');

      if (pushCode) {
        Alert.alert('Notificación VANTAGE', `Tu código de recuperación es ${pushCode}`);
      }
    } catch (error) {
      setMessage(error.message || 'No pudimos enviar el código de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCodeDigits(Array(CODE_LENGTH).fill(''));
    await handleForgot();
  };

  const handleValidateCode = async () => {
    if (code.length !== CODE_LENGTH) {
      Alert.alert('Código incompleto', 'Ingresá los 6 dígitos del código de verificación.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await request('/validate-reset-code', { email: normalizedEmail, code });
      setStep('password');
    } catch (error) {
      setMessage(error.message || 'El código ingresado no es válido.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!passwordMeetsRules) {
      Alert.alert('Contraseña inválida', 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
      return;
    }
    if (!passwordsMatch) {
      Alert.alert('Contraseñas distintas', 'Confirmá la contraseña nueva para continuar.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = await request('/reset', { email: normalizedEmail, code, newPassword: password });
      Alert.alert('OK', payload?.message || 'Contraseña actualizada correctamente', [
        { text: 'Continuar', onPress: onFinished },
      ]);
    } catch (error) {
      setMessage(error.message || 'No pudimos actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (text, index) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const nextDigits = [...codeDigits];
    nextDigits[index] = digit;
    setCodeDigits(nextDigits);

    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const renderEmailStep = () => (
    <ScrollView contentContainerStyle={styles.emailScroll} keyboardShouldPersistTaps="handled">
      <TopChrome onBack={onBack} compact={false} />

      <View style={styles.emailHero}>
        <Text style={styles.kicker}>SEGURIDAD DE CUENTA</Text>
        <Text style={styles.emailTitle}>Recuperar{`\n`}Acceso</Text>
        <Text style={styles.emailSubtitle}>Ingrese su correo electrónico{`\n`}para recibir un código de{`\n`}verificación.</Text>

        <View style={styles.emailFieldGroup}>
          <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ejemplo@vantage.com"
            placeholderTextColor="#8e95a4"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={styles.outlinedInput}
          />
        </View>

        {message ? <Text style={styles.feedback}>{message}</Text> : null}

        <PrimaryButton loading={loading} onPress={handleForgot} label="ENVIAR CÓDIGO ↗" />
      </View>

      <View style={styles.trustFooter}>
        <View style={styles.footerLine} />
        <Text style={styles.footerCenter}>PROVENANCE & TRUST</Text>
        <View style={styles.footerLine} />
      </View>
      <View style={styles.footerLinks}>
        <Text style={styles.footerLink}>ASISTENCIA</Text>
        <Text style={styles.footerLink}>PRIVACIDAD</Text>
      </View>
    </ScrollView>
  );

  const renderCodeStep = () => (
    <ScrollView contentContainerStyle={styles.codeScroll} keyboardShouldPersistTaps="handled">
      <TopChrome onBack={() => setStep('email')} compact />
      <View style={styles.codeContent}>
        <Text style={styles.codeTitle}>Verificar Código</Text>
        <Text style={styles.codeSubtitle}>Hemos enviado un código de 6{`\n`}dígitos a su correo electrónico.</Text>

        <View style={styles.codeBoxes}>
          {codeDigits.map((digit, index) => (
            <TextInput
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              ref={(input) => { inputs.current[index] = input; }}
              value={digit ? '•' : ''}
              onChangeText={(text) => handleDigitChange(text, index)}
              onKeyPress={(event) => handleCodeKeyPress(event, index)}
              keyboardType="number-pad"
              maxLength={1}
              style={styles.codeBox}
              textAlign="center"
            />
          ))}
        </View>

        {message ? <Text style={styles.feedback}>{message}</Text> : null}

        <PrimaryButton loading={loading} onPress={handleValidateCode} label="VERIFICAR" />

        <View style={styles.resendBlock}>
          <Text style={styles.resendQuestion}>¿NO RECIBIÓ EL CÓDIGO?</Text>
          <Pressable disabled={loading} onPress={handleResend}>
            <Text style={styles.resendLink}>Reenviar código</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.protocolBlock}>
        <View style={styles.protocolLine} />
        <View style={styles.protocolDot} />
        <Text style={styles.protocolText}>SECURITY PROTOCOL 2.0</Text>
      </View>
    </ScrollView>
  );

  const renderPasswordStep = () => (
    <ScrollView contentContainerStyle={styles.passwordScroll} keyboardShouldPersistTaps="handled">
      <View style={styles.passwordLogoWrap}>
        <Image source={require('../../assets/images/logo_vantage.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.passwordContent}>
        <Text style={styles.passwordTitle}>Nueva Contraseña</Text>
        <Text style={styles.passwordSubtitle}>Establezca su nueva clave de acceso para{`\n`}su cuenta VANTAGE.</Text>

        <PasswordField
          label="NUEVA CONTRASEÑA"
          value={password}
          onChangeText={setPassword}
          visible={showPassword}
          onToggleVisible={() => setShowPassword((visible) => !visible)}
        />

        <PasswordField
          label="CONFIRMAR NUEVA CONTRASEÑA"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          visible={showConfirmPassword}
          onToggleVisible={() => setShowConfirmPassword((visible) => !visible)}
        />

        {passwordsMatch ? <Text style={styles.matchText}>✓ Las contraseñas coinciden</Text> : null}
        {message ? <Text style={styles.feedback}>{message}</Text> : null}

        <Text style={styles.passwordHint}>La contraseña debe contener al menos 8 caracteres, incluyendo una mayúscula y un número.</Text>
      </View>

      <Pressable
        disabled={loading}
        onPress={handleResetPassword}
        style={({ pressed }) => [styles.goldButton, (pressed || loading) && styles.pressed]}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.goldButtonText}>ACTUALIZAR CONTRASEÑA</Text>}
      </Pressable>

      <Pressable disabled={loading} onPress={() => setStep('code')} style={styles.cancelButton}>
        <Text style={styles.cancelText}>CANCELAR Y VOLVER</Text>
      </Pressable>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        {step === 'email' ? renderEmailStep() : null}
        {step === 'code' ? renderCodeStep() : null}
        {step === 'password' ? renderPasswordStep() : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TopChrome({ onBack, compact }) {
  return (
    <View style={[styles.topChrome, compact && styles.topChromeCompact]}>
      <Pressable accessibilityLabel="Volver" onPress={onBack} style={styles.recoveryBackButton}>
        <Text style={styles.recoveryBackIcon}>←</Text>
      </Pressable>
      <Image source={require('../../assets/images/logo_vantage.png')} style={styles.topLogo} resizeMode="contain" />
    </View>
  );
}

function PrimaryButton({ label, loading, onPress }) {
  return (
    <Pressable disabled={loading} onPress={onPress} style={({ pressed }) => [styles.primaryButton, (pressed || loading) && styles.pressed]}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{label}</Text>}
    </Pressable>
  );
}

function PasswordField({ label, value, onChangeText, visible, onToggleVisible }) {
  return (
    <View style={styles.passwordFieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordInputShell}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          placeholder="••••••••"
          placeholderTextColor="#9a9da5"
          autoCapitalize="none"
          autoComplete="new-password"
          style={styles.passwordInput}
        />
        <Pressable onPress={onToggleVisible} style={styles.eyeButton}>
          <Text style={styles.eyeText}>{visible ? '◉' : '◌'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbfbfc',
  },
  keyboard: {
    flex: 1,
  },
  emailScroll: {
    minHeight: '100%',
    paddingHorizontal: 23,
    paddingBottom: 36,
  },
  codeScroll: {
    minHeight: '100%',
    paddingHorizontal: 22,
    paddingBottom: 38,
  },
  passwordScroll: {
    minHeight: '100%',
    paddingHorizontal: 26,
    paddingBottom: 34,
  },
  topChrome: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  topChromeCompact: {
    height: 120,
  },
  recoveryBackButton: {
    position: 'absolute',
    left: -12,
    top: 14,
    height: 42,
    width: 42,
    justifyContent: 'center',
  },
  recoveryBackIcon: {
    color: '#111316',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 31,
  },
  topLogo: {
    width: 98,
    height: 34,
  },
  logo: {
    width: 103,
    height: 44,
  },
  emailHero: {
    marginTop: 85,
  },
  kicker: {
    color: palette.gold,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 14,
  },
  emailTitle: {
    color: '#030303',
    fontFamily: 'serif',
    fontSize: 37,
    fontWeight: '800',
    lineHeight: 41,
    marginBottom: 12,
  },
  emailSubtitle: {
    color: '#5f6570',
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 34,
  },
  label: {
    color: '#8d929b',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  emailFieldGroup: {
    marginBottom: 36,
  },
  outlinedInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d8dbe0',
    color: '#1e2530',
    fontSize: 16,
    paddingHorizontal: 0,
  },
  primaryButton: {
    height: 47,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 1,
  },
  primaryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3.3,
  },
  feedback: {
    color: palette.danger,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  pressed: {
    opacity: 0.72,
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 65,
    gap: 13,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e3e8',
  },
  footerCenter: {
    color: '#b1b4ba',
    fontSize: 8,
    letterSpacing: 0.7,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 21,
  },
  footerLink: {
    color: '#9fa3aa',
    fontSize: 9,
  },
  codeContent: {
    marginTop: 44,
  },
  codeTitle: {
    color: '#030303',
    fontFamily: 'serif',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 14,
  },
  codeSubtitle: {
    color: '#5f6570',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 37,
  },
  codeBoxes: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 37,
  },
  codeBox: {
    width: 38,
    height: 50,
    borderWidth: 1,
    borderColor: '#a7abb3',
    backgroundColor: '#f5f6f8',
    color: '#727987',
    fontSize: 24,
    fontWeight: '700',
  },
  resendBlock: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendQuestion: {
    color: '#777d86',
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  resendLink: {
    color: palette.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textDecorationLine: 'underline',
    textDecorationColor: '#d3c09b',
  },
  protocolBlock: {
    alignItems: 'center',
    marginTop: 67,
  },
  protocolLine: {
    height: 42,
    width: 1,
    backgroundColor: '#d3b982',
    marginBottom: 27,
  },
  protocolDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#9b7d35',
    marginBottom: 16,
  },
  protocolText: {
    color: '#a8abb2',
    fontSize: 8,
    letterSpacing: 2.1,
  },
  passwordLogoWrap: {
    alignItems: 'center',
    paddingTop: 11,
  },
  passwordContent: {
    marginTop: 150,
  },
  passwordTitle: {
    color: '#030303',
    fontFamily: 'serif',
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  passwordSubtitle: {
    color: '#5f6570',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 32,
  },
  passwordFieldGroup: {
    marginBottom: 18,
  },
  passwordInputShell: {
    height: 46,
    borderRadius: 4,
    backgroundColor: '#f0f0f2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    color: '#1d2330',
    fontSize: 14,
  },
  eyeButton: {
    width: 32,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeText: {
    color: '#8a8f98',
    fontSize: 20,
  },
  matchText: {
    color: '#11a86f',
    fontSize: 11,
    marginTop: -8,
    marginBottom: 27,
  },
  passwordHint: {
    color: '#92969f',
    fontSize: 9,
    lineHeight: 12,
    marginTop: 2,
  },
  goldButton: {
    height: 46,
    backgroundColor: '#856414',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 1,
    marginTop: 62,
    shadowColor: '#7d641f',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  goldButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3.3,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  cancelText: {
    color: '#c5a86f',
    fontSize: 10,
    letterSpacing: 1,
  },
});