import React, { useState } from "react"
import { Route, Routes } from "react-router-dom"

import ArtDetail from "@apps/consumer/art/components/ArtsGrid/Details/Details"
import Home from "apps/consumer/home/home"
import Catalog from "@apps/consumer/art/catalog/Catalog"
import Products from "apps/consumer/products/Catalog"
import Cart from "@apps/consumer/cart"
import Prixers from "apps/consumer/prixers/prixersGrid"
import OrgGrid from "apps/consumer/components/orgGrid/orgGrid"
import PrixersService from "apps/consumer/prixerServices/prixerService"
import TestimonialsGrid from "apps/consumer/testimonials/testimonialsGrid"
import ProductDetails from "apps/consumer/products/Details/Details"
import Flow from "apps/consumer/flow/Flow"
import PrixerProfile from "apps/artist/profile"
import Login from "@apps/consumer/login"
import PasswordChange from "@apps/artist/passwordChange/passwordChange"

import SignUp from "@apps/consumer/signup/SignUp"
import TrackOrder from "./trackOrder/TrackOrder"
import OrderDetailsPage from "./trackOrder/OrderDetailsPage"
import ConditionalFB from "@components/floatingAddButton/Conditional"
import ArtUploader from "@apps/artist/artUploader"
import CreateService from "@components/createService"
import ForgotPassword from "@apps/artist/passwordReset/ForgotPassword"
import PasswordReset from "@apps/artist/passwordReset/PasswordReset" 

import { usePrixerCreator } from "@context/GlobalContext"

const ConsumerRoutes: React.FC = () => {

const {uploadArt, setArtModal} = usePrixerCreator()
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
        <Route path="/org/:username" element={<PrixerProfile />} />
        <Route path="/crear-prix" element={<Flow />} />
        <Route path="/producto/:id" element={<ProductDetails />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<div><h1>404 - No Encontrado</h1></div>} />
      </Routes>

      <ConditionalFB />
      <ArtUploader
        openArtFormDialog={uploadArt}
        setOpenArtFormDialog={setArtModal}
      />
      <CreateService />
    </>
  )
}

export default ConsumerRoutes
