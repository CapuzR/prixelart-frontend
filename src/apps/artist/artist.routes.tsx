import Login from "@apps/artist/login"

import { Route, Routes } from "react-router-dom"
import ResetPassword from "@apps/artist/passwordReset/passwordReset"
import PrixerStats from "@apps/artist/profile/prixerStats"
import Profile from "@apps/artist/profile"
import SoloService from "@apps/artist/fullscreenPhoto/fullscreenService"
import PrixersService from "apps/consumer/prixerServices/prixerService"
import ArtDetail from "./fullscreenPhoto/fullscreenPhoto"
import Register from "@apps/artist/register/views/SignUp"
import PasswordChange from "@apps/artist/passwordChange/passwordChange"
import ForgotPassword from "@apps/artist/passwordReset/forgotPassword"
import PrixerRegistration from "./register/views/PrixerRegistration"

const ArtistRoutes = () => {
  return (
    <Routes>
      <Route path="/iniciar" element={<Login />} />
      <Route path="/registrar" element={<Register />} />
      <Route path="/cambio-contraseña" element={<PasswordChange />} />
      <Route path="/olvido-contraseña" element={<ForgotPassword />} />
      <Route path="/registrar/prixer" element={<PrixerRegistration />} />
      <Route path="/recuperar/:token" element={<ResetPassword />} />
      <Route path="/:username/stats" element={<PrixerStats />} />
      <Route path={"/art=:artId"} element={<ArtDetail />} />
      <Route path={"/arte/:artId"} element={<ArtDetail />} />
      <Route path="/prixer=:username" element={<Profile />} />
      <Route path="/org=:username" element={<Profile />} />
      <Route path="/servicios" element={<PrixersService />} />
      <Route path={"/service=:serviceId"} element={<SoloService />} />
      <Route path={"/servicio/:serviceId"} element={<SoloService />} />
    </Routes>
  )
}

export default ArtistRoutes
