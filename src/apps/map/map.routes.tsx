import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Map from 'apps/map/index';

const MapRoutes = ({}) => {
  return (
    <Switch>
      <Route path="/wip/map">
        <Map />
      </Route>
    </Switch>
  );
};

export default MapRoutes;
