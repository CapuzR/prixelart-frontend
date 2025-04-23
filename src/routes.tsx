import { useEffect, useState } from "react";
import expire from "./utils/expire";

import ConsumerRoutes from "apps/consumer/consumer.routes";
import AppBar from "@components/appBar";
import AdminRoutes from "@apps/admin/admin.routes";
import ArtistRoutes from "@apps/artist/artist.routes";


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

  useEffect(() => {
    if (localStorage.getItem("token")) {
      expire("token", "tokenExpire");
    } else if (localStorage.getItem("adminToken")) {
      expire("adminToken", "adminTokenExpire");
    }
  }, []);

  const adminToken = localStorage.getItem("adminToken");
  const adminData = adminToken ? JSON.parse(adminToken) : null;

  return (
    <>
      <AdminRoutes />
      <>
        <AppBar />
        <ArtistRoutes />
        <ConsumerRoutes />
      </>
    </>
  );
};

export default Routes;