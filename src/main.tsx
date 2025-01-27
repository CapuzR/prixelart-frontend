import React from 'react';
// import ReactDOM from 'react-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import App from './App';
import axios from 'axios';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container);

axios.defaults.withCredentials = true;

root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </BrowserRouter>);
