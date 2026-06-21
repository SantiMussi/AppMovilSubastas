import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../components/TopBar';
import { useCurrency } from '../context/CurrencyContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=900&auto=format&fit=crop';
const CLOSED_AUCTION_STATUSES = ['cerrada', 'carrada', 'cerrado', 'closed', 'finalizada', 'finalizado', 'finished'];

export default function AuctionRoomScreen({ auctionItemId, session, onMenuPress }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connection, setConnection] = useState('connecting');
  const [bidAmount, setBidAmount] = useState('');
  const [bidPending, setBidPending] = useState(false);
  const [bidMessage, setBidMessage] = useState('');
  const [now, setNow] = useState(Date.now());
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [winningSale, setWinningSale] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('envio');
  const [shippingAddress, setShippingAddress] = useState('');
  const [closedEventReceived, setClosedEventReceived] = useState(false);
  const closedRefreshRef = useRef(false);
  const resultCheckedRef = useRef(false);
  const forceAuctionClosedRef = useRef(false);
  const socketRef = useRef(null);
  const reconnectRef = useRef(null);
  const parentAuctionIdRef = useRef(null);
  const closurePollPendingRef = useRef(false);
  const closurePollErrorRef = useRef(false);
  const auctionClosedRef = useRef(false);
  const { formatGlobalMoney } = useCurrency();
  const validAuctionItemId = normalizeAuctionItemId(auctionItemId);

  const headers = useMemo(
    () => (session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    [session?.accessToken]
  );

  const selectedPayment = useMemo(
    () => payments.find((payment) => String(payment.id) === String(selectedPaymentId)) || null,
    [payments, selectedPaymentId]
  );


  const applySnapshot = useCallback((payload) => {
    const normalized = normalizeSnapshot(payload, Date.now());
    if (normalized.detail.auctionId) parentAuctionIdRef.current = normalized.detail.auctionId;
    if (forceAuctionClosedRef.current) {
      normalized.detail.auctionClosed = true;
      normalized.detail.biddingOpen = false;
    }
    setSnapshot(normalized);
    setError('');
    setLoading(false);
  }, []);

  const applyAuctionClosedEvent = useCallback((payload) => {
    auctionClosedRef.current = true;
    forceAuctionClosedRef.current = true;
    setSnapshot((current) => ({
      ...(current || normalizeSnapshot({}, Date.now())),
      detail: {
        ...(current?.detail || {}),
        auctionClosed: true,
        biddingOpen: false,
      },
      topBid: {
        ...(current?.topBid || {}),
        currentBid: payload?.winningAmount ?? current?.topBid?.currentBid,
        bidderNumber: payload?.winningBidderNumber ?? current?.topBid?.bidderNumber,
      },
    }));
    setClosedEventReceived(true);
    setBidPending(false);
    setError('');
    setLoading(false);
    resultCheckedRef.current = true;
    setResultModalVisible(true);
    (async () => {
      try {
        const sale = await loadWinningSale();
        if (sale) await loadInvoice(sale);
      } catch (e) {
        console.warn('[Auction room] could not load winning sale/invoice on close event', e);
      }
    })();
  }, [loadInvoice, loadWinningSale]);

  const loadSnapshot = useCallback(async () => {
    if (!validAuctionItemId) {
      throw new Error('No se recibió un identificador válido para la subasta.');
    }
    setError('');
    const [detailResponse, topBidResponse, historyResponse] = await Promise.all([
      fetch(`${API_BASE}/api/v1/auction-items/${validAuctionItemId}`, { headers }),
      fetch(`${API_BASE}/api/v1/auction-items/${validAuctionItemId}/top-bid`, { headers }),
      fetch(`${API_BASE}/api/v1/auction-items/${validAuctionItemId}/bids?size=50`, { headers }),
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

  const loadPayments = useCallback(async () => {
    if (!session?.accessToken) return;
    setPaymentsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me/payments/verified`, { headers });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setPayments([]);
        return;
      }
      const items = normalizeCollection(payload).filter((payment) => payment?.activo !== false && payment?.verificado !== false);
      setPayments(items);
      setSelectedPaymentId((current) => items.some((item) => String(item.id) === String(current)) ? current : null);
    } catch (loadError) {
      console.warn('Error loading verified payment methods:', loadError);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }, [headers, session?.accessToken]);

  const loadWinningSale = useCallback(async () => {
    if (!validAuctionItemId || !session?.accessToken) return null;
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me/wins`, { headers });
      const payload = await response.json().catch(() => null);
      if (!response.ok) return null;
      console.log(payload)
      const sale = normalizeCollection(payload).find((item) => saleMatchesAuctionItem(item, validAuctionItemId));
      setWinningSale(sale || null);
      return sale || null;
    } catch (loadError) {
      console.warn('Error loading winning sale:', loadError);
      return null;
    }
  }, [headers, session?.accessToken, validAuctionItemId]);

  const loadInvoice = useCallback(async (sale) => {
    const saleId = sale?.saleId || sale?.id;
    if (!saleId) return null;
    try {
      const response = await fetch(`${API_BASE}/api/v1/sales/${saleId}/invoice`, { headers });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setCheckoutMessage(payload?.message || payload?.error || 'No se pudo cargar la factura.');
        return null;
      }
      setInvoice(normalizeInvoice(payload, sale));
      return payload;
    } catch (loadError) {
      setCheckoutMessage('No se pudo cargar la factura por un error de conexión.');
      return null;
    }
  }, [headers]);


  useEffect(() => {
    loadSnapshot().catch((loadError) => {
      setError(loadError.message || 'No se pudo cargar la sala de subasta.');
      setLoading(false);
    });
  }, [loadSnapshot]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const checkParentAuctionClosed = useCallback(async () => {
    if (!validAuctionItemId || closedEventReceived || closurePollPendingRef.current) return;
    closurePollPendingRef.current = true;
    try {
      const auctionsResponse = await fetch(`${API_BASE}/api/v1/auctions`, { headers });
      if (!auctionsResponse.ok) return;
      const auctions = normalizeCollection(await auctionsResponse.json().catch(() => null));
      let parentAuctionId = parentAuctionIdRef.current;

      if (!parentAuctionId) {
        for (const auction of auctions) {
          const auctionId = auction?.id || auction?.identificador || auction?.auctionId;
          if (!auctionId) continue;
          const catalogResponse = await fetch(`${API_BASE}/api/v1/auctions/${auctionId}/catalog`, { headers });
          if (!catalogResponse.ok) continue;
          const catalog = await catalogResponse.json().catch(() => null);
          if (collectionContainsAuctionItem(catalog, validAuctionItemId)) {
            parentAuctionId = auctionId;
            parentAuctionIdRef.current = auctionId;
            break;
          }
        }
      }

      const parentAuction = auctions.find((auction) => String(auction?.id || auction?.identificador || auction?.auctionId) === String(parentAuctionId));
      if (parentAuction && isClosedAuctionStatus(parentAuction)) applyAuctionClosedEvent(parentAuction);
    } catch (pollError) {
      if (!closurePollErrorRef.current) {
        closurePollErrorRef.current = true;
        console.warn('[Auction room] Could not check parent auction status', pollError);
      }
    } finally {
      closurePollPendingRef.current = false;
    }
  }, [applyAuctionClosedEvent, closedEventReceived, headers, validAuctionItemId]);

  useEffect(() => {
    checkParentAuctionClosed();
    const timer = setInterval(checkParentAuctionClosed, 5000);
    return () => clearInterval(timer);
  }, [checkParentAuctionClosed]);

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
          const eventType = normalizeEventType(payload?.type);
          if (eventType === 'bid_accepted') {
            setBidPending(false);
            setBidMessage('Tu puja fue registrada correctamente.');
            loadSnapshot().catch(() => {});
          } else if (eventType === 'bid_rejected') {
            setBidPending(false);
            setError(payload.message || 'La puja fue rechazada.');
          } else if (eventType === 'lot_closed') {
            const nextId = payload?.nextItemId ? String(payload.nextItemId) : null;
            if (nextId) {
              // Hay un lote siguiente — mostrar aviso breve y navegar
              setBidMessage('Lote adjudicado. Avanzando al siguiente…');
              setTimeout(() => {
                onNavigateToItem?.(nextId);
              }, 2000);
            } else {
              // Era el último lote — tratar como subasta cerrada
              applyAuctionClosedEvent(payload);
              loadSnapshot().catch(() => {});
            }
          } else if (isAuctionClosedPayload(payload, eventType)) {
              applyAuctionClosedEvent(payload);
              loadSnapshot().catch(() => {});
          } else {
            applySnapshot(payload);
          }
        } catch (socketError) {
          console.warn('[Auction room] Invalid live update', socketError);
        }
      };
      socket.onerror = () => setConnection('offline');
      socket.onclose = (event) => {
      if (!mounted) return;
        setConnection('offline');
			  setBidPending(false);
        if (event.code === 1000 || auctionClosedRef.current) return;
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
  }, [applyAuctionClosedEvent, applySnapshot, loadSnapshot, session?.accessToken, validAuctionItemId]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (snapshot?.topBid?.nextMinBid && !bidAmount) {
      setBidAmount(String(Math.round(Number(snapshot.topBid.nextMinBid))));
    }
  }, [bidAmount, snapshot?.topBid?.nextMinBid]);

  useEffect(() => {
    closedRefreshRef.current = false;
    resultCheckedRef.current = false;
    forceAuctionClosedRef.current = false;
    parentAuctionIdRef.current = null;
    closurePollErrorRef.current = false;
    auctionClosedRef.current = false;
    setClosedEventReceived(false);
    setResultModalVisible(false);
    setWinningSale(null);
    setInvoice(null);
  }, [validAuctionItemId]);

  const serverNow = now + (snapshot?.serverOffsetMs || 0);
  const auctionClosed = closedEventReceived || Boolean(snapshot?.detail?.auctionClosed) || (snapshot?.detail?.endsAt && new Date(snapshot.detail.endsAt).getTime() <= serverNow);
  const biddingOpen = snapshot?.detail?.biddingOpen !== false && !auctionClosed;

  useEffect(() => {
    if (!auctionClosed || closedRefreshRef.current) return;
    closedRefreshRef.current = true;
    requestLiveRefresh();
  }, [auctionClosed]);

  useEffect(() => {
    if (!auctionClosed || resultCheckedRef.current || !snapshot) return;
    resultCheckedRef.current = true;
    setResultModalVisible(true);
    (async () => {
      const sale = await loadWinningSale();
      if (sale) await loadInvoice(sale);
    })();
  }, [auctionClosed, loadInvoice, loadWinningSale, snapshot]);

  const requestLiveRefresh = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'refresh' }));
    } else {
      loadSnapshot().catch((loadError) => setError(loadError.message || 'No se pudo actualizar la sala.'));
    }
  };

  const placeBid = async () => {
    if (bidPending) return;
    if (!selectedPaymentId) {
      setPaymentModalVisible(true);
      setError('Selecciona un medio de pago verificado antes de pujar.');
      return;
    }
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

    setError('');
    setBidMessage('');
    setBidPending(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/auction-items/${validAuctionItemId}/bids`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentMethodId: selectedPaymentId,
          clientRequestId: `mobile-${validAuctionItemId}-${Date.now()}`,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || 'La puja fue rechazada.');
      }
      setBidMessage(payload?.message || 'Tu puja fue registrada correctamente.');
      await loadSnapshot();
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'refresh' }));
      }
    } catch (bidError) {
      setError(bidError.message || 'No se pudo registrar la puja. Intenta nuevamente.');
    } finally {
      setBidPending(false);
    }
  };

  const openCheckout = async () => {
    setResultModalVisible(false);
    setCheckoutModalVisible(true);
    setCheckoutMessage('');
    const sale = winningSale || await loadWinningSale();
    if (sale && !invoice) await loadInvoice(sale);
  };

  const finalizeCheckout = async () => {
    const sale = winningSale || await loadWinningSale();
    const saleId = sale?.saleId || sale?.id || sale?.registroId || invoice?.saleId;
    if (!saleId) {
      setCheckoutMessage('No se encontró la venta asociada a esta adjudicación.');
      return;
    }
    if (!selectedPaymentId) {
      setPaymentModalVisible(true);
      setCheckoutMessage('Selecciona un medio de pago para finalizar la compra.');
      return;
    }
    setCheckoutLoading(true);
    setCheckoutMessage('');
    try {
      const response = await fetch(`${API_BASE}/api/v1/sales/${saleId}/checkout`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryMethod,
          shippingAddress: deliveryMethod === 'envio' ? shippingAddress : null,
          paymentMethodId: selectedPaymentId,
          acceptRisk: true,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || 'No se pudo finalizar la compra.');
      }
      setCheckoutMessage(`${payload?.message || 'Compra finalizada correctamente'}${payload?.invoiceNumber ? ` · ${payload.invoiceNumber}` : ''}`);
    } catch (checkoutError) {
      setCheckoutMessage(checkoutError.message || 'No se pudo finalizar la compra.');
    } finally {
      setCheckoutLoading(false);
    }
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
  const winner = winningSale || getWinnerFallback(snapshot, session?.profile);
  const hasWinner = Boolean(winner);
  const currentInvoice = invoice || normalizeInvoice(null, winningSale || { montoGanador: topBid.currentBid });

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
          <Pressable style={styles.paymentSelector} onPress={() => setPaymentModalVisible(true)}>
            <View>
              <Text style={styles.eyebrow}>MEDIO DE PAGO</Text>
              <Text style={styles.paymentSelectorText}>{selectedPayment ? formatPaymentMethod(selectedPayment) : paymentsLoading ? 'Cargando medios aptos…' : 'Seleccionar antes de pujar'}</Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#8B691B" />
          </Pressable>
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
                <View style={styles.bidder}><Text style={styles.bidderName}>{formatBidderName(bid, index)}</Text><Text style={styles.bidTime}>{relativeTime(bid.date, now)}</Text></View>
              <Text style={[styles.historyAmount, index > 0 && styles.mutedAmount]}>{formatMoney(formatGlobalMoney, bid.amount)}</Text>
            </View>
          ))}
          {!bids.length ? <Text style={styles.empty}>Todavía no hay ofertas. Sé el primero en pujar.</Text> : null}
        </View>
        <Pressable style={styles.historyButton} onPress={() => setHistoryModalVisible(true)}><Text style={styles.historyButtonText}>VER HISTORIAL COMPLETO</Text></Pressable>
      </ScrollView>

      <BidHistoryModal visible={historyModalVisible} onClose={() => setHistoryModalVisible(false)} detail={detail} bids={bids} now={now} formatGlobalMoney={formatGlobalMoney} />
      <PaymentMethodModal visible={paymentModalVisible} onClose={() => setPaymentModalVisible(false)} payments={payments} selectedPaymentId={selectedPaymentId} onSelect={setSelectedPaymentId} loading={paymentsLoading} onReload={loadPayments} />
      <AuctionResultModal visible={resultModalVisible} onClose={() => setResultModalVisible(false)} winner={winner} hasWinner={hasWinner} detail={detail} topBid={topBid} invoice={currentInvoice} onCheckout={openCheckout} formatGlobalMoney={formatGlobalMoney} />
      <CheckoutModal visible={checkoutModalVisible} onClose={() => setCheckoutModalVisible(false)} detail={detail} invoice={currentInvoice} payment={selectedPayment} deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod} shippingAddress={shippingAddress} setShippingAddress={setShippingAddress} message={checkoutMessage} loading={checkoutLoading} onFinalize={finalizeCheckout} onPickPayment={() => setPaymentModalVisible(true)} formatGlobalMoney={formatGlobalMoney} />
    </View>
  );
}

function BidHistoryModal({ visible, onClose, detail, bids, now, formatGlobalMoney }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.historyModalCard}>
          <Text style={styles.modalTitle}>Historial de Pujas</Text>
          <Text style={styles.modalLot}>LOTE #{String(detail?.lotNumber || '—').padStart(3, '0')}</Text>
          <ScrollView style={styles.historyModalScroll} contentContainerStyle={styles.historyModalContent} showsVerticalScrollIndicator>
            {bids.map((bid, index) => (
              <View key={bid.bidId || index} style={[styles.modalHistoryRow, index === 0 && styles.leadingHistoryRow]}>
                <View style={[styles.historyDot, index === 0 && styles.firstHistoryDot]} />
                <View style={styles.bidder}>
                  <Text style={styles.modalBidderName}>{formatBidderName(bid, index)}</Text>
                  <Text style={styles.modalBidTime}>{relativeTime(bid.date, now)}</Text>
                </View>
                <View style={styles.modalBidAmountWrap}>
                  <Text style={styles.modalHistoryAmount}>{formatMoney(formatGlobalMoney, bid.amount)}</Text>
                  {index === 0 ? <Text style={styles.leaderText}>LÍDER</Text> : null}
                </View>
              </View>
            ))}
            {!bids.length ? <Text style={styles.empty}>Todavía no hay ofertas.</Text> : null}
          </ScrollView>
          <View style={styles.modalFooterInfo}>
            <View><Text style={styles.footerLabel}>APERTURA DE SUBASTA</Text><Text style={styles.footerValue}>{formatDateTime(detail?.startsAt)}</Text></View>
            <View><Text style={styles.footerLabelLarge}>Precio Base:</Text><Text style={styles.footerPrice}>{formatMoney(formatGlobalMoney, detail?.basePrice)}</Text></View>
          </View>
          <Pressable style={styles.modalPrimaryButton} onPress={onClose}><Text style={styles.modalPrimaryButtonText}>CERRAR</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

function PaymentMethodModal({ visible, onClose, payments, selectedPaymentId, onSelect, loading, onReload }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.paymentModalCard}>
          <Text style={styles.modalTitle}>Medio de pago</Text>
          <Text style={styles.paymentModalHelp}>Selecciona un medio verificado antes de iniciar tus pujas.</Text>
          {loading ? <ActivityIndicator color="#9A7720" style={{ marginVertical: 20 }} /> : null}
          {!loading && payments.map((payment) => (
            <Pressable
              key={payment.id}
              style={[styles.paymentOption, String(selectedPaymentId) === String(payment.id) && styles.paymentOptionSelected]}
              onPress={() => onSelect(payment.id)}
            >
              <View style={styles.cardMiniBadge}><Text style={styles.cardMiniText}>{payment.entidad || payment.tipo || 'PAGO'}</Text></View>
              <View style={styles.paymentOptionTextWrap}>
                <Text style={styles.paymentOptionTitle}>{formatPaymentMethod(payment)}</Text>
                <Text style={styles.paymentOptionSubtitle}>{payment.moneda || 'USD'} · Verificado</Text>
              </View>
              {String(selectedPaymentId) === String(payment.id) ? <Ionicons name="checkmark-circle" size={18} color="#8B691B" /> : null}
            </Pressable>
          ))}
          {!loading && !payments.length ? <Text style={styles.empty}>No tienes medios verificados aptos para pujar.</Text> : null}
          <Pressable style={styles.modalPrimaryButton} onPress={onClose} disabled={!selectedPaymentId}><Text style={styles.modalPrimaryButtonText}>USAR MEDIO SELECCIONADO</Text></Pressable>
          <Pressable style={styles.modalTextButton} onPress={onReload}><Text style={styles.modalTextButtonText}>ACTUALIZAR MEDIOS</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

function AuctionResultModal({ visible, onClose, winner, hasWinner, detail, topBid, invoice, onCheckout, formatGlobalMoney }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.resultModalCard}>
          {hasWinner ? (
            <>
              <View style={styles.goldIcon}><Ionicons name="trophy" size={22} color="#FFFFFF" /></View>
              <Text style={styles.winTitle}>¡Ganaste la Subasta!</Text>
              <Text style={styles.resultHelp}>Felicitaciones. Has adquirido con éxito <Text style={styles.bold}>Lote #{detail?.lotNumber || '—'}: {detail?.title}</Text>. Tu oferta final ha sido validada.</Text>
              <View style={styles.invoiceDivider} />
              <Text style={styles.invoiceLabel}>TOTAL A PAGAR</Text>
              <Text style={styles.invoiceTotal}>{formatMoney(formatGlobalMoney, invoice?.total || winner?.total || winner?.montoGanador || topBid?.currentBid)}</Text>
              <Pressable style={styles.checkoutButton} onPress={onCheckout}><Text style={styles.modalPrimaryButtonText}>IR AL FORMULARIO DE COMPRA</Text></Pressable>
              <Pressable style={styles.modalTextButton} onPress={onClose}><Text style={styles.modalTextButtonText}>CERRAR</Text></Pressable>
            </>
          ) : (
            <>
              <View style={styles.hammerIcon}><Ionicons name="hammer" size={24} color="#8B691B" /></View>
              <Text style={styles.resultTitle}>Subasta Finalizada</Text>
              <Text style={styles.resultHelp}>No has resultado ganador.</Text>
              <View style={styles.loserSummary}>
                <Text style={styles.invoiceLabel}>GANADOR</Text>
                <Text style={styles.resultName}>{topBid?.bidderName || '—'}</Text>
                <Text style={styles.invoiceLabel}>MONTO FINAL</Text>
                <Text style={styles.resultAmount}>{formatMoney(formatGlobalMoney, topBid?.currentBid)}</Text>
              </View>
              <Pressable style={styles.modalPrimaryButton} onPress={onClose}><Text style={styles.modalPrimaryButtonText}>CERRAR</Text></Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function CheckoutModal({ visible, onClose, detail, invoice, payment, deliveryMethod, setDeliveryMethod, shippingAddress, setShippingAddress, message, loading, onFinalize, onPickPayment, formatGlobalMoney }) {
  const amount = Number(invoice?.montoPujado || invoice?.amount || 0);
  const commission = Number(invoice?.comision || 0);
  const total = Number(invoice?.total || amount + commission + Number(invoice?.costoEnvio || 0));
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.checkoutBackdrop}>
        <View style={styles.checkoutCard}>
          <ScrollView contentContainerStyle={styles.checkoutContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.checkoutTitle}>¡Felicidades!</Text>
            <Text style={styles.checkoutHelp}>Has asegurado una pieza de excepcional procedencia.</Text>
            <View style={styles.checkoutProductRow}>
              <Image source={{ uri: detail?.images?.[0] || FALLBACK_IMAGE }} style={styles.checkoutImage} resizeMode="cover" />
              <View style={styles.checkoutProductInfo}>
                <Text style={styles.modalLot}>LOTE #{detail?.lotNumber || '—'}</Text>
                <Text style={styles.checkoutProductTitle}>{detail?.title}</Text>
                <Text style={styles.checkoutProductSubtitle}>{detail?.collection || 'Colección Privada Ginebra'}</Text>
              </View>
            </View>

            <View style={styles.checkoutSummary}>
              <Text style={styles.checkoutSectionTitle}>RESUMEN DE LIQUIDACIÓN</Text>
              <SummaryRow label="Puja final" value={formatMoney(formatGlobalMoney, amount)} />
              <SummaryRow label="Comisiones" value={formatMoney(formatGlobalMoney, commission)} />
              {invoice?.costoEnvio ? <SummaryRow label="Envío" value={formatMoney(formatGlobalMoney, invoice.costoEnvio)} /> : null}
              <View style={styles.checkoutRule} />
              <SummaryRow label="TOTAL" value={formatMoney(formatGlobalMoney, total)} strong />
            </View>

            <Text style={styles.checkoutSectionTitle}>MEDIO DE PAGO</Text>
            <Pressable style={styles.checkoutPayment} onPress={onPickPayment}>
              <View style={styles.cardMiniBadge}><Text style={styles.cardMiniText}>{payment?.entidad || 'VISA'}</Text></View>
              <Text style={styles.checkoutPaymentText}>{payment ? formatPaymentMethod(payment) : 'Seleccionar medio de pago'}</Text>
            </Pressable>

            <Text style={styles.checkoutSectionTitle}>OPCIONES DE ENTREGA</Text>
            <View style={styles.deliveryRow}>
              <Pressable style={[styles.deliveryOption, deliveryMethod === 'envio' && styles.deliverySelected]} onPress={() => setDeliveryMethod('envio')}>
                <Ionicons name="car-outline" size={16} color="#8B691B" />
                <Text style={styles.deliveryTitle}>A domicilio</Text>
                <TextInput value={shippingAddress} onChangeText={setShippingAddress} multiline style={styles.addressInput} />
              </Pressable>
              <Pressable style={[styles.deliveryOption, deliveryMethod === 'galeria' && styles.deliverySelected]} onPress={() => setDeliveryMethod('galeria')}>
                <Ionicons name="storefront-outline" size={16} color="#8B691B" />
                <Text style={styles.deliveryTitle}>En Galería</Text>
                <Text style={styles.deliveryText}>Galería Vantage, Paseo de Gracia, 12.</Text>
              </Pressable>
            </View>

            <View style={styles.warningBox}><Text style={styles.warningText}>⚠ Aviso: La pieza pierde la cobertura del seguro una vez retirada de nuestras instalaciones.</Text></View>
            {message ? <Text style={message.includes('correctamente') ? styles.bidSuccess : styles.bidError}>{message}</Text> : null}
            <Pressable style={[styles.modalPrimaryButton, loading && styles.bidButtonDisabled]} onPress={onFinalize} disabled={loading}>
              <Text style={styles.modalPrimaryButtonText}>{loading ? 'FINALIZANDO…' : 'FINALIZAR COMPRA'}</Text>
            </Pressable>
            <Pressable style={styles.checkoutCloseButton} onPress={onClose}><Text style={styles.modalPrimaryButtonText}>CERRAR</Text></Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <View style={styles.summaryLine}>
      <Text style={[styles.summaryLabel, strong && styles.summaryStrong]}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryTotal]}>{value}</Text>
    </View>
  );
}

function normalizeEventType(value) {
  return String(value || '').trim().toLowerCase();
}

function isAuctionClosedPayload(payload, eventType = normalizeEventType(payload?.type)) {
  if (['lot_closed', 'auction_closed', 'auction_item_closed'].includes(eventType)) return true;
  const detail = payload?.detail || payload?.item || payload || {};
  return detail?.auctionClosed === true
    || detail?.subastado === true
    || isClosedAuctionStatus(detail);
}

function isClosedAuctionStatus(detail) {
  const status = normalizeEventType(
    detail?.auctionStatus
    || detail?.status
    || detail?.estado
    || detail?.auction?.status
    || detail?.auction?.estado
    || detail?.subasta?.status
    || detail?.subasta?.estado
  );
  return CLOSED_AUCTION_STATUSES.includes(status);
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
  const status = normalizeEventType(detailData?.auctionStatus || detailData?.status || detailData?.estado);
  const isClosedStatus = isClosedAuctionStatus(detailData);
  return {
    serverOffsetMs: Number.isFinite(parsedServerTime) ? parsedServerTime - receivedAt : 0,
    detail: {
      auctionId: detailData?.auctionId || detailData?.subastaId || detailData?.auction?.id || detailData?.subasta?.id,
      title: detailData?.title || detailData?.nombre || detailData?.description || detailData?.descripcion || `Lote #${detailData?.auctionItemId || ''}`,
      lotNumber: detailData?.lotNumber || detailData?.numeroLote || detailData?.auctionItemId || '—',
      basePrice: detailData?.basePrice || detailData?.precioBase,
      startsAt: detailData?.startsAt || detailData?.fechaInicio,
      endsAt: detailData?.endsAt || detailData?.fechaFin,
      auctionClosed: detailData?.auctionClosed === true || isClosedStatus || detailData?.subastado === true,
      biddingOpen: detailData?.biddingOpen !== false,
      images: images.map((image) => resolveImageUri(typeof image === 'string' ? image : image?.url || image?.uri)).filter(Boolean),
    },
    topBid: {
      currentBid: topBid?.currentBid || topBid?.pujaActual,
      bidderNumber: topBid?.bidderNumber || topBid?.numeroPostor,
      bidderName: topBid?.bidderName || topBid?.nombrePostor || topBid?.nombrePujador,
      nextMinBid: topBid?.nextMinBid || topBid?.pujaMinima || topBid?.minAllowed,
      nextMaxBid: topBid?.nextMaxBid || topBid?.pujaMaxima || topBid?.maxAllowed,
      appliesCap: topBid?.appliesCap !== false,
    },
    bids: rawHistory.slice().reverse().map((bid) => ({
      bidId: bid?.bidId || bid?.id,
      bidderNumber: bid?.bidderNumber || bid?.numeroPostor,
      bidderName: bid?.bidderName || bid?.nombrePostor || bid?.nombrePujador,
      amount: bid?.importe || bid?.amount,
      date: bid?.fecha || bid?.date || bid?.createdAt,
    })),
  };
}

