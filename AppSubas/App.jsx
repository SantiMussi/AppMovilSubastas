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
import PlaceholderScreen from './src/screens/PlaceholderScreen';

import { Sidebar } from './src/components/Sidebar';
import { DrawerLayout } from './src/components/DrawerLayout';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [screenHistory, setScreenHistory] = useState([]);

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

  const handleLogout = () => {
    setDrawerOpen(false);
    setSession(null);
    setScreen('authChoice');
  };

  const handleNavigate = (screenKey) => {
    setDrawerOpen(false);
    setScreenHistory((prev) => [...prev, screen]);
    setScreen(screenKey);
  };

  const goBack = () => {
    setScreenHistory((prev) => {
      const copy = [...prev];
      const previous = copy.pop() || 'userData';
      setScreen(previous);
      return copy;
    });
  };

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  /* ── Pre-auth screens (no drawer) ── */

  if (!session) {
    if (screen === 'login') {
      return (
        <LoginScreen
          onBack={() => setScreen('authChoice')}
          onRegister={() => setScreen('register')}
          onLoginSuccess={openUserDataScreen}
          onForgotPassword={() => setScreen('passwordRecovery')}
        />
      );
    }

    if (screen === 'register') {
      return <RegisterScreen onBack={() => setScreen('authChoice')} onRegisterSuccess={openUserDataScreen} />;
    }

    if (screen === 'passwordRecovery') {
      return (
        <PasswordRecoveryScreen
          onBack={() => setScreen('login')}
          onFinished={openUserDataScreen}
        />
      );
    }

    return (
      <AuthChoiceScreen
        onBack={() => {}}
        onLogin={() => setScreen('login')}
        onRegister={() => setScreen('register')}
        onForgotPassword={() => setScreen('passwordRecovery')}
        onLoginSuccess={openUserDataScreen}
      />
    );
  }

  /* ── Post-auth screens (with drawer) ── */

  const renderSidebar = () => (
    <Sidebar
      profile={session?.profile}
      currentScreen={screen}
      onNavigate={handleNavigate}
      onClose={closeDrawer}
      onLogout={handleLogout}
    />
  );

  const renderCurrentScreen = () => {
    switch (screen) {
      case 'userData':
        return (
          <UserDataScreen
            session={session}
            onLogout={handleLogout}
            onMenuPress={openDrawer}
          />
        );

      case 'offerItem':
        return (
          <OfferItemScreen
            onBack={goBack}
            onMenuPress={openDrawer}
            onGoToMyItems={() => handleNavigate('coleccion')}
            accessToken={session?.accessToken}
          />
        );

      case 'perfil':
        return (
          <PlaceholderScreen
            title="Perfil"
            subtitle="Acá vas a poder ver y editar tu información personal, foto de perfil y datos de contacto."
            iconName="person-outline"
            onMenuPress={openDrawer}
          />
        );

      case 'coleccion':
        return (
          <PlaceholderScreen
            title="Mi Colección"
            subtitle="Explorá los artículos que tenés en tu colección y seguí el estado de tus piezas."
            iconName="albums-outline"
            onMenuPress={openDrawer}
          />
        );

      case 'pagos':
        return (
          <PlaceholderScreen
            title="Métodos de Pago"
            subtitle="Gestioná tus tarjetas y métodos de pago para realizar ofertas en las subastas."
            iconName="card-outline"
            onMenuPress={openDrawer}
          />
        );

      case 'historial':
        return (
          <PlaceholderScreen
            title="Historial de Pujas"
            subtitle="Revisá todas tus pujas anteriores, resultados y montos ofrecidos."
            iconName="time-outline"
            onMenuPress={openDrawer}
          />
        );

      case 'ajustes':
        return (
          <PlaceholderScreen
            title="Ajustes"
            subtitle="Configurá notificaciones, privacidad, idioma y otras preferencias de la aplicación."
            iconName="settings-outline"
            onMenuPress={openDrawer}
          />
        );

      case 'notificaciones':
        return (
          <PlaceholderScreen
            title="Notificaciones"
            subtitle="Acá vas a recibir alertas sobre subastas, pujas y novedades de Vantage."
            iconName="notifications-outline"
            onMenuPress={openDrawer}
          />
        );

      default:
        return (
          <UserDataScreen
            session={session}
            onLogout={handleLogout}
            onMenuPress={openDrawer}
          />
        );
    }
  };

  return (
    <DrawerLayout
      isOpen={drawerOpen}
      onClose={closeDrawer}
      renderSidebar={renderSidebar}
    >
      {renderCurrentScreen()}
    </DrawerLayout>
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