import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../components/TopBar';
import { useCurrency } from '../context/CurrencyContext';

const { width } = Dimensions.get('window');
const API_BASE = process.env.EXPO_PUBLIC_API_URL;



export default function BiddingHistoryScreen({ session, onMenuPress, onNavigate, onBack }) {
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState([]);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const { formatGlobalMoney } = useCurrency();

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me/bids/history`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      console.log(response)
      console.log(session.accessToken)
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          setBids(data.items);
        } else {
          setBids([]);
        }
      } else {
        setError('No se pudo cargar el historial de pujas.');
      }
    } catch (err) {
      setError('Ocurrió un error de red.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.hammerIconContainer}>
        <Ionicons name="hammer" size={48} color="#8B6A32" style={{ transform: [{ rotate: '-45deg' }] }} />
      </View>
      <Text style={styles.emptyTitle}>No has participado en ninguna puja</Text>
      <Text style={styles.emptyText}>
        Explora nuestras subastas activas para comenzar tu colección.
      </Text>
      
      <Pressable style={styles.exploreButton} onPress={() => onNavigate('auctions')}>
        <Text style={styles.exploreButtonText}>EXPLORAR SUBASTAS</Text>
      </Pressable>
      
      <Pressable style={styles.upcomingButton} onPress={() => onNavigate('auctions')}>
        <Text style={styles.upcomingButtonText}>VER PRÓXIMAS SUBASTAS</Text>
      </Pressable>
    </View>
  );

  const renderPopulatedState = () => (
    <View style={styles.populatedContainer}>
      <ScrollView 
        horizontal 
        snapToInterval={width - 20}
        decelerationRate="fast"
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const index = Math.round(x / (width - 20));
          setActiveIndex(prev => prev !== index ? index : prev);
        }}
        scrollEventThrottle={16}
      >
        {bids.map((bid, index) => (
          <View key={bid.id || index} style={[styles.bidCard, index === bids.length - 1 && { marginRight: 0 }]}>
            <View style={styles.imageContainer}>
               <Image source={{ uri: bid.image }} style={styles.bidImage} resizeMode="cover" />
               <View style={styles.badgeContainer}>
                 <Text style={styles.badgeText}>{bid.status}</Text>
               </View>
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.lotCategory}>LOTE #{bid.lotNumber} • {bid.category}</Text>
              <Text style={styles.bidTitle}>{bid.title}</Text>
              <Text style={styles.bidDescription}>{bid.description}</Text>
              
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>PRECIO FINAL DE ADJUDICACIÓN</Text>
                <Text style={styles.priceValue}>{formatGlobalMoney(bid.price)}</Text>
              </View>
              
              <View style={styles.footerInfo}>
                <View>
                  <Text style={styles.footerLabel}>MARTILLERO</Text>
                  <Text style={styles.footerValue}>{bid.auctioneer}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.footerLabel}>FECHA SUBASTA</Text>
                  <Text style={styles.footerValue}>{bid.auctionDate}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.paginationDots}>
         {bids.map((_, i) => (
           <View key={i} style={[styles.dot, i === activeIndex && styles.activeDot]} />
         ))}
      </View>
    </View>
  );

  if (!loading && bids.length === 0) {
    return (
      <View style={styles.container}>
        <TopBar onMenuPress={onMenuPress} />
        <ScrollView contentContainerStyle={styles.scrollGrow}>
          {renderEmptyState()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack || (() => onNavigate('userData'))} style={styles.backButton} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Historial de Pujas</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#8B6A32" />
        </View>
      ) : error ? (
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {renderPopulatedState()}
        </View>
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
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 50,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '700',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 60,
  },
  hammerIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  emptyTitle: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  exploreButton: {
    backgroundColor: '#0A1628',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  upcomingButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  upcomingButtonText: {
    color: '#8B6A32',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  populatedContainer: {
    flex: 1,
  },
  bidCard: {
    width: width - 40,
    backgroundColor: '#FFF',
    marginRight: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  bidImage: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#1E8449',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardContent: {
    padding: 20,
  },
  lotCategory: {
    fontSize: 10,
    color: '#8B6A32',
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  bidTitle: {
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: '600',
    color: '#111',
    lineHeight: 32,
    marginBottom: 16,
  },
  bidDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  priceContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  priceValue: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CCC',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#8B6A32',
  },
});
