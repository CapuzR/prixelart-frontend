import Login from "@apps/artist/login"

import { Route, Switch } from "react-router-dom"
import ResetPassword from "@apps/artist/passwordReset/passwordReset"
import PrixerStats from "@apps/artist/profile/prixerStats"
import Profile from "@apps/artist/profile"
import SoloService from "@apps/artist/fullscreenPhoto/fullscreenService"
import PrixersService from "apps/consumer/prixerServices/prixerService"
import ArtDetail from "apps/consumer/art/components/Detail"
import Register from "@apps/artist/register/views/SignUp"
import PasswordChange from "@apps/artist/passwordChange/passwordChange"
import ForgotPassword from "@apps/artist/passwordReset/forgotPassword"
import PrixerRegistration from "./register/views/PrixerRegistration"

const ArtistRoutes = () => {
  return (
    <Switch>
      <Route exact path="/iniciar">
        <Login />
      </Route>

      <Route exact path="/registrar">
        <Register />
      </Route>

      <Route path="/cambio-contraseña">
        <PasswordChange />
      </Route>

      <Route path="/olvido-contraseña">
        <ForgotPassword />
      </Route>

      <Route exact path="/registrar/prixer">
        <PrixerRegistration/>
      </Route>

      <Route exact path="/recuperar/:token" component={ResetPassword} />

      <Route path="/:username/stats">
        <PrixerStats />
      </Route>

      <Route exact path={["/art=:artId", "/arte/:artId"]} component={ArtDetail}>
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
    </Switch>
  )
}

export default ArtistRoutes
