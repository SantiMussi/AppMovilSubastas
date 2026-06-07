import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { TopBar } from '../components/TopBar';
import { useCurrency } from '../context/CurrencyContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=900&auto=format&fit=crop';

export default function AuctionRoomScreen({ auctionItemId, session, onMenuPress }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connection, setConnection] = useState('connecting');
  const [bidAmount, setBidAmount] = useState('');
	const [bidPending, setBidPending] = useState(false);
  const [bidMessage, setBidMessage] = useState('');
  const [now, setNow] = useState(Date.now());
  const closedRefreshRef = useRef(false);
  const socketRef = useRef(null);
  const reconnectRef = useRef(null);
  const { formatGlobalMoney } = useCurrency();
  const validAuctionItemId = normalizeAuctionItemId(auctionItemId);

  const headers = useMemo(
    () => (session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    [session?.accessToken]
  );

  const applySnapshot = useCallback((payload) => {
    setSnapshot(normalizeSnapshot(payload, Date.now()));
    setError('');
    setLoading(false);
  }, []);

  const loadSnapshot = useCallback(async () => {
    if (!validAuctionItemId) {
      throw new Error('No se recibió un identificador válido para la subasta.');
    }
    setError('');
    const [detailResponse, topBidResponse, historyResponse] = await Promise.all([
      fetch(`${API_BASE}/api/v1/auction-items/${validAuctionItemId}`, { headers }),
      fetch(`${API_BASE}/api/v1/auction-items/${validAuctionItemId}/top-bid`, { headers }),
      fetch(`${API_BASE}/api/v1/auction-items/${validAuctionItemId}/bids?size=20`, { headers }),
    ]);
    if (!detailResponse.ok || !topBidResponse.ok || !historyResponse.ok) {
      throw new Error('No se pudo cargar la sala de subasta.');
    }
    applySnapshot({
      detail: await detailResponse.json(),
      topBid: await topBidResponse.json(),
      history: await historyResponse.json(),
    });
  }, [applySnapshot, headers, validAuctionItemId]);

  useEffect(() => {
    loadSnapshot().catch((loadError) => {
      setError(loadError.message || 'No se pudo cargar la sala de subasta.');
      setLoading(false);
    });
  }, [loadSnapshot]);

  useEffect(() => {
    let mounted = true;
    const connect = () => {
      if (!mounted || !validAuctionItemId) {
        setConnection('offline');
        return;
      }
      setConnection('connecting');
      if (!session?.accessToken) {
        setConnection('offline');
        setError('Debes iniciar sesión para ingresar a una sala de subasta.');
        return;
      }
      const socket = new WebSocket(toWebSocketUrl(API_BASE, `/ws/auction-items/${validAuctionItemId}`, session.accessToken));
      socketRef.current = socket;
      socket.onopen = () => setConnection('live');
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'bid_accepted') {
            setBidPending(false);
            setBidMessage('Tu puja fue registrada correctamente.');
          } else if (payload.type === 'bid_rejected') {
            setBidPending(false);
            setError(payload.message || 'La puja fue rechazada.');
          } else {
            applySnapshot(payload);
          }
        } catch (error) {
          console.warn('[Auction room] Invalid live update', error);
        }
      };
      socket.onerror = () => setConnection('offline');
      socket.onclose = (event) => {
				if (!mounted) return;
        setConnection('offline');
				setBidPending(false);
        if (event.code === 1008) {
          setError('Esta sesión se cerró porque ingresaste a otra sala de subasta.');
          return;
        }
				reconnectRef.current = setTimeout(connect, 3000);
			};
    };
    connect();
    return () => {
      mounted = false;
      clearTimeout(reconnectRef.current);
      socketRef.current?.close();
    };
  }, [applySnapshot, session?.accessToken, validAuctionItemId]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (snapshot?.topBid?.nextMinBid && !bidAmount) {
      setBidAmount(String(Math.round(Number(snapshot.topBid.nextMinBid))));
    }
  }, [bidAmount, snapshot?.topBid?.nextMinBid]);

  const serverNow = now + (snapshot?.serverOffsetMs || 0);
  const auctionClosed = Boolean(snapshot?.detail?.auctionClosed)
    || (snapshot?.detail?.endsAt && new Date(snapshot.detail.endsAt).getTime() <= serverNow);
  const biddingOpen = snapshot?.detail?.biddingOpen !== false && !auctionClosed;

  useEffect(() => {
    if (!auctionClosed || closedRefreshRef.current) return;
    closedRefreshRef.current = true;
    requestLiveRefresh();
  }, [auctionClosed]);

  const requestLiveRefresh = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'refresh' }));
    } else {
      loadSnapshot().catch((loadError) => setError(loadError.message || 'No se pudo actualizar la sala.'));
    }
  };

	const placeBid = () => {
    if (bidPending) return;
    if (!biddingOpen) {
      setError(auctionClosed ? 'La subasta está cerrada y ya no recibe pujas.' : 'La subasta todavía no comenzó.');
      return;
    }
    const amount = Number(String(bidAmount).replace(',', '.'));
    const minimum = Number(snapshot?.topBid?.nextMinBid);
    const maximum = Number(snapshot?.topBid?.nextMaxBid);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Ingresa un importe válido para pujar.');
      return;
    }
    if (Number.isFinite(minimum) && amount < minimum) {
      setError(`La puja mínima permitida es ${minimum.toFixed(2)}.`);
      return;
    }
    if (snapshot?.topBid?.appliesCap && Number.isFinite(maximum) && amount > maximum) {
      setError(`La puja máxima permitida es ${maximum.toFixed(2)}.`);
      return;
    }
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      setError('Espera a que se restablezca la conexión antes de pujar.');
      return;
    }
    setError('');
    setBidMessage('');
    setBidPending(true);
    socketRef.current.send(JSON.stringify({ type: 'place_bid', amount }));
  };

  if (loading && !snapshot) {
    return <View style={styles.screen}><TopBar onMenuPress={onMenuPress} /><View style={styles.loading}><ActivityIndicator color="#9A7720" /><Text style={styles.loadingText}>Cargando subasta en vivo…</Text></View></View>;
  }

  if (!snapshot) {
    return (
      <View style={styles.screen}>
        <TopBar onMenuPress={onMenuPress} />
        <View style={styles.loading}>
          <Text style={styles.errorText}>{error || 'No se pudo cargar la sala de subasta.'}</Text>
          <Pressable style={styles.retryButton} onPress={() => loadSnapshot().catch((loadError) => setError(loadError.message))}>
            <Text style={styles.retryButtonText}>REINTENTAR</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const detail = snapshot.detail || {};
  const topBid = snapshot.topBid || {};
  const bids = asArray(snapshot.bids);
  const detailImages = asArray(detail.images);
  const images = detailImages.length ? detailImages.slice(0, 2) : [FALLBACK_IMAGE, FALLBACK_IMAGE];
  if (images.length === 1) images.push(images[0]);

  return (
    <View style={styles.screen}>
      <TopBar onMenuPress={onMenuPress} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.lotRow}>
          <Text style={styles.lot}>LOTE ◆ {String(detail.lotNumber).padStart(3, '0')}</Text>
          <View style={styles.liveWrap}><View style={[styles.liveDot, connection !== 'live' && styles.offlineDot]} /><Text style={styles.liveLabel}>{auctionClosed ? 'CERRADA' : connection === 'live' ? 'EN VIVO' : 'RECONECTANDO'}</Text></View>
        </View>
        <Text style={styles.title}>{detail.title}</Text>

        <View style={styles.imagesRow}>
          {images.map((uri, index) => <Image key={`${uri}-${index}`} source={{ uri }} resizeMode="contain" style={styles.productImage} />)}
        </View>

        <View style={styles.bidCard}>
          <View style={styles.summaryRow}>
            <View><Text style={styles.eyebrow}>ÚLTIMA OFERTA</Text><Text style={styles.currentBid}>{formatMoney(formatGlobalMoney, topBid.currentBid || detail.basePrice)}</Text></View>
            <View><Text style={styles.eyebrow}>TIEMPO RESTANTE</Text><Text style={styles.countdown}>{auctionClosed ? 'CERRADA' : formatCountdown(detail.endsAt, serverNow)}</Text></View>
          </View>
          <View style={styles.rule} />
          <View style={styles.minimumRow}><Text style={styles.eyebrow}>TU PUJA MÍNIMA</Text><Text style={styles.minimum}>{formatMoney(formatGlobalMoney, topBid.nextMinBid)}</Text></View>
          <TextInput
            value={bidAmount}
            editable={biddingOpen}
            onChangeText={setBidAmount}
            keyboardType="numeric"
            style={styles.bidInput}
            accessibilityLabel="Importe de puja"
          />
          {topBid.appliesCap && topBid.nextMaxBid ? <Text style={styles.bidLimit}>Máximo: {formatMoney(formatGlobalMoney, topBid.nextMaxBid)}</Text> : null}
          {error ? <Text style={styles.bidError}>{error}</Text> : null}
          {bidMessage ? <Text style={styles.bidSuccess}>{bidMessage}</Text> : null}
          <Pressable style={[styles.bidButton, (bidPending || !biddingOpen) && styles.bidButtonDisabled]} onPress={placeBid} disabled={bidPending || !biddingOpen}>
            <Text style={styles.bidButtonText}>{auctionClosed ? 'SUBASTA CERRADA' : !biddingOpen ? 'SUBASTA PRÓXIMA' : bidPending ? 'REGISTRANDO PUJA…' : 'PUJAR AHORA'}</Text>
          </Pressable>
        </View>

        <View style={styles.historyHeader}><Text style={styles.historyTitle}>Historial de Pujas</Text><Text style={styles.liveCount}>{bids.length} OFERTAS</Text></View>
        <View style={styles.historyList}>
          {bids.slice(0, 5).map((bid, index) => (
            <View key={bid.bidId || index} style={styles.historyRow}>
              <View style={[styles.historyDot, index === 0 && styles.firstHistoryDot]} />
                            <View style={styles.bidder}><Text style={styles.bidderName}>{formatBidderName(bid)}</Text><Text style={styles.bidTime}>{relativeTime(bid.date, now)}</Text></View>
              <Text style={[styles.historyAmount, index > 0 && styles.mutedAmount]}>{formatMoney(formatGlobalMoney, bid.amount)}</Text>
            </View>
          ))}
          {!bids.length ? <Text style={styles.empty}>Todavía no hay ofertas. Sé el primero en pujar.</Text> : null}
        </View>
        <Pressable style={styles.historyButton} onPress={requestLiveRefresh}><Text style={styles.historyButtonText}>VER HISTORIAL COMPLETO</Text></Pressable>
      </ScrollView>
    </View>
  );
}


