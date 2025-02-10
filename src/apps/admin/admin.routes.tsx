import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import AdminLogin from "@apps/admin/adminLogin/adminLogin";
import AdminMain from "apps/admin/adminMain/adminMain";
import { useLocation, useParams } from "react-router";

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
  const { path } = useRouteMatch();
  let location = useLocation();
  const section = location.pathname.split("/")[1];
  const hostname = window.location;
  console.log(path);
  console.log(section);
  console.log(hostname);
  return (
    <Switch>
      <Route path="/admin/dashboard">
        <AdminMain
          permissions={permissions}
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route exact path="/admin/main">
        <AdminMain
          permissions={permissions}
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route path="/admin/user/create">
        <AdminMain
          permissions={permissions}
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route path="/admin/users/read">
        <AdminMain
          permissions={permissions}
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route
        exact
        path={[
          "/admin/user/update/:userId",
          "/admin/order/read",
          "/admin/user/read",
          "/admin/user/update",
          "/admin/user/updateRole",
          "/admin/product/read",
          "/admin/consumer/read",
          "/admin/movements/read",
          "/admin/product/create",
          "/admin/preferences/read",
          "/admin/shipping-method/read",
          "/admin/shipping-method/create",
          "/admin/shipping-method/update/:id",
          "/admin/prixer/read",
          "/admin/product/update/:productId",
          "/admin/consumer/update/:consumerId",
          "/admin/payment-method/read",
          "/admin/testimonials/read",
          "/admin/product/createDiscount",
          "/admin/product/updateDiscount/:discountId",
          "/admin/product/createSurcharge",
          "/admin/product/updateSurcharge/:surchargeId",
          "/admin/product/createCategory",
          "/admin/product/updateCategory/:categoryId",
        ]}
      >
        <AdminMain
          permissions={permissions}
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route path="/admin/product/create">
        <AdminMain
          permissions={permissions}
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route path="/admin/products/read">
        <AdminMain
          permissions={permissions}
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route path="/admin/consumer/create">
        <AdminMain
          permissions={permissions}
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route path="/admin/consumers/read">
        <AdminMain
          permissions={permissions}
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route exact path="/admin/inicio">
        <AdminLogin setPermissions={setPermissions} />
      </Route>
    </Switch>
  );
};

export default AdminRoutes;
