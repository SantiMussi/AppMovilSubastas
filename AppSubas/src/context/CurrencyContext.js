import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('vantage_global_currency');
        if (stored === 'USD' || stored === 'ARS') {
          setCurrency(stored);
        }
      } catch (e) {
        console.warn('Failed to load currency', e);
      }
    })();
  }, []);

  const changeCurrency = async (newCurrency) => {
    setCurrency(newCurrency);
    try {
      await AsyncStorage.setItem('vantage_global_currency', newCurrency);
    } catch (e) {
      console.warn('Failed to save currency', e);
    }
  };

  const formatGlobalMoney = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '';
    }
    
    let numericalValue = Number(value);
    
    if (currency === 'ARS') {
      numericalValue = numericalValue * 1600;
      return numericalValue.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }

    return numericalValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatGlobalMoney }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
