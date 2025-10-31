import React from "react";
import { Route, Routes } from "react-router-dom";
import Map from "apps/map/index";

const MapRoutes = ({}) => {
  return (
    <Routes>
      <Route path="/wip/map" element={<Map />} />
    </Routes>
  );
};

export default MapRoutes;
