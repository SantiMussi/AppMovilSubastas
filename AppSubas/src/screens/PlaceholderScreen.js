import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../components/TopBar';

/**
 * Generic placeholder screen shown for features that are not yet implemented.
 *
 * Props:
 * - title       : screen title (e.g. "Mi Colección")
 * - subtitle    : brief description of what the screen will contain
 * - iconName    : Ionicons icon name to display
 * - onMenuPress : callback to open the sidebar
 */
export default function PlaceholderScreen({ title, subtitle, iconName, onMenuPress }) {
  return (
    <View style={styles.container}>
      <TopBar onMenuPress={onMenuPress} />
      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Ionicons name={iconName || 'construct-outline'} size={36} color="#C5A059" />
        </View>
        <Text style={styles.title}>{title || 'Próximamente'}</Text>
        <Text style={styles.subtitle}>
          {subtitle || 'Esta sección está en desarrollo.'}
        </Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>EN CONSTRUCCIÓN</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f9',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(10,22,40,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: '900',
    color: '#0b1020',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#616875',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  pill: {
    backgroundColor: '#0A1628',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    color: '#C5A059',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
