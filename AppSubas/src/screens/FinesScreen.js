import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../themes/colors';

const { width } = Dimensions.get('window');

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export default function FinesScreen({ session, onBack, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [fines, setFines] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me/fines`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFines(data.multas || []);
      } else {
        setError('No se pudieron cargar las multas.');
      }
    } catch (err) {
      setError('Ocurrió un error al cargar las multas.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLeft = (fechaLimite) => {
    if (!fechaLimite) return 'FALTAN 0H';
    const limit = new Date(fechaLimite).getTime();
    const now = new Date().getTime();
    const diff = limit - now;
    if (diff <= 0) return 'VENCIDA';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `FALTAN ${hours}H ${minutes}M`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const renderEmptyState = () => (
    <View style={styles.content}>
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>Estado de Cumplimiento</Text>
        <Text style={styles.statusText}>
          Las multas se aplican (10% de la puja) cuando los fondos son insuficientes. 
          Su perfil se encuentra actualmente al dia con todas sus obligaciones de pago.
        </Text>
      </View>
      <View style={styles.emptyContainer}>
        <View style={styles.shieldIconContainer}>
          <Ionicons name="shield-checkmark-outline" size={40} color="#ccc" />
        </View>
        <Text style={styles.emptyTitle}>No hay multas pendientes</Text>
        <Text style={styles.emptyText}>
          Gracias por mantener su cuenta al corriente. Puede seguir participando en nuestras subastas exclusivas.
        </Text>
      </View>
    </View>
  );

  const renderPopulatedState = () => {
    const totalAmount = fines.reduce((acc, curr) => acc + (curr.monto || 0), 0);
    // Assuming uniform currency for the total, or taking the first one
    const currency = fines[0]?.moneda || '$';

    return (
      <View style={styles.content}>
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Estado de Cumplimiento</Text>
          <Text style={styles.statusText}>
            Las multas se aplican (10% de la puja) cuando los fondos son insuficientes. 
            Debe regularizar su situación para participar en nuevas subastas. Dispone de un margen de{' '}
            <Text style={{ fontWeight: 'bold' }}>72h</Text> para presentar los fondos totales.
          </Text>
        </View>

        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {fines.map((multa, index) => (
            <Pressable 
              key={multa.identificador || index} 
              style={styles.fineCard}
              onPress={() => onNavigate(`fineDetail:${multa.identificador}`)}
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=600&auto=format&fit=crop' }} 
                style={styles.fineImage} 
                resizeMode="cover"
              />
              <View style={styles.fineDetails}>
                <View style={styles.fineTitleRow}>
                  <Text style={styles.fineTitle} numberOfLines={2}>
                    {multa.descProducto || `Subasta #${multa.subasta?.identificador || 'N/A'}`}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{multa.estado || 'PENDIENTE'}</Text>
                  </View>
                </View>

                <Text style={styles.fineDate}>{formatDate(multa.fechaEmision)}</Text>

                <View style={styles.fineAmountRow}>
                  <View>
                    <Text style={styles.fineAmountLabel}>IMPORTE MULTA</Text>
                    <Text style={styles.fineAmountValue}>{multa.moneda || '$'}{Number(multa.monto || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</Text>
                  </View>
                  <View style={styles.timeLeftContainer}>
                    <Ionicons name="time-outline" size={14} color="#B22222" />
                    <Text style={styles.timeLeftText}>{calculateTimeLeft(multa.fechaLimite)}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.paginationDots}>
           {fines.map((_, i) => (
             <View key={i} style={[styles.dot, i === 0 && styles.activeDot]} />
           ))}
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>TOTAL PENDIENTE</Text>
          <Text style={styles.totalValue}>{currency}{totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Gestión de Multas</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : error ? (
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollGrow}>
          {fines.length === 0 ? renderEmptyState() : renderPopulatedState()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'serif',
    fontSize: 20,
    color: '#000',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  scrollGrow: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  statusBox: {
    backgroundColor: '#F5F5F7',
    borderLeftWidth: 2,
    borderLeftColor: Colors.secondary,
    padding: 16,
    marginBottom: 24,
  },
  statusTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    color: '#000',
    fontWeight: '700',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  shieldIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  // Populated State Styles
  fineCard: {
    width: width - 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    marginRight: 20,
    overflow: 'hidden',
  },
  fineImage: {
    width: '100%',
    height: 180,
  },
  fineDetails: {
    padding: 16,
  },
  fineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  fineTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  statusBadge: {
    backgroundColor: '#FCECEC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#B22222',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fineDate: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 1,
    marginBottom: 16,
  },
  fineAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  fineAmountLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  fineAmountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  timeLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLeftText: {
    color: '#B22222',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CCC',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  totalContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  totalValue: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
});
