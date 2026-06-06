import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image, Switch, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { TopBar } from '../components/TopBar';
import { Colors } from '../themes/colors';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export default function SettingsScreen({ session, onMenuPress, onNavigate, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    direccion: '',
  });

  const [auctionAlerts, setAuctionAlerts] = useState(true);
  const [outbidAlerts, setOutbidAlerts] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          direccion: data.direccion || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateField = async (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    const body = {
      nombre: field === 'nombre' ? value : formData.nombre,
      apellido: field === 'apellido' ? value : formData.apellido,
      direccion: field === 'direccion' ? value : formData.direccion,
    };

    try {
      await fetch(`${API_BASE}/api/v1/users/me`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tu galería.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfile(prev => ({ ...prev, foto: uri }));
      
      const formDataUpload = new FormData();
      formDataUpload.append('imagen', {
        uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });

      try {
        await fetch(`${API_BASE}/api/v1/users/me/foto`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: formDataUpload,
        });
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'No se pudo subir la foto');
      }
    }
  };

  const handleDeleteAccount = () => {
    setDeleteModalVisible(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        setDeleteModalVisible(false);
        if (onLogout) onLogout();
      } else {
        Alert.alert('Error', 'Hubo un problema al eliminar la cuenta');
        setDeleteModalVisible(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categoryBadge = profile?.categoria ? `${profile.categoria} MEMBER`.toUpperCase() : 'PLATINUM MEMBER';
  const fullName = `${formData.nombre} ${formData.apellido}`.trim() || 'Usuario';
  const photoUri = profile?.foto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400';

  return (
    <View style={styles.container}>
      <TopBar onMenuPress={onMenuPress} />
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.headerProfile}>
            <View>
              <Image source={{ uri: photoUri }} style={styles.profileImage} />
              <Pressable style={styles.editIconBtn} onPress={handlePickImage}>
                <Ionicons name="pencil" size={12} color="#FFF" />
              </Pressable>
            </View>
            <Text style={styles.profileName}>{fullName}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{categoryBadge}</Text>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.dot} />
              <Text style={styles.sectionTitle}>Información Personal</Text>
            </View>
            
            <View style={styles.inputWrap}>
              <Text style={styles.label}>NOMBRE</Text>
              <TextInput 
                style={styles.input} 
                value={formData.nombre}
                onChangeText={(val) => setFormData(prev => ({...prev, nombre: val}))}
                onBlur={() => handleUpdateField('nombre', formData.nombre)}
              />
            </View>
            
            <View style={styles.inputWrap}>
              <Text style={styles.label}>APELLIDO</Text>
              <TextInput 
                style={styles.input} 
                value={formData.apellido}
                onChangeText={(val) => setFormData(prev => ({...prev, apellido: val}))}
                onBlur={() => handleUpdateField('apellido', formData.apellido)}
              />
            </View>
            
            <View style={styles.inputWrap}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput 
                style={[styles.input, styles.inputDisabled]} 
                value={formData.email}
                editable={false}
              />
            </View>
            
            <View style={styles.inputWrap}>
              <Text style={styles.label}>DIRECCIÓN</Text>
              <TextInput 
                style={styles.input} 
                value={formData.direccion}
                onChangeText={(val) => setFormData(prev => ({...prev, direccion: val}))}
                onBlur={() => handleUpdateField('direccion', formData.direccion)}
              />
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.dot} />
              <Text style={styles.sectionTitle}>Seguridad y privacidad</Text>
            </View>
            
            <Pressable style={styles.rowBtn} onPress={() => onNavigate('changePassword')}>
              <Ionicons name="lock-closed-outline" size={20} color="#333" />
              <Text style={styles.rowBtnText}>Cambiar Contraseña</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </Pressable>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.dot} />
              <Text style={styles.sectionTitle}>Preferencias de Notificación</Text>
            </View>
            
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleTitle}>Alertas de subastas</Text>
                <Text style={styles.toggleDesc}>Actualizaciones en ofertas y artistas que usted sigue</Text>
              </View>
              <Switch 
                value={auctionAlerts} 
                onValueChange={setAuctionAlerts} 
                trackColor={{ false: "#D3D3D3", true: "#000" }}
                thumbColor="#FFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleTitle}>Notificación de sobrepuja</Text>
                <Text style={styles.toggleDesc}>Notificación inmediata si alguien superó tu oferta</Text>
              </View>
              <Switch 
                value={outbidAlerts} 
                onValueChange={setOutbidAlerts} 
                trackColor={{ false: "#D3D3D3", true: "#000" }}
                thumbColor="#FFF"
              />
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.dot} />
              <Text style={styles.sectionTitle}>Administración de Cuenta</Text>
            </View>
            
            <View style={styles.currencyRow}>
              <Text style={styles.currencyLabel}>Moneda</Text>
              <Pressable 
                style={{flexDirection: 'row', alignItems: 'center'}}
                onPress={() => setCurrency(prev => prev === 'USD' ? 'ARS' : 'USD')}
              >
                <Text style={styles.currencyValue}>{currency} ($)</Text>
                <Ionicons name="swap-vertical" size={14} color="#888" style={{marginLeft: 4}} />
              </Pressable>
            </View>

            <Pressable style={styles.deleteBtn} onPress={handleDeleteAccount}>
              <Text style={styles.deleteBtnText}>ELIMINAR CUENTA</Text>
            </Pressable>
            <Text style={styles.deleteDesc}>
              La eliminación es permanente y borrará todo el historial de subastas, tus ofertas y los certificados de procedencia
            </Text>
          </View>

        </ScrollView>
      )}

      <Modal visible={deleteModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="warning-outline" size={48} color="#D32F2F" style={{ alignSelf: 'center', marginBottom: 8 }} />
            <Text style={styles.modalTitle}>¡Atención!</Text>
            <Text style={styles.modalDesc}>¿Estás seguro que quieres eliminar tu cuenta?{'\n'}¡Esta acción es irreversible!</Text>
            
            <Pressable style={styles.modalCancelBtn} onPress={() => setDeleteModalVisible(false)}>
              <Text style={styles.modalCancelText}>CANCELAR</Text>
            </Pressable>
            
            <Pressable style={styles.modalDeleteBtn} onPress={confirmDeleteAccount}>
              <Text style={styles.modalDeleteText}>ELIMINAR CUENTA</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loaderContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerProfile: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#EEE'
  },
  editIconBtn: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#000',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FAFAFA'
  },
  profileName: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 14,
    marginBottom: 6,
  },
  badge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#333'
  },
  sectionDivider: {
    height: 12,
    backgroundColor: '#F3F3F5',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FAFAFA',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A8925A',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  inputWrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 9,
    color: '#888',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#FFF',
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333',
    borderRadius: 4,
  },
  inputDisabled: {
    color: '#999',
    backgroundColor: '#F5F5F5'
  },
  rowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
  },
  rowBtnText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    color: '#333'
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: 20,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 11,
    color: '#888',
    lineHeight: 16,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  currencyLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  currencyValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: '#FCECEC',
    backgroundColor: '#FDF7F7',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 12,
  },
  deleteBtnText: {
    color: '#D32F2F',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  deleteDesc: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    color: '#D32F2F',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalDesc: {
    textAlign: 'center',
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 24,
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderColor: '#F76C6C',
    backgroundColor: '#FFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalCancelText: {
    color: '#F76C6C',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  modalDeleteBtn: {
    backgroundColor: '#990000',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  modalDeleteText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
  }
});
