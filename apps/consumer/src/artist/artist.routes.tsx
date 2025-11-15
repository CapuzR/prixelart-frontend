import Login from "@apps/consumer/src/login";

import { Route, Routes } from "react-router-dom";
import PrixerStats from "@/artist/profile/Stats";
import Profile from "@/artist/profile";
import PrixersService from "@apps/consumer/src/prixerServices/prixerService";
import Register from "@apps/consumer/src/signup/SignUp";
import PasswordChange from "@/artist/passwordChange/passwordChange";
import PrixerRegistration from "./register/views/PrixerRegistration";

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
  );
};

export default ArtistRoutes;
