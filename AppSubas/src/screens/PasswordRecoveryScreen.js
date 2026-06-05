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

import { styles } from '../styles/passwordRecoveryStyles'
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