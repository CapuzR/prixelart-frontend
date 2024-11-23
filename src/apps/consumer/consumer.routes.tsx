import React, { useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import ArtDetail from 'apps/consumer/art/components/Detail';
import Home from 'apps/consumer/home/home';
import Catalog from 'apps/consumer/art/catalog/views/Catalog';
import Products from 'apps/consumer/products/Catalog';
import ShoppingPage from '@apps/consumer/cart';
import Prixers from 'apps/consumer/prixers/prixersGrid';
import OrgGrid from 'apps/consumer/components/orgGrid/orgGrid';
import PrixersService from 'apps/consumer/prixerServices/prixerService';
import TestimonialsGrid from 'apps/consumer/testimonials/testimonialsGrid';
import ProductDetails from 'apps/consumer/products/Details/Details';
import Flow from 'apps/consumer/flow/Flow';
import PrixerProfile from 'apps/artist/prixerProfile/prixerProfile';
import SoloService from 'apps/artist/prixerProfile/fullscreenPhoto/fullscreenService';

interface ConsumerRoutesProps {
  valuesConsumerForm: string;
  setValuesConsumerForm: (value: string) => void;
  permissions: any;
}

const ArtistRoutes: React.FC<ConsumerRoutesProps> = ({
  valuesConsumerForm,
  setValuesConsumerForm,
  permissions,
}) => {
  const [prixer, setPrixer] = useState<any>(null);
  const [fullArt, setFullArt] = useState<any>(null);
  const [pointedProduct, setPointedProduct] = useState<any>(undefined);

  return (
    <Switch>
      <Route path="/productos">
        <Products pointedProduct={pointedProduct} setPointedProduct={setPointedProduct} />
      </Route>
      <Route path="/galeria">
        <Catalog setPrixer={setPrixer} prixer={prixer} setFullArt={setFullArt} fullArt={fullArt} />
      </Route>
      <Route path="/prixers">
        <Prixers setPrixer={setPrixer} prixer={prixer} />
      </Route>
      <Route path="/organizaciones">
        <OrgGrid setPrixer={setPrixer} prixer={prixer} />
      </Route>
      <Route path="/shopping">
        <ShoppingPage
          valuesConsumerForm={valuesConsumerForm}
          setValuesConsumerForm={setValuesConsumerForm}
        />
      </Route>

      <Route path="/servicios">
        <PrixersService setPrixer={setPrixer} prixer={prixer} permissions={permissions} />
      </Route>

      <Route path="/service=:serviceId">
        <SoloService setPrixer={setPrixer} prixer={prixer} permissions={permissions} />
      </Route>
      <Route path="/testimonios">
        <TestimonialsGrid setPrixer={setPrixer} prixer={prixer} />
      </Route>
      <Route exact path="/art=:artId" component={ArtDetail}>
        <ArtDetail prixer={prixer} fullArt={fullArt} permissions={permissions} />
      </Route>
      <Route path="/prixer=:username">
        <PrixerProfile setPrixer={setPrixer} setFullArt={setFullArt} permissions={permissions} />
      </Route>
      <Route path="/org=:username">
        <PrixerProfile setPrixer={setPrixer} setFullArt={setFullArt} permissions={permissions} />
      </Route>
      <Route path="/flow">
        <Flow />
      </Route>

      <Route path="/producto/:id">
        <ProductDetails />
      </Route>

      <Route path="/" component={Home} />
    </Switch>
  );
};

export default ArtistRoutes;
