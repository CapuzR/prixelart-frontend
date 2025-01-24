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
      <Route path="/dashboard">
        <AdminMain
          permissions={permissions}
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route exact path="/admin/main">
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
          "/user/update/:userId",
          "/admin/order/read",
          "/users/read",
          "/user/read",
          "/product/read",
          "/consumer/read",
          "/movements/read",
          "/product/create",
          "/preferences/read",
          "/shipping-method/read",
          "/prixer/read",
          "/product/update/:productId",
          "/consumer/update/:consumerId",
          "/payment-method/read",
          "/shipping-method/read",
          "/testimonials/read",
          "/product/createDiscount",
          "/product/updateDiscount/:discountId",
          "/product/createSurcharge",
          "/product/updateSurcharge/:surchargeId",
          "/product/createCategory",
          "/product/updateCategory/:categoryId",
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

      <Route exact path="/admin/inicio">
        <AdminLogin setPermissions={setPermissions} />
      </Route>
    </Switch>
  );
};

export default AdminRoutes;
