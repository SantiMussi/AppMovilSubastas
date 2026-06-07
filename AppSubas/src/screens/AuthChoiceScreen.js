import React from 'react';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { palette } from '../constants/palette';

export default function AuthChoiceScreen({ onLogin, onRegister, onCheckStatus, onBack }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <Pressable accessibilityLabel="Volver" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <View style={styles.brandBlock}>
          <Text style={styles.brandLetters}>VANTAGE</Text>
          <Image source={require('../../assets/images/logo_vantage.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onLogin} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>INICIAR SESIÓN</Text>
          </Pressable>
          <Pressable onPress={onRegister} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryText}>CREAR CUENTA</Text>
          </Pressable>
          <Pressable onPress={onCheckStatus} style={({ pressed }) => [styles.tertiaryButton, pressed && styles.pressed]}>
            <Text style={styles.tertiaryText}>VERIFICAR ESTADO DE REGISTRO</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eeeeef',
  },
  shell: {
    flex: 1,
    margin: 10,
    backgroundColor: '#fbfbfd',
    paddingHorizontal: 27,
  },
  backButton: {
    position: 'absolute',
    left: 27,
    top: 26,
    zIndex: 2,
    height: 42,
    width: 42,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#202225',
    fontSize: 38,
    fontWeight: '300',
    lineHeight: 40,
  },
  brandBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  brandLetters: {
    color: '#d7c49d',
    fontFamily: 'serif',
    fontSize: 27,
    fontWeight: '600',
    letterSpacing: 12,
    marginBottom: 10,
    paddingLeft: 12,
  },
  logo: {
    width: 112,
    height: 80,
  },
  actions: {
    paddingBottom: 210,
    gap: 14,
  },
  primaryButton: {
    minHeight: 47,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: '#9a7c3b',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 4,
  },
  secondaryText: {
    color: palette.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 4,
  },
  tertiaryButton: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  tertiaryText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 4,
  },
  pressed: {
    opacity: 0.72,
  },
});