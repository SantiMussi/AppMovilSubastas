import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../themes/colors';
import { useCurrency } from '../context/CurrencyContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export default function MetricsScreen({ session, onBack }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [wins, setWins] = useState(null);
  const [error, setError] = useState('');
  const { formatGlobalMoney } = useCurrency();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const [statsRes, winsRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/users/me/stats`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }),
        fetch(`${API_BASE}/api/v1/users/me/wins`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        })
      ]);

      if (statsRes.ok && winsRes.ok) {
        setStats(await statsRes.json());
        setWins(await winsRes.json());
      } else {
        setError('Error al cargar métricas');
      }
    } catch (err) {
      setError('Error de red al cargar métricas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  if (error || !stats || !wins) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={onBack} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.secondary }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const profile = session?.profile || {};
  const fullName = `${profile.nombre || 'Usuario'} ${profile.apellido || ''}`.trim();
  const category = profile.categoria || 'COMÚN';
  const avatarUrl = profile.foto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Pressable onPress={onBack} hitSlop={10} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.headerTitle}>Métricas</Text>
        </View>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.topSection}>
          <View>
            <Text style={styles.userName}>{fullName}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{category.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.valuationContainer}>
            <Text style={styles.valuationLabel}>VALUACIÓN DE PORTFOLIO</Text>
            <Text style={styles.valuationValue}>{formatGlobalMoney(stats.valuacionPortfolio)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>ASISTENCIA</Text>
          <Text style={styles.cardValue}>{stats.asistencia}</Text>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#1F1C2C', '#928DAB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: '85%' }]}
            />
          </View>
          <Text style={styles.cardSub}>Top 5% participación en subastas</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>VICTORIAS</Text>
          <Text style={styles.cardValue}>{stats.victorias}</Text>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#D4AF37', '#F3E5AB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: '60%' }]}
            />
          </View>
          <Text style={styles.cardSub}>Lotes adquiridos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PROMEDIO PUJA</Text>
          <Text style={styles.cardValue}>{formatGlobalMoney(stats.promedioPuja)}</Text>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#0B132B', '#1C2541']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: '70%' }]}
            />
          </View>
        </View>

        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Desglose de inversiones</Text>
          
          {wins.desgloseInversiones && wins.desgloseInversiones.length > 0 ? (
            wins.desgloseInversiones.map((inv, idx) => (
              <View key={idx} style={styles.barItem}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barLabel}>{inv.categoria.replace('_', ' ')}</Text>
                  <Text style={styles.barPercent}>{inv.porcentaje}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <LinearGradient
                    colors={idx === 0 ? ['#000000', '#434343'] : idx === 1 ? ['#D4AF37', '#AA771C'] : ['#1C2541', '#3A506B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.barFill, 
                      { width: `${inv.porcentaje}%` }
                    ]}
                  />
                </View>
              </View>
            ))
          ) : (
             <Text style={{ color: '#888', fontSize: 12, textAlign: 'center', marginTop: 10 }}>Sin inversiones.</Text>
          )}
        </View>

        <View style={styles.successRateCard}>
          <Text style={styles.successRateLabel}>TASA DE ÉXITO</Text>
          <View style={styles.circleContainer}>
            <LinearGradient
              colors={['#D4AF37', '#F3E5AB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.circleOut}
            >
              <View style={styles.circleInnerBg}>
                <Text style={styles.successRateValue}>{Math.round(wins.tasaExito)}%</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  errorText: {
    color: '#B22222',
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  topSection: {
    marginBottom: 32,
  },
  userName: {
    fontFamily: 'serif',
    fontSize: 36,
    color: '#000',
    marginBottom: 4,
  },
  badge: {
    backgroundColor: '#E0E6ED',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#333',
    letterSpacing: 1,
  },
  valuationContainer: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  valuationLabel: {
    fontSize: 10,
    color: '#666',
    letterSpacing: 1,
    fontWeight: '600',
  },
  valuationValue: {
    fontFamily: 'serif',
    fontSize: 28,
    color: '#000',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardValue: {
    fontFamily: 'serif',
    fontSize: 36,
    color: '#000',
    marginBottom: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  cardSub: {
    fontSize: 11,
    color: '#666',
  },
  breakdownCard: {
    backgroundColor: '#F2F2F2',
    padding: 24,
    marginBottom: 24,
  },
  breakdownTitle: {
    fontFamily: 'serif',
    fontSize: 22,
    color: '#000',
    marginBottom: 24,
  },
  barItem: {
    marginBottom: 20,
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
    borderRadius: 2,
  },
  successRateCard: {
    backgroundColor: '#0B132B',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successRateLabel: {
    fontSize: 10,
    color: '#667487',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 24,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOut: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  circleInnerBg: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    backgroundColor: '#0B132B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successRateValue: {
    fontFamily: 'serif',
    fontSize: 48,
    color: '#FFF',
  },
});
