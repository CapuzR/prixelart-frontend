import { useEffect } from "react";
import ReactGA from "react-ga4";
import { Outlet, Route, Routes as RouterRoutes } from "react-router-dom";
import { Toolbar } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import AnalyticsTracker from "@components/AnalyticsTracker";
import AppBar from "@components/appBar";
import Utility from "@components/Utility";

import ConsumerRoutes from "./consumer.routes";
import { GlobalProvider, useTheme, useUser } from "@prixpon/context/GlobalContext";
import { CartProvider } from "@apps/consumer/context/CartContext";
import { isAuth } from "@prixpon/api-client/utils.api";
import { User } from "@prixpon/types/user.types";

const MainLayout = () => {
  const { setUser } = useUser();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await isAuth();
        if (response.success) {
          const validUser = response.result as User;
          setUser(validUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
      }
    };

    checkAuthStatus();
  }, [setUser]);

  return (
    <>
      <AppBar />
      <Toolbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

const AppRoutes = () => {
  useEffect(() => {
    const disableRightClick = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("contextmenu", disableRightClick);
    return () => document.removeEventListener("contextmenu", disableRightClick);
  }, []);

  return (
    <>
      <AnalyticsTracker />
      <RouterRoutes>
        <Route path="/*" element={<MainLayout />}>
          <Route path="*" element={<ConsumerRoutes />} />
        </Route>
      </RouterRoutes>
    </>
  );
};

const ThemedApp = () => {
  const { theme } = useTheme();

  return (
    <div className={`${theme} app`}>
      <Utility />
      <AppRoutes />
    </div>
  );
};

const App = () => {
  useEffect(() => {
    ReactGA.initialize("G-0RWP9B33D8");
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
