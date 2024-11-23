import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppBar from '@components/appBar';
import Routes from './routes';
import { GlobalProvider, useTheme } from 'context/GlobalContext';
import ReactGA from 'react-ga';
import Utility from '@components/Utility';
import { CartProvider } from 'context/CartContext';

const ThemedApp: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`${theme} app`}>
      <Utility />
      <div className="app-bar">
        <AppBar />
      </div>
      <div className="routes">
        <Routes />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    ReactGA.initialize('G-0RWP9B33D8');
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  return (
    <GlobalProvider>
      <CartProvider>
        <Router>
          <ThemedApp />
        </Router>
      </CartProvider>
    </GlobalProvider>
  );
};

export default App;
