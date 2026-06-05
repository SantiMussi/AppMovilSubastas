import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { ActionButton } from '../components';
import { TopBar } from '../components/TopBar';
import { palette } from '../constants/palette';
import { styles } from '../styles/offerItemStyles';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const MIN_PHOTOS = 6;
const MAX_PHOTOS = 10;

const initialForm = { title: '', description: '', history: '' };
const initialErrors = { title: '', description: '', history: '', photos: '', declaration: '' };

export default function OfferItemScreen({ onBack, onMenuPress, onGoToMyItems, accessToken }) {
  const [step, setStep] = useState('details');
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState([]);
  const [declaration, setDeclaration] = useState(false);
  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(false);

  const [infoVisible, setInfoVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setPhotos([]);
    setDeclaration(false);
    setErrors(initialErrors);
    setStep('details');
  };

  const validateDetails = () => {
    const next = { title: '', description: '', history: '' };
    let valid = true;
    if (!form.title.trim())       { next.title       = 'Este campo es obligatorio.'; valid = false; }
    if (!form.description.trim()) { next.description = 'Este campo es obligatorio.'; valid = false; }
    if (!form.history.trim())     { next.history     = 'Este campo es obligatorio.'; valid = false; }
    setErrors((prev) => ({ ...prev, ...next }));
    return valid;
  };

  const validatePhotos = () => {
    const next = { photos: '', declaration: '' };
    let valid = true;
    if (photos.length < MIN_PHOTOS) { next.photos      = 'Debe colocar al menos 6 imágenes.'; valid = false; }
    if (!declaration)               { next.declaration = 'Debe aceptar esta casilla.';         valid = false; }
    setErrors((prev) => ({ ...prev, ...next }));
    return valid;
  };

  const pickPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para adjuntar fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });
    if (result.canceled || result.cancelled) return;
    const asset = result.assets?.[0] ?? result;
    if (!asset?.uri) return;
    setPhotos((prev) => [...prev, { uri: asset.uri, base64: asset.base64 ?? '' }]);
    setErrors((prev) => ({ ...prev, photos: '' }));
  };

  const confirmDelete = (index) => setDeleteIndex(index);

  const doDelete = () => {
    if (deleteIndex !== null) setPhotos((prev) => prev.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  };

  const handleDeclarationToggle = () => {
    setDeclaration((v) => !v);
    if (errors.declaration) setErrors((prev) => ({ ...prev, declaration: '' }));
  };

  const submit = async () => {
    if (!validatePhotos()) return;
    setLoading(true);
    try {
      const payload = {
        titulo: form.title.trim(),
        descripcion: form.description.trim(),
        historia: form.history.trim(),
        fotos: photos.map((p) => p.base64),
        declaracionPropiedad: true,
        acuerdoEnvio: true,
        origenLicitoAdjunto: 'declaracion_aceptada',
      };
      const response = await fetch(`${API_BASE}/api/v1/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message ?? errorData?.error ?? `Error ${response.status}`);
      }
      setSuccessVisible(true);
    } catch (error) {
      Alert.alert('Error al enviar', error.message ?? 'No se pudo enviar la propuesta. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.stage}>
      <TopBar onMenuPress={onMenuPress || onBack} />

      {step === 'details' && (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <SectionHeader onInfoPress={() => setInfoVisible(true)} />
          <Text style={styles.sectionTitle}>Detalles del Bien</Text>
          <FormField
            label="NOMBRE DEL BIEN"
            placeholder="Ej: 'Composición No. 5' o 'Reloj Patek Philippe 1954'"
            value={form.title}
            onChangeText={(v) => update('title', v)}
            error={errors.title}
          />
          <FormField
            label="DESCRIPCIÓN"
            placeholder="Describa el estado físico, materiales y dimensiones..."
            value={form.description}
            onChangeText={(v) => update('description', v)}
            multiline
            error={errors.description}
          />
          <FormField
            label="HISTORIA / CURIOSIDADES"
            placeholder="Indique procedencia, dueños anteriores o anécdotas relevantes del artículo..."
            value={form.history}
            onChangeText={(v) => update('history', v)}
            multiline
            error={errors.history}
          />
          <View style={styles.buttonRow}>
            <ActionButton label="SIGUIENTE" onPress={() => { if (validateDetails()) setStep('photos'); }} />
          </View>
        </ScrollView>
      )}

      {step === 'photos' && (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <SectionHeader onInfoPress={() => setInfoVisible(true)} />
          <Text style={styles.sectionTitle}>Registro Visual</Text>
          <View style={styles.photosHeader}>
            <Text style={styles.photosSubtitle}>Adjunte al menos 6 fotografías en{'\n'}alta resolución.</Text>
            <Text style={styles.photosCounter}>{photos.length} / {MIN_PHOTOS}{'\n'}ARCHIVOS</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel} contentContainerStyle={styles.carouselContent}>
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.photoSlot, styles.photoSlotFilled]}
                onPress={() => setPhotoPreview(photo)}
                onLongPress={() => confirmDelete(index)}
                activeOpacity={0.85}
                delayLongPress={400}
              >
                <Image source={{ uri: photo.uri }} style={styles.photoImg} />
                {index === 0 && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>Principal</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity style={[styles.photoSlot, styles.photoSlotAdd]} onPress={pickPhoto} activeOpacity={0.7}>
                <Text style={styles.addIcon}>＋</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {errors.photos ? <Text style={styles.fieldError}>{errors.photos}</Text> : null}

          <Pressable style={styles.declarationRow} onPress={handleDeclarationToggle}>
            <View style={[styles.checkbox, declaration && styles.checkboxChecked]}>
              {declaration && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.declarationText}>Declaro que el bien me pertenece y es de origen lícito.</Text>
          </Pressable>

          {errors.declaration ? <Text style={styles.fieldError}>{errors.declaration}</Text> : null}

          <Text style={styles.footerNote}>SUJETO A INSPECCIÓN Y APROBACIÓN DE LA EMPRESA</Text>
          <View style={styles.buttonRow}>
            <ActionButton label="ANTERIOR" variant="ghost" onPress={() => setStep('details')} />
            <ActionButton label={loading ? 'ENVIANDO...' : 'FINALIZAR'} disabled={loading} onPress={submit} />
          </View>
        </ScrollView>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={palette.gold} size="large" />
        </View>
      )}

      <Modal visible={infoVisible} transparent animationType="fade" onRequestClose={() => setInfoVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>¿Como funciona?</Text>
            <Text style={styles.modalBody}>
              Inicie el proceso de curatela. Nuestro equipo de expertos revisará la procedencia y el estado de su pieza para determinar su elegibilidad en nuestras próximas subastas de alta gama.
            </Text>
            <ActionButton label="Entendido" wide onPress={() => setInfoVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={!!photoPreview} transparent animationType="fade" onRequestClose={() => setPhotoPreview(null)}>
        <View style={styles.previewBackdrop}>
          {photoPreview && (
            <>
              <Image source={{ uri: photoPreview.uri }} style={styles.previewImg} resizeMode="contain" />
              <Pressable style={styles.previewCloseBtn} onPress={() => setPhotoPreview(null)}>
                <Text style={styles.previewCloseText}>✕  Cerrar</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>

      <Modal visible={deleteIndex !== null} transparent animationType="fade" onRequestClose={() => setDeleteIndex(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Eliminar foto</Text>
            <Text style={styles.modalBody}>¿Querés eliminar esta fotografía?</Text>
            <ActionButton label="ELIMINAR" variant="danger" wide onPress={doDelete} />
            <Pressable style={styles.cancelLink} onPress={() => setDeleteIndex(null)}>
              <Text style={styles.cancelText}>CANCELAR</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={successVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.successIconWrap}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
            <Text style={styles.successTitle}>¡Envío Exitoso!</Text>
            <Text style={styles.modalBody}>
              Su artículo ha sido enviado correctamente a nuestro comité de curadores para su revisión.
            </Text>
            <ActionButton label="IR A MIS ARTÍCULOS" wide onPress={() => { setSuccessVisible(false); onGoToMyItems?.(); }} />
            <Pressable style={styles.cancelLink} onPress={() => { setSuccessVisible(false); resetForm(); }}>
              <Text style={styles.cancelText}>CERRAR</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SectionHeader({ onInfoPress }) {
  return (
    <>
      <Text style={styles.eyebrow}>CONSIGNACIÓN DE OBRAS</Text>
      <View style={styles.titleRow}>
        <Text style={styles.screenTitle}>Ofrecer Artículo</Text>
        <Pressable style={styles.infoBtn} onPress={onInfoPress} accessibilityLabel="¿Cómo funciona?">
          <Text style={styles.infoBtnText}>i</Text>
        </Pressable>
      </View>
    </>
  );
}

function FormField({ label, multiline = false, error, ...inputProps }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          {...inputProps}
          multiline={multiline}
          placeholderTextColor="#c5c7cb"
          style={[styles.input, multiline && styles.multilineInput]}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}