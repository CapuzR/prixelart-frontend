import React from "react"
import { Switch, Route, useRouteMatch } from "react-router-dom"
import AdminLogin from "@apps/admin/login"
import AdminMain from "@apps/admin/App"
import { useLocation, useParams } from "react-router"

interface AdminRoutesProps {
  setValuesConsumerForm: (value: string) => void
  valuesConsumerForm: string
}

const AdminRoutes: React.FC<AdminRoutesProps> = ({
  setValuesConsumerForm,
  valuesConsumerForm,
}) => {
  const { path } = useRouteMatch()

  let location = useLocation()
  const section = location.pathname.split("/")[1]
  const hostname = window.location

  console.log(path)
  console.log(section)
  console.log(hostname)
  return (
    <Switch>
      <Route path="/admin/dashboard">
        <AdminMain
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route exact path="/admin/main">
        <AdminMain
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route path="/admin/admins/create">
        <AdminMain
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route path="/admin/admins/read">
        <AdminMain
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route
        exact
        path={[
          "/admin/admins/update/:adminId",
          "/admin/order/read",
          "/admin/admins/read",
          "/admin/admins/update",
          "/admin/admins/updateRole",
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
          "/admin/payment-method/create",
          "/admin/payment-method/update/:id",
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
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route path="/admin/product/create">
        <AdminMain
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route path="/admin/products/read">
        <AdminMain
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route path="/admin/consumer/create">
        <AdminMain
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route path="/admin/consumers/read">
        <AdminMain
          valuesConsumerForm={valuesConsumerForm}
          setValues={setValuesConsumerForm}
        />
      </Route>

      <Route exact path="/admin/inicio">
        <AdminLogin />
      </Route>
    </Switch>
  )
}

export default AdminRoutes
