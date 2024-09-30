import React, { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  // State for currency toggle (USD or Bs)
  const [currency, setCurrency] = useState('USD');
  
  // State for conversion rate from USD to Bs
  const [conversionRate, setConversionRate] = useState(30); // Example: 1 USD = 30 Bs
  
  // State for theme toggle (light or dark)
  const [theme, setTheme] = useState('light');

  // Toggle currency between USD and Bs
  const toggleCurrency = () => {
    setCurrency((prevCurrency) => (prevCurrency === 'USD' ? 'Bs' : 'USD'));
  };

  // Update conversion rate (e.g., when fetching from an API)
  const updateConversionRate = (newRate) => {
    setConversionRate(newRate);
  };

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <GlobalContext.Provider
      value={{
        currency,
        conversionRate,
        theme,
        toggleCurrency,
        updateConversionRate,
        toggleTheme,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use the GlobalContext
export const useGlobalContext = () => {
  return useContext(GlobalContext);
};


//const { currency, conversionRate, theme, toggleCurrency, toggleTheme, updateConversionRate } = useGlobalContext();