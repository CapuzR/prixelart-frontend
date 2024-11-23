import React from 'react';
import { Route, Switch } from 'react-router-dom';
import AdminLogin from 'apps/admin/adminLogin/adminLoginPage';
import AdminMain from 'apps/admin/adminMain/adminMain';

interface AdminRoutesProps {
  setPermissions: (permissions: any) => void;
  setValuesConsumerForm: (value: string) => void;
  valuesConsumerForm: string;
  permissions: any;
}

const AdminRoutes: React.FC<AdminRoutesProps> = ({
  setValuesConsumerForm,
  valuesConsumerForm,
  permissions,
  setPermissions,
}) => {
  return (
    <Switch>
      <Route path="/dashboard">
        <AdminMain 
        permissions={permissions}
        valuesConsumerForm={valuesConsumerForm}
        setValues={setValuesConsumerForm}
         />
      </Route>

      <Route path="/main">
        <AdminMain
          setValues={setValuesConsumerForm}
          valuesConsumerForm={valuesConsumerForm}
          permissions={permissions}
        />
      </Route>

      <Route path="/user/create">
        <AdminMain permissions={permissions} />
      </Route>

      <Route path="/users/read">
        <AdminMain permissions={permissions} />
      </Route>

      <Route
        exact
        path={[
          '/user/update/:userId',
          '/order/read',
          '/users/read',
          '/user/read',
          '/product/read',
          '/consumer/read',
          '/movements/read',
          '/product/create',
          '/preferences/read',
          '/shipping-method/read',
          '/prixer/read',
          '/product/update/:productId',
          '/consumer/update/:consumerId',
          '/payment-method/read',
          '/shipping-method/read',
          '/testimonials/read',
          '/product/createDiscount',
          '/product/updateDiscount/:discountId',
          '/product/createSurcharge',
          '/product/updateSurcharge/:surchargeId',
          '/product/createCategory',
          '/product/updateCategory/:categoryId',
        ]}
      >
        <AdminMain permissions={permissions} />
      </Route>

      <Route path="/product/create">
        <AdminMain permissions={permissions} />
      </Route>

      <Route path="/products/read">
        <AdminMain permissions={permissions} />
      </Route>

      <Route path="/consumer/create">
        <AdminMain permissions={permissions} />
      </Route>

      <Route path="/consumers/read">
        <AdminMain permissions={permissions} />
      </Route>
      
      <Route>
        <AdminLogin setPermissions={setPermissions} />
      </Route>

    </Switch>
  );
};

export default AdminRoutes;
