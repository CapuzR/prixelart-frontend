import React from "react"
import { Routes, Route } from "react-router-dom"
import AdminLogin from "@apps/admin/login"
import AdminMain from "@apps/admin/App"
import { useLocation, useParams } from "react-router"

// interface AdminRoutesProps {
//   setValuesConsumerForm: (value: string) => void
//   valuesConsumerForm: string
// }

const AdminRoutes: React.FC = () => {
  // let location = useLocation()
  // const section = location.pathname.split("/")[1]
  // const hostname = window.location
  // console.log(section)
  // console.log(hostname)

  const various = [
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
  ]
  return (
    <Routes>
      <Route path="/admin/dashboard" element={<AdminMain />} />
      <Route path="/admin/main" element={<AdminMain />} />
      <Route path="/admin/admins/create" element={<AdminMain />} />
      <Route path="/admin/admins/read" element={<AdminMain />} />

      {various.map((path) => (
        <Route key={path} path={path} element={<AdminMain />} />
      ))}

      <Route path="/admin/product/create" element={<AdminMain />} />
      <Route path="/admin/products/read" element={<AdminMain />} />
      <Route path="/admin/consumer/create" element={<AdminMain />} />
      <Route path="/admin/consumers/read" element={<AdminMain />} />

      <Route path="/admin/inicio" element={<AdminLogin />} />
    </Routes>
  )
}

export default AdminRoutes
