import React, { useEffect, useState } from "react"
import axios from "axios"

import "./App.css"
import Login from "./login/loginPage"
import AdminLogin from "./adminLogin/adminLoginPage"
import AdminMain from "./admin/adminMain/adminMain"
import Register from "./register/userRegistration"
import PrixerRegistration from "./register/prixerRegistration"
import PrixerProfile from "./prixerProfile/prixerProfile"
import FullscreenPhoto from "./prixerProfile/fullscreenPhoto/fullscreenPhoto"
import Home from "./home/home"
import { Switch, Route } from "react-router-dom"
import Gallery from "./gallery/gallery"
import Products from "./products/productsCatalog"
import ShoppingPage from "./shoppingCart/shoppingPage"
import expire from "./utils/expire"
import { makeStyles } from "@material-ui/core/styles"
import Prixers from "./prixers/prixersGrid"
import PasswordChange from "./prixerProfile/passwordChange/passwordChange"
import ForgotPassword from "./prixerProfile/passwordReset/forgotPassword"
import ResetPassword from "./prixerProfile/passwordReset/passwordReset"
import PrixerStats from "../src/prixerProfile/prixerStats"
import Snackbar from "@material-ui/core/Snackbar"
import Modal from "@material-ui/core/Modal"
import Button from "@material-ui/core/Button"
import MDEditor from "@uiw/react-md-editor"
import PrixersService from "./prixerServices/prixerService"
import SoloService from "./prixerProfile/fullscreenPhoto/fullscreenService"
import TestimonialsGrid from "./testimonials/testimonialsGrid"
import Map from "./map/index"
import OrgGrid from "./sharedComponents/prixerGrid/orgGrid"
import { getComission } from "./shoppingCart/pricesFunctions"
import ChiguireHome from "./orgLanding/chiguireHome"
import ProductDetail from "./orgLanding/productDetail"
import ShoppingCartCB from "./orgLanding/shoppingCartCB"
import PrixPoduct from "./products/prixProduct"
import ReactGA from "react-ga"

ReactGA.initialize("G-0RWP9B33D8")
ReactGA.pageview(window.location)

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
}))

