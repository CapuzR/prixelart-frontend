import React, { useEffect, useState } from "react";
import axios from "axios";

import "./App.css";
import Login from "./login/loginPage";
import AdminLogin from "./adminLogin/adminLoginPage";
import AdminMain from "./admin/adminMain/adminMain";
import Register from "./register/userRegistration";
import PrixerRegistration from "./register/prixerRegistration";
import PrixerProfile from "./prixerProfile/prixerProfile";
import FullscreenPhoto from "./prixerProfile/fullscreenPhoto/fullscreenPhoto";
import Home from "./home/home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gallery from "./gallery/gallery";
import Products from "./products/productsCatalog";
import ShoppingPage from "./shoppingCart/shoppingPage";
import expire from "./utils/expire";
import PasswordChange from "./prixerProfile/passwordChange/passwordChange";
import ForgotPassword from "./prixerProfile/passwordReset/forgotPassword";
import ResetPassword from "./prixerProfile/passwordReset/passwordReset";
import PrixerStats from "../src/prixerProfile/prixerStats";

import { Snackbar } from "@mui/material";
import Orders from "./admin/adminMain/orders/orders";
import OrderForm from "./shoppingCart/orderForm";

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
  const [valuesConsumerForm, setValuesConsumerForm] = useState("");
  const [prixer, setPrixer] = useState(null);
  const [fullArt, setFullArt] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [admins, setAdmins] = useState();
  const [sellers, setSellers] = useState();
  const [dollarValue, setDollarValue] = useState("1");

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  const readDollarValue = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/dollarValue/read";
    await axios.get(base_url).then((response) => {
      if (response.data.dollarValue !== undefined) {
        setDollarValue(response.data.dollarValue);
      } else return;
    });
  };
  const loadAdmins = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/admin/read-all";
    try {
      const rowState = await axios.post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      );
      setAdmins(rowState.data);

      let sellersTeam = rowState.data.filter(
        (admin) => admin.area === "Ventas"
      );
      let team = [];
      sellersTeam.map((admin) => {
        team.push(admin.firstname + " " + admin.lastname);
      });
      setSellers(team);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    readDollarValue();
    // loadAdmins();
  }, []);

  useEffect(() => {
    setInterval(() => {
      expire("token", "tokenExpire");
    }, 60000);
  }, []);

  const updateDollarValue = () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/dollarValue/update";
    const body = {
      adminToken: localStorage.getItem("adminTokenV"),
      dollarValue: dollarValue,
    };
    axios.post(base_url, body);
  };

  function addItemToBuyState(input) {
    const newState = [...buyState];
    if (input.type === "product") {
      newState.push({
        art: undefined,
        product: input.item,
      });
    } else if (input.type === "art") {
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
        ? "Producto agregado al carrito correctamente, selecciona un arte que desees asociar."
        : "Arte agregado al carrito correctamente, selecciona un producto que desees asociar."
    );
  }
  function AssociateProduct(input) {
    const newState = buyState;
    if (input.type === "product") {
      newState[input.index].product = input.item;
      newState[input.index].quantity = 1;
      setBuyState(newState);
    } else if (input.type === "art") {
      newState[input.index].art = input.item;
      newState[input.index].quantity = 1;
      setBuyState(newState);
    }
    localStorage.setItem("buyState", JSON.stringify(newState));
    setOpen(true);
    setMessage(
      input.type === "product"
        ? "Producto asociado correctamente."
        : "Arte asociado correctamente."
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
      <Routes>
        <Route path="/iniciar" element={<Login />} />
        {/* <Login />
          </Route> */}

        {/* Admin Routes */}
        <Route path="/inicio-admin-prix" element={<AdminLogin />} />

        {/* <Route path="/admin/dashboard">
            <AdminMain
              dollarValue={dollarValue}
              setDollarValue={setDollarValue}
              updateDollarValue={updateDollarValue}
              setMessage={setMessage}
              setOpen={setOpen}
            />
          </Route> */}

        <Route
          path="/admin"
          element={
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
              valuesConsumerForm={valuesConsumerForm}
              setValuesConsumerForm={setValuesConsumerForm}
              setOpen={setOpen}
              setMessage={setMessage}
              addItemToBuyState={addItemToBuyState}
              dollarValue={dollarValue}
              setDollarValue={setDollarValue}
              updateDollarValue={updateDollarValue}
              admins={admins}
              sellers={sellers}
            />
          }
        />

        {/* <Route path="/admin/user/create">
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

          <Route exact path="/user/update/:userId" element={AdminMain} />

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

          <Route
            exact
            path="/product/update/:productId"
            element={AdminMain}
          />

          <Route
            exact
            path="/product/:productId/variant/create"
            element={AdminMain}
          />

          <Route
            exact
            path="/product/:productId/variants/read"
            element={AdminMain}
          />

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

          <Route
            exact
            path="/consumer/update/:consumerId"
            element={AdminMain}
          /> */}

        {/* END Admin Routes */}
        <Route
          path="/productos"
          element={
            <Products
              buyState={buyState}
              addItemToBuyState={addItemToBuyState}
              isOpenAssociateArt={isOpenAssociateArt}
              setIsOpenAssociateArt={setIsOpenAssociateArt}
              setSelectedArtToAssociate={setSelectedArtToAssociate}
              changeQuantity={changeQuantity}
              selectedArtToAssociate={selectedArtToAssociate}
              selectedProductToAssociate={selectedProductToAssociate}
              deleteItemInBuyState={deleteItemInBuyState}
              deleteProductInItem={deleteProductInItem}
              AssociateProduct={AssociateProduct}
              dollarValue={dollarValue}
            />
          }
        />

        <Route
          path="/galeria"
          element={
            <Gallery
              buyState={buyState}
              addItemToBuyState={addItemToBuyState}
              isOpenAssociateProduct={isOpenAssociateProduct}
              setIsOpenAssociateProduct={setIsOpenAssociateProduct}
              setSelectedProductToAssociate={setSelectedProductToAssociate}
              selectedProductToAssociate={selectedProductToAssociate}
              selectedArtToAssociate={selectedArtToAssociate}
              setSelectedArtToAssociate={setSelectedArtToAssociate}
              deleteItemInBuyState={deleteItemInBuyState}
              deleteProductInItem={deleteProductInItem}
              changeQuantity={changeQuantity}
              AssociateProduct={AssociateProduct}
              setPrixer={setPrixer}
              prixer={prixer}
              setFullArt={setFullArt}
              fullArt={fullArt}
              setSearchResult={setSearchResult}
              searchResult={searchResult}
            />
          }
        />

        <Route
          path="/shopping"
          element={
            <ShoppingPage
              buyState={buyState}
              setBuyState={setBuyState}
              deleteItemInBuyState={deleteItemInBuyState}
              deleteProductInItem={deleteProductInItem}
              setSelectedArtToAssociate={setSelectedArtToAssociate}
              changeQuantity={changeQuantity}
              valuesConsumerForm={valuesConsumerForm}
              setValuesConsumerForm={setValuesConsumerForm}
              dollarValue={dollarValue}
              setOpen={setOpen}
              setMessage={setMessage}
            />
          }
        />

        <Route path="/registrar/prixer" element={<PrixerRegistration />} />

        <Route path="/registrar" element={<Register />} />

        <Route path="/cambio-contraseña" element={<PasswordChange />} />

        <Route path="/olvido-contraseña" element={<ForgotPassword />} />

        <Route exact path="/recuperar/:token" element={<ResetPassword />} />

        <Route
          exact
          path="/art=:artId"
          element={
            <FullscreenPhoto
              buyState={buyState}
              deleteItemInBuyState={deleteItemInBuyState}
              addItemToBuyState={addItemToBuyState}
              prixer={prixer}
              fullArt={fullArt}
              searchResult={searchResult}
              isOpenAssociateProduct={isOpenAssociateProduct}
              setIsOpenAssociateProduct={setIsOpenAssociateProduct}
              setSelectedProductToAssociate={setSelectedProductToAssociate}
              selectedProductToAssociate={selectedProductToAssociate}
              AssociateProduct={AssociateProduct}
              setBuyState={setBuyState}
              deleteProductInItem={deleteProductInItem}
              setSelectedArtToAssociate={setSelectedArtToAssociate}
              changeQuantity={changeQuantity}
              setOpen={setOpen}
              setMessage={setMessage}
            />
          }
        />

        <Route path="/:username/stats" element={<PrixerStats />} />

        <Route
          path="/:username"
          element={
            <PrixerProfile
              buyState={buyState}
              deleteItemInBuyState={deleteItemInBuyState}
              addItemToBuyState={addItemToBuyState}
              isOpenAssociateProduct={isOpenAssociateProduct}
              setIsOpenAssociateProduct={setIsOpenAssociateProduct}
              setSelectedProductToAssociate={setSelectedProductToAssociate}
              selectedProductToAssociate={selectedProductToAssociate}
              AssociateProduct={AssociateProduct}
              setBuyState={setBuyState}
              deleteProductInItem={deleteProductInItem}
              setSelectedArtToAssociate={setSelectedArtToAssociate}
              changeQuantity={changeQuantity}
              setOpen={setOpen}
              setMessage={setMessage}
              setPrixer={setPrixer}
              setFullArt={setFullArt}
              setSearchResult={setSearchResult}
            />
          }
        />

        <Route
          path="/"
          element={
            <Home
              deleteItemInBuyState={deleteItemInBuyState}
              element={Home}
              buyState={buyState}
              addItemToBuyState={addItemToBuyState}
              isOpenAssociateProduct={isOpenAssociateProduct}
              setIsOpenAssociateProduct={setIsOpenAssociateProduct}
              setSelectedProductToAssociate={setSelectedProductToAssociate}
              selectedProductToAssociate={selectedProductToAssociate}
              AssociateProduct={AssociateProduct}
              setBuyState={setBuyState}
              deleteProductInItem={deleteProductInItem}
              setSelectedArtToAssociate={setSelectedArtToAssociate}
              changeQuantity={changeQuantity}
              valuesConsumerForm={valuesConsumerForm}
              setValuesConsumerForm={setValuesConsumerForm}
              setOpen={setOpen}
              setMessage={setMessage}
              setPrixer={setPrixer}
              setFullArt={setFullArt}
              setSearchResult={setSearchResult}
              dollarValue={dollarValue}
            />
          }
        />

        {/* <Route element={Home} /> */}
      </Routes>

      <Snackbar
        open={open}
        autoHideDuration={5000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export default App;
