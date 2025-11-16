import { useEffect } from "react";
import ReactGA from "react-ga4";
import { Navigate, Route, Routes as RouterRoutes } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import AnalyticsTracker from "@components/AnalyticsTracker";
import Utility from "@components/Utility";
import AdminLayout from "@components/AdminLayout";
import AdminNestedRoutes from "./admin.routes";
import AdminLogin from "./login";

import { GlobalProvider, useTheme } from "@prixpon/context/GlobalContext";
import { CartProvider } from "@apps/consumer/context/CartContext";

const AdminRoutes = () => {
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
        <Route path="/admin/inicio" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="*" element={<AdminNestedRoutes />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin/inicio" replace />} />
        <Route path="*" element={<Navigate to="/admin/inicio" replace />} />
      </RouterRoutes>
    </>
  );
};

const ThemedApp = () => {
  const { theme } = useTheme();

  return (
    <div className={`${theme} app`}>
      <Utility />
      <AdminRoutes />
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
