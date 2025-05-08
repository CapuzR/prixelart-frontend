import React from "react"
import { Routes, Route, Navigate, useRoutes } from "react-router-dom"
import CreateAdmin from "./sections/admins/views/Create"
import ReadAdmins from "./sections/admins/views/Read"
import CreateProduct from "./sections/products/views/Create"
import UpdateProduct from "./sections/products/views/Update"
import UpdateAdmin from "./sections/admins/views/Update"
import CreateRole from "./sections/admins/views/CreateRole"
import ReadRoles from "./sections/admins/views/ReadRoles"
import UpdateAdminRole from "./sections/admins/views/UpdateRole"
import CreateShippingMethod from "./sections/shippingMethods/views/Create"
import ReadShippingMethods from "./sections/shippingMethods/views/Read"
import UpdateShippingMethod from "./sections/shippingMethods/views/Update"
import CreatePaymentMethod from "./sections/paymentMethod/views/Create"
import ReadPaymentMethods from "./sections/paymentMethod/views/Read"
import UpdatePaymentMethod from "./sections/paymentMethod/views/Update"
import ReadTestimonials from "./sections/testimonials/views/Read"
import CreateTestimonial from "./sections/testimonials/views/Create"
import UpdateTestimonial from "./sections/testimonials/views/Update"
import CreateArt from "./sections/art/views/Create"
import ReadArts from "./sections/art/views/Read"
import UpdateArt from "./sections/art/views/Update"
import ReadDiscounts from "./sections/discounts/views/Read"
import UpdateDiscount from "./sections/discounts/views/Update"
import CreateDiscount from "./sections/discounts/views/Create"
import CreateSurcharge from "./sections/surcharges/views/Create"
import ReadSurcharges from "./sections/surcharges/views/Read"
import UpdateSurcharge from "./sections/surcharges/views/Update"
import CreateMovement from "./sections/movements/views/Create"
import ReadMovements from "./sections/movements/views/Read"
import UpdateMovement from "./sections/movements/views/Update"
import ReadAndUpdateTerms from "./sections/preferences/components/views/Terms"
import CreateUser from "./sections/users/Create"
import ReadUsers from "./sections/users/Read"
import UpdateUser from "./sections/users/Update"
import ReadProducts from "./sections/products/views/Read"
import CreateOrder from "./sections/orders/views/Create"
import ReadOrders from "./sections/orders/views/Read"
import UpdateOrder from "./sections/orders/views/Update"
import ManageCarousels from "./sections/carousel/Manage"
import ReadOrderArchives from "./sections/orderArchives/views/Read"
import OrderArchiveDetail from "./sections/orderArchives/views/Details"
import SellerDashboard from "./sections/dashboard/Dashboard"

const AdminNestedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<SellerDashboard />} />

      {/* Admin Management */}
      <Route path="admins/create" element={<CreateAdmin />} />
      <Route path="admins/read" element={<ReadAdmins />} />
      <Route path="admins/update/:username" element={<UpdateAdmin />} />
      <Route path="admins/roles/create" element={<CreateRole />} />
      <Route path="admins/roles/read" element={<ReadRoles />} />
      <Route path="admins/roles/update/:id" element={<UpdateAdminRole />} />

      {/* Product Management */}
      <Route path="product/create" element={<CreateProduct />} />
      <Route path="product/read" element={<ReadProducts />} />
      <Route path="product/update/:id" element={<UpdateProduct />} />

      {/* Art Management */}
      <Route path="art/create" element={<CreateArt />} />
      <Route path="art/read" element={<ReadArts />} />
      <Route path="art/update/:id" element={<UpdateArt />} />

      {/* Discount Management */}
      <Route path="discount/create" element={<CreateDiscount />} />
      <Route path="discount/read" element={<ReadDiscounts />} />
      <Route path="discount/update/:id" element={<UpdateDiscount />} />

      {/* Surcharge Management */}
      <Route path="surcharges/create" element={<CreateSurcharge />} />
      <Route path="surcharges/read" element={<ReadSurcharges />} />
      <Route path="surcharges/update/:id" element={<UpdateSurcharge />} />

      {/* Users Management */}
      <Route path="users/create" element={<CreateUser />} />
      <Route path="users/read" element={<ReadUsers />} />
      <Route path="users/update/:id" element={<UpdateUser />} />

      {/* Order Management */}
      <Route path="orders/create" element={<CreateOrder />} />
      <Route path="orders/read" element={<ReadOrders />} />
      <Route path="orders/update/:id" element={<UpdateOrder />} />

      {/* Order Archives Management */}
      <Route path="orderArchives/read" element={<ReadOrderArchives />} />
      <Route path="orderArchives/detail/:id" element={<OrderArchiveDetail />} />
      <Route path="orderArchives/update/:id" element={<UpdateOrder />} />

      {/* Shipping Methods */}
      <Route path="shipping-method/create" element={<CreateShippingMethod />} />
      <Route path="shipping-method/read" element={<ReadShippingMethods />} />
      <Route path="shipping-method/update/:id" element={<UpdateShippingMethod />} />

      {/* Payment Methods */}
      <Route path="payment-method/create" element={<CreatePaymentMethod />} />
      <Route path="payment-method/read" element={<ReadPaymentMethods />} />
      <Route path="payment-method/update/:id" element={<UpdatePaymentMethod />} />


      {/* Movements */}
      <Route path="movements/create" element={<CreateMovement />} />
      <Route path="movements/read" element={<ReadMovements />} />
      <Route path="movements/update/:id" element={<UpdateMovement />} />

      {/* Prixers */}
      {/* <Route path="prixer/read" element={<ReadPrixers />} /> */}

      {/* Testimonials */}
      <Route path="testimonials/create" element={<CreateTestimonial />} />
      <Route path="testimonials/read" element={<ReadTestimonials />} />
      <Route path="testimonials/update/:id" element={<UpdateTestimonial />} />

      {/* Preferences */}
      <Route path="preferences/terms" element={<ReadAndUpdateTerms />} />
      <Route path="preferences/banners" element={<ManageCarousels />} />


      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />

    </Routes>
  );
};

export default AdminNestedRoutes
