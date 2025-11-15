import { useEffect } from "react";

import ConsumerRoutes from "@/consumer.routes";
import AppBar from "@components/appBar";
import ArtistRoutes from "@/artist/artist.routes";
import { Toolbar } from "@mui/material";
import {
  Outlet,
  Route,
  Routes as RouterRoutes,
  useLocation,
} from "react-router-dom";
import AdminLayout from "@apps/admin/components/AdminLayout";
import AdminLogin from "@apps/admin/login";
import AdminNestedRoutes from "@apps/admin/admin.routes";
import { isAuth } from "@api/utils.api";
import { useUser } from "@prixpon/context/GlobalContext";
import { User } from "types/user.types";
import AnalyticsTracker from "@components/AnalyticsTracker";

const MainLayout = () => {
  const location = useLocation();
  const { user, setUser } = useUser();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await isAuth();

        if (user.success) {
          const validUser = user.result as User;
          setUser(validUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuthStatus();
  }, []);

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

const Routes = () => {
  useEffect(() => {
    const disableRightClick = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("contextmenu", disableRightClick);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  return (
    <>
      <AnalyticsTracker />

      <RouterRoutes>
        <Route path="/admin/inicio" element={<AdminLogin />} />

        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="*" element={<AdminNestedRoutes />} />
        </Route>

        <Route path="/*" element={<MainLayout />}>
          {/* <Route path="prixer/*" element={<ArtistRoutes />} /> */}
          <Route path="*" element={<ConsumerRoutes />} />
        </Route>
      </RouterRoutes>
    </>
  );
};
export default Routes;
