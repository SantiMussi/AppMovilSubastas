import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

const SIDEBAR_WIDTH = 280;

/**
 * Animated drawer wrapper that slides the Sidebar in from the left.
 *
 * Props:
 * - isOpen       : boolean — whether the drawer is open
 * - onClose      : () => void
 * - renderSidebar: () => ReactNode — the Sidebar component to render inside
 * - children     : the main screen content behind the drawer
 */
export function DrawerLayout({ isOpen, onClose, renderSidebar, children }) {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  const [overlayVisible, setOverlayVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOverlayVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setOverlayVisible(false);
      });
    }
  }, [isOpen, slideAnim, fadeAnim]);

  return (
    <View style={styles.root}>
      {children}

      {overlayVisible && (
        <View style={styles.backdropLayer}>
          <Animated.View style={[styles.backdropFill, { opacity: fadeAnim }]} />
          <Pressable
            style={styles.backdropTouch}
            onPress={onClose}
            accessibilityLabel="Cerrar menú"
          />
        </View>
      )}

      {overlayVisible && (
        <Animated.View
          style={[
            styles.sidebarContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {renderSidebar()}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdropLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
});
