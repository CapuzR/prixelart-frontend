import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import AppBar from "./sharedComponents/appBar/appBar";
import Routes from "./routes";
import { GlobalProvider, useGlobalContext  } from './context/GlobalContext';
import './globalTheme.css';

function ThemedApp() {
  const { theme } = useGlobalContext();

  return (
    <div className={theme}>
      <AppBar />
      <Routes />
    </div>
  );
}

function App() {
  
  useEffect(() => {
    // If needed, you can initialize analytics or similar services here.
  }, []);

  return (
    <GlobalProvider>
      <Router>
        <ThemedApp />
      </Router>
    </GlobalProvider>
  );
}

export default App;
