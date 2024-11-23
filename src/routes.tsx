import React, { useEffect, useState } from 'react';
import expire from './utils/expire';

import ArtistRoutes from 'apps/artist/artist.routes';
import AdminRoutes from 'apps/admin/admin.routes';
import ConsumerRoutes from 'apps/consumer/consumer.routes';
import MapRoutes from 'apps/map/map.routes';
import OrgsRoutes from 'apps/orgs/orgs.routes';

const Routes = () => {
  const [valuesConsumerForm, setValuesConsumerForm] = useState<string>('');
  const hostname = window.location.hostname;

  const [permissions, setPermissions] = useState<any>(
    JSON.parse(localStorage.getItem('adminToken') || '{}')?.permissions
  );

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  useEffect(() => {
    if (localStorage.getItem('token')) {
      expire('token', 'tokenExpire');
    } else if (localStorage.getItem('adminToken')) {
      expire('adminToken', 'adminTokenExpire');
    }
  }, []);

  return (
    <>
    {
      hostname.includes('admin') ?
        <AdminRoutes
          valuesConsumerForm={valuesConsumerForm}
          setValuesConsumerForm={setValuesConsumerForm}
          permissions={permissions}
          setPermissions={setPermissions}
        /> : 
      hostname.includes('prixer') ?
        <ArtistRoutes /> :
      hostname.includes('wip') ?
        <MapRoutes /> :
      hostname.includes('orgs') ?
        <OrgsRoutes /> :      
        <ConsumerRoutes
          permissions={permissions}
        />
    }


      


    </>
  );
};

export default Routes;
