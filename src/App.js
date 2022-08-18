import React, { useEffect } from 'react';
import './App.css';
import Login from './login/loginPage';
import AdminLogin from './adminLogin/adminLoginPage';
import AdminMain from './admin/adminMain/adminMain';
import Register from './register/userRegistration';
import PrixerRegistration from './register/prixerRegistration';
import PrixerProfile from './prixerProfile/prixerProfile';
import FullscreenPhoto from './prixerProfile/fullscreenPhoto/fullscreenPhoto';
import Home from './home/home'
import {
  Switch,
  Route
} from "react-router-dom";
import Gallery from './gallery/gallery';
import Products from './products/productsCatalog';
import expire from './utils/expire';
import PasswordChange from './prixerProfile/passwordChange/passwordChange';
import ForgotPassword from './prixerProfile/passwordReset/forgotPassword';
import ResetPassword from './prixerProfile/passwordReset/passwordReset';


function App() {

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  useEffect(()=> {
    setInterval(()=> {
      expire('token', 'tokenExpire');
    },60000)
  }, []);

  return (
    <Switch>
      <Route path="/iniciar">
        <Login />
      </Route>

{/* Admin Routes */}
      <Route path="/inicio-admin-prix">
        <AdminLogin />
      </Route>

      <Route path="/admin/dashboard">
        <AdminMain />
      </Route>

      <Route path="/admin">
        <AdminMain />
      </Route>

      <Route path="/admin/user/create">
        <AdminMain />
      </Route>

      <Route path="/admin/users/read">
        <AdminMain />
      </Route>

      <Route exact path="/user/update/:userId" component={AdminMain} />

      <Route path="/admin/product/create">
        <AdminMain />
      </Route>

      <Route path="/admin/products/read">
        <AdminMain />
      </Route>

      <Route exact path="/product/update/:productId" component={AdminMain} />

      <Route exact path="/product/:productId/variant/create" component={AdminMain} />

      <Route exact path="/product/:productId/variants/read" component={AdminMain} />

      <Route path="/admin/consumer/create">
        <AdminMain />
      </Route>

      <Route path="/admin/consumers/read">
        <AdminMain />
      </Route>

      <Route exact path="/consumer/update/:consumerId" component={AdminMain} />


{/* END Admin Routes */}
      <Route path="/productos">
        <Products />
      </Route>

      <Route path="/galeria">
        <Gallery />
      </Route>

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

      <Route exact path="/:username/art/:artId" component={FullscreenPhoto} />
      
      <Route exact path="/:username" component={PrixerProfile} />

      <Route path="/prixer-profile">
        <PrixerProfile />
      </Route>

      <Route path="/">
        <Home />
      </Route>
      <Route component={Home} />
    </Switch>
  );
}


export default App;