function normalizeAuctionItemId(value) {
  const normalized = String(value ?? '').trim();
  return /^[1-9]\d*$/.test(normalized) ? normalized : null;
}

function normalizeSnapshot(payload, receivedAt) {
  const detailData = payload?.detail || payload?.item || {};
  const topBid = payload?.topBid || {};
  const rawHistory = asArray(payload?.history?.items ?? payload?.bids);
  const images = asArray(detailData?.imagenes ?? detailData?.images);
  const serverTimestamp = payload?.generatedAt || detailData?.serverTime;
  const parsedServerTime = serverTimestamp ? new Date(serverTimestamp).getTime() : NaN;
  const status = String(detailData?.auctionStatus || detailData?.estado || '').toLowerCase();
  return {
    serverOffsetMs: Number.isFinite(parsedServerTime) ? parsedServerTime - receivedAt : 0,
    detail: {
      title: detailData?.title || detailData?.nombre || detailData?.description || detailData?.descripcion || `Lote #${detailData?.auctionItemId || ''}`,
      lotNumber: detailData?.lotNumber || detailData?.numeroLote || detailData?.auctionItemId || '—',
      basePrice: detailData?.basePrice || detailData?.precioBase,
      endsAt: detailData?.endsAt || detailData?.fechaFin,
      auctionClosed: detailData?.auctionClosed === true || !['', 'abierta', 'open', 'live'].includes(status),
      biddingOpen: detailData?.biddingOpen !== false,
      images: images.map((image) => resolveImageUri(typeof image === 'string' ? image : image?.url || image?.uri)).filter(Boolean),
    },
    topBid: {
      currentBid: topBid?.currentBid || topBid?.pujaActual,
      bidderName: topBid?.bidderName || topBid?.nombrePostor || topBid?.nombrePujador,
      nextMinBid: topBid?.nextMinBid || topBid?.pujaMinima,
      nextMaxBid: topBid?.nextMaxBid || topBid?.pujaMaxima,
      appliesCap: topBid?.appliesCap !== false,
    },
    bids: rawHistory.slice().reverse().map((bid) => ({
      bidId: bid?.bidId || bid?.id,
      bidderNumber: bid?.bidderNumber || bid?.numeroPostor,
      bidderName: bid?.bidderName || bid?.nombrePostor || bid?.nombrePujador,
      amount: bid?.importe || bid?.amount,
      date: bid?.fecha || bid?.date,
    })),
  };
}


