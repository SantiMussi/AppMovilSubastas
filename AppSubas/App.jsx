import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  View,
} from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import SplashScreen from './src/screens/SplashScreen';
import AuthChoiceScreen from './src/screens/AuthChoiceScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import PasswordRecoveryScreen from './src/screens/PasswordRecoveryScreen';
import UserDataScreen from './src/screens/UserDataScreen';
import OfferItemScreen from './src/screens/OfferItemScreen';
import MembershipCategoriesScreen from './src/screens/MembershipCategoriesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FinesScreen from './src/screens/FinesScreen';
import FineDetailScreen from './src/screens/FineDetailScreen';
import AuctionsScreen from './src/screens/AuctionsScreen';
import AuctionItemDetailScreen from './src/screens/AuctionItemDetailScreen';
import AuctionRoomScreen from './src/screens/AuctionRoomScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import PaymentMethodsScreen from './src/screens/PaymentMethodsScreen';
import AddCreditCardScreen from './src/screens/AddCreditCardScreen';
import LinkBankAccountScreen from './src/screens/LinkBankAccountScreen';
import AddChequeScreen from './src/screens/AddChequeScreen';
import PaymentSuccessScreen from './src/screens/PaymentSuccessScreen';
import FinePaymentScreen from './src/screens/FinePaymentScreen';
import MetricsScreen from './src/screens/MetricsScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import ProductDetailScreen from "./src/screens/ProductDetailScreen";
import BiddingHistoryScreen from './src/screens/BiddingHistoryScreen';
import RegistrationStatusScreen from './src/screens/RegistrationStatusScreen';
import InsurancePolicyScreen from "./src/screens/InsurancePolicyScreen";
import MyItemsScreen from './src/screens/MyItemsScreen';
import ProposalDetailScreen from './src/screens/ProposalDetailScreen';
import ProposalCheckoutScreen from './src/screens/ProposalCheckoutScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import CatalogScreen from './src/screens/CatalogScreen';

import { Sidebar } from './src/components/Sidebar';
import { DrawerLayout } from './src/components/DrawerLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton } from './src/components';
import { styles as registerStyles } from './src/styles/registerStyles';

