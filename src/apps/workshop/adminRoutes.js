import React from 'react';
import { Route, Switch } from 'react-router-dom';
import AdminLogin from 'apps/adminLogin/adminLoginPage';
import AdminMain from 'apps/adminMain/adminMain';

const AdminRoutes = ({
  dollarValue,
  setDollarValue,
  updateDollarValue,
  setMessage,
  setOpen,
  buyState,
  setBuyState,
  deleteItemInBuyState,
  deleteProductInItem,
  setSelectedArtToAssociate,
  setSelectedProductToAssociate,
  setValuesConsumerForm,
  valuesConsumerForm,
  AssociateProduct,
  changeQuantity,
  sellers,
  permissions,
  setPermissions,
  setSearchResult,
  searchResult,
}) => {
  return (
    <Switch>
      <Route path="/inicio">
        <AdminLogin setPermissions={setPermissions} />
      </Route>

      <Route path="/dashboard">
        <AdminMain
          dollarValue={dollarValue}
          setDollarValue={setDollarValue}
          updateDollarValue={updateDollarValue}
          setMessage={setMessage}
          setOpen={setOpen}
          permissions={permissions}
        />
      </Route>

      <Route path="/main">
        <AdminMain
          buyState={buyState}
          setBuyState={setBuyState}
          deleteItemInBuyState={deleteItemInBuyState}
          deleteProductInItem={deleteProductInItem}
          setSelectedArtToAssociate={setSelectedArtToAssociate}
          setSelectedProductToAssociate={setSelectedProductToAssociate}
          setValues={setValuesConsumerForm}
          values={valuesConsumerForm}
          AssociateProduct={AssociateProduct}
          changeQuantity={changeQuantity}
          setOpen={setOpen}
          setMessage={setMessage}
          sellers={sellers}
          permissions={permissions}
          setSearchResult={setSearchResult}
          searchResult={searchResult}
        />
      </Route>

      <Route path="/user/create">
        <AdminMain dollarValue={dollarValue} permissions={permissions} />
      </Route>

      <Route path="/users/read">
        <AdminMain
          dollarValue={dollarValue}
          setDollarValue={setDollarValue}
          updateDollarValue={updateDollarValue}
          setMessage={setMessage}
          setOpen={setOpen}
          permissions={permissions}
        />
      </Route>

      <Route
        exact
        path={[
          '/user/update/:userId',
          '/order/read',
          '/product/read',
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
        <AdminMain dollarValue={dollarValue} permissions={permissions} />
      </Route>

      <Route path="/products/read">
        <AdminMain
          dollarValue={dollarValue}
          setDollarValue={setDollarValue}
          updateDollarValue={updateDollarValue}
          setMessage={setMessage}
          setOpen={setOpen}
          permissions={permissions}
        />
      </Route>

      <Route path="/consumer/create">
        <AdminMain dollarValue={dollarValue} permissions={permissions} />
      </Route>

      <Route path="/consumers/read">
        <AdminMain
          dollarValue={dollarValue}
          setDollarValue={setDollarValue}
          updateDollarValue={updateDollarValue}
          setMessage={setMessage}
          setOpen={setOpen}
          permissions={permissions}
        />
      </Route>
    </Switch>
  );
};

export default AdminRoutes;
