import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Register from 'apps/artist/register/userRegistration';
import PrixerRegistration from 'apps/artist/register/prixerRegistration';
import Login from 'apps/artist/login/loginPage';
import PasswordChange from 'apps/artist/prixerProfile/passwordChange/passwordChange';
import ForgotPassword from 'apps/artist/prixerProfile/passwordReset/forgotPassword';
import ResetPassword from 'apps/artist/prixerProfile/passwordReset/passwordReset';
import PrixerStats from 'apps/artist/prixerProfile/prixerStats';

const ArtistRoutes = ({}) => {
  return (
    <Switch>

      <Route path="/registrar/prixer">
        <PrixerRegistration />
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

      <Route exact path="/recuperar/:token" component={ResetPassword} />

      <Route path="/:username/stats">
        <PrixerStats />
      </Route>

      <Route>
        <Login />
      </Route>
    </Switch>
  );
};

export default ArtistRoutes;
