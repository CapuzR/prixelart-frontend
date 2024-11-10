import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';
import { fetchConversionRateFromAPI } from './api';

// Define the shape of the context
interface GlobalContextType {
  currency: 'Bs' | 'USD';
  conversionRate: number;
  theme: string;
  toggleCurrency: () => void;
  updateConversionRate: (newRate: number) => void;
  loadingRate: boolean;
  toggleTheme: () => void;
  error: string | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  snackbarOpen: boolean;
  snackbarMessage: string;
  showSnackBar: (message: string) => void;
  closeSnackBar: () => void;
  backdropOpen: boolean;
  showBackdrop: () => void;
  closeBackdrop: () => void;
}

// Create the context with the type
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Define props for the provider component
interface GlobalProviderProps {
  children: ReactNode;
}

// Global Provider component
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState<'Bs' | 'USD'>('USD');
  const [conversionRate, setConversionRate] = useState<number>(() => {
    const storedRate = localStorage.getItem('conversionRate');
    return storedRate ? parseFloat(storedRate) : 1;
  });
  const [theme, setTheme] = useState<string>('light');
  const [loadingRate, setLoadingRate] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [backdropOpen, setBackdropOpen] = useState<boolean>(false); // New state for the backdrop

  // Function to fetch the conversion rate
  const fetchConversionRate = async () => {
    try {
      setLoadingRate(true);
      const newRate = await fetchConversionRateFromAPI();
      setConversionRate(newRate);
      localStorage.setItem('conversionRate', newRate.toString());
      setLoadingRate(false);
    } catch (err) {
      setError((err as Error).message);
      setLoadingRate(false);
    }
  };

  const toggleCurrency = () => {
    if (currency === 'USD') {
      if (conversionRate === 1) {
        fetchConversionRate();
      }
      setCurrency('Bs');
    } else {
      setCurrency('USD');
    }
  };

  const updateConversionRate = (newRate: number) => {
    setConversionRate(newRate);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const showSnackBar = (message: string) => {
    console.log('Snackbar triggered with message: ', message);
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const closeSnackBar = () => {
    setSnackbarOpen(false);
  };

  const showBackdrop = () => {
    setBackdropOpen(true);
  };

  const closeBackdrop = () => {
    setBackdropOpen(false);
  };

  // Memoize the context value to avoid unnecessary re-renders
  const value = useMemo(
    () => ({
      currency,
      conversionRate,
      theme,
      toggleCurrency,
      updateConversionRate,
      loadingRate,
      toggleTheme,
      error,
      loading,
      setLoading,
      snackbarOpen,
      snackbarMessage,
      showSnackBar,
      closeSnackBar,
      backdropOpen,
      showBackdrop,
      closeBackdrop,
    }),
    [
      currency,
      conversionRate,
      theme,
      loadingRate,
      error,
      loading,
      snackbarOpen,
      snackbarMessage,
      backdropOpen,
    ]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

// Custom hooks to access parts of the global context
export const useCurrency = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useCurrency must be used within a GlobalProvider');
  }
  return { currency: context.currency, toggleCurrency: context.toggleCurrency };
};

export const useTheme = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useTheme must be used within a GlobalProvider');
  }
  return { theme: context.theme, toggleTheme: context.toggleTheme };
};

export const useConversionRate = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useConversionRate must be used within a GlobalProvider');
  }
  return {
    conversionRate: context.conversionRate,
    loadingRate: context.loadingRate,
    error: context.error,
  };
};

export const useLoading = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useLoading must be used within a GlobalProvider');
  }
  return { loading: context.loading, setLoading: context.setLoading };
};

export const useSnackBar = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useSnackBar must be used within a GlobalProvider');
  }
  return {
    snackbarOpen: context.snackbarOpen,
    snackbarMessage: context.snackbarMessage,
    showSnackBar: context.showSnackBar,
    closeSnackBar: context.closeSnackBar,
  };
};

export const useBackdrop = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useBackdrop must be used within a GlobalProvider');
  }
  return {
    backdropOpen: context.backdropOpen,
    showBackdrop: context.showBackdrop,
    closeBackdrop: context.closeBackdrop,
  };
};
