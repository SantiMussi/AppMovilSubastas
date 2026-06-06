import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../components/TopBar';
import { useCurrency } from '../context/CurrencyContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop';

export default function AuctionDetailScreen({ auctionItemId, session, onMenuPress, onPlaceBid }) {
  const [detail, setDetail] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => new Date());
  const { formatGlobalMoney } = useCurrency();

  const headers = useMemo(
    () => (session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    [session?.accessToken]
  );

  

  const loadDetail = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/v1/auction-items/${auctionItemId}`, { headers });
      console.log(response)
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          payload?.message || payload?.error || 'Este artículo ya no está disponible en una subasta en vivo.'
        );
      }
      setDetail(normalizeDetail(payload));
      setActiveImage(0);
    } catch (loadError) {
      setError(loadError.message || 'No se pudo cargar el artículo en vivo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [auctionItemId, headers]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <TopBar onMenuPress={onMenuPress} />
      {loading ? (
        <StatePanel icon="radio-outline" label="Cargando lote en vivo..." loading />
      ) : error ? (
        <StatePanel icon="alert-circle-outline" label={error} onRetry={loadDetail} />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDetail({ refresh: true })} />}
          >
            <Hero detail={detail} activeImage={activeImage} setActiveImage={setActiveImage} />

            <View style={styles.body}>
              <Text style={styles.title}>{detail.title}</Text>
              {detail.subtitle ? <Text style={styles.subtitle}>{detail.subtitle}</Text> : null}

              <View style={styles.bidSummary}>
                <View style={styles.bidColumn}>
                  <Text style={styles.summaryLabel}>PUJA ACTUAL</Text>
                  <Text style={styles.bidAmount}>{formatGlobalMoney(detail.currentBid || detail.basePrice)}</Text>
                  <Text style={styles.currency}>{detail.currency}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.bidColumn}>
                  <Text style={styles.summaryLabel}>TERMINA EN</Text>
                  <Text style={styles.timeLeft}>{formatCountdown(detail.endsAt, now)}</Text>
                </View>
              </View>

              <SectionTitle title="Descripción" />
              <Text style={styles.description}>{detail.description}</Text>

              <View style={styles.factList}>
                {detail.medium ? <Fact label="MEDIO" value={detail.medium} /> : null}
                {detail.dimensions ? <Fact label="DIMENSIONES" value={detail.dimensions} /> : null}
                {detail.condition ? <Fact label="CONDICIÓN" value={detail.condition} /> : null}
              </View>

              {detail.history ? (
                <>
                  <SectionTitle title="Procedencia & Historia" centered />
                  <View style={styles.timelineRow}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineYear}>HISTORIA DEL LOTE</Text>
                      <Text style={styles.timelineText}>{detail.history}</Text>
                    </View>
                  </View>
                </>
              ) : null}

              {detail.ownerName ? (
                <View style={styles.ownerCard}>
                  <View style={styles.ownerAvatar}>
                    <Ionicons name="business-outline" size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.ownerText}>
                    <Text style={styles.ownerLabel}>CONSIGNADO POR</Text>
                    <Text style={styles.ownerName}>{detail.ownerName}</Text>
                    <Text style={styles.verified}>● Vendedor Autenticado</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </ScrollView>

          <View style={styles.actionBar}>
            <Pressable style={styles.bidButton} onPress={onPlaceBid}>
              <Text style={styles.bidButtonText}>Pujar Ahora</Text>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function Hero({ detail, activeImage, setActiveImage }) {
  const images = detail.images.length ? detail.images : [FALLBACK_IMAGE];
  return (
    <View style={styles.hero}>
      <Image source={{ uri: images[activeImage] }} style={styles.heroImage} resizeMode="contain" />
      <View style={styles.lotBadge}><Text style={styles.lotBadgeText}>LOT # {detail.lotNumber}</Text></View>
      <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>EN VIVO</Text></View>
      {images.length > 1 ? (
        <View style={styles.dots}>
          {images.map((_, index) => (
            <Pressable key={index} onPress={() => setActiveImage(index)} style={[styles.dot, index === activeImage && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function SectionTitle({ title, centered }) {
  return (
    <View style={[styles.sectionHeading, centered && styles.centeredHeading]}>
      {centered ? <View style={styles.headingLine} /> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
      {centered ? <View style={styles.headingLine} /> : null}
    </View>
  );
}

function Fact({ label, value }) {
  return <View style={styles.fact}><Text style={styles.factLabel}>{label}</Text><Text style={styles.factValue}>{value}</Text></View>;
}

function StatePanel({ icon, label, loading, onRetry }) {
  return (
    <View style={styles.statePanel}>
      {loading ? <ActivityIndicator size="large" color="#9A7720" /> : <Ionicons name={icon} size={42} color="#9A7720" />}
      <Text style={styles.stateLabel}>{label}</Text>
      {onRetry ? <Pressable style={styles.retryButton} onPress={() => onRetry()}><Text style={styles.retryText}>REINTENTAR</Text></Pressable> : null}
    </View>
  );
}

function normalizeDetail(payload) {
  const data = payload?.data || payload?.item || payload;
  const product = data?.product || data?.producto || {};
  const owner = data?.ownerSummary || data?.owner || data?.dueño || {};
  const images = data?.images || data?.imagenes || product?.images || product?.imagenes || [];
  const title = data?.title || data?.nombre || product?.name || product?.nombre || data?.description || data?.descripcion;
  const description = data?.description || data?.descripcion || product?.fullDescription || product?.descripcionCompleta || title;

  return {
    title: title || `Lote #${data?.lotNumber || data?.numeroLote || data?.auctionItemId || ''}`,
    subtitle: data?.subtitle || data?.subtitulo || product?.catalogDescription || product?.descripcionCatalogo,
    description: description || 'Sin descripción disponible.',
    history: data?.history || data?.historia || product?.historia,
    medium: data?.medium || data?.medio || product?.material || product?.materiales,
    dimensions: data?.dimensions || data?.dimensiones || product?.dimensiones,
    condition: data?.condition || data?.condicion || product?.condicion,
    currentBid: data?.currentBid || data?.pujaActual || data?.ofertaActual || data?.precioActual,
    basePrice: data?.basePrice || data?.precioBase,
    currency: data?.currency || data?.moneda || 'USD',
    endsAt: data?.endsAt || data?.endDate || data?.fechaFin || data?.auctionEnd,
    lotNumber: data?.lotNumber || data?.numeroLote || data?.auctionItemId || data?.identificador || '—',
    ownerName: owner?.name || owner?.nombre || data?.ownerName || data?.consignorName,
    images: images.map((image) => typeof image === 'string' ? image : image?.url || image?.uri || image?.ruta).filter(Boolean),
  };
}

function formatCountdown(value, now) {
  if (!value) return 'En vivo';
  const remaining = new Date(value).getTime() - now.getTime();
  if (!Number.isFinite(remaining) || remaining <= 0) return 'Finalizando';
  const totalMinutes = Math.floor(remaining / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return days ? `${days}d ${hours}h\n${minutes}m` : `${hours}h ${minutes}m`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F8F7' },
  content: { paddingBottom: 96 },
  hero: { height: 330, backgroundColor: '#071829', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  heroImage: { width: '86%', height: '82%' },
  lotBadge: { position: 'absolute', top: 18, left: 16, backgroundColor: '#E9ECEE', paddingHorizontal: 10, paddingVertical: 5 },
  lotBadgeText: { color: '#071829', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  liveBadge: { position: 'absolute', top: 18, right: 16, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.94)', paddingHorizontal: 9, paddingVertical: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A32222' },
  liveText: { color: '#071829', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  dots: { position: 'absolute', bottom: 15, flexDirection: 'row', gap: 7 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#40505F' },
  dotActive: { backgroundColor: '#FFFFFF', width: 12 },
  body: { paddingHorizontal: 20, paddingTop: 30 },
  title: { color: '#101010', fontFamily: 'serif', fontSize: 31, lineHeight: 31 },
  subtitle: { color: '#747474', fontSize: 11, lineHeight: 16, marginTop: 8, maxWidth: 340 },
  bidSummary: { flexDirection: 'row', marginTop: 28, marginHorizontal: -20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#EBEBE8', minHeight: 94 },
  bidColumn: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  summaryDivider: { width: 1, backgroundColor: '#EBEBE8' },
  summaryLabel: { fontSize: 8, color: '#777777', letterSpacing: 0.8, marginBottom: 5 },
  bidAmount: { color: '#111111', fontSize: 18, fontWeight: '700' },
  currency: { color: '#777777', fontSize: 8, marginTop: 2 },
  timeLeft: { color: '#8A6411', fontSize: 17, lineHeight: 19, fontWeight: '700' },
  sectionHeading: { marginTop: 38, marginBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  centeredHeading: { justifyContent: 'center' },
  headingLine: { height: 1, backgroundColor: '#E4E4E1', flex: 1 },
  sectionTitle: { color: '#151515', fontFamily: 'serif', fontSize: 15 },
  description: { color: '#686868', fontSize: 11, lineHeight: 18 },
  factList: { marginTop: 22, gap: 14 },
  fact: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  factLabel: { color: '#898989', fontSize: 7, letterSpacing: 0.4 },
  factValue: { flex: 1, textAlign: 'right', color: '#343434', fontSize: 9 },
  timelineRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 3 },
  timelineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9A7720', marginTop: 4 },
  timelineContent: { flex: 1, borderLeftWidth: 1, borderLeftColor: '#E2E2DE', paddingLeft: 14, paddingBottom: 10 },
  timelineYear: { color: '#9A7720', fontSize: 7, letterSpacing: 0.7, marginBottom: 5 },
  timelineText: { color: '#666666', fontSize: 10, lineHeight: 16 },
  ownerCard: { marginTop: 34, padding: 15, backgroundColor: '#F1F1EF', flexDirection: 'row', alignItems: 'center', gap: 12 },
  ownerAvatar: { width: 42, height: 42, backgroundColor: '#172333', alignItems: 'center', justifyContent: 'center' },
  ownerText: { flex: 1 },
  ownerLabel: { color: '#898989', fontSize: 7, letterSpacing: 0.6 },
  ownerName: { color: '#151515', fontSize: 11, fontWeight: '700', marginVertical: 3 },
  verified: { color: '#9A7720', fontSize: 7 },
  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, backgroundColor: 'rgba(248,248,247,0.97)' },
  bidButton: { height: 54, backgroundColor: '#091A2E', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, shadowColor: '#000000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  bidButtonText: { color: '#FFFFFF', fontFamily: 'serif', fontSize: 15 },
  statePanel: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 36, gap: 16 },
  stateLabel: { color: '#555555', textAlign: 'center', lineHeight: 20 },
  retryButton: { backgroundColor: '#091A2E', paddingHorizontal: 22, paddingVertical: 13 },
  retryText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
});