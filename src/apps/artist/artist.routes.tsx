import Login from "@apps/consumer/login"

import { Route, Routes } from "react-router-dom"
import PrixerStats from "@apps/artist/profile/Stats"
import Profile from "@apps/artist/profile"
import PrixersService from "apps/consumer/prixerServices/prixerService"
import Register from "@apps/consumer/signup/SignUp"
import PasswordChange from "@apps/artist/passwordChange/passwordChange"
import PrixerRegistration from "./register/views/PrixerRegistration"

const ArtistRoutes = () => {
  return (
    <Routes>
{/*       <Route path="/registrar/prixer" element={<PrixerRegistration />} />
      <Route path="/recuperar/:token" element={<ResetPassword />} />
      <Route path="/:username/stats" element={<PrixerStats />} />
      <Route path="/prixer=:username" element={<Profile />} />
      <Route path="/org=:username" element={<Profile />} />
      <Route path="/servicios" element={<PrixersService />} />
      <Route path={"/service=:serviceId"} element={<SoloService />} />
      <Route path={"/servicio/:serviceId"} element={<SoloService />} /> */}
    </Routes>
  )
}

export default ArtistRoutes
