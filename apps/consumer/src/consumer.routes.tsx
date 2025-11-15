import React from "react";
import { Route, Routes } from "react-router-dom";

import ArtDetail from "@/art/components/ArtsGrid/Details/Details";
import Home from "@/home/home";
import Catalog from "@/art/catalog/Catalog";
import Products from "@/products/Catalog";
import Cart from "@/cart";
import Prixers from "@/prixers/prixersGrid";
import PrixersService from "@/prixerServices/prixerService";
import TestimonialsGrid from "@/testimonials/testimonialsGrid";
import ProductDetails from "@/products/Details/Details";
import Flow from "@/flow/Flow";
import PrixerProfile from "@/artist/profile";
import Login from "@/login";
import PasswordChange from "@/artist/passwordChange/passwordChange";

import SignUp from "@/signup/SignUp";
import TrackOrder from "./trackOrder/TrackOrder";
import OrderDetailsPage from "./trackOrder/OrderDetailsPage";
import ConditionalFB from "@components/floatingAddButton/Conditional";
import ArtUploader from "@/artist/artUploader";
import CreateService from "@components/createService";
import ForgotPassword from "@/artist/passwordReset/ForgotPassword";
import PasswordReset from "@/artist/passwordReset/PasswordReset";
import PrixerStats from "@/artist/profile/Stats";
import LegacyOrProfileRoute from "./LegacyArtLink.routes";
import PrixItem from "./products/PrixItem/index";

import { usePrixerCreator } from "@prixpon/context/GlobalContext";

const ConsumerRoutes: React.FC = () => {
  const { uploadArt, setArtModal } = usePrixerCreator();

  return (
    <>
      <Routes>
        <Route path="/iniciar" element={<Login />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/track/:id" element={<OrderDetailsPage />} />
        <Route path="/registrar" element={<SignUp />} />
        <Route path="/cambio-contraseña" element={<PasswordChange />} />
        <Route path="/olvido-contraseña" element={<ForgotPassword />} />
        <Route path="/recuperar/:token" element={<PasswordReset />} />

        <Route path="/productos" element={<Products />} />
        <Route path="/galeria" element={<Catalog />} />
        <Route path="/prixers" element={<Prixers />} />
        {/* <Route path="/organizaciones" element={<OrgGrid />} /> */}
        <Route path="/carrito" element={<Cart />} />
        <Route path="/servicios" element={<PrixersService />} />
        <Route path="/servicio/:id" element={<PrixersService />} />
        <Route path="/testimonios" element={<TestimonialsGrid />} />
        <Route path="/arte/:artId" element={<ArtDetail />} />
        <Route path="/prixer/:username" element={<PrixerProfile />} />
        <Route path="/:slug" element={<LegacyOrProfileRoute />} />

        <Route path="/prixer/:username/stats" element={<PrixerStats />} />
        {/* <Route path="/org/:username" element={<PrixerProfile />} /> */}
        <Route path="/crear-prix" element={<Flow />} />
        <Route path="/producto/:id" element={<ProductDetails />} />
        <Route path="/prix-item" element={<PrixItem />} />

        <Route path="/" element={<Home />} />
        <Route
          path="*"
          element={
            <div>
              <h1>404 - No Encontrado</h1>
            </div>
          }
        />
      </Routes>

      <ConditionalFB />
      <ArtUploader
        openArtFormDialog={uploadArt}
        setOpenArtFormDialog={setArtModal}
      />
      <CreateService />
    </>
  );
};

export default ConsumerRoutes;
