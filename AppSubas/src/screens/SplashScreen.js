import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
 
const { width: SCREEN_WIDTH } = Dimensions.get('window');
 
const COLORS = {
  bgTop: '#0B1528',
  bgBottom: '#050A14',
  goldLight: '#F5D98A',
  gold: '#D4AF37',
  goldDark: '#8B6F1F',
  textMuted: 'rgba(245, 217, 138, 0.55)',
  textDim: 'rgba(245, 217, 138, 0.35)',
  trackBg: 'rgba(212, 175, 55, 0.12)',
};
 
const BAR_WIDTH = SCREEN_WIDTH * 0.55;
const INDICATOR_WIDTH = BAR_WIDTH * 0.35;
 
export default function SplashScreen({ onReady }) {
  const translateX = useRef(new Animated.Value(-INDICATOR_WIDTH)).current;
 
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
 
  useEffect(() => {
    const barLoop = Animated.loop(
      Animated.timing(translateX, {
        toValue: BAR_WIDTH,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    barLoop.start();
 
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
 
    return () => barLoop.stop();
  }, [translateX, fadeAnim, logoScale]);
 
  return (
    <LinearGradient
      colors={[COLORS.bgTop, COLORS.bgBottom]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
 
      <Animated.View
        style={[
          styles.centerBlock,
          { opacity: fadeAnim, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require('../../assets/images/logo_vantage.png')}
          style={styles.logo}
          resizeMode="contain"
        />
 
        <Text style={styles.brand}>VANTAGE</Text>
        <View style={styles.divider} />
 
        <Text style={styles.tagline}>La cima de las subastas digitales.</Text>
        <Text style={styles.subtagline}>FINE AUCTIONS</Text>
      </Animated.View>
 
      <View style={styles.bottomBlock}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressIndicator,
              { transform: [{ translateX }] },
            ]}
          >
            <LinearGradient
              colors={[
                'transparent',
                COLORS.goldDark,
                COLORS.gold,
                COLORS.goldLight,
                COLORS.gold,
                COLORS.goldDark,
                'transparent',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
 
        <Text style={styles.footer}>ESTABLECIDO EN MMXXV · PRESTIGIO DIGITAL</Text>
      </View>
    </LinearGradient>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '25%',
    paddingBottom: 48,
  },
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 18,
  },
  brand: {
    fontSize: 38,
    letterSpacing: 8,
    color: COLORS.goldLight,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: 80,
    backgroundColor: COLORS.gold,
    opacity: 0.35,
    marginVertical: 26,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  subtagline: {
    fontSize: 10,
    color: COLORS.textDim,
    letterSpacing: 4,
    marginTop: 14,
  },
  bottomBlock: {
    alignItems: 'center',
    width: '100%',
  },
  progressTrack: {
    width: BAR_WIDTH,
    height: 2,
    backgroundColor: COLORS.trackBg,
    overflow: 'hidden',
    borderRadius: 1,
    marginBottom: 36,
  },
  progressIndicator: {
    height: '100%',
    width: INDICATOR_WIDTH,
  },
  footer: {
    fontSize: 9,
    letterSpacing: 3,
    color: COLORS.textDim,
  },
});