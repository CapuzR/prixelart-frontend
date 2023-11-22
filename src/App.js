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
import { Switch, Route } from "react-router-dom";
import Gallery from "./gallery/gallery";
import Products from "./products/productsCatalog";
import ShoppingPage from "./shoppingCart/shoppingPage";
import expire from "./utils/expire";
import { makeStyles } from "@material-ui/core/styles";

import PasswordChange from "./prixerProfile/passwordChange/passwordChange";
import ForgotPassword from "./prixerProfile/passwordReset/forgotPassword";
import ResetPassword from "./prixerProfile/passwordReset/passwordReset";
import PrixerStats from "../src/prixerProfile/prixerStats";
import Snackbar from "@material-ui/core/Snackbar";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import MDEditor from "@uiw/react-md-editor";

const useStyles = makeStyles((theme) => ({
  paper2: {
    position: "absolute",
    width: "80%",
    maxHeight: 450,
    overflowY: "auto",
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: "16px 32px 24px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "justify",
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function App() {
  const classes = useStyles();

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
  const [pointedProduct, setPointedProduct] = useState();
  const [dollarValue, setDollarValue] = useState("1");
  const [permissions, setPermissions] = useState();
  const [termsAgreeVar, setTermsAgreeVar] = useState(true);
  const [value, setValue] = useState();

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
  const checkP = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/admin/CheckPermissions";
    await axios
      .post(base_url, { adminToken: localStorage.getItem("adminTokenV") })
      .then((response) => {
        if (response.data.auth === false) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminTokenV");
        } else {
          setPermissions(response.data.readedRole);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    readDollarValue();
    checkP();
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [localStorage.getItem("adminTokenV")]);

  useEffect(() => {
    setInterval(() => {
      expire("token", "tokenExpire");
    }, 60000);
  }, []);

  useEffect(() => {
    if (JSON.parse(localStorage.getItem("token"))) {
      TermsAgreeModal();
    }
  }, []);

  const TermsAgreeModal = () => {
    const GetId = JSON.parse(localStorage.getItem("token")).username;
    const base_url = process.env.REACT_APP_BACKEND_URL + "/prixer/get/" + GetId;
    axios.get(base_url).then((response) => {
      setTermsAgreeVar(response.data.termsAgree);
      getTerms();
    });
  };

  const getTerms = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/read";
    await axios
      .get(base_url)
      .then((response) => {
        setValue(response.data.terms.termsAndConditions);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSubmit = async (e, Id) => {
    e.preventDefault();
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/prixer/update-terms/" + Id;
    const response = await axios.put(
      base_url,
      { termsAgree: true },
      {
        "Content-Type": "multipart/form-data",
      }
    );
    if (response.data.success) {
      setTermsAgreeVar(true);
    }
  };

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
      <Switch>
        <Route path="/iniciar">
          <Login />
        </Route>

        {/* Admin Routes */}
        <Route path="/inicio-admin-prix">
          <AdminLogin checkP={checkP} />
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

        <Route path="/admin">
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

        <Route exact path="/user/update/:userId" component={AdminMain} />

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

        {/* <Route
          exact
          path="/product/:productId/mockup"
          component={MockUp}
        ></Route> */}

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
            changeQuantity={changeQuantity}
            selectedArtToAssociate={selectedArtToAssociate}
            selectedProductToAssociate={selectedProductToAssociate}
            deleteItemInBuyState={deleteItemInBuyState}
            deleteProductInItem={deleteProductInItem}
            AssociateProduct={AssociateProduct}
            dollarValue={dollarValue}
            pointedProduct={pointedProduct}
            setPointedProduct={setPointedProduct}
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
        </Route>

        <Route path="/shopping">
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

        <Route exact path="/art=:artId" component={FullscreenPhoto}>
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
            permissions={permissions}
          />
        </Route>

        <Route path="/:username/stats">
          <PrixerStats />
        </Route>

        <Route path="/:username">
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
        </Route>

        <Route path="/">
          <Home
            deleteItemInBuyState={deleteItemInBuyState}
            component={Home}
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
            setPointedProduct={setPointedProduct}
            pointedProduct={pointedProduct}
            permissions={permissions}
          />
        </Route>
        <Route component={Home} />
      </Switch>

      <Modal
        xl={800}
        lg={800}
        md={480}
        sm={360}
        xs={360}
        open={termsAgreeVar === false}
        onClose={termsAgreeVar === true}
      >
        <div className={classes.paper2}>
          <h2 style={{ textAlign: "center", fontWeight: "Normal" }}>
            Hemos actualizado nuestros términos y condiciones y queremos que
            estés al tanto.
          </h2>
          <div>
            <div data-color-mode="light">
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "12px",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                CONVENIO DE RELACIÓN ENTRE LOS ARTISTAS Y LA COMPAÑÍA
              </div>
              <div data-color-mode="light">
                <MDEditor.Markdown
                  source={value}
                  style={{ textAlign: "justify" }}
                />
              </div>
            </div>
          </div>
          <div style={{ justifyContent: "center", display: "flex" }}>
            <Button
              onClick={(e) => {
                handleSubmit(
                  e,
                  JSON.parse(localStorage.getItem("token")).username
                );
              }}
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submit}
              required
            >
              Acepto los nuevos términos y condiciones
            </Button>
          </div>
        </div>
      </Modal>
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
