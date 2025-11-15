import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { fetchConversionRateFromAPI } from "@prixpon/api/conversion.api";
import { User } from "@prixpon/types/user.types";

// Define the shape of the context
interface GlobalContextType {
  backdropOpen: boolean;
  closeBackdrop: () => void;
  closeSnackBar: () => void;
  conversionRate: number;
  currency: "Bs" | "USD";
  error: string | null;
  loading: boolean;
  loadingRate: boolean;
  setArtModal: (x: boolean) => void;
  setLoading: (loading: boolean) => void;
  setServiceModal: (x: boolean) => void;
  setUser: Dispatch<SetStateAction<User | null>>;
  showBackdrop: () => void;
  showSnackBar: (message: string) => void;
  snackbarMessage: string;
  snackbarOpen: boolean;
  theme: string;
  toggleCurrency: () => void;
  toggleTheme: () => void;
  updateConversionRate: (newRate: number) => void;
  uploadArt: boolean;
  uploadService: boolean;
  user: User | null;
}

// Create the context with the type
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Define props for the provider component
interface GlobalProviderProps {
  children: ReactNode;
}

// Global Provider component
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState<"Bs" | "USD">("USD");
  const [conversionRate, setConversionRate] = useState<number>(() => {
    const storedRate = localStorage.getItem("conversionRate");
    return storedRate ? parseFloat(storedRate) : 1;
  });
  const [theme, setTheme] = useState<string>("light");
  const [loadingRate, setLoadingRate] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [backdropOpen, setBackdropOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [uploadArt, setUploadArt] = useState<boolean>(false);
  const [uploadService, setUploadService] = useState<boolean>(false);

  // Function to fetch the conversion rate
  const fetchConversionRate = async () => {
    try {
      setLoadingRate(true);
      const newRate = await fetchConversionRateFromAPI();
      setConversionRate(newRate);
      localStorage.setItem("conversionRate", newRate.toString());
      setLoadingRate(false);
    } catch (err) {
      setError((err as Error).message);
      setLoadingRate(false);
    }
  };

  const toggleCurrency = () => {
    if (currency === "USD") {
      if (conversionRate === 1) {
        fetchConversionRate();
      }
      setCurrency("Bs");
    } else {
      setCurrency("USD");
    }
  };

  const updateConversionRate = (newRate: number) => {
    setConversionRate(newRate);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const showSnackBar = useCallback((message: string) => {
    console.log("Snackbar triggered with message: ", message);
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

  const setArtModal = (value: boolean) => {
    setUploadArt(value);
  };

  const setServiceModal = (value: boolean) => {
    setUploadService(value);
  };

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
      user,
      setUser,
      uploadArt,
      uploadService,
      setArtModal,
      setServiceModal,
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
      showSnackBar,
      closeSnackBar,
      backdropOpen,
      user,
      uploadArt,
      uploadService,
    ],
  );

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useCurrency must be used within a GlobalProvider");
  }
  return { currency: context.currency, toggleCurrency: context.toggleCurrency };
};

export const useTheme = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useTheme must be used within a GlobalProvider");
  }
  return { theme: context.theme, toggleTheme: context.toggleTheme };
};

export const useConversionRate = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useConversionRate must be used within a GlobalProvider");
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
    throw new Error("useLoading must be used within a GlobalProvider");
  }
  return { loading: context.loading, setLoading: context.setLoading };
};

export const useSnackBar = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useSnackBar must be used within a GlobalProvider");
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
    throw new Error("useBackdrop must be used within a GlobalProvider");
  }
  return {
    backdropOpen: context.backdropOpen,
    showBackdrop: context.showBackdrop,
    closeBackdrop: context.closeBackdrop,
  };
};

export const useUser = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useUser must be used within a GlobalProvider");
  }
  return { user: context.user, setUser: context.setUser };
};

export const usePrixerCreator = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("usePrixerCreator must be used within a GlobalProvider");
  }
  return {
    uploadArt: context.uploadArt,
    uploadService: context.uploadService,
    setArtModal: context.setArtModal,
    setServiceModal: context.setServiceModal,
  };
};