function collectionContainsAuctionItem(payload, auctionItemId) {
  const items = normalizeCollection(payload);
  if (items.some((item) => String(item?.auctionItemId || item?.itemSubastaId || item?.id) === String(auctionItemId))) return true;
  return items.some((catalog) => collectionContainsAuctionItem(catalog?.items || catalog?.data, auctionItemId));
}


function normalizeCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.ventas)) return payload.ventas;
  if (Array.isArray(payload?.wins)) return payload.wins;
  if (Array.isArray(payload?.adjudicaciones)) return payload.adjudicaciones;
  return [];
}

function saleMatchesAuctionItem(sale, auctionItemId) {
  const candidates = [
    sale?.auctionItemId,
    sale?.itemSubastaId,
    sale?.itemCatalogoId,
    sale?.auctionItem?.id,
    sale?.item?.auctionItemId,
    sale?.item?.id,
  ];
  return candidates.some((candidate) => candidate != null && String(candidate) === String(auctionItemId));
}

function normalizeInvoice(payload, sale = {}) {
  const data = payload?.data || payload || {};
  return {
    saleId: data.saleId || sale.saleId || sale.registroId || sale.id,
    montoPujado: data.montoPujado || data.importe || sale.montoGanador || sale.amount || data.amount,
    comision: data.comision || sale.comision,
    costoEnvio: data.costoEnvio,
    total: data.total || sale.total || ((data.montoPujado || data.importe || sale.montoGanador || sale.amount || data.amount || 0) + (data.comision || sale.comision || 0)),
    moneda: data.moneda || sale.moneda,
  };
}

