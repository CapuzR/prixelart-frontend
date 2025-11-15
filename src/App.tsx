import React, { useEffect } from "react";
import Routes from "./routes";
import { GlobalProvider, useTheme } from "@prixpon/context/GlobalContext";
import ReactGA from 'react-ga4';
import Utility from "@components/Utility";
import { CartProvider } from "@context/CartContext";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import './styles/index.css'

const ThemedApp: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`${theme} app`}>
      <Utility />
      <div>
        <Routes />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    ReactGA.initialize('G-0RWP9B33D8');
  }, []);

  return (
    <GlobalProvider>
      <CartProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ThemedApp />
        </LocalizationProvider>
      </CartProvider>
    </GlobalProvider>
  );
};

export default App;
