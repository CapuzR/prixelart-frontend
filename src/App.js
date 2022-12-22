import React, { useEffect, useState } from "react";
import "./App.css";
import Login from "./login/loginPage";
import AdminLogin from "./adminLogin/adminLoginPage";
import AdminMain from "./admin/adminMain/adminMain";
import Register from "./register/userRegistration";
import PrixerRegistration from "./register/prixerRegistration";
import PrixerProfile from "./prixerProfile/prixerProfile";
import FullscreenPhoto from "./prixerProfile/fullscreenPhoto/fullscreenPhoto";
import Home from "./home/home";
import { Switch, Route } from "react-router-dom";
import Gallery from "./gallery/gallery";
import Products from "./products/productsCatalog";
import ShoppingPage from "./shoppingCart/shoppingPage";
import expire from "./utils/expire";
import PasswordChange from "./prixerProfile/passwordChange/passwordChange";
import ForgotPassword from "./prixerProfile/passwordReset/forgotPassword";
import ResetPassword from "./prixerProfile/passwordReset/passwordReset";
import Snackbar from "@material-ui/core/Snackbar";

function App() {
  const [buyState, setBuyState] = useState(
    localStorage.getItem("buyState")
      ? JSON.parse(localStorage.getItem("buyState"))
      : []
  );
  const [isOpenAssociateArt, setIsOpenAssociateArt] = useState(false);
  const [isOpenAssociateProduct, setIsOpenAssociateProduct] = useState(false);
  const [selectedArtToAssociate, setSelectedArtToAssociate] =
    useState(undefined);
  const [selectedProductToAssociate, setSelectedProductToAssociate] =
    useState(undefined);
  const [valuesConsumerForm, setValuesConsumerForm] = useState();
  const [valuesOrderForm, setValuesOrderForm] = useState();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  useEffect(() => {
    setInterval(() => {
      expire("token", "tokenExpire");
    }, 60000);
  }, []);

  function addItemToBuyState(input) {
    const newState = [...buyState];
    if (input.type === "product") {
      newState.push({
        art: undefined,
        product: input.item,
      });
    } else {
      newState.push({
        art: input.item,
        product: undefined,
      });
    }
    setBuyState(newState);
    setIsOpenAssociateArt(false);
    setIsOpenAssociateProduct(false);
    localStorage.setItem("buyState", JSON.stringify(newState));
    setOpen(true);
    setMessage(
      input.type === "product"
        ? "Producto agregado al carrito correctamente"
        : "Arte agregado al carrito correctamente"
    );
  }
  function AssociateProduct(input) {
    const newState = [...buyState];
    if (input.type === "product") {
      newState[input.index].product = input.item;
      setBuyState(newState);
    } else {
      newState[input.index].art = input.item;
      setBuyState(newState);
    }
    setBuyState(newState);
    localStorage.setItem("buyState", JSON.stringify(newState));
    setOpen(true);
    setMessage(
      input.type === "product"
        ? "Producto asociado correctamente"
        : "Arte asociado correctamente"
    );
  }

  function changeQuantity(input) {
    const newState = [...buyState];
    if (input.quantity) {
      newState[input.index].quantity = input.quantity;
      setBuyState(newState);
    }
    // newState.push({
    //   art: input.art,
    //   product: input.product,
    //   quantity: input.quantity,
    // });
    setBuyState(newState);
    localStorage.setItem("buyState", JSON.stringify(newState));
  }

  function deleteItemInBuyState(input) {
    const newState = [...buyState];
    const filterState = newState.filter((buy, index) => index !== input.id);
    setBuyState(filterState);
    localStorage.setItem("buyState", JSON.stringify(filterState));
    setOpen(true);
    setMessage("Item eliminado correctamente");
  }

  function deleteProductInItem(input) {
    const newState = [...buyState];
    const item = newState.findIndex((buy, index) => index === input.id);
    if (input.type === "product") {
      newState[item].product = undefined;
    } else {
      newState[item].art = undefined;
    }
    const filterState = newState.filter(
      (item) => item.art !== undefined || item.product !== undefined
    );
    setBuyState(filterState);
    if (
      newState[item].product == undefined &&
      newState[item].art == undefined
    ) {
      const filter = newState.filter((buy, index) => index !== input.id);
      localStorage.setItem("buyState", JSON.stringify(filter));
    } else {
      localStorage.setItem("buyState", JSON.stringify(buyState));
    }
  }

  return (
    <>
      <Switch>
        <Route path="/iniciar">
          <Login />
        </Route>

        {/* Admin Routes */}
        <Route path="/inicio-admin-prix">
          <AdminLogin />
        </Route>

        <Route path="/admin/dashboard">
          <AdminMain />
        </Route>

        <Route path="/admin">
          <AdminMain />
        </Route>

        <Route path="/admin/user/create">
          <AdminMain />
        </Route>

        <Route path="/admin/users/read">
          <AdminMain />
        </Route>

        <Route exact path="/user/update/:userId" component={AdminMain} />

        <Route path="/admin/product/create">
          <AdminMain />
        </Route>

        <Route path="/admin/products/read">
          <AdminMain />
        </Route>

        <Route exact path="/product/update/:productId" component={AdminMain} />

        <Route
          exact
          path="/product/:productId/variant/create"
          component={AdminMain}
        />

        <Route
          exact
          path="/product/:productId/variants/read"
          component={AdminMain}
        />

        <Route path="/admin/consumer/create">
          <AdminMain />
        </Route>

        <Route path="/admin/consumers/read">
          <AdminMain />
        </Route>

        <Route
          exact
          path="/consumer/update/:consumerId"
          component={AdminMain}
        />

        {/* END Admin Routes */}
        <Route path="/productos">
          <Products
            buyState={buyState}
            addItemToBuyState={addItemToBuyState}
            isOpenAssociateArt={isOpenAssociateArt}
            setIsOpenAssociateArt={setIsOpenAssociateArt}
            setSelectedArtToAssociate={setSelectedArtToAssociate}
            selectedArtToAssociate={selectedArtToAssociate}
            AssociateProduct={AssociateProduct}
          />
        </Route>

        <Route path="/galeria">
          <Gallery
            buyState={buyState}
            addItemToBuyState={addItemToBuyState}
            isOpenAssociateProduct={isOpenAssociateProduct}
            setIsOpenAssociateProduct={setIsOpenAssociateProduct}
            setSelectedProductToAssociate={setSelectedProductToAssociate}
            selectedProductToAssociate={selectedProductToAssociate}
            AssociateProduct={AssociateProduct}
          />
        </Route>

        <Route path="/shopping">
          <ShoppingPage
            buyState={buyState}
            deleteItemInBuyState={deleteItemInBuyState}
            deleteProductInItem={deleteProductInItem}
            setSelectedArtToAssociate={setSelectedArtToAssociate}
            changeQuantity={changeQuantity}
            valuesConsumerForm={valuesConsumerForm}
            setValuesConsumerForm={setValuesConsumerForm}
            // onCreateConsumer={props.onCreateConsumer}
            // isProcessed={isProcessed}
            // step={step}
          />
        </Route>

        <Route path="/registrar/prixer">
          <PrixerRegistration />
        </Route>

        <Route path="/registrar">
          <Register />
        </Route>

        <Route path="/cambio-contraseña">
          <PasswordChange />
        </Route>

        <Route path="/olvido-contraseña">
          <ForgotPassword />
        </Route>

        <Route exact path="/recuperar/:token" component={ResetPassword} />

        <Route exact path="/:username/art/:artId" component={FullscreenPhoto} />

        <Route exact path="/:username" component={PrixerProfile} />

        <Route path="/prixer-profile">
          <PrixerProfile />
        </Route>

        <Route path="/">
          <Home deleteItemInBuyState={deleteItemInBuyState} />
        </Route>
        <Route component={Home} />
      </Switch>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export default App;
