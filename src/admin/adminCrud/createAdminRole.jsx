import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "classnames";
import axios from "axios";

import makeStyles from "@mui/styles/makeStyles";

import {
  TextField,
  Button,
  Grid,
  Snackbar,
  CircularProgress,
  FormControl,
  Switch,
  Typography,
} from "@mui/material";

import Title from "../adminMain/Title";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function CreateAdminRole() {
  const classes = useStyles();
  const history = useNavigate();
  const [area, setArea] = useState();
  const [detailOrder, setDetailOrder] = useState(false);
  const [detailPay, setDetailPay] = useState(false);
  const [orderStatus, setOrderStatus] = useState(false);
  const [createOrder, setCreateOrder] = useState(false);
  const [createProduct, setCreateProduct] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(false);
  const [createDiscount, setCreateDiscount] = useState(false);
  const [deleteDiscount, setDeleteDiscount] = useState(false);
  const [modifyBanners, setModifyBanners] = useState(false);
  const [modifyDollar, setModifyDollar] = useState(false);
  const [modifyTermsAndCo, setModifyTermsAndCo] = useState(false);
  const [createPaymentMethod, setCreatePaymentMethod] = useState(false);
  const [deletePaymentMethod, setDeletePaymentMethod] = useState(false);
  const [createShippingMethod, setCreateShippingMethod] = useState(false);
  const [deleteShippingMethod, setDeleteShippingMethod] = useState(false);
  const [prixerBan, setPrixerBan] = useState(false);
  const [createTestimonial, setCreateTestimonial] = useState(false);
  const [deleteTestimonial, setDeleteTestimonial] = useState(false);
  const [modifyAdmins, setModifyAdmins] = useState(false);
  const [setPrixerBalance, setSetPrixerBalance] = useState(false);
  const [readMovements, setReadMovements] = useState(false);
  const [createConsumer, setCreateConsumer] = useState(false);
  const [readConsumers, setReadConsumers] = useState(false);
  const [deleteConsumer, setDeleteConsumer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!area) {
      setErrorMessage("Por favor indica el área");
      setSnackBarError(true);
      e.preventDefault();
    } else {
      setLoading(true);
      setButtonState(true);
      const data = {
        area: area,
        detailOrder: detailOrder,
        detailPay: detailPay,
        orderStatus: orderStatus,
        createOrder: createOrder,
        createProduct: createProduct,
        deleteProduct: deleteProduct,
        createDiscount: createDiscount,
        deleteDiscount: deleteDiscount,
        modifyBanners: modifyBanners,
        modifyDollar: modifyDollar,
        modifyTermsAndCo: modifyTermsAndCo,
        createPaymentMethod: createPaymentMethod,
        deletePaymentMethod: deletePaymentMethod,
        createShippingMethod: createShippingMethod,
        deleteShippingMethod: deleteShippingMethod,
        prixerBan: prixerBan,
        createTestimonial: createTestimonial,
        deleteTestimonial: deleteTestimonial,
        modifyAdmins: modifyAdmins,
        setPrixerBalance: setPrixerBalance,
        readMovements: readMovements,
        createConsumer: createConsumer,
        readConsumers: readConsumers,
        deleteConsumer: deleteConsumer,
        adminToken: localStorage.getItem("adminTokenV"),
      };
      const base_url = process.env.REACT_APP_BACKEND_URL + "/adminRole/create";
      const response = await axios.post(base_url, data, {
        withCredentials: true,
      });
      if (response.data.success === false) {
        setLoading(false);
        setButtonState(false);
        setErrorMessage(response.data.message);
        setSnackBarError(true);
      } else {
        setErrorMessage("Registro de Admin exitoso.");
        setSnackBarError(true);
        history.push({ pathname: "/admin/user/read" });
      }
    }
  };
  const handleChangeDetailOrder = () => {
    setDetailOrder(!detailOrder);
  };

  const handleChangeDetailPay = () => {
    setDetailPay(!detailPay);
  };

  const handleChangeOrderStatus = () => {
    setOrderStatus(!orderStatus);
  };

  const handleChangeCreateOrder = () => {
    setCreateOrder(!createOrder);
  };
  const handleChangeCreateProduct = () => {
    setCreateProduct(!createProduct);
  };

  const handleChangeDeleteProduct = () => {
    setDeleteProduct(!deleteProduct);
  };

  const handleChangeCreateDiscount = () => {
    setCreateDiscount(!createDiscount);
  };

  const handleChangeDeleteDiscount = () => {
    setDeleteDiscount(!deleteDiscount);
  };

  const handleChangeModifyBanners = () => {
    setModifyBanners(!modifyBanners);
  };

  const handleChangeModifyTermsAndCo = () => {
    setModifyTermsAndCo(!modifyTermsAndCo);
  };

  const handleChangeModifyDollar = () => {
    setModifyDollar(!modifyDollar);
  };

  const handleChangeCreatePaymentMethod = () => {
    setCreatePaymentMethod(!createPaymentMethod);
  };

  const handleChangeDeletePaymentMethod = () => {
    setDeletePaymentMethod(!deletePaymentMethod);
  };

  const handleChangeCreateShippingMethod = () => {
    setCreateShippingMethod(!createShippingMethod);
  };

  const handleChangeDeleteShippingMethod = () => {
    setDeleteShippingMethod(!deleteShippingMethod);
  };

  const handleChangePrixerBan = () => {
    setPrixerBan(!prixerBan);
  };

  const handleChangeCreateTestimonial = () => {
    setCreateTestimonial(!createTestimonial);
  };

  const handleChangeDeleteTestimonial = () => {
    setDeleteTestimonial(!deleteTestimonial);
  };

  const handleChangeModifyAdmins = () => {
    setModifyAdmins(!modifyAdmins);
  };

  const handleChangeSetPrixerBalance = () => {
    setSetPrixerBalance(!setPrixerBalance);
  };

  const handleChangeSetReadMovements = () => {
    setReadMovements(!readMovements);
  };

  const handleChangeCreateConsumer = () => {
    setCreateConsumer(!createConsumer);
  };

  const handleChangeReadConsumers = () => {
    setReadConsumers(!readConsumers);
  };

  const handleChangeDeleteConsumer = () => {
    setDeleteConsumer(!deleteConsumer);
  };

  return (
    <React.Fragment>
      {loading && (
        <div class={classes.loading}>
          <CircularProgress />
        </div>
      )}
      <Title>Crear Rol de Administrador</Title>
      <form className={classes.form} noValidate onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl
              className={clsx(classes.margin, classes.textField)}
              variant="outlined"
              style={{ width: "40%", marginRight: "20px", marginLeft: "20px" }}
            >
              <TextField
                variant="outlined"
                required
                // fullWidth
                label="Área"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                }}
              />
            </FormControl>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              marginRight: "20px",
              marginLeft: "20px",
            }}
          >
            <Typography
              varaint="p"
              color="secondary"
              style={{ marginLeft: "20px" }}
            >
              Órdenes
            </Typography>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para crear orden de compra</Typography>
                <Switch
                  checked={createOrder}
                  onChange={handleChangeCreateOrder}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para ver detalles de la orden</Typography>
                <Switch
                  checked={detailOrder}
                  onChange={handleChangeDetailOrder}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para modificar status de pago</Typography>
                <Switch
                  checked={detailPay}
                  onChange={handleChangeDetailPay}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para modificar status de orden de compra
                </Typography>
                <Switch
                  checked={orderStatus}
                  onChange={handleChangeOrderStatus}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              marginRight: "20px",
              marginLeft: "20px",
            }}
          >
            <Typography
              varaint="p"
              color="secondary"
              style={{ marginLeft: "20px" }}
            >
              Productos
            </Typography>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para crear y editar productos</Typography>
                <Switch
                  checked={createProduct}
                  onChange={handleChangeCreateProduct}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para eliminar productos</Typography>
                <Switch
                  checked={deleteProduct}
                  onChange={handleChangeDeleteProduct}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para crear descuentos</Typography>
                <Switch
                  checked={createDiscount}
                  onChange={handleChangeCreateDiscount}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para eliminar descuentos</Typography>
                <Switch
                  checked={deleteDiscount}
                  onChange={handleChangeDeleteDiscount}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              marginRight: "20px",
              marginLeft: "20px",
              marginTop: "20px",
            }}
          >
            <Typography
              varaint="p"
              color="secondary"
              style={{ marginLeft: "20px" }}
            >
              Preferencias
            </Typography>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para actualizar valor del dolar</Typography>
                <Switch
                  checked={modifyDollar}
                  onChange={handleChangeModifyDollar}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para modificar banners</Typography>
                <Switch
                  checked={modifyBanners}
                  onChange={handleChangeModifyBanners}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para modificar términos y condiciones
                </Typography>
                <Switch
                  checked={modifyTermsAndCo}
                  onChange={handleChangeModifyTermsAndCo}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              marginRight: "20px",
              marginLeft: "20px",
              marginTop: "20px",
            }}
          >
            <Typography
              varaint="p"
              color="secondary"
              style={{ marginLeft: "20px" }}
            >
              Métodos de Pago
            </Typography>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para crear y modificar métodos de pago
                </Typography>
                <Switch
                  checked={createPaymentMethod}
                  onChange={handleChangeCreatePaymentMethod}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para eliminar métodos de pago</Typography>
                <Switch
                  checked={deletePaymentMethod}
                  onChange={handleChangeDeletePaymentMethod}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              marginRight: "20px",
              marginLeft: "20px",
              marginTop: "20px",
            }}
          >
            <Typography
              varaint="p"
              color="secondary"
              style={{ marginLeft: "20px" }}
            >
              Métodos de Envío
            </Typography>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para crear y modificar métodos de envío
                </Typography>
                <Switch
                  checked={createShippingMethod}
                  onChange={handleChangeCreateShippingMethod}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para eliminar métodos de pago</Typography>
                <Switch
                  checked={deleteShippingMethod}
                  onChange={handleChangeDeleteShippingMethod}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              marginRight: "20px",
              marginLeft: "20px",
              marginTop: "20px",
            }}
          >
            <Typography
              varaint="p"
              color="secondary"
              style={{ marginLeft: "20px" }}
            >
              Prixers
            </Typography>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para banear Prixer </Typography>
                <Switch
                  checked={prixerBan}
                  onChange={handleChangePrixerBan}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para modificar balance de Prixer
                </Typography>
                <Switch
                  checked={setPrixerBalance}
                  onChange={handleChangeSetPrixerBalance}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para leer movimientos</Typography>
                <Switch
                  checked={readMovements}
                  onChange={handleChangeSetReadMovements}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              marginRight: "20px",
              marginLeft: "20px",
              marginTop: "20px",
            }}
          >
            <Typography
              varaint="p"
              color="secondary"
              style={{ marginLeft: "20px" }}
            >
              Testimonios
            </Typography>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para crear, modificar, mostrar y ordenar testimonios{" "}
                </Typography>
                <Switch
                  checked={createTestimonial}
                  onChange={handleChangeCreateTestimonial}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para eliminar testimonios </Typography>
                <Switch
                  checked={deleteTestimonial}
                  onChange={handleChangeDeleteTestimonial}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              marginRight: "20px",
              marginLeft: "20px",
              marginTop: "20px",
            }}
          >
            <Typography
              varaint="p"
              color="secondary"
              style={{ marginLeft: "20px" }}
            >
              Usuarios{" "}
            </Typography>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para crear, modificar y eliminar Admins{" "}
                </Typography>
                <Switch
                  checked={modifyAdmins}
                  onChange={handleChangeModifyAdmins}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              marginRight: "20px",
              marginLeft: "20px",
              marginTop: "20px",
            }}
          >
            <Typography
              varaint="p"
              color="secondary"
              style={{ marginLeft: "20px" }}
            >
              Clientes frecuentes
            </Typography>
            <div>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para crear y modificar clientes frecuentes
                </Typography>
                <Switch
                  checked={createConsumer}
                  onChange={handleChangeCreateConsumer}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para leer clientes frecuentes</Typography>
                <Switch
                  checked={readConsumers}
                  onChange={handleChangeReadConsumers}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                style={{
                  width: "90%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para eliminar clientes frecuentes
                </Typography>
                <Switch
                  checked={deleteConsumer}
                  onChange={handleChangeDeleteConsumer}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={buttonState}
            >
              Crear
            </Button>
          </Grid>
        </Grid>
      </form>
      <Snackbar
        open={snackBarError}
        autoHideDuration={1000}
        message={errorMessage}
        className={classes.snackbar}
      />
    </React.Fragment>
  );
}
