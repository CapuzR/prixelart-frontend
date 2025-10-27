import React, { createContext, useState, useContext, useMemo, useCallback, ReactNode } from 'react';

interface UIContextType {
  backdropOpen: boolean;
  closeBackdrop: () => void;
  closeSnackBar: () => void;
  showBackdrop: () => void;
  showSnackBar: (message: string) => void;
  snackbarMessage: string;
  snackbarOpen: boolean;
  theme: string;
  toggleTheme: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  // NOte: UI states basically

  const [theme, setTheme] = useState<string>('light');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [backdropOpen, setBackdropOpen] = useState<boolean>(false);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const showSnackBar = useCallback((message: string) => {
    console.log('Snackbar triggered with message: ', message);
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  }, []);

  const closeSnackBar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const showBackdrop = () => {
    setBackdropOpen(true);
  };

  const closeBackdrop = () => {
    setBackdropOpen(false);
  };

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      snackbarOpen,
      snackbarMessage,
      showSnackBar,
      closeSnackBar,
      backdropOpen,
      showBackdrop,
      closeBackdrop
    }),
    [
      theme,
      snackbarOpen,
      snackbarMessage,
      showSnackBar,
      closeSnackBar,
      backdropOpen,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useTheme must be used within a UIProvider');
  }
  return { theme: context.theme, toggleTheme: context.toggleTheme };
};

// export const useLoading = () => {
// const context = useContext(UIContext);
// if (!context) {
// throw new Error('useLoading must be used within a UIProvider');
// }
// };

export const useSnackBar = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useSnackBar must be used within a UIProvider');
  }
  return {
    snackbarOpen: context.snackbarOpen,
    snackbarMessage: context.snackbarMessage,
    showSnackBar: context.showSnackBar,
    closeSnackBar: context.closeSnackBar,
  };
};

export const useBackdrop = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useBackdrop must be used within a UIProvider');
  }
  return {
    backdropOpen: context.backdropOpen,
    showBackdrop: context.showBackdrop,
    closeBackdrop: context.closeBackdrop,
  };
};
