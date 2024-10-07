import React, { createContext, useState, useContext, useMemo } from 'react';
import { fetchConversionRateFromAPI } from './api';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [conversionRate, setConversionRate] = useState(() => {
    // Get conversionRate from localStorage when the component first loads
    const storedRate = localStorage.getItem('conversionRate');
    return storedRate ? parseFloat(storedRate) : 1;  // Default to 30 if nothing in localStorage
  });
  const [theme, setTheme] = useState('light');
  const [loadingRate, setLoadingRate] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversionRate = async () => {
    try {
      setLoadingRate(true);
      const newRate = await fetchConversionRateFromAPI();
      setConversionRate(newRate);
      localStorage.setItem('conversionRate', newRate);
      setLoadingRate(false);
    } catch (err) {
      setError(err.message);
      setLoadingRate(false);
    }
  };

  const toggleCurrency = () => {
    if (currency === 'USD') {
      if (conversionRate == 1) {
        fetchConversionRate();
      }
      setCurrency('Bs');
    } else {
      setCurrency('USD');
    }
  };

  const updateConversionRate = (newRate) => {
    setConversionRate(newRate);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  

  // Use useMemo to ensure the context value only changes when needed
  const value = useMemo(() => ({
    currency,
    conversionRate,
    theme,
    toggleCurrency,
    updateConversionRate,
    loadingRate,
    toggleTheme,
    error,
  }), [currency, conversionRate, theme]);

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hooks to access specific parts of the global context
export const useCurrency = () => {
  const { currency, toggleCurrency } = useContext(GlobalContext);
  return { currency, toggleCurrency };
};

export const useTheme = () => {
  const { theme, toggleTheme } = useContext(GlobalContext);
  return { theme, toggleTheme };
};

export const useConversionRate = () => {
  const { conversionRate, loadingRate, error } = useContext(GlobalContext);
  return { conversionRate, loadingRate, error };
};

//const { currency, conversionRate, theme, toggleCurrency, toggleTheme, updateConversionRate } = useGlobalContext();