function App() {
  const classes = useStyles()
  const globalParams = window.location.pathname

  const [buyState, setBuyState] = useState(
    localStorage.getItem("buyState")
      ? JSON.parse(localStorage.getItem("buyState"))
      : []
  )
  const [isOpenAssociateArt, setIsOpenAssociateArt] = useState(false)
  const [isOpenAssociateProduct, setIsOpenAssociateProduct] = useState(false)
  const [selectedArtToAssociate, setSelectedArtToAssociate] =
    useState(undefined)
  const [selectedProductToAssociate, setSelectedProductToAssociate] =
    useState(undefined)
  const [valuesConsumerForm, setValuesConsumerForm] = useState("")
  const [prixer, setPrixer] = useState(null)
  const [fullArt, setFullArt] = useState(null)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [admins, setAdmins] = useState()
  const [sellers, setSellers] = useState()
  const [pointedProduct, setPointedProduct] = useState()
  const [dollarValue, setDollarValue] = useState("1")
  const [permissions, setPermissions] = useState()
  const [termsAgreeVar, setTermsAgreeVar] = useState(true)
  const [value, setValue] = useState()
  const [discountList, setDiscountList] = useState([])
  const [surchargeList, setSurchargeList] = useState([])
  const [orgs, setOrgs] = useState([])

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault()
  })

  const onCloseModal = () => {
    setTermsAgreeVar(true)
  }

  const readDollarValue = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/dollarValue/read"
    await axios.get(base_url).then((response) => {
      if (response.data.dollarValue !== undefined) {
        setDollarValue(response.data.dollarValue)
      } else return
    })
  }
  const loadAdmins = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/admin/read-all"
    try {
      const rowState = await axios.post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      setAdmins(rowState.data)

      let sellersTeam = rowState?.data?.filter(
        (admin) => admin.isSeller === true
      )
      let team = []
      sellersTeam.map((admin) => {
        team.push(admin.firstname + " " + admin.lastname)
      })
      setSellers(team)
    } catch (e) {
      console.log(e)
    }
  }

  const checkP = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/admin/CheckPermissions"
    await axios
      .post(base_url, { adminToken: localStorage.getItem("adminTokenV") })
      .then((response) => {
        if (response.data.auth === false) {
          localStorage.removeItem("adminToken")
          localStorage.removeItem("adminTokenV")
        } else {
          setPermissions(response.data.readedRole)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const getDiscounts = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/discount/read-allv2"
    await axios
      .post(base_url, { adminToken: localStorage.getItem("adminTokenV") })
      .then((response) => {
        setDiscountList(response.data.discounts)
      })
      .catch((error) => {
        console.log(error)
      })
  }
  const getSurcharges = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/surcharge/read-active"
    await axios
      .get(base_url)
      .then((response) => {
        setSurchargeList(response.data.surcharges)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  useEffect(() => {
    readDollarValue()
    checkP()
  }, [])

  useEffect(() => {
    if (localStorage.getItem("adminTokenV")) {
      loadAdmins()
    }
  }, [])

  useEffect(() => {
    if (localStorage.getItem("token")) {
      expire("token", "tokenExpire")
    } else if (localStorage.getItem("adminToken")) {
      expire("adminToken", "adminTokenExpire")
    }
  }, [])

  useEffect(() => {
    if (JSON.parse(localStorage.getItem("token"))) {
      TermsAgreeModal()
    }
  }, [])

  useEffect(() => {
    if (globalParams === ("/admin/order/read" || "/shopping")) {
      getDiscounts()
      getSurcharges()
      getORGs()
    }
  }, [])

  const getORGs = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/organization/read-all-full"
    await axios
      .get(base_url)
      .then((response) => {
        setOrgs(response.data.organizations)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const TermsAgreeModal = () => {
    const GetId = JSON.parse(localStorage.getItem("token")).username
    const base_url = process.env.REACT_APP_BACKEND_URL + "/prixer/get/" + GetId
    axios.get(base_url).then((response) => {
      setTermsAgreeVar(response.data.termsAgree)
      getTerms()
    })
  }

  const getTerms = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/read"
    await axios
      .get(base_url)
      .then((response) => {
        setValue(response.data.terms.termsAndConditions)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const handleSubmit = async (e, Id) => {
    e.preventDefault()
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/prixer/update-terms/" + Id
    const response = await axios.put(
      base_url,
      { termsAgree: true },
      {
        "Content-Type": "multipart/form-data",
      }
    )
    if (response.data.success) {
      setTermsAgreeVar(true)
    }
  }

  const updateDollarValue = () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/dollarValue/update"
    const body = {
      adminToken: localStorage.getItem("adminTokenV"),
      dollarValue: dollarValue,
    }
    axios.post(base_url, body)
  }

  function addItemToBuyState(input) {
    const newState = [...buyState]
    if (input.type === "product") {
      newState.push({
        art: undefined,
        product: input.item,
        quantity: 1,
      })
    } else if (input.type === "art") {
      newState.push({
        art: input.item,
        product: undefined,
        quantity: 1,
      })
    }
    setBuyState(newState)
    setIsOpenAssociateArt(false)
    setIsOpenAssociateProduct(false)
    localStorage.setItem("buyState", JSON.stringify(newState))
    setOpen(true)
    setMessage(
      input.type === "product"
        ? "Producto agregado al carrito correctamente, selecciona un arte que desees asociar."
        : "Arte agregado al carrito correctamente, selecciona un producto que desees asociar."
    )
  }

  const AssociateProduct = (input) => {
    let newState = JSON.parse(localStorage.getItem("buyState"))
    if (input.type === "product") {
      newState[input.index].product = input.item
      newState[input.index].quantity = 1
    } else if (input.type === "art") {
      newState[input.index].art = input.item
    }
    setBuyState(newState)
    localStorage.setItem("buyState", JSON.stringify(newState))
    setOpen(true)
    setMessage(
      input.type === "product"
        ? "Producto asociado correctamente."
        : "Arte asociado correctamente."
    )
  }

  const checkOrgs = (art) => {
    const org = orgs?.find((el) => el.username === art.owner)
    return org
  }

  function changeQuantity(input) {
    const newState = [...buyState]
    if (input.quantity) {
      newState[input.index].product.comission = getComission(
        newState[input.index].product,
        newState[input.index].art,
        false,
        1,
        discountList,
        input.quantity,
        input.prixer,
        surchargeList,
        checkOrgs(newState[input.index].art),
        input.consumerType
      )
      newState[input.index].quantity = input.quantity
      setBuyState(newState)
    }
    setBuyState(newState)
    localStorage.setItem("buyState", JSON.stringify(newState))
  }

  function deleteItemInBuyState(input) {
    const newState = [...buyState]
    const filterState = newState.filter((buy, index) => index !== input.id)
    setBuyState(filterState)
    localStorage.setItem("buyState", JSON.stringify(filterState))
    setOpen(true)
    setMessage("Item eliminado correctamente")
  }

  function deleteProductInItem(input) {
    const newState = [...buyState]
    const item = newState.findIndex((buy, index) => index === input.id)
    if (input.type === "product") {
      newState[item].product = undefined
    } else {
      newState[item].art = undefined
    }
    const filterState = newState.filter(
      (item) => item.art !== undefined || item.product !== undefined
    )
    setBuyState(filterState)
    if (
      newState[item].product == undefined &&
      newState[item].art == undefined
    ) {
      const filter = newState.filter((buy, index) => index !== input.id)
      localStorage.setItem("buyState", JSON.stringify(filter))
    } else {
      localStorage.setItem("buyState", JSON.stringify(buyState))
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
          <AdminLogin
            checkP={checkP}
            loadAdmins={loadAdmins}
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

        <Route
          exact
          path="/user/update/:userId"
          component={AdminMain}
        />

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
          component={AdminMain}
        />

        {/* <Route
          exact
          path="/product/:productId/variant/create"
          component={AdminMain}
        /> */}

        {/* <Route
          exact
          path="/product/:productId/variants/read"
          component={AdminMain}
        /> */}

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
            permissions={permissions}
          />
        </Route>
        <Route path="/producto=:id">
          <PrixPoduct
            addItemToBuyState={addItemToBuyState}
            isOpenAssociateProduct={isOpenAssociateProduct}
            setIsOpenAssociateProduct={setIsOpenAssociateProduct}
            setSelectedProductToAssociate={setSelectedProductToAssociate}
            selectedProductToAssociate={selectedProductToAssociate}
            selectedArtToAssociate={selectedArtToAssociate}
            setSelectedArtToAssociate={setSelectedArtToAssociate}
            setIsOpenAssociateArt={setIsOpenAssociateArt}
            isOpenAssociateArt={isOpenAssociateArt}
            setSearchResult={setSearchResult}
            searchResult={searchResult}
            setFullArt={setFullArt}
            fullArt={fullArt}
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
            permissions={permissions}
            setOpen={setOpen}
            setMessage={setMessage}
          />
        </Route>
        <Route path="/prixers">
          <Prixers
            buyState={buyState}
            setPrixer={setPrixer}
            prixer={prixer}
          />
        </Route>
        <Route path="/organizaciones">
          <OrgGrid
            buyState={buyState}
            setPrixer={setPrixer}
            prixer={prixer}
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
            surchargeList={surchargeList}
            dollarValue={dollarValue}
            setOpen={setOpen}
            setMessage={setMessage}
          />
        </Route>

        <Route path="/servicios">
          <PrixersService
            buyState={buyState}
            setPrixer={setPrixer}
            prixer={prixer}
            permissions={permissions}
          />
        </Route>

        <Route path="/service=:serviceId">
          <SoloService
            buyState={buyState}
            setPrixer={setPrixer}
            prixer={prixer}
            permissions={permissions}
          />
        </Route>
        <Route path="/testimonios">
          <TestimonialsGrid
            buyState={buyState}
            setPrixer={setPrixer}
            prixer={prixer}
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

        <Route
          exact
          path="/recuperar/:token"
          component={ResetPassword}
        />

        <Route
          exact
          path="/art=:artId"
          component={FullscreenPhoto}
        >
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

        <Route path="/wip/map">
          <Map />
        </Route>

        <Route path="/:username/stats">
          <PrixerStats />
        </Route>

        <Route path="/prixer=:username">
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
            permissions={permissions}
          />
        </Route>

        <Route path="/org=:username">
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
            permissions={permissions}
          />
        </Route>
        <Route path="/ChiguireBipolar/carrito">
          <ShoppingCartCB />
        </Route>
        <Route path="/ChiguireBipolar/item=:id">
          <ProductDetail />
        </Route>
        <Route path="/ChiguireBipolar">
          <ChiguireHome />
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
        open={!termsAgreeVar}
        onClose={onCloseModal}
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
                )
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
  )
}

export default App
