import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
 
import SplashScreen from './src/screens/SplashScreen';
import AuthChoiceScreen from './src/screens/AuthChoiceScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import PasswordRecoveryScreen from './src/screens/PasswordRecoveryScreen';
import UserDataScreen from './src/screens/UserDataScreen';
import OfferItemScreen from './src/screens/OfferItemScreen';

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
  const [screen, setScreen] = useState('authChoice');
  const [session, setSession] = useState(null);

  const extractAccessToken = (payload) => payload?.accessToken || payload?.access_token || payload?.token || '';

  const openUserDataScreen = async (authPayload) => {
    const accessToken = extractAccessToken(authPayload);
    let profile = authPayload?.user || null;
    let profileError = '';

    if (accessToken) {
      try {
        const response = await fetch(`${API_BASE}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const profilePayload = await response.json().catch(() => null);

        if (response.ok) {
          profile = profilePayload;
        } else {
          profileError = profilePayload?.message || profilePayload?.error || `No se pudo cargar el perfil (${response.status}).`;
        }
      } catch (error) {
        profileError = error.message || 'No se pudo cargar el perfil del usuario.';
      }
    } else {
      profileError = 'La respuesta no incluyó un access token.';
    }

    setSession({
      authPayload: authPayload || {},
      accessToken,
      profile,
      profileError,
    });
    setScreen('userData');
  };

  if (screen === 'userData') {
    return (
      <UserDataScreen
        session={session}
        onLogout={() => {
          setSession(null);
          setScreen('authChoice');
        }}
      />
    );
  }

  if (screen === 'login') {
    return (
      <LoginScreen
        onBack={() => setScreen('authChoice')}
        onRegister={() => setScreen('register')}
        onForgotPassword={() => setScreen('passwordRecovery')}
        onLoginSuccess={openUserDataScreen}
      />
    );
  }
 
  if (screen === 'passwordRecovery') {
    return (
      <PasswordRecoveryScreen
        onBack={() => setScreen('login')}
        onFinished={openUserDataScreen}
      />
    );
  }

  if (screen === 'register') {
    return <RegisterScreen onBack={() => setScreen('authChoice')} onRegisterSuccess={openUserDataScreen} />;
  }

  if (screen === 'offerItem') {
  return (
    <OfferItemScreen
      onBack={() => setScreen('authChoice')} // ajustar cuando esté el side menu
      onGoToMyItems={() => setScreen('myItems')} // ajustar cuando exista esa pantalla
      accessToken={session?.accessToken}
    />
    );
  }

  return (
    <AuthChoiceScreen
      onBack={() => {}}
      onLogin={() => setScreen('login')}
      onRegister={() => setScreen('register')}
    />
  );
}
 
async function pingBackend() {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 4000);

  try {
    const res = await fetch(`${API_BASE}/actuator/health`, {
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Health check ${res.status}`);
    }

    const data = await res.json();

    if (data.status !== "UP") {
      throw new Error("Backend not UP");
    }

    console.log("Backend UP");
  } catch (err) {
    console.warn("Backend not UP");
  } finally {
    clearTimeout(timeoutId);
  }
}