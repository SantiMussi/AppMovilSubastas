 import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
 
import SplashScreen from './src/screens/SplashScreen';
 
// Mantener la splash NATIVA hasta que estemos listos para mostrar la custom.
// Esto evita el flash blanco entre "splash de sistema" y "splash de React".
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});
 
// URL del back de Spring (ajustá a tu config real)
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:8080';
 
export default function App() {
  const [appReady, setAppReady] = useState(false);
 
  useEffect(() => {
    (async () => {
      try {
        // 1) Cargar fuentes / assets críticos
        await Font.loadAsync({
          // 'PlayfairDisplay-SemiBold': require('./assets/fonts/PlayfairDisplay-SemiBold.ttf'),
          // agregá tus fuentes acá
        });
 
        // 2) Health-check al back de Spring (opcional pero recomendado)
        //    Si no querés depender del back para mostrar UI, sacá este bloque.
        await pingBackend();
 
        // 3) Cualquier otra precarga: token, perfil, feature flags, etc.
        // await restoreSession();
      } catch (e) {
        // Logueá pero no bloquees la UI por errores no críticos.
        console.warn('[Bootstrap] error:', e);
      } finally {
        setAppReady(true);
      }
    })();
  }, []);
 
  // En cuanto la custom splash esté montada, ocultamos la nativa de Expo.
  const onLayoutRootView = useCallback(async () => {
    await ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);
 
  if (!appReady) {
    return (
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <SplashScreen />
      </View>
    );
  }
 
  return <RootNavigator />;
}
 
async function pingBackend() {
  // Timeout manual: no querés que la splash se cuelgue infinito si el back está caído.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
 
  try {
    const res = await fetch(`${API_BASE}/actuator/health`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Health check ${res.status}`);
    const data = await res.json();
    if (data.status !== 'UP') throw new Error('Backend not UP');
  } finally {
    clearTimeout(timeoutId);
  }
}