ExpoSplashScreen.preventAutoHideAsync().catch(() => { });

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
        });

        await pingBackend();
      } catch (e) {
        console.warn('[Bootstrap] error:', e);
      } finally {
        setAppReady(true);
      }
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    await ExpoSplashScreen.hideAsync().catch(() => { });
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
  const [screen, setScreen] = useState('auctions');
  const [session, setSession] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [screenHistory, setScreenHistory] = useState([]);
  const [registerParams, setRegisterParams] = useState(null);
  const [paymentPromptVisible, setPaymentPromptVisible] = useState(false);
  const [checkingPayments, setCheckingPayments] = useState(false);
  const [proposalDetailId, setProposalDetailId] = useState(null);

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

  const openUserDataScreen = async (authPayload, defaultScreen = 'userData', options = {}) => {
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

    if (options.checkPaymentMethods) {
      checkPaymentMethodsAfterLogin(accessToken);
    }
  };

  async function checkPaymentMethodsAfterLogin(accessToken) {
    if (!accessToken) return;

    setCheckingPayments(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me/payments`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return;
      }

      const paymentItems = Array.isArray(payload)
          ? payload
          : payload?.items || [];
      if (paymentItems.length === 0) {
        setPaymentPromptVisible(true);
      }
    } catch (error) {
      console.warn('Error checking payment methods:', error);
    } finally {
      setCheckingPayments(false);
    }
  }

  const handleGoToPaymentMethodsFromPrompt = () => {
    setPaymentPromptVisible(false);
    setScreenHistory((prev) => [...prev, 'auctions']);
    setScreen('pagos');
  };

  const handleContinueToAuctionsFromPrompt = () => {
    setPaymentPromptVisible(false);
    setScreen('auctions');
  };

  const handleLogout = async () => {
    setDrawerOpen(false);
    setSession(null);
    setPaymentPromptVisible(false);
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
      case 'checkStatus':
        return (
          <RegistrationStatusScreen
            onBack={() => setScreen('authChoice')}
            onContinueRegistration={(email) => {
              setRegisterParams({ email, step: 'security' });
              setScreen('register');
            }}
          />
        );
      case 'authChoice':
        return (
          <AuthChoiceScreen
            onBack={() => setScreen('auctions')}
            onLogin={() => setScreen('login')}
            onRegister={() => {
              setRegisterParams(null);
              setScreen('register');
            }}
            onCheckStatus={() => setScreen('checkStatus')}
            onForgotPassword={() => setScreen('passwordRecovery')}
            onLoginSuccess={() => setScreen('auctions')}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onBack={() => setScreen('authChoice')}
            onRegister={() => {
              setRegisterParams(null);
              setScreen('register');
            }}
            onLoginSuccess={(payload) =>
                openUserDataScreen(payload, 'auctions', { checkPaymentMethods: true })
            }
            onForgotPassword={() => setScreen('passwordRecovery')}
          />
        );

      case 'register':
        return (
          <RegisterScreen 
            initialEmail={registerParams?.email}
            initialStep={registerParams?.step || 'details'}
            onBack={() => {
              setRegisterParams(null);
              setScreen('authChoice');
            }} 
            onRegisterSuccess={(payload) => {
              setRegisterParams(null);
              openUserDataScreen(payload, 'auctions');
            }} 
          />
        );

      case 'passwordRecovery':
        return (
          <PasswordRecoveryScreen
            onBack={() => setScreen('login')}
            onFinished={() => setScreen('perfil')}
          />
        );

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
            onGoToMyItems={() => handleNavigate('misArticulos')}
            accessToken={session?.accessToken}
          />
        );

      case 'misArticulos':
        return (
          <MyItemsScreen
            session={session}
            onMenuPress={openDrawer}
            onProductPress={(item) => {
              setProposalDetailId(item.proposalId);
              setScreen('proposalDetail');
            }}
          />
        );

      case 'proposalDetail':
        return (
          <ProposalDetailScreen
            proposalId={proposalDetailId}
            session={session}
            onBack={() => setScreen('misArticulos')}
            onMenuPress={openDrawer}
            onNavigate={(route) => handleNavigate(route)}
          />
        );
      
      case 'proposalCheckout':
        return (
            <ProposalCheckoutScreen
                proposalId={proposalDetailId}
                session={session}
                onBack={goBack}
                onMenuPress={openDrawer}
                onSuccess={() => handleNavigate('misArticulos')}
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

      case 'metrics':
        return (
          <MetricsScreen
            session={session}
            onBack={goBack}
          />
        );

      case 'auctionRoom':
        const auctionItemId = screen.split(':')[1];
        return (
          <AuctionRoomScreen
            auctionItemId={auctionItemId}
            session={session}
            onMenuPress={openDrawer}
            onBackToPrevious={goBack}
            onGoToCollection={() => setScreen('coleccion')}
          />
        );


      case 'coleccion':
        return (
          <CollectionScreen
              session={session}
              onMenuPress={openDrawer}
              onOpenProduct={(productId) => productId && handleNavigate(`productDetail:${productId}`)}
          />
        );

      case 'pagos':
        return (
          <PaymentMethodsScreen
            session={session}
            onMenuPress={openDrawer}
            onNavigate={handleNavigate}
          />
        );

      case 'addCreditCard':
        return (
          <AddCreditCardScreen
            session={session}
            onBack={goBack}
            onMenuPress={openDrawer}
            onNavigate={handleNavigate}
          />
        );

      case 'linkBankAccount':
        return (
          <LinkBankAccountScreen
            session={session}
            onBack={goBack}
            onMenuPress={openDrawer}
            onNavigate={handleNavigate}
          />
        );

      case 'addCheque':
        return (
          <AddChequeScreen
            session={session}
            onBack={goBack}
            onMenuPress={openDrawer}
            onNavigate={handleNavigate}
          />
        );

      case 'paymentSuccess':
        return (
          <PaymentSuccessScreen
            session={session}
            onMenuPress={openDrawer}
            onNavigate={handleNavigate}
          />
        );

      case 'historial':
        return (
          <BiddingHistoryScreen
            session={session}
            onMenuPress={openDrawer}
            onNavigate={handleNavigate}
            onBack={goBack}
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
            <NotificationsScreen
                session={session}
                onMenuPress={openDrawer}
                onNavigate={handleNavigate}
          />
        );

      default:
        if (screen.startsWith('catalog:')) {
          const parts = screen.split(':');
          const auctionId = parts[1];
          const auctionTitle = parts[2] ? decodeURIComponent(parts[2]) : undefined;
          return (
            <CatalogScreen
              auctionId={auctionId}
              auctionTitle={auctionTitle}
              session={session}
              onMenuPress={openDrawer}
              onBack={goBack}
              onSelectItem={(route) => handleNavigate(route)}
            />
          );
        }

        if (screen.startsWith('auctionItemDetail:')) {
          const auctionId = screen.split(':')[1];
          const auctionItemId = screen.split(':')[2];
          return (
            <AuctionItemDetailScreen
              auctionId={auctionId}
              auctionItemId={auctionItemId}
              session={session}
              onMenuPress={openDrawer}
              onPlaceBid={() => handleNavigate(`auctionRoom:${auctionItemId}`)}
            />
          );
        }

        if (screen.startsWith('auctionRoom:')) {
          const auctionItemId = screen.split(':')[1]
          return (
            <AuctionRoomScreen
              auctionItemId={auctionItemId}
              session={session}
              onMenuPress={openDrawer}
              onNavigateToItem={(nextId) => handleNavigate(`auctionRoom:${nextId}`)}
              onBackToPrevious={goBack}
              onGoToCollection={() => setScreen('coleccion')}
            />
          );
        }

        if (screen.startsWith('productDetail:')) {
          const productId = screen.split(':')[1];
          return (
              <ProductDetailScreen
                  session={session}
                  productId={productId}
                  onBack={goBack}
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

        if (screen.startsWith('insurancePolicy:')) {
          const proposalId = screen.split(':')[1];
          return (
            <InsurancePolicyScreen
              session={session}
              productId={proposalId}
              onBack={goBack}
              onSuccess={goBack}  // ← agregás esto
            />
          );
        }

        if (screen.startsWith('finePayment:')) {
          const fineId = screen.split(':')[1];
          return (
            <FinePaymentScreen
              session={session}
              fineId={fineId}
              onBack={goBack}
              onPaymentSuccess={(id) => {
                // Clear the fine-related history and navigate back to fines
                setScreenHistory(prev => {
                  const copy = [...prev];
                  // Pop until we find the screen that led to 'fines'
                  const idx = copy.lastIndexOf('fines');
                  return idx >= 0 ? copy.slice(0, idx) : [];
                });
                setScreen('fines');
              }}
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
      <PaymentMethodPromptModal
          visible={paymentPromptVisible}
          checking={checkingPayments}
          onAddPaymentMethod={handleGoToPaymentMethodsFromPrompt}
          onContinueToAuctions={handleContinueToAuctionsFromPrompt}
      />
    </DrawerLayout>
  );
}

function PaymentMethodPromptModal({
                                    visible,
                                    checking,
                                    onAddPaymentMethod,
                                    onContinueToAuctions,
                                  }) {
  return (
      <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={onContinueToAuctions}
      >
        <View style={[registerStyles.modalStage, paymentPromptBackdropStyle]}>
          <View style={registerStyles.modalBox}>
            <View style={paymentPromptIconStyle}>
              {checking ? (
                  <ActivityIndicator color="#9d7a3a" />
              ) : (
                  <Ionicons name="card-outline" size={34} color="#9d7a3a" />
              )}
            </View>
            <Text style={registerStyles.modalText}>Agregá un metodo de pago</Text>
            <Text style={[registerStyles.modalText, paymentPromptTextStyle]}>
              No tenés métodos de pago almacenados. Podés agregar uno ahora para
              participar con mayor agilidad en las subastas.
            </Text>

            <ActionButton label="IR A MÉTODOS DE PAGO" wide onPress={onAddPaymentMethod} />

            <ActionButton
                label="IR A SUBASTAS"
                variant="ghost"
                wide
                onPress={onContinueToAuctions}
            />
          </View>
        </View>
      </Modal>
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

const paymentPromptBackdropStyle = {
  backgroundColor: 'rgba(8, 10, 14, 0.58)',
};

const paymentPromptIconStyle = {
  marginBottom: 18,
};

const paymentPromptTextStyle = {
  color: '#5D6472',
  fontSize: 14,
  lineHeight: 21,
};