import React from "react";
import { Route, Routes } from "react-router-dom";

import ArtDetail from "@apps/consumer/art/components/ArtsGrid/Details/Details";
import Home from "apps/consumer/home/home";
import Catalog from "@apps/consumer/art/catalog/Catalog";
import Products from "apps/consumer/products/Catalog";
import Cart from "@apps/consumer/cart";
import Prixers from "apps/consumer/prixers/prixersGrid";
import OrgGrid from "apps/consumer/components/orgGrid/orgGrid";
import PrixersService from "apps/consumer/prixerServices/prixerService";
import TestimonialsGrid from "apps/consumer/testimonials/testimonialsGrid";
import ProductDetails from "apps/consumer/products/Details/Details";
import Flow from "apps/consumer/flow/Flow";
import PrixerProfile from "apps/artist/prixerProfile/prixerProfile";

const ConsumerRoutes: React.FC = () => {

  return (
    <Routes>
      <Route
        path="/productos"
        element={
          <Products />
        } />
      <Route
        path="/galeria"
        element={
          <Catalog />
        } />
      <Route
        path="/prixers"
        element={<Prixers />}
      />
      <Route
        path="/organizaciones"
        element={<OrgGrid />}
      />
      <Route path="/carrito" element={<Cart />} />

      <Route
        path="/servicios"
        element={
          <PrixersService />
        } />

      {/* 
      <Route
        path="/servicio/:serviceId"
        element={
          <SoloService
          />
        } />
      */}
      <Route
        path="/testimonios"
        element={<TestimonialsGrid />}
      />
      <Route
        path="/arte/:artId"
        element={
          <ArtDetail />
        } />

      <Route
        path="/prixer/username"
        element={
          <PrixerProfile />
        } />

      {/*
      <Route
        path="/org/:username"
        element={
          <PrixerProfile
            setPrixer={setPrixer}
            setFullArt={setFullArt}
            permissions={permissions}
          />
        } />

      */}

      {/* TODO : Cómo debería llamarse? Flujo? Selección? */}
      <Route path="/crear-prix" element={<Flow />} />
      <Route path="/producto/:id" element={<ProductDetails />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default ConsumerRoutes;
