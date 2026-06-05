import React from 'react';
import { Image, Platform, Pressable, StatusBar, StyleSheet, View } from 'react-native';

/**
 * Reusable top bar with left-aligned logo and side-menu hamburger button.
 * Props:
 * - onMenuPress: callback fired when the user taps the menu icon (≡).
 */
export function TopBar({ onMenuPress }) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onMenuPress}
        style={styles.menuBtn}
        accessibilityLabel="Abrir menú"
        hitSlop={8}
      >
        <View style={styles.bar} />
        <View style={styles.bar} />
        <View style={styles.bar} />
      </Pressable>

      <View style={styles.logoWrap} pointerEvents="none">
        <Image
          source={require('../../assets/images/Topbar.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const HAMBURGER_W = 26;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  menuBtn: {
    width: HAMBURGER_W,
    justifyContent: 'center',
    gap: 5,
    zIndex: 10,
  },
  bar: {
    width: HAMBURGER_W,
    height: 2,
    backgroundColor: '#0A1628',
    borderRadius: 1,
  },
  logoWrap: {
    justifyContent: 'center',
    marginLeft: -80,
  },
  logo: {
    width: 350,
    height: 75,
  },
});