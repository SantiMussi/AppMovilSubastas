import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../components/TopBar';
import { Colors } from '../themes/colors';
import { useCurrency } from '../context/CurrencyContext';

export default function ProfileScreen({ session, onMenuPress, onNavigate }) {
  const [profile, setProfile] = useState(session?.profile || {});
  const [loading, setLoading] = useState(false);
  const { formatGlobalMoney } = useCurrency();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.EXPO_PUBLIC_API_URL;
        const response = await fetch(`${API_BASE}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.accessToken) {
      fetchProfile();
    }
  }, [session?.accessToken]);

  const nombre = profile?.nombre || 'Usuario';
  const apellido = profile?.apellido || '';
  const fullName = `${nombre} ${apellido}`.trim();
  const categoria = profile?.categoria ? `${profile.categoria}`.toUpperCase() : 'COMÚN';
  
  const saldoGarantia = profile?.saldoGarantia || 0;
  const limiteCompra = profile?.limiteCompra || 0;
  const subastasVisitadas = profile?.subastasVisitadas || 0;
  const victorias = profile?.victorias || 0;
  const pujasRealizadas = profile?.pujasRealizadas || 0;
  const valorTotalEstimado = profile?.valorTotalEstimado || 0;
  const incrementoAnual = profile?.incrementoAnual || 0;
  
  // Fake empty array to map if empty
  const inversiones = profile?.inversiones || [];

  const formatCurrency = (val) => {
    return formatGlobalMoney(val);
  };
  return (
    <View style={styles.container}>
      <TopBar onMenuPress={onMenuPress} />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header / Member Info */}
        <View style={styles.header}>
          <View style={styles.memberBadge}>
            <Ionicons name="card" size={12} color="#000" />
            <Text style={styles.memberBadgeText}>{categoria} MEMBER</Text>
          </View>
          <Text style={styles.userName}>{fullName}</Text>

          <View style={styles.balancesContainer}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>SALDO EN GARANTÍA</Text>
              <Text style={styles.balanceValue}>{formatCurrency(saldoGarantia)}</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>LÍMITE DE COMPRA</Text>
              <Text style={styles.balanceValue}>{formatCurrency(limiteCompra)}</Text>
            </View>
          </View>

          <Pressable style={styles.redButton} onPress={() => onNavigate('fines')}>
            <Text style={styles.redButtonText}>CONSULTAR MULTAS</Text>
          </Pressable>
        </View>

        {/* Resumen de Actividad */}
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>RESUMEN DE ACTIVIDAD</Text>

          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>Subastas visitadas</Text>
            <Text style={styles.activityValue}>{subastasVisitadas}</Text>
          </View>

          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>Victorias</Text>
            <Text style={[styles.activityValue, { color: Colors.secondary }]}>{victorias < 10 ? `0${victorias}` : victorias}</Text>
          </View>

          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>Pujas Realizadas</Text>
            <Text style={styles.activityValue}>{pujasRealizadas}</Text>
          </View>
        </View>

        {/* Inversión por Categoría */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inversión por Categoría</Text>
          <Text style={styles.sectionSubtitle}>AÑO DE INICIO EN SUBASTAS: 2024</Text>

          <View style={styles.barsContainer}>
            {inversiones.length > 0 ? (
              inversiones.map((inv, idx) => (
                <View key={idx} style={styles.barItem}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barLabel}>{inv.categoria}</Text>
                    <Text style={styles.barPercent}>{inv.porcentaje}%</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${inv.porcentaje}%`, backgroundColor: idx === 2 ? Colors.secondary : '#000' }]} />
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ color: '#888', fontSize: 12, textAlign: 'center', marginVertical: 20 }}>
                No hay datos de inversión para mostrar.
              </Text>
            )}
          </View>

          <View style={styles.totalValueContainer}>
            <Text style={styles.totalValueLabel}>VALOR TOTAL ESTIMADO</Text>
            <Text style={styles.totalValue}>{formatCurrency(valorTotalEstimado)}</Text>
            {incrementoAnual > 0 && (
              <Text style={styles.totalValueIncrease}>↗ +{incrementoAnual}% este año</Text>
            )}
          </View>
        </View>

        {/* Gestionar Fondos */}
        <View style={styles.manageFundsCard}>
          <View style={styles.manageFundsHeader}>
            <Ionicons name="wallet-outline" size={20} color="#000" />
            <Text style={styles.manageFundsTitle}>Gestionar Fondos</Text>
          </View>
          <Text style={styles.manageFundsText}>
            Aumenta tu límite de puja mediante un depósito adicional.
          </Text>
          <Pressable style={styles.blueButton}>
            <Text style={styles.blueButtonText}>TRANSFERIR FONDOS</Text>
          </Pressable>
        </View>

        {/* Artículos en Consignación */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Artículos en{'\n'}Consignación</Text>
            <Pressable>
              <Text style={styles.viewAllText}>VER{'\n'}TODOS ➔</Text>
            </Pressable>
          </View>

          {profile?.consignaciones && profile.consignaciones.length > 0 ? (
            profile.consignaciones.map((item, idx) => (
              <View key={idx} style={styles.itemCard}>
                <Image
                  source={{ uri: item.imagen || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=800&auto=format&fit=crop' }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemContent}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{item.titulo}</Text>
                    <Ionicons name="qr-code-outline" size={24} color="#ccc" />
                  </View>
                  <Text style={styles.itemSubtitle}>{item.subtitulo}</Text>

                  <View style={styles.itemBulletRow}>
                    <View style={styles.goldDot} />
                    <View>
                      <Text style={styles.itemBulletLabel}>UBICACIÓN ACTUAL</Text>
                      <Text style={styles.itemBulletValue}>{item.ubicacion}</Text>
                    </View>
                  </View>

                  <View style={styles.itemBulletRow}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#666" style={{ marginTop: 2 }} />
                    <View style={{ marginLeft: 6 }}>
                      <Text style={styles.itemBulletLabel}>PÓLIZA DE SEGURO</Text>
                      <Text style={styles.itemBulletLink}>Descargar Certificado</Text>
                    </View>
                  </View>

                  <View style={styles.itemDivider} />

                  <View style={styles.itemValueRow}>
                    <Text style={styles.itemValueLabel}>VALOR ESTIMADO</Text>
                    <Text style={styles.itemValue}>{item.valorEstimado}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginTop: 10 }}>
              No cuentas con artículos en consignación en este momento.
            </Text>
          )}
        </View>

        <Pressable style={styles.blackButton}>
          <Text style={styles.blackButtonText}>VISUALIZAR MÉTRICAS</Text>
        </Pressable>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3D28E',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
    marginLeft: 6,
  },
  userName: {
    fontFamily: 'serif',
    fontSize: 32,
    color: '#000',
    marginBottom: 20,
  },
  balancesContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F7',
    marginBottom: 16,
    padding: 16,
  },
  balanceCard: {
    flex: 1,
  },
  balanceDivider: {
    width: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  balanceLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: 'serif',
    fontSize: 18,
    color: '#000',
  },
  redButton: {
    backgroundColor: '#B22222', // Dark red
    paddingVertical: 14,
    alignItems: 'center',
  },
  redButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  activityCard: {
    backgroundColor: Colors.primary,
    padding: 24,
    marginBottom: 32,
  },
  activityTitle: {
    color: '#667487',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 24,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activityLabel: {
    color: '#FFF',
    fontSize: 14,
  },
  activityValue: {
    color: '#FFF',
    fontFamily: 'serif',
    fontSize: 18,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: 24,
    color: '#000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 1,
    marginBottom: 24,
  },
  barsContainer: {
    marginBottom: 24,
  },
  barItem: {
    marginBottom: 16,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 1,
  },
  barPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
  barTrack: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  totalValueContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  totalValueLabel: {
    fontSize: 10,
    color: '#666',
    letterSpacing: 1,
    marginBottom: 4,
  },
  totalValue: {
    fontFamily: 'serif',
    fontSize: 32,
    color: '#000',
  },
  totalValueIncrease: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
    marginTop: 4,
  },
  manageFundsCard: {
    backgroundColor: '#F0F0F0',
    padding: 20,
    marginBottom: 32,
  },
  manageFundsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  manageFundsTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    color: '#000',
    marginLeft: 8,
  },
  manageFundsText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    marginBottom: 16,
  },
  blueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  blueButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
    paddingBottom: 16,
  },
  viewAllText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
    textAlign: 'right',
    letterSpacing: 1,
  },
  itemCard: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  itemImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
  },
  itemContent: {
    padding: 16,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    color: '#000',
    lineHeight: 24,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  itemBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
    marginTop: 6,
    marginRight: 8,
  },
  itemBulletLabel: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 1,
    marginBottom: 2,
  },
  itemBulletValue: {
    fontSize: 13,
    color: '#000',
  },
  itemBulletLink: {
    fontSize: 13,
    color: Colors.secondary,
    textDecorationLine: 'underline',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 16,
  },
  itemValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemValueLabel: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 1,
  },
  itemValue: {
    fontFamily: 'serif',
    fontSize: 16,
    color: '#000',
  },
  blackButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  blackButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