function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveImageUri(uri) {
  if (!uri || typeof uri !== 'string') return null;
  if (!uri.startsWith('/')) return uri;
  const resolvedBase = API_BASE || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');
  return `${resolvedBase.replace(/\/$/, '')}${uri}`;
}

function toWebSocketUrl(base, path, accessToken) {
  const resolved = base || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');
  return `${resolved.replace(/^http/, 'ws').replace(/\/$/, '')}${path}?access_token=${encodeURIComponent(accessToken)}`;
}

function formatBidderName(bid) {
  const name = String(bid?.bidderName || '').trim();
  return name || `Postor #${bid?.bidderNumber || '—'}`;
}

function formatMoney(formatter, amount) {
  return formatter(amount) || '$0';
}

function formatCountdown(endsAt, now) {
  if (!endsAt) return '04:12:09';
  const seconds = Math.max(0, Math.floor((new Date(endsAt).getTime() - now) / 1000));
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');
}

function relativeTime(date, now) {
  if (!date) return 'HACE UN MOMENTO';
  const minutes = Math.max(0, Math.floor((now - new Date(date).getTime()) / 60000));
  return minutes < 1 ? 'HACE UN MOMENTO' : `HACE ${minutes} MINUTOS`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F7' },
  content: { paddingHorizontal: 10, paddingBottom: 28 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#777', fontSize: 12 },
  errorText: { color: '#555', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  retryButton: { backgroundColor: '#06033E', paddingHorizontal: 24, paddingVertical: 12 },
  retryButtonText: { color: '#FFF', fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  lotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  lot: { color: '#856521', fontSize: 7, fontWeight: '700', letterSpacing: 1.4 },
  liveWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#9B7623' },
  offlineDot: { backgroundColor: '#B9B9B9' },
  liveLabel: { color: '#777', fontSize: 6, letterSpacing: 0.8 },
  title: { marginTop: 6, color: '#111', fontFamily: 'serif', fontSize: 24, lineHeight: 26, maxWidth: 280 },
  imagesRow: { flexDirection: 'row', gap: 7, height: 170, marginTop: 19, marginBottom: 20 },
  productImage: { flex: 1, height: 170, backgroundColor: '#FFF' },
  bidCard: { backgroundColor: '#FFF', padding: 19, marginBottom: 19 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 14 },
  eyebrow: { color: '#555', fontSize: 6, fontWeight: '700', letterSpacing: 0.65, marginBottom: 6 },
  currentBid: { color: '#111', fontFamily: 'serif', fontSize: 18 },
  countdown: { color: '#8B691B', fontSize: 16, fontWeight: '700', letterSpacing: 1.2 },
  rule: { height: 1, backgroundColor: '#E8E8E8', marginBottom: 20 },
  minimumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  minimum: { color: '#111', fontSize: 11, fontWeight: '700' },
  bidInput: { height: 38, backgroundColor: '#F1F1F1', paddingHorizontal: 12, color: '#111', fontSize: 12, marginBottom: 11 },
  bidLimit: { color: '#666', fontSize: 8, marginBottom: 8 },
  bidError: { color: '#A12222', fontSize: 8, marginBottom: 8 },
  bidSuccess: { color: '#287A40', fontSize: 8, marginBottom: 8 },
  bidButton: { height: 39, backgroundColor: '#06033E', alignItems: 'center', justifyContent: 'center' },
  bidButtonDisabled: { opacity: 0.55 },
  bidButtonText: { color: '#FFF', fontFamily: 'serif', fontSize: 8, letterSpacing: 1.2 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  historyTitle: { color: '#171717', fontFamily: 'serif', fontSize: 14 },
  liveCount: { color: '#9A7720', fontSize: 6, letterSpacing: 0.7 },
  historyList: { marginBottom: 10 },
  historyRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  historyDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#C8CCD2', marginRight: 14 },
  firstHistoryDot: { backgroundColor: '#9A7720' },
  bidder: { flex: 1 },
  bidderName: { color: '#1C1C1C', fontSize: 9, fontWeight: '700' },
  bidTime: { color: '#8A8A8A', fontSize: 5, marginTop: 2 },
  historyAmount: { color: '#111', fontSize: 9, fontWeight: '700' },
  mutedAmount: { color: '#555' },
  empty: { color: '#777', fontSize: 9, paddingVertical: 22, textAlign: 'center' },
  historyButton: { height: 31, borderWidth: 1, borderColor: '#D8CEB8', alignItems: 'center', justifyContent: 'center' },
  historyButtonText: { color: '#7B5D1C', fontSize: 6, letterSpacing: 0.5 },
});