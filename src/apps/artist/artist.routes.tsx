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
      <Route path="/iniciar">
        <Login />
      </Route>

      <Route path="/registrar">
        <Register />
      </Route>

      <Route path="/cambio-contraseña">
        <PasswordChange />
      </Route>

      <Route path="/olvido-contraseña">
        <ForgotPassword />
      </Route>

      <Route path="/registrar/prixer">
        <PrixerRegistration/>
      </Route>

      <Route path="/recuperar/:token" element={<ResetPassword/>} />

      <Route path="/:username/stats">
        <PrixerStats />
      </Route>

      <Route path={["/art=:artId", "/arte/:artId"]} element={<ArtDetail/>}>
        <ArtDetail />
      </Route>
      <Route path="/prixer=:username">
        <Profile />
      </Route>
      <Route path="/org=:username">
        <Profile />
      </Route>
      <Route path="/servicios">
        <PrixersService />
      </Route>

      <Route path={["/service=:serviceId", "/servicio/:serviceId"]}>
        <SoloService />
      </Route>
    </Routes>
  )
}

export default ArtistRoutes