function getWinnerFallback(snapshot, profile) {
  const bidderName = normalizeName(snapshot?.topBid?.bidderName);
  const userNames = [profile?.nombre, profile?.name, profile?.fullName, [profile?.nombre, profile?.apellido].filter(Boolean).join(' ')].map(normalizeName).filter(Boolean);
  if (bidderName && userNames.includes(bidderName)) return { montoGanador: snapshot?.topBid?.currentBid };
  return null;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveImageUri(uri) {
  if (!uri || typeof uri !== 'string') return null;
  if (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:')) return uri;
  if (!API_BASE) return uri;
  return `${API_BASE}${uri.startsWith('/') ? '' : '/'}${uri}`;
  return `${resolvedBase.replace(/\/$/, '')}${uri}`;
}

function toWebSocketUrl(baseUrl, path, token) {
  const base = baseUrl || '';
  const wsBase = base.replace(/^http/i, 'ws').replace(/\/$/, '');
  return `${wsBase}${path}?access_token=${encodeURIComponent(token || '')}`;
}

function formatCountdown(endsAt, now) {
  if (!endsAt) return '—';
  const diff = Math.max(0, new Date(endsAt).getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function formatMoney(formatGlobalMoney, value) {
  if (value === null || value === undefined || value === '') return '—';
  return formatGlobalMoney(value);
}

function relativeTime(date, now) {
  if (!date) return 'Hace instantes';
  const diff = Math.max(0, now - new Date(date).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Hace instantes';
  if (minutes < 60) return `Hace ${minutes} minuto${minutes === 1 ? '' : 's'}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hora${hours === 1 ? '' : 's'}`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days === 1 ? '' : 's'}`;
}

function formatDateTime(value) {
  if (!value) return '24 OCT, 10:00 AM';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase() + `, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

function formatBidderName(bid, index = 0) {
  if (bid?.bidderName) return bid.bidderName;
  if (bid?.bidderNumber) return `Postor #${bid.bidderNumber}`;
  return index === 0 ? 'The Collective' : 'Postor privado';
}

function formatPaymentMethod(payment) {
  if (!payment) return '—';
  const lastDigits = String(payment.numeroIdentificacion || payment.number || '').slice(-4);
  const entity = payment.entidad || payment.tipo || 'Medio de pago';
  return `${entity}${lastDigits ? ` · •••• ${lastDigits}` : ''}`;
}

function normalizeName(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F3F3' },
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#777', fontSize: 12 },
  errorText: { color: '#A12222', textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#07182D', paddingHorizontal: 22, paddingVertical: 12 },
  retryButtonText: { color: '#FFF', fontSize: 10, letterSpacing: 1 },
  lotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  lot: { color: '#9A7720', fontSize: 7, letterSpacing: 1.1, fontWeight: '700' },
  liveWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 9, paddingVertical: 5, gap: 5 },
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
  rule: { height: 1, backgroundColor: '#E8E8E8', marginBottom: 14 },
  paymentSelector: { minHeight: 45, borderWidth: 1, borderColor: '#E5DDCC', padding: 10, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentSelectorText: { color: '#111', fontSize: 10, fontWeight: '700' },
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
  empty: { color: '#777', fontSize: 10, paddingVertical: 22, textAlign: 'center' },
  historyButton: { height: 31, borderWidth: 1, borderColor: '#D8CEB8', alignItems: 'center', justifyContent: 'center' },
  historyButtonText: { color: '#7B5D1C', fontSize: 6, letterSpacing: 0.5 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', padding: 24 },
  historyModalCard: { backgroundColor: '#FFF', padding: 26, maxHeight: '88%', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 24, elevation: 8 },
  modalTitle: { color: '#111', fontFamily: 'serif', fontSize: 21, fontWeight: '700' },
  modalLot: { color: '#8B691B', fontSize: 8, letterSpacing: 1, marginTop: 6, marginBottom: 10 },
  historyModalScroll: { maxHeight: 385, marginHorizontal: -12 },
  historyModalContent: { paddingHorizontal: 12, paddingVertical: 8 },
  modalHistoryRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F1F1' },
  leadingHistoryRow: { backgroundColor: '#FBFBFB' },
  modalBidderName: { color: '#1C1C1C', fontSize: 13, fontWeight: '700' },
  modalBidTime: { color: '#555', fontSize: 8, marginTop: 4 },
  modalBidAmountWrap: { alignItems: 'flex-end' },
  modalHistoryAmount: { color: '#111', fontSize: 14, fontWeight: '800' },
  leaderText: { color: '#9A7720', fontSize: 6, marginTop: 4 },
  modalFooterInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  footerLabel: { color: '#4A4A4A', fontSize: 8, letterSpacing: 1.2, fontWeight: '700' },
  footerValue: { color: '#5A5A5A', fontSize: 8, marginTop: 4 },
  footerLabelLarge: { fontFamily: 'serif', fontWeight: '700', fontSize: 15, color: '#555' },
  footerPrice: { textAlign: 'right', marginTop: 4, fontSize: 13, fontWeight: '700' },
  modalPrimaryButton: { minHeight: 43, backgroundColor: '#07182D', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 10 },
  modalPrimaryButtonText: { color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 1.6 },
  modalTextButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  modalTextButtonText: { color: '#555', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  paymentModalCard: { backgroundColor: '#FFF', padding: 24, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 20, elevation: 8 },
  paymentModalHelp: { color: '#666', fontSize: 11, lineHeight: 17, marginVertical: 8 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', minHeight: 48, backgroundColor: '#F1F1F3', padding: 10, marginTop: 8, borderWidth: 1, borderColor: 'transparent' },
  paymentOptionSelected: { borderColor: '#C6A45E', backgroundColor: '#FFF' },
  cardMiniBadge: { backgroundColor: '#111', paddingHorizontal: 7, paddingVertical: 4, marginRight: 10, minWidth: 31, alignItems: 'center' },
  cardMiniText: { color: '#FFF', fontSize: 5, fontWeight: '800' },
  paymentOptionTextWrap: { flex: 1 },
  paymentOptionTitle: { color: '#111', fontSize: 11, fontWeight: '700' },
  paymentOptionSubtitle: { color: '#777', fontSize: 8, marginTop: 2 },
  resultModalCard: { backgroundColor: '#FFF', padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, elevation: 8 },
  goldIcon: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#C79A3B', marginBottom: 18 },
  hammerIcon: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', marginBottom: 18 },
  winTitle: { fontFamily: 'serif', fontSize: 24, lineHeight: 27, fontWeight: '800', textAlign: 'center', color: '#000' },
  resultTitle: { fontFamily: 'serif', fontSize: 20, fontWeight: '700', textAlign: 'center', color: '#000' },
  resultHelp: { color: '#555', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 8 },
  bold: { fontWeight: '800', color: '#111' },
  invoiceDivider: { height: 1, backgroundColor: '#EFEFEF', alignSelf: 'stretch', marginVertical: 14 },
  invoiceLabel: { color: '#9A7720', fontSize: 6, letterSpacing: 1, fontWeight: '800', marginTop: 7 },
  invoiceTotal: { color: '#8B691B', fontFamily: 'serif', fontWeight: '800', fontSize: 15, marginTop: 4, marginBottom: 18 },
  checkoutButton: { minHeight: 43, backgroundColor: '#07182D', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, marginTop: 8 },
  loserSummary: { backgroundColor: '#F1F1F3', alignSelf: 'stretch', padding: 18, marginVertical: 20, borderLeftWidth: 1, borderLeftColor: '#C6A45E' },
  resultName: { fontFamily: 'serif', fontSize: 14, color: '#111', marginTop: 4 },
  resultAmount: { fontFamily: 'serif', fontSize: 22, fontWeight: '800', color: '#111', marginTop: 4 },
  checkoutBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  checkoutCard: { backgroundColor: '#FFF', maxHeight: '94%', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 24, elevation: 10 },
  checkoutContent: { padding: 18, paddingBottom: 28 },
  checkoutTitle: { fontFamily: 'serif', fontSize: 20, fontWeight: '800', textAlign: 'center', color: '#000' },
  checkoutHelp: { color: '#777', fontSize: 10, textAlign: 'center', marginTop: 4, marginBottom: 16 },
  checkoutProductRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  checkoutImage: { width: 92, height: 92, backgroundColor: '#EEE', borderRadius: 2 },
  checkoutProductInfo: { flex: 1, justifyContent: 'center' },
  checkoutProductTitle: { fontFamily: 'serif', color: '#111', fontSize: 15, lineHeight: 18 },
  checkoutProductSubtitle: { color: '#666', fontSize: 8, marginTop: 4 },
  checkoutSummary: { borderWidth: 1, borderColor: '#E8E8E8', padding: 12, marginBottom: 14 },
  checkoutSectionTitle: { color: '#777', fontSize: 7, letterSpacing: 1.2, marginBottom: 8, marginTop: 6 },
  summaryLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 22 },
  summaryLabel: { color: '#333', fontSize: 10 },
  summaryValue: { color: '#111', fontSize: 10, fontWeight: '700' },
  summaryStrong: { color: '#111', fontWeight: '800', fontSize: 13 },
  summaryTotal: { color: '#8B691B', fontFamily: 'serif', fontSize: 16, fontWeight: '800' },
  checkoutRule: { height: 1, backgroundColor: '#E8E8E8', marginVertical: 5 },
  checkoutPayment: { minHeight: 42, flexDirection: 'row', alignItems: 'center', backgroundColor: '#E7E7E9', paddingHorizontal: 9, marginBottom: 12 },
  checkoutPaymentText: { color: '#111', fontSize: 10, fontWeight: '700' },
  deliveryRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  deliveryOption: { flex: 1, minHeight: 82, backgroundColor: '#F0F0F2', padding: 9, borderWidth: 1, borderColor: 'transparent' },
  deliverySelected: { backgroundColor: '#FFF', borderColor: '#C6A45E' },
  deliveryTitle: { color: '#333', fontSize: 9, fontWeight: '700', marginTop: 3 },
  deliveryText: { color: '#555', fontSize: 7, lineHeight: 10, marginTop: 5 },
  addressInput: { color: '#555', fontSize: 7, lineHeight: 10, marginTop: 4, padding: 0, minHeight: 28 },
  warningBox: { backgroundColor: '#FFF5C9', padding: 10, marginBottom: 12 },
  warningText: { color: '#5A4A00', fontSize: 8, fontWeight: '700' },
  checkoutCloseButton: { minHeight: 43, backgroundColor: '#07182D', alignItems: 'center', justifyContent: 'center', marginTop: 28 },
});