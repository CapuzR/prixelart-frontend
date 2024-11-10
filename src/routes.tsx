import React, { useEffect, useState } from 'react';
import expire from './utils/expire';

import ArtistRoutes from 'apps/artist/artist.routes';
import AdminRoutes from 'apps/admin/admin.routes';
import ConsumerRoutes from 'apps/consumer/consumer.routes';
import MapRoutes from 'apps/map/map.routes';
import OrgsRoutes from 'apps/orgs/orgs.routes';

const Routes = () => {
  const [valuesConsumerForm, setValuesConsumerForm] = useState<string>('');

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
      <ArtistRoutes />

      <AdminRoutes
        valuesConsumerForm={valuesConsumerForm}
        setValuesConsumerForm={setValuesConsumerForm}
        permissions={permissions}
        setPermissions={setPermissions}
      />

      <MapRoutes />

      <OrgsRoutes />

      <ConsumerRoutes
        valuesConsumerForm={valuesConsumerForm}
        setValuesConsumerForm={setValuesConsumerForm}
        permissions={permissions}
      />
    </>
  );
};

export default Routes;
