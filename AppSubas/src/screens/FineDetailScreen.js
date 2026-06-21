import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../themes/colors';
import { useCurrency } from '../context/CurrencyContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export default function FineDetailScreen({ session, fineId, onBack, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [fine, setFine] = useState(null);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const { formatGlobalMoney } = useCurrency();

  useEffect(() => {
    fetchFineDetail();
  }, [fineId]);

  const fetchFineDetail = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me/fines/${fineId}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFine(data);
      } else {
        setError('No se pudo cargar el detalle de la multa.');
      }
    } catch (err) {
      setError('Ocurrió un error de red al cargar el detalle.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (onNavigate) {
      onNavigate(`finePayment:${fine.identificador}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  if (error || !fine) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'No se encontró la multa.'}</Text>
        <Pressable onPress={onBack} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.secondary }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const amount = Number(fine.monto || 0);
  const winningOffer = amount * 10;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <Text style={styles.kicker}>REGISTRO LEGAL VANTAGE</Text>
        <Text style={styles.mainTitle}>Multa #{fine.identificador}</Text>

        <View style={styles.itemCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=200&auto=format&fit=crop' }} 
            style={styles.itemImage}
            resizeMode="cover"
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle}>{fine.descProducto || `Subasta #${fine.subasta?.identificador || ''}`}</Text>
            <Text style={styles.itemSubtitle}>LOTE NO. {fine.subasta?.identificador || 'N/A'}</Text>
            
            <View style={{ marginTop: 12 }}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Subasta:</Text>
                <Text style={styles.infoValue}>{formatDate(fine.subasta?.fecha || fine.fechaEmision)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Oferta Ganadora</Text>
                <Text style={styles.infoValue}>{formatGlobalMoney(winningOffer)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MOTIVO DE LA SANCIÓN</Text>
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>
              Falta de fondos verificados en el medio de pago seleccionado para cubrir el remanente de la puja ganadora tras el cierre de subasta.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DESGLOSE DEL IMPORTE</Text>
          
          <View style={styles.breakdownRow}>
            <View>
              <Text style={styles.breakdownLabel}>Multa Administrativa</Text>
              <Text style={styles.breakdownSub}>10% sobre la oferta final de {formatGlobalMoney(winningOffer)}</Text>
            </View>
            <Text style={styles.breakdownValue}>{formatGlobalMoney(amount)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Adeudado</Text>
            <Text style={styles.totalValue}>{formatGlobalMoney(amount)}</Text>
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.payButton, paying && { opacity: 0.7 }]} 
          onPress={handlePay}
          disabled={paying}
        >
          {paying ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.payButtonText}>PROCEDER AL PAGO ➔</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  errorText: {
    color: '#B22222',
    fontSize: 16,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#666',
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: '#666',
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  reasonBox: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.secondary,
    paddingLeft: 16,
    paddingVertical: 4,
  },
  reasonText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#111',
  },
  breakdownSub: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  payButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 4,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
