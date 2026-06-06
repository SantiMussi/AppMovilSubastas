import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { safeJson } from '../utils/safeJson';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const AUTH_PATH = '/api/v1/auth';
const CODE_LENGTH = 6;

export default function ChangePasswordScreen({ session, onBack }) {
  const [step, setStep] = useState('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [codeDigits, setCodeDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const inputs = useRef([]);

  const normalizedEmail = session?.profile?.email?.trim().toLowerCase() || session?.email?.trim().toLowerCase() || '';
  const code = codeDigits.join('');
  const passwordsMatch = Boolean(confirmPassword) && password === confirmPassword;
  const passwordMeetsRules = useMemo(() => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password), [password]);

  const request = async (path, body) => {
    const response = await fetch(`${API_BASE}${AUTH_PATH}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.accessToken}` },
      body: JSON.stringify(body),
    });
    const payload = await safeJson(response);
    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || `Error (${response.status})`);
    }
    return payload;
  };

  const handleContinueToCode = async () => {
    if (!passwordMeetsRules) {
      Alert.alert('Contraseña inválida', 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
      return;
    }
    if (!passwordsMatch) {
      Alert.alert('Contraseñas distintas', 'Las contraseñas no coinciden.');
      return;
    }
    if (!normalizedEmail) {
      Alert.alert('Error', 'No se pudo obtener el email de tu sesión.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Step 1: Request the code
      await request('/forgot', { email: normalizedEmail });
      setStep('code');
    } catch (error) {
      Alert.alert('Error', error.message || 'No pudimos enviar el código de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCodeDigits(Array(CODE_LENGTH).fill(''));
    setLoading(true);
    try {
      await request('/forgot', { email: normalizedEmail });
      Alert.alert('Enviado', 'Se ha reenviado un nuevo código a tu correo.');
    } catch (error) {
      Alert.alert('Error', error.message || 'No pudimos reenviar el código.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== CODE_LENGTH) {
      Alert.alert('Código incompleto', 'Ingresá los 6 dígitos del código de verificación.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Validating code and setting new password in one go
      const payload = await request('/reset', { email: normalizedEmail, code, newPassword: password });
      Alert.alert('Éxito', payload?.message || 'Contraseña actualizada correctamente', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'El código ingresado no es válido.');
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

  const renderPasswordStep = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.topChrome}>
        <Pressable onPress={onBack} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.backIcon}>← VANTAGE</Text>
        </Pressable>
        <Text style={styles.topChromeRight}>SETTINGS</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Cambiar{'\n'}Contraseña</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor="#ccc"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#999" />
            </Pressable>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor="#ccc"
            />
          </View>
        </View>

        <View style={styles.watermarkContainer} pointerEvents="none">
          <Ionicons name="key" size={250} color="rgba(0,0,0,0.03)" style={{transform: [{rotate: '45deg'}]}} />
        </View>

        <View style={{flex: 1}} />

        <Pressable style={styles.primaryBtn} disabled={loading} onPress={handleContinueToCode}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>CONTINUAR →</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );

  const renderCodeStep = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.topChromeCentered}>
        <Pressable onPress={() => setStep('password')} hitSlop={10} style={styles.absoluteLeft}>
          <Text style={styles.backIconSolo}>←</Text>
        </Pressable>
        <Image source={require('../../assets/images/logo_vantage.png')} style={styles.headerLogo} resizeMode="contain" />
      </View>

      <View style={styles.content}>
        <Text style={styles.titleCode}>Verificar Código</Text>
        <Text style={styles.subtitleCode}>Hemos enviado un código de 6{'\n'}dígitos a su correo electrónico.</Text>

        <View style={styles.codeBoxes}>
          {codeDigits.map((digit, index) => (
            <TextInput
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

        <Pressable style={styles.primaryBtnDark} disabled={loading} onPress={handleVerifyCode}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>VERIFICAR</Text>}
        </Pressable>

        <View style={styles.resendContainer}>
          <Text style={styles.resendTextDark}>¿NO RECIBIÓ EL CÓDIGO?</Text>
          <Pressable onPress={handleResend} disabled={loading}>
            <Text style={styles.resendLinkDark}>Reenviar código</Text>
          </Pressable>
        </View>

        <View style={{flex: 1}} />

        <View style={styles.footerSecurity}>
          <View style={styles.securityLine} />
          <View style={styles.securityDot} />
          <Text style={styles.securityText}>SECURITY PROTOCOL 2.0</Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        {step === 'password' ? renderPasswordStep() : renderCodeStep()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboard: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  topChrome: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
  },
  topChromeCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    position: 'relative',
  },
  absoluteLeft: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'android' ? 40 : 20,
    bottom: 20,
    justifyContent: 'center'
  },
  backIcon: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  backIconSolo: {
    fontSize: 20,
    color: '#333',
  },
  topChromeRight: {
    fontSize: 9,
    color: '#999',
    letterSpacing: 1,
  },
  headerLogo: {
    width: 140,
    height: 35,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 38,
  },
  titleCode: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitleCode: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 9,
    color: '#A8925A', // slightly golden matching screenshot
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 4,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    color: '#333',
    fontSize: 18,
    letterSpacing: 4,
  },
  eyeBtn: {
    padding: 12,
  },
  watermarkContainer: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  primaryBtn: {
    backgroundColor: '#0A1628',
    paddingVertical: 18,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 40,
  },
  primaryBtnDark: {
    backgroundColor: '#0A1628',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 30,
  },
  primaryBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  codeBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  codeBox: {
    width: 42,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    backgroundColor: '#FFF',
    fontSize: 24,
    color: '#333',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resendTextDark: {
    fontSize: 10,
    color: '#999',
    marginBottom: 6,
  },
  resendLinkDark: {
    fontSize: 11,
    color: '#A8925A', // Gold
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  footerSecurity: {
    alignItems: 'center',
  },
  securityLine: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginBottom: 6,
  },
  securityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A8925A',
    marginBottom: 10,
  },
  securityText: {
    fontSize: 8,
    color: '#999',
    letterSpacing: 1,
  }
});
