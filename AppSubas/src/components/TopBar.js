import React from 'react';
import { Image, Platform, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { palette } from '../constants/palette';

/**
 * Reusable top bar with centered logo and side-menu hamburger button.
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

      <View style={styles.logoWrap}>
        {/*
          TODO: replace with the full logo image (with name) when available.
          Currently uses the icon-only logo from assets.
        */}
        <Image
          source={require('../../assets/images/logo_vantage.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Right spacer to keep logo visually centered */}
      <View style={styles.rightSpacer} />
    </View>
  );
}

const HAMBURGER_W = 30;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.paper,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 52,
    paddingBottom: 14,
    paddingHorizontal: 18,
  },
  menuBtn: {
    width: HAMBURGER_W,
    justifyContent: 'center',
    gap: 5,
  },
  bar: {
    width: HAMBURGER_W,
    height: 2,
    backgroundColor: palette.ink,
    borderRadius: 1,
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 130,
    height: 38,
  },
  rightSpacer: {
    width: HAMBURGER_W,
  },
});