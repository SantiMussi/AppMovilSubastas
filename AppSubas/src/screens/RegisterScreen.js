import React, { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, View, Modal } from 'react-native';
import { ActionButton, Card, CenteredScreen, DocumentBox, Header, KeyWatermark, LabeledInput, ProfileRow } from '../components';
import { palette } from '../constants/palette';
import { styles } from '../styles/registerStyles';
import { safeJson } from '../utils/safeJson';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const initialForm = {
  nombre: '',
  apellido: '',
  documento: '',
  email: '',
  direccion: '',
  pais: null,
  dorsoDni: null,
  frenteDni: null,
};

const normalizeCountry = (country) => {
  if (!country) {
    return null;
  }

  const id = country.numero ?? country.id ?? country.codigo ?? country.nombreCorto ?? country.nombre;
  const nombre = country.nombre ?? country.name ?? country.nombreCorto ?? String(id);

  return {
    ...country,
    id,
    nombre,
  };
};

export default function RegisterScreen() {
  const [step, setStep] = useState('details');
  const [form, setForm] = useState(initialForm);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [acceptedTruth, setAcceptedTruth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const fullName = useMemo(
    () => [form.nombre, form.apellido].filter(Boolean).join(' ').trim() || 'Alejandro Valentín',
    [form.nombre, form.apellido]
  );

  const selectedCountryName = form.pais?.nombre || '';

  useEffect(() => {
    let isMounted = true;

    const fetchCountries = async () => {
      setCountriesLoading(true);
      setCountriesError('');

      try {
        const response = await fetch(`${API_BASE}/api/paises`);
        const payload = await safeJson(response);

        if (!response.ok) {
          throw new Error(payload?.message || `No se pudieron cargar los países (${response.status})`);
        }

        const apiCountries = Array.isArray(payload) ? payload.map(normalizeCountry).filter(Boolean) : [];

        if (!isMounted) {
          return;
        }

        setCountries(apiCountries);
        setForm((current) => {
          if (current.pais || apiCountries.length === 0) {
            return current;
          }

          const argentina = apiCountries.find((country) => country.nombre?.toLowerCase() === 'argentina');
          return { ...current, pais: argentina || apiCountries[0] };
        });
      } catch (error) {
        if (isMounted) {
          setCountriesError(error.message || 'No se pudieron cargar los países.');
        }
      } finally {
        if (isMounted) {
          setCountriesLoading(false);
        }
      }
    };

    fetchCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

const resetForm = () => {
    setForm({ ...initialForm, pais: countries[0] || null });
    setPassword('');
    setPasswordConfirm('');
    setVerificationCode('');
    setAcceptedTruth(false);
    setMessage('');
  };

  const formatDocumentPhoto = (photo) => {
    if (!photo) {
      return null;
    }

    return photo.base64 || photo.uri;
  };

  const buildApiErrorMessage = (payload, statusCode, fallback) => {
    if (!payload) {
      return `${fallback} (${statusCode})`;
    }

    if (payload.message || payload.error) {
      return payload.message || payload.error;
    }

    const validationMessages = Object.entries(payload)
      .filter(([key]) => !['status', 'timestamp'].includes(key))
      .map(([key, value]) => `${key}: ${value}`);

    if (validationMessages.length > 0) {
      return validationMessages.join('\n');
    }

    return `${fallback} (${statusCode})`;
  };


  const takeDocumentPhoto = async (key) => {
    const ImagePicker = await import('expo-image-picker');
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso de cámara requerido', 'Necesitamos acceder a la cámara para fotografiar tu DNI.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      cameraType: ImagePicker.CameraType?.back,
      quality: 0.85,
      base64: true,
    });

    if (result.canceled || result.cancelled) {
      return;
    }

    const asset = result.assets?.[0] || result;
    update(key, {
      uri: asset.uri,
      fileName: asset.fileName || `${key}.jpg`,
      mimeType: asset.mimeType || asset.type || 'image/jpeg',
      base64: asset.base64,
      capturedAt: new Date().toISOString(),
    });
  };

  const validateDetails = () => {
    const required = ['nombre', 'apellido', 'documento', 'email', 'direccion'];
    const missing = required.find((key) => !form[key].trim());

    if (missing) {
      Alert.alert('Información incompleta', 'Completá tus datos personales para continuar.');
      return false;
    }

    if (!form.pais) {
      Alert.alert('País requerido', 'Seleccioná tu país desde el listado cargado por el sistema.');
      return false;
    }

    if (!form.dorsoDni || !form.frenteDni) {
      Alert.alert('Documentación incompleta', 'Tomá una foto del dorso y otra del frente de tu DNI con la cámara.');
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

  const buildInitialRegisterPayload = () => ({
    documento: form.documento.trim(),
    nombre: form.nombre.trim(),
    apellido: form.apellido.trim(),
    email: form.email.trim().toLowerCase(),
    domicilio: form.direccion.trim(),
    paisId: form.pais?.id,
    fotoDniFrente: formatDocumentPhoto(form.frenteDni),
    fotoDniDorso: formatDocumentPhoto(form.dorsoDni),
  });

  const canProceedToPasswordSetup = (status) => {
    const normalizedStatus = String(status?.status || status?.estado || '').trim().toLowerCase();
    return Boolean(
      status?.puedeCompletarEtapa2 ||
        status?.approved ||
        normalizedStatus === 'approved' ||
        normalizedStatus === 'aprobado' ||
        normalizedStatus === 'ok'
    );
  };

  const submitInitialRegistration = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildInitialRegisterPayload()),
      });

      const payload = await safeJson(response);

      if (!response.ok) {
        console.log(payload)
        throw new Error(buildApiErrorMessage(payload, response.status, 'Registro inicial rechazado'));
      }

      setStep('pending');
      setMessage(
        payload?.message ||
          'Registro inicial enviado correctamente. Revisaremos tu documentación y te avisaremos por email cuando puedas continuar.'
      );
    } catch (error) {
      const errorMessage = error.message || 'No se pudo enviar el registro inicial.';
      setMessage(errorMessage);
      Alert.alert('Error de registro', errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const checkRegisterStatus = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/auth/register/status?email=${encodeURIComponent(form.email.trim())}`
      );

      const payload = await safeJson(response);

      if (response.ok) {
        if (canProceedToPasswordSetup(payload)) {
          setStep('security');
          return;
        }

        setMessage('Tu documentación continúa en revisión. Te avisaremos por email cuando esté aprobada.');
        return;
      }

      setMessage(payload?.message || 'Tu registro todavía no fue aprobado para continuar.');
    } catch (error) {
      setMessage(error.message || 'No pudimos consultar el estado del registro.');
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    if (!acceptedTruth) {
      Alert.alert('Confirmación requerida', 'Confirmá que los datos son veraces y corresponden a tu identidad legal.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const completePayload = {
        email: form.email.trim().toLowerCase(),
        password,
      };

      if (verificationCode.trim()) {
        completePayload.verificationCode = verificationCode.trim();
      }

      const response = await fetch(`${API_BASE}/api/v1/auth/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completePayload),
      });

      const payload = await safeJson(response);

      if (!response.ok) {
        console.log(payload)
        throw new Error(payload?.message || `Registro rechazado (${response.status})`);
      }

      setMessage(payload?.message || 'Registro completado. Token recibido y cuenta creada correctamente.');
      Alert.alert('Registro completado', payload?.message || 'Tu cuenta fue creada correctamente.');
    } catch (error) {
      setMessage(error.message || 'No se pudo completar el registro.');
      Alert.alert('Error de registro', error.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  const goToPending = () => {
    if (validateDetails()) {
      submitInitialRegistration();
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
                style={[styles.select, countriesError && styles.selectError]}
                onPress={() => {
                  if (!countriesLoading && countries.length > 0) {
                    setCountryDropdownOpen(true);
                  }
                }}
              >
                <Text style={[styles.selectText, !selectedCountryName && styles.selectPlaceholder]}>
                  {countriesLoading ? 'Cargando países...' : selectedCountryName || 'Seleccioná un país'}
                </Text>
                <Text style={styles.chevron}>⌄</Text>
              </Pressable>
              {countriesError ? <Text style={styles.fieldError}>{countriesError}</Text> : null}

              <Text style={styles.sectionLabel}>DOCUMENTACIÓN</Text>
              <View style={styles.documentRow}>
                <DocumentBox
                  title="Dorso de DNI"
                  onPress={() => takeDocumentPhoto('dorsoDni')}
                  selected={!!form.dorsoDni}
                  imageUri={form.dorsoDni?.uri}
                />
                <DocumentBox
                  title="Frente de DNI"
                  onPress={() => takeDocumentPhoto('frenteDni')}
                  selected={!!form.frenteDni}
                  imageUri={form.frenteDni?.uri}
                />
              </View>

              <View style={styles.buttonRow}>
                <ActionButton label="CANCELAR" variant="danger" onPress={resetForm} />
                <ActionButton label={loading ? 'ENVIANDO...' : 'SIGUIENTE'} disabled={loading} onPress={goToPending} />
              </View>
            </Card>
          </ScrollView>
        )}

        {step === 'pending' && (
          <CenteredScreen caption="Registro 2 - Esperando aprobación">
            <View style={styles.pendingContent}>
              <Text style={styles.heroTitle}>Aprobación{`\n`}pendiente</Text>
              <Text style={styles.heroText}>La empresa todavía está revisando tus datos. Una vez que tengas el OK podrás seguir con el proceso de registro.</Text>
              <Text style={styles.heroText}>La empresa está revisando tus datos y fotos de DNI. Cuando el administrador apruebe tu registro, recibirás un email y podrás consultar el estado para continuar.</Text>
              <KeyWatermark />
            </View>

            {message ? <Text style={styles.feedback}>{message}</Text> : null}

            <ActionButton
              label={loading ? 'CONSULTANDO...' : '←   VOLVER'}
              label={loading ? 'CONSULTANDO...' : 'CONSULTAR ESTADO'}
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
              <LabeledInput
                label="CÓDIGO DE VERIFICACIÓN"
                placeholder="Opcional, si el email lo incluye"
                value={verificationCode}
                onChangeText={setVerificationCode}
                autoCapitalize="none"
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
                <ProfileRow label="PAÍS / REGIÓN" value={`◉ ${selectedCountryName || 'Sin seleccionar'}`} />
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
                  onPress={completeRegistration}
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

        <Modal
          animationType="fade"
          transparent
          visible={countryDropdownOpen}
          onRequestClose={() => setCountryDropdownOpen(false)}
        >
          <Pressable style={styles.dropdownBackdrop} onPress={() => setCountryDropdownOpen(false)}>
            <View style={styles.dropdownCard}>
              <Text style={styles.dropdownTitle}>Seleccioná tu país</Text>
              <FlatList
                data={countries}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.countryOption, form.pais?.id === item.id && styles.countryOptionSelected]}
                    onPress={() => {
                      update('pais', item);
                      setCountryDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.countryOptionText}>{item.nombre}</Text>
                    {item.nombreCorto ? <Text style={styles.countryOptionMeta}>{item.nombreCorto}</Text> : null}
                  </Pressable>
                )}
              />
            </View>
          </Pressable>
        </Modal>


        {loading && step !== 'pending' ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={palette.gold} />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}