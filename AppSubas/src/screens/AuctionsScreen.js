import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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
import { Colors } from '../themes/colors';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get('window');

const TAB_OPTIONS = [
  { key: 'live', label: 'En Vivo' },
  { key: 'scheduled', label: 'Próximas' },
  { key: 'ended', label: 'Finalizadas' },
];

const FALLBACK_IMAGES = {
  live: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=900&auto=format&fit=crop',
  scheduled: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?q=80&w=900&auto=format&fit=crop',
  ended: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=900&auto=format&fit=crop',
};

const STATUS_ALIASES = {
  live: ['abierta', 'en_vivo', 'en vivo', 'in_progress', 'in progress', 'activa'],
  scheduled: ['programada', 'proxima', 'próxima', 'scheduled', 'pendiente'],
  ended: ['cerrada', 'finalizada', 'ended', 'vendida', 'terminada'],
};

export default function AuctionsScreen({ session, onMenuPress, onNavigate }) {
  const [activeTab, setActiveTab] = useState('live');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => new Date());
  const mounted = useRef(true);

  const requestHeaders = useMemo(() => {
    if (!session?.accessToken) return {};
    return { Authorization: `Bearer ${session.accessToken}` };
  }, [session?.accessToken]);

  const fetchJson = useCallback(async (path) => {
    const response = await fetch(`${API_BASE}${path}`, { headers: requestHeaders });
    if (response.status === 204) return null;
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.message || payload?.error || `No se pudo cargar ${path} (${response.status}).`;
      throw new Error(message);
    }
    return payload;
  }, [requestHeaders]);

  const hydrateAuction = useCallback(async (rawAuction) => {
    const normalized = normalizeAuction(rawAuction);

    try {
      const catalogsPayload = await fetchJson(`/api/v1/auctions/${normalized.id}/catalog`);
      const catalogs = normalizeList(catalogsPayload);
      const firstCatalog = catalogs[0];
      const catalogId = firstCatalog?.identificador || firstCatalog?.id;

      if (!catalogId) {
        return {
          ...normalized,
          title: normalized.title || firstCatalog?.descripcion || `Subasta #${normalized.id}`,
        };
      }

      const itemsPayload = await fetchJson(`/api/v1/catalogs/${catalogId}/items`);
      const items = normalizeList(itemsPayload);
      const firstItem = items[0];
      const firstProduct = firstItem?.producto || firstItem?.product || {};

      return {
        ...normalized,
        catalogTitle: firstCatalog?.descripcion,
        title: normalized.title || firstCatalog?.descripcion || firstProduct?.nombre || firstProduct?.descripcionCatalogo || `Subasta #${normalized.id}`,
        category: normalized.category || firstProduct?.categoria,
        imageUri: extractImageUri(firstProduct, firstItem),
        currentOffer: firstItem?.precioBase || firstItem?.basePrice || firstItem?.precioActual || normalized.currentOffer,
        currency: normalized.currency || firstItem?.moneda || 'USD',
        auctionItemId: firstItem?.identificador || firstItem?.auctionItemId,
        itemDescription: firstProduct?.descripcionCatalogo || firstProduct?.descripcionCompleta || firstItem?.descripcion,
      };
    } catch (catalogError) {
      return normalized;
    }
  }, [fetchJson]);

  const loadAuctions = useCallback(async ({ showRefresh = false } = {}) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const payload = await fetchJson('/api/v1/auctions');
      const rawAuctions = normalizeList(payload);
      const detailedAuctions = await Promise.all(rawAuctions.map(hydrateAuction));

      if (mounted.current) {
        setAuctions(detailedAuctions);
        setNow(new Date());
      }
    } catch (loadError) {
      if (mounted.current) {
        setError(loadError.message || 'No se pudieron cargar las subastas.');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [fetchJson, hydrateAuction]);

  useEffect(() => {
    mounted.current = true;
    loadAuctions();
    return () => {
      mounted.current = false;
    };
  }, [loadAuctions]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const auctionsWithStatus = useMemo(
    () => auctions.map((auction) => ({ ...auction, computedStatus: getAuctionStatus(auction, now) })),
    [auctions, now]
  );

  const filteredAuctions = useMemo(
    () => auctionsWithStatus.filter((auction) => auction.computedStatus === activeTab),
    [activeTab, auctionsWithStatus]
  );

  return (
    <View style={styles.container}>
      <TopBar onMenuPress={onMenuPress} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAuctions({ showRefresh: true })}
            tintColor={Colors.secondary}
          />
        }
      >
        <Text style={styles.kicker}>SUBASTAS</Text>

        <View style={styles.tabsCard}>
          {TAB_OPTIONS.map((tab) => {
            const selected = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tab, selected && styles.tabActive]}
              >
                <Text style={[styles.tabText, selected && styles.tabTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={Colors.secondary} />
            <Text style={styles.stateText}>Cargando subastas...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Ionicons name="alert-circle-outline" size={34} color="#B22222" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => loadAuctions()}>
              <Text style={styles.retryButtonText}>REINTENTAR</Text>
            </Pressable>
          </View>
        ) : filteredAuctions.length === 0 ? (
          <View style={styles.stateBox}>
            <Ionicons name="calendar-clear-outline" size={36} color={Colors.secondary} />
            <Text style={styles.emptyTitle}>No hay subastas en esta sección</Text>
            <Text style={styles.stateText}>Deslizá hacia abajo para actualizar el listado.</Text>
          </View>
        ) : (
          filteredAuctions.map((auction) => (
            <AuctionCard
              key={`${auction.id}-${auction.computedStatus}`}
              auction={auction}
              now={now}
              onJoin={() => onNavigate?.(`auctionRoom:${auction.id}`)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function AuctionCard({ auction, now, onJoin }) {
  const isLive = auction.computedStatus === 'live';
  const isScheduled = auction.computedStatus === 'scheduled';
  const isEnded = auction.computedStatus === 'ended';
  const startDate = getAuctionDate(auction);
  const imageUri = auction.imageUri || FALLBACK_IMAGES[auction.computedStatus] || FALLBACK_IMAGES.live;

  return (
    <View style={[styles.card, isEnded && styles.endedCard]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        <View style={[styles.badge, isEnded && styles.badgeEnded, isScheduled && styles.badgeLight]}>
          {isLive && <View style={styles.liveDot} />}
          <Text style={[styles.badgeText, isScheduled && styles.badgeTextDark]}>
            {isLive ? 'EN VIVO' : isScheduled ? 'PRÓXIMAMENTE' : 'VENDIDO'}
          </Text>
        </View>

        <Pressable style={[styles.carouselButton, styles.carouselLeft]}>
          <Ionicons name="chevron-back" size={18} color="#0A1628" />
        </Pressable>
        <Pressable style={[styles.carouselButton, styles.carouselRight]}>
          <Ionicons name="chevron-forward" size={18} color="#0A1628" />
        </Pressable>

        {isLive && (
          <View style={styles.offerBox}>
            <Text style={styles.offerLabel}>OFERTA ACTUAL</Text>
            <Text style={styles.offerValue}>{formatMoney(auction.currentOffer, auction.currency)}</Text>
            <Pressable style={styles.joinButton} onPress={onJoin}>
              <Text style={styles.joinButtonText}>PARTICIPAR AHORA</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Text style={styles.title}>{auction.title || `Subasta #${auction.id}`}</Text>

      {isLive && auction.auctioneerName ? (
        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={14} color="#0A1628" />
          <Text style={styles.metaText}>Martillero: {auction.auctioneerName}</Text>
        </View>
      ) : null}

      {auction.category ? (
        <Text style={styles.category}>CATEGORÍA: {formatCategory(auction.category)}</Text>
      ) : null}

      {isLive && auction.endDate ? (
        <View style={styles.countdownBox}>
          <Text style={styles.countdownLabel}>CIERRA EN</Text>
          <Text style={styles.countdownValue}>{formatCountdown(auction.endDate, now)}</Text>
        </View>
      ) : null}

      {(isScheduled || isLive) && startDate ? (
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color="#0A1628" />
          <Text style={styles.dateText}>{formatDateTime(startDate)}</Text>
        </View>
      ) : null}

      {isEnded && startDate ? <Text style={styles.endedDate}>{formatPastDate(startDate)}</Text> : null}
    </View>
  );
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeAuction(raw) {
  const id = raw?.id || raw?.identificador || raw?.auctionId;
  const date = raw?.fecha || raw?.date || raw?.startDate;
  const time = raw?.hora || raw?.time || raw?.startTime;
  const subastador = raw?.subastador || raw?.auctioneer || {};

  return {
    ...raw,
    id,
    date,
    time,
    title: raw?.titulo || raw?.title || raw?.nombre || raw?.descripcion,
    status: raw?.estado || raw?.status,
    category: raw?.categoria || raw?.category,
    currency: raw?.moneda || raw?.currency || 'USD',
    startDate: raw?.fechaInicio || raw?.startDateTime || raw?.startsAt,
    endDate: raw?.fechaFin || raw?.endDateTime || raw?.endsAt || inferEndDate(date, time),
    auctioneerName: [subastador?.nombre, subastador?.apellido].filter(Boolean).join(' ') || subastador?.name,
    currentOffer: raw?.ofertaActual || raw?.currentOffer || raw?.montoActual,
    imageUri: raw?.imagenPrincipal || raw?.image || raw?.imageUrl,
  };
}

function getAuctionDate(auction) {
  if (auction.startDate) return safeDate(auction.startDate);
  if (auction.date && auction.time) return safeDate(`${auction.date}T${auction.time}`);
  if (auction.date) return safeDate(auction.date);
  return null;
}

function inferEndDate(date, time) {
  const start = date && time ? safeDate(`${date}T${time}`) : safeDate(date);
  if (!start) return null;
  return new Date(start.getTime() + 3 * 60 * 60 * 1000).toISOString();
}

function getAuctionStatus(auction, now) {
  const normalizedStatus = `${auction.status || ''}`.trim().toLowerCase();

  if (STATUS_ALIASES.ended.includes(normalizedStatus)) return 'ended';
  if (STATUS_ALIASES.scheduled.includes(normalizedStatus)) {
    const start = getAuctionDate(auction);
    return start && start <= now ? 'live' : 'scheduled';
  }
  if (STATUS_ALIASES.live.includes(normalizedStatus)) {
    const end = safeDate(auction.endDate);
    if (end && end <= now) return 'ended';
    const start = getAuctionDate(auction);
    if (start && start > now) return 'scheduled';
    return 'live';
  }

  const start = getAuctionDate(auction);
  const end = safeDate(auction.endDate);

  if (end && end <= now) return 'ended';
  if (start && start > now) return 'scheduled';
  return 'live';
}

function safeDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function extractImageUri(product = {}, item = {}) {
  const direct = product.imagenPrincipal || product.image || product.imageUrl || item.imagenPrincipal || item.imageUrl;
  if (direct) return direct;

  const images = product.imagenes || item.imagenes || product.fotos || item.fotos;
  if (Array.isArray(images) && images.length > 0) {
    if (typeof images[0] === 'string') return images[0];
    if (images[0]?.url) return images[0].url;
    if (images[0]?.foto) return byteArrayToDataUri(images[0].foto);
  }

  return byteArrayToDataUri(product.foto || item.foto);
}

function byteArrayToDataUri(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    return value.startsWith('data:') || value.startsWith('http') ? value : `data:image/jpeg;base64,${value}`;
  }
  if (Array.isArray(value)) {
    const binary = value.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    if (typeof btoa === 'function') return `data:image/jpeg;base64,${btoa(binary)}`;
  }
  return null;
}

function formatCategory(category) {
  return `${category}`.replace(/_/g, ' ').toUpperCase();
}

function formatMoney(value, currency = 'USD') {
  if (value === null || value === undefined || value === '') return `${currency} 0`;
  return `${currency} ${Number(value).toLocaleString('es-ES', { maximumFractionDigits: 0 })}`;
}

function formatCountdown(endDate, now) {
  const end = safeDate(endDate);
  if (!end) return '00h : 00m : 00s';
  const diff = Math.max(0, end.getTime() - now.getTime());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
}

function formatDateTime(date) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]}, ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })} ARS`;
}

function formatPastDate(date) {
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const cardWidth = Math.min(width - 44, 420);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 36,
  },
  kicker: {
    color: Colors.secondary,
    fontSize: 13,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  tabsCard: {
    flexDirection: 'row',
    backgroundColor: '#EFEFF1',
    borderRadius: 5,
    padding: 4,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  tabActive: {
    backgroundColor: '#07162A',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tabText: {
    color: '#384152',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  card: {
    width: cardWidth,
    alignSelf: 'center',
    marginBottom: 30,
  },
  endedCard: {
    backgroundColor: '#FFFFFF',
  },
  imageWrap: {
    height: cardWidth * 1.34,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 18,
    left: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#07162A',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeLight: {
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  badgeEnded: {
    backgroundColor: '#050505',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  badgeTextDark: {
    color: '#101010',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E53935',
  },
  carouselButton: {
    position: 'absolute',
    top: '50%',
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  carouselLeft: {
    left: -6,
  },
  carouselRight: {
    right: -6,
  },
  offerBox: {
    position: 'absolute',
    right: 16,
    top: 72,
    width: 166,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
    paddingTop: 12,
  },
  offerLabel: {
    color: '#233044',
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  offerValue: {
    color: '#07162A',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 14,
  },
  joinButton: {
    alignSelf: 'stretch',
    backgroundColor: '#07162A',
    paddingVertical: 14,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  title: {
    color: '#151515',
    fontFamily: 'serif',
    fontSize: 27,
    lineHeight: 31,
    marginTop: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  metaText: {
    color: '#4E5663',
    fontSize: 13,
  },
  category: {
    color: '#101820',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    marginTop: 5,
  },
  countdownBox: {
    alignItems: 'center',
    marginTop: 22,
  },
  countdownLabel: {
    color: Colors.secondary,
    fontSize: 11,
    letterSpacing: 0.9,
    marginBottom: 4,
  },
  countdownValue: {
    color: '#101820',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  dateText: {
    color: '#263242',
    fontSize: 13,
  },
  endedDate: {
    color: '#B8BEC7',
    fontSize: 11,
    marginTop: 8,
    paddingBottom: 28,
  },
  stateBox: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  stateText: {
    color: '#667085',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyTitle: {
    color: '#101820',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#B22222',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 18,
    backgroundColor: '#07162A',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
});