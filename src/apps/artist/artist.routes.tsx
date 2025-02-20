import React from "react"
import { Route, Switch } from "react-router-dom"
import ResetPassword from "apps/artist/prixerProfile/passwordReset/passwordReset"
import PrixerStats from "apps/artist/prixerProfile/prixerStats"

const ArtistRoutes = ({}) => {
  return (
    <Switch>
      <Route exact path="/recuperar/:token" component={ResetPassword} />

      <Route path="/:username/stats">
        <PrixerStats />
      </Route>
    </Switch>
  )
}

export default ArtistRoutes
