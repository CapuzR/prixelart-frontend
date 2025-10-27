import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchConversionRateFromAPI } from './api';

interface CurrencyContextType {
  currency: 'Bs' | 'USD';
  toggleCurrency: () => void;
  conversionRate: number;
  loadingRate: boolean;
  updateConversionRate?: (newRate: number) => void;
}

const CurrencyContext = createContext<CurrencyContextType>(null!);

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<'Bs' | 'USD'>('USD');
  const [conversionRate, setConversionRate] = useState<number>(() => {
    const storedRate = localStorage.getItem('conversionRate');
    return storedRate ? parseFloat(storedRate) : 1;
  });
  const [loadingRate, setLoadingRate] = useState(false);

  const toggleCurrency = () => setCurrency((c) => (c === 'USD' ? 'Bs' : 'USD'));

  const fetchConversionRate = async () => {
    try {
      setLoadingRate(true);
      const newRate = await fetchConversionRateFromAPI();
      setConversionRate(newRate);
      localStorage.setItem('conversionRate', newRate.toString());
      setLoadingRate(false);
    } catch (err) {
      setLoadingRate(false);
    }
  };

  const updateConversionRate = (newRate: number) => {
    setConversionRate(newRate);
    localStorage.setItem('conversionRate', newRate.toString());
  };

  useEffect(() => {
    fetchConversionRate();
  }, []);

  return (
    <CurrencyContext.Provider
      value={{ currency, toggleCurrency, conversionRate, loadingRate, updateConversionRate }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
