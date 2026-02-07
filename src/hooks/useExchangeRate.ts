import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DOLAR_API_URL = 'https://dolarapi.com/v1/dolares/blue';
const MXN_API_URL = 'https://open.er-api.com/v6/latest/USD';
const CACHE_KEY = '@zenbudget_exchange_rates_v2';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en ms

// Fallback rates
const FALLBACK_RATES = {
  ARS: 1100, // ARS per USD
  MXN: 20, // MXN per USD
};

interface CachedRates {
  rates: Record<string, number>;
  timestamp: number;
}

interface ExchangeRateResult {
  rates: Record<string, number>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getRate: (currency: string) => number;
}

export function useExchangeRate(): ExchangeRateResult {
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async (force: boolean = false) => {
    try {
      // Verificar cache primero
      if (!force) {
        const cachedJson = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedJson) {
          const cached: CachedRates = JSON.parse(cachedJson);
          const age = Date.now() - cached.timestamp;
          if (age < CACHE_DURATION) {
            setRates(params => ({ ...params, ...cached.rates }));
            setLoading(false);
            return;
          }
        }
      }

      setLoading(true);

      // Parallel Fetch
      const [dolarResponse, mxnResponse] = await Promise.allSettled([
        fetch(DOLAR_API_URL),
        fetch(MXN_API_URL),
      ]);

      const newRates = { ...rates };

      // Process ARS (Blue)
      if (dolarResponse.status === 'fulfilled' && dolarResponse.value.ok) {
        try {
          const data = await dolarResponse.value.json();
          // La API retorna { compra, venta, ... } - usamos el promedio
          newRates.ARS = Math.round((data.compra + data.venta) / 2);
        } catch (e) {
          console.error('Error parsing DolarAPI response', e);
        }
      }

      // Process MXN
      if (mxnResponse.status === 'fulfilled' && mxnResponse.value.ok) {
        try {
          const data = await mxnResponse.value.json();
          // data.rates.MXN is how many MXN per 1 USD
          if (data && data.rates && data.rates.MXN) {
            newRates.MXN = data.rates.MXN;
          }
        } catch (e) {
          console.error('Error parsing MXN API response', e);
        }
      }

      // Guardar en cache
      const cacheData: CachedRates = {
        rates: newRates,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      setRates(newRates);
      setError(null);
    } catch (e) {
      console.error('Error fetching exchange rates:', e);
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return {
    rates,
    loading,
    error,
    refresh: () => fetchRates(true),
    getRate: (currency: string) => {
      if (currency === 'USD') return 1;
      return rates[currency] || 1;
    },
  };
}
