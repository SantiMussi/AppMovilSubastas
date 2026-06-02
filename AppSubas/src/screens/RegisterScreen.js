import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { ActionButton, Card, CenteredScreen, DocumentBox, Header, KeyWatermark, LabeledInput, ProfileRow } from '../components';
import { palette } from '../constants/palette';
import { styles } from '../styles/registerStyles';
import { safeJson } from '../utils/safeJson';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:8080';

const initialForm = {
  nombre: '',
  apellido: '',
  documento: '',
  email: '',
  direccion: '',
  pais: 'Argentina',
  dorsoDni: null,
  frenteDni: null,
};

export default function RegisterScreen() {
  const [step, setStep] = useState('details');
  const [form, setForm] = useState(initialForm);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [acceptedTruth, setAcceptedTruth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fullName = useMemo(
    () => [form.nombre, form.apellido].filter(Boolean).join(' ').trim() || 'Alejandro Valentín',
    [form.nombre, form.apellido]
  );

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validateDetails = () => {
    const required = ['nombre', 'apellido', 'documento', 'email', 'direccion'];
    const missing = required.find((key) => !form[key].trim());

    if (missing) {
      Alert.alert('Información incompleta', 'Completá tus datos personales para continuar.');
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      Alert.alert('Email inválido', 'Ingresá una dirección de email válida.');
      return false;
    }

    return true;
  };

  const validatePassword = () => {
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    if (password !== passwordConfirm) {
      Alert.alert('Las contraseñas no coinciden', 'Revisá la confirmación de contraseña.');
      return false;
    }

    return true;
  };

  const checkRegisterStatus = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/auth/register/status?email=${encodeURIComponent(form.email.trim())}`
      );

      if (response.ok) {
        const status = await response.json();

        if (status.approved || status.estado === 'approved' || status.estado === 'aprobado') {
          setStep('security');
          return;
        }

        setMessage('Tu documentación continúa en revisión. Te avisaremos cuando esté aprobada.');
        return;
      }

      setMessage('No se encontró un endpoint de estado activo; podés continuar la demo de registro.');
      setStep('security');
    } catch (error) {
      setMessage('No pudimos consultar el estado, pero podés continuar la demo de registro.');
      setStep('security');
    } finally {
      setLoading(false);
    }
  };

  const submitRegistration = async () => {
    if (!acceptedTruth) {
      Alert.alert('Confirmación requerida', 'Confirmá que los datos son veraces y corresponden a tu identidad legal.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documento: form.documento.trim(),
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          email: form.email.trim().toLowerCase(),
          direccion: form.direccion.trim(),
          password,
        }),
      });

      const payload = await safeJson(response);

      if (!response.ok) {
        throw new Error(payload?.message || `Registro rechazado (${response.status})`);
      }

      setMessage('Registro completado. Token recibido y cuenta creada correctamente.');
      Alert.alert('Registro completado', 'Tu cuenta fue creada correctamente.');
    } catch (error) {
      setMessage(error.message || 'No se pudo completar el registro.');
      Alert.alert('Error de registro', error.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  const goToPending = () => {
    if (validateDetails()) {
      setStep('pending');
    }
  };

  const goToConfirm = () => {
    if (validatePassword()) {
      setStep('confirm');
    }
  };

  return (
    <View style={styles.stage}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        {step === 'details' && (
          <ScrollView contentContainerStyle={styles.scrollShell}>
            <Card>
              <Header title="Registro" eyebrow="PASO 1 DE 2" activeStep={0} compact />
              <Text style={styles.sectionLabel}>INFORMACIÓN PERSONAL</Text>

              <LabeledInput
                label="NOMBRE"
                placeholder="Ej. Alexander"
                value={form.nombre}
                onChangeText={(value) => update('nombre', value)}
              />
              <LabeledInput
                label="APELLIDO"
                placeholder="Ej. Von Matterhorn"
                value={form.apellido}
                onChangeText={(value) => update('apellido', value)}
              />
              <LabeledInput
                label="DNI"
                placeholder="Ej. 12345678"
                value={form.documento}
                onChangeText={(value) => update('documento', value)}
                keyboardType="number-pad"
              />
              <LabeledInput
                label="EMAIL"
                placeholder="ejemplo@mail.com"
                value={form.email}
                onChangeText={(value) => update('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <LabeledInput
                label="DOMICILIO"
                placeholder="Calle, número, departamento"
                value={form.direccion}
                onChangeText={(value) => update('direccion', value)}
              />

              <Text style={styles.label}>PAÍS</Text>
              <Pressable
                style={styles.select}
                onPress={() => update('pais', form.pais === 'Argentina' ? 'México' : 'Argentina')}
              >
                <Text style={styles.selectText}>{form.pais}</Text>
                <Text style={styles.chevron}>⌄</Text>
              </Pressable>

              <Text style={styles.sectionLabel}>DOCUMENTACIÓN</Text>
              <View style={styles.documentRow}>
                <DocumentBox
                  title="Dorso de DNI"
                  onPress={() => update('dorsoDni', 'selected')}
                  selected={!!form.dorsoDni}
                />
                <DocumentBox
                  title="Frente de DNI"
                  onPress={() => update('frenteDni', 'selected')}
                  selected={!!form.frenteDni}
                />
              </View>

              <View style={styles.buttonRow}>
                <ActionButton label="CANCELAR" variant="danger" onPress={() => setForm(initialForm)} />
                <ActionButton label="SIGUIENTE" onPress={goToPending} />
              </View>
            </Card>
          </ScrollView>
        )}

        {step === 'pending' && (
          <CenteredScreen caption="Registro 2 - Esperando aprobación">
            <View style={styles.pendingContent}>
              <Text style={styles.heroTitle}>Aprobación{`\n`}pendiente</Text>
              <Text style={styles.heroText}>La empresa todavía está revisando tus datos. Una vez que tengas el OK podrás seguir con el proceso de registro.</Text>
              <KeyWatermark />
            </View>

            {message ? <Text style={styles.feedback}>{message}</Text> : null}

            <ActionButton
              label={loading ? 'CONSULTANDO...' : '←   VOLVER'}
              wide
              disabled={loading}
              onPress={checkRegisterStatus}
            />
          </CenteredScreen>
        )}

        {step === 'security' && (
          <CenteredScreen caption="Registro 2 - Establecer Clave">
            <Header title="Seguridad de la Cuenta" activeStep={1} />
            <Text style={styles.heroText}>
              Establezca una clave de acceso robusta para proteger su colección y transacciones privadas.
            </Text>

            <View style={styles.securityFields}>
              <LabeledInput
                label="NUEVA CONTRASEÑA"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={securePassword}
                right={
                  <Pressable onPress={() => setSecurePassword((value) => !value)}>
                    <Text style={styles.eye}>◎</Text>
                  </Pressable>
                }
              />
              <LabeledInput
                label="CONFIRMAR CONTRASEÑA"
                placeholder="••••••••"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry={securePassword}
              />
            </View>

            <KeyWatermark small />
            <ActionButton label="CONTINUAR  →" wide onPress={goToConfirm} />
            <Text style={styles.policy}>
              Al continuar, usted reafirma su compromiso con las políticas de seguridad de The Curated.
            </Text>
          </CenteredScreen>
        )}

        {step === 'confirm' && (
          <ScrollView contentContainerStyle={styles.scrollShell}>
            <Card roomy>
              <Header title="Confirmación de Perfil" activeStep={2} />

              <View style={styles.profilePanel}>
                <ProfileRow label="NOMBRE COMPLETO" value={fullName} />
                <ProfileRow label="APELLIDO" value={form.apellido || 'De la Vega'} />
                <ProfileRow
                  label="DOMICILIO DE RESIDENCIA"
                  value={form.direccion || 'Avenida de los Insurgentes 1450, Piso 4, Colonia del Valle'}
                />
                <ProfileRow label="PAÍS / REGIÓN" value={`◉ ${form.pais || 'México'}`} />
              </View>

              <View style={styles.legalBlock}>
                <Switch
                  value={acceptedTruth}
                  onValueChange={setAcceptedTruth}
                  trackColor={{ true: palette.gold, false: '#ddd' }}
                  thumbColor="#fff"
                />
                <Text style={styles.legalText}>
                  Confirmo que los datos proporcionados son veraces y corresponden a mi identidad legal. Entiendo que la
                  falsificación de información resultará en la revocación inmediata del acceso a la plataforma.
                </Text>
              </View>

              {message ? <Text style={styles.feedback}>{message}</Text> : null}

              <View style={styles.buttonRow}>
                <ActionButton label="EDITAR INFORMACIÓN" variant="ghost" onPress={() => setStep('editModal')} />
                <ActionButton
                  label={loading ? 'ENVIANDO...' : 'CONFIRMAR'}
                  disabled={loading}
                  onPress={submitRegistration}
                />
              </View>
            </Card>
          </ScrollView>
        )}

        {step === 'editModal' && (
          <View style={styles.modalStage}>
            <Card roomy dimmed>
              <Header title="Confirmación dePerfil" activeStep={2} />
              <View style={styles.fakeBlur} />
            </Card>

            <View style={styles.modalBox}>
              <Text style={styles.modalIcon}>ⓘ</Text>
              <Text style={styles.modalText}>
                En caso de editar la{`\n`}informacion actual, el{`\n`}perfil vuelve a estar sujeto{`\n`}a revision
              </Text>
              <ActionButton label="ACEPTAR" wide onPress={() => setStep('details')} />
              <Pressable onPress={() => setStep('confirm')} style={styles.cancelLink}>
                <Text style={styles.cancelText}>CANCELAR</Text>
              </Pressable>
            </View>
          </View>
        )}

        {loading && step !== 'pending' ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={palette.gold} />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}