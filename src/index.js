import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import App from './App';
import * as serviceWorker from './serviceWorker';
import axios from 'axios';
axios.defaults.withCredentials = true;

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
