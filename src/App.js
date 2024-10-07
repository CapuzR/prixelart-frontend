import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import AppBar from "./sharedComponents/appBar/appBar";
import Routes from "./routes";
import { GlobalProvider, useTheme  } from './context/globalContext';
import './globalTheme.css';
import ReactGA from "react-ga"

function ThemedApp() {
  const { theme } = useTheme();

  return (
    <div className={`${theme} app`}>
      <div className="app-bar">
        <AppBar />
      </div>
      <div className="routes">
        <Routes />
      </div>
    </div>
  );
}

function App() {
  
  useEffect(() => {
    ReactGA.initialize("G-0RWP9B33D8")
    ReactGA.pageview(window.location)
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
