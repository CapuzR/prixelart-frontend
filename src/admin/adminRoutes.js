import React from 'react';
import { Route, Switch } from 'react-router-dom';
import AdminLogin from '../adminLogin/adminLoginPage';
import AdminMain from '../admin/adminMain/adminMain';

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
      <Route path="/admin/inicio">
        <AdminLogin
          setPermissions={setPermissions}
        />
      </Route>

      <Route path="/admin/dashboard">
        <AdminMain
          dollarValue={dollarValue}
          setDollarValue={setDollarValue}
          updateDollarValue={updateDollarValue}
          setMessage={setMessage}
          setOpen={setOpen}
        />
      </Route>

      <Route path="/admin/main">
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

      <Route path="/admin/user/create">
        <AdminMain dollarValue={dollarValue} />
      </Route>

      <Route path="/admin/users/read">
        <AdminMain
          dollarValue={dollarValue}
          setDollarValue={setDollarValue}
          updateDollarValue={updateDollarValue}
          setMessage={setMessage}
          setOpen={setOpen}
        />
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
        ]}
        >
        <AdminMain />
      </Route>

      <Route path="/admin/product/create">
        <AdminMain dollarValue={dollarValue} />
      </Route>

      <Route path="/admin/products/read">
        <AdminMain
          dollarValue={dollarValue}
          setDollarValue={setDollarValue}
          updateDollarValue={updateDollarValue}
          setMessage={setMessage}
          setOpen={setOpen}
        />
      </Route>

      <Route path="/admin/consumer/create">
        <AdminMain dollarValue={dollarValue} />
      </Route>

      <Route path="/admin/consumers/read">
        <AdminMain
          dollarValue={dollarValue}
          setDollarValue={setDollarValue}
          updateDollarValue={updateDollarValue}
          setMessage={setMessage}
          setOpen={setOpen}
        />
      </Route>
    </Switch>
  );
};

export default AdminRoutes;
