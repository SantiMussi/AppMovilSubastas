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
import MembershipCategoriesScreen from './src/screens/MembershipCategoriesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FinesScreen from './src/screens/FinesScreen';
import FineDetailScreen from './src/screens/FineDetailScreen';
import AuctionsScreen from './src/screens/AuctionsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';

import { Sidebar } from './src/components/Sidebar';
import { DrawerLayout } from './src/components/DrawerLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurrencyProvider } from './src/context/CurrencyContext';

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
 
  return (
    <CurrencyProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        {!appReady ? <SplashScreen /> : <RootNavigator />}
      </View>
    </CurrencyProvider>
  );
}

function RootNavigator() {
  const [screen, setScreen] = useState('authChoice');
  const [session, setSession] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [screenHistory, setScreenHistory] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('vantage_access_token');
        if (storedToken) {
          const res = await fetch(`${API_BASE}/api/v1/users/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (res.ok) {
            const profile = await res.json();
            setSession({
              authPayload: {},
              accessToken: storedToken,
              profile,
              profileError: '',
            });
            setScreen('auctions');
          } else {
            await AsyncStorage.removeItem('vantage_access_token');
          }
        }
      } catch (error) {
        console.warn('Error restoring session:', error);
      }
    })();
  }, []);

  const extractAccessToken = (payload) => payload?.accessToken || payload?.access_token || payload?.token || '';

  const openUserDataScreen = async (authPayload, defaultScreen = 'userData') => {
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
    setScreen(defaultScreen);
  };

  const handleLogout = async () => {
    setDrawerOpen(false);
    setSession(null);
    setScreen('authChoice');
    await AsyncStorage.removeItem('vantage_access_token');
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
          onLoginSuccess={(payload) => openUserDataScreen(payload, 'auctions')}
          onForgotPassword={() => setScreen('passwordRecovery')}
        />
      );
    }

    if (screen === 'register') {
      return <RegisterScreen onBack={() => setScreen('authChoice')} onRegisterSuccess={(payload) => openUserDataScreen(payload, 'auctions')} />;
    }

    if (screen === 'passwordRecovery') {
      return (
        <PasswordRecoveryScreen
          onBack={() => setScreen('login')}
          onFinished={() => setScreen('perfil')}
        />
      );
    }

    return (
      <AuthChoiceScreen
        onBack={() => {}}
        onLogin={() => setScreen('login')}
        onRegister={() => setScreen('register')}
        onForgotPassword={() => setScreen('passwordRecovery')}
        onLoginSuccess={() => setScreen('auctions') }
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
      case 'auctions':
        return (
          <AuctionsScreen
            session={session}
            onMenuPress={openDrawer}
            onNavigate={handleNavigate}
          />
        );

      case 'userData':
        return (
          <UserDataScreen
            session={session}
            onLogout={handleLogout}
            onMenuPress={openDrawer}
          />
        );

      case 'membershipCategories':
        return (
          <MembershipCategoriesScreen
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
          <ProfileScreen
            session={session}
            onMenuPress={openDrawer}
            onNavigate={handleNavigate}
          />
        );

      case 'fines':
        return (
          <FinesScreen
            session={session}
            onBack={goBack}
            onNavigate={handleNavigate}
          />
        );
      
      case 'auctionRoom':
        return (
          <PlaceholderScreen
            title="Sala de Subasta"
            subtitle="La experiencia para participar en vivo se implementará en una próxima iteración."
            iconName="radio-outline"
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
          <SettingsScreen
            session={session}
            onMenuPress={openDrawer}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );

      case 'changePassword':
        return (
          <ChangePasswordScreen
            session={session}
            onBack={goBack}
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
        if (screen.startsWith('auctionRoom:')) {
          return (
            <PlaceholderScreen
              title="Sala de Subasta"
              subtitle="La experiencia para participar en vivo se implementará en una próxima iteración."
              iconName="radio-outline"
              onMenuPress={openDrawer}
            />
          );
        }

        if (screen.startsWith('fineDetail:')) {
          const fineId = screen.split(':')[1];
          return (
            <FineDetailScreen
              session={session}
              fineId={fineId}
              onBack={goBack}
              onNavigate={handleNavigate}
            />
          );
        }

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