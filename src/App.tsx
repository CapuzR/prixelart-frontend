import React from 'react';
import Routes from './routes';
import { UIProvider, useTheme } from '@context/UIContext';
// import ReactGA from 'react-ga';
import Utility from '@components/Utility';
import { CartProvider } from 'context/CartContext';
import { AuthProvider } from '@context/AuthContext';
import { CurrencyProvider } from '@context/CurrencyContext';
import { ModalProvider } from '@context/ModalContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

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
  // useEffect(() => {
  //   ReactGA.initialize('G-0RWP9B33D8');
  //   ReactGA.pageview(window.location.pathname + window.location.search);
  // }, []);

  return (
    <AuthProvider>
      <CurrencyProvider>
        <UIProvider>
          <ModalProvider>
            <CartProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <ThemedApp />
              </LocalizationProvider>
            </CartProvider>
          </ModalProvider>
        </UIProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;
