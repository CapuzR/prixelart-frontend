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
      <Route path="/admin/inicio">
        <AdminLogin setPermissions={setPermissions} />
      </Route>

      <Route path="/admin/dashboard">
        <AdminMain permissions={permissions} />
      </Route>

      <Route path="/admin/main">
        <AdminMain
          setValues={setValuesConsumerForm}
          values={valuesConsumerForm}
          permissions={permissions}
        />
      </Route>

      <Route path="/admin/user/create">
        <AdminMain permissions={permissions} />
      </Route>

      <Route path="/admin/users/read">
        <AdminMain permissions={permissions} />
      </Route>

      <Route
        exact
        path={[
          '/admin/user/update/:userId',
          '/admin/order/read',
          '/admin/product/read',
          '/admin/shipping-method/read',
          '/admin/prixer/read',
          '/admin/product/update/:productId',
          '/admin/consumer/update/:consumerId',
          '/admin/payment-method/read',
          '/admin/shipping-method/read',
          '/admin/testimonials/read',
          '/admin/product/createDiscount',
          '/admin/product/updateDiscount/:discountId',
          '/admin/product/createSurcharge',
          '/admin/product/updateSurcharge/:surchargeId',
          '/admin/product/createCategory',
          '/admin/product/updateCategory/:categoryId',
        ]}
      >
        <AdminMain permissions={permissions} />
      </Route>

      <Route path="/admin/product/create">
        <AdminMain permissions={permissions} />
      </Route>

      <Route path="/admin/products/read">
        <AdminMain permissions={permissions} />
      </Route>

      <Route path="/admin/consumer/create">
        <AdminMain permissions={permissions} />
      </Route>

      <Route path="/admin/consumers/read">
        <AdminMain permissions={permissions} />
      </Route>
    </Switch>
  );
};

export default AdminRoutes;
