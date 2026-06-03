import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
 
import SplashScreen from './src/screens/SplashScreen';
import RegisterScreen from './src/screens/RegisterScreen';
 
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
 
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
        //  
        await pingBackend();
 
        // 3) Cualquier otra precarga: token, perfil, feature flags, etc.
        // await restoreSession();
      } catch (e) {
        console.warn('[Bootstrap] error:', e);
      } finally {
        setAppReady(true);
      }
    })();
  }, []);
 
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

function RootNavigator() {
  return <RegisterScreen />;
}
 
async function pingBackend() {
  // Timeout manual si no hay conexion con API
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