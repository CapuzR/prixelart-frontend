import React from "react";
import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Title from "../adminMain/Title";
import axios from "axios";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { Switch, Typography } from "@material-ui/core";
import clsx from "clsx";
import validations from "../../utils/validations";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function CreateAdminRole() {
  const classes = useStyles();
  const history = useHistory();
  const [area, setArea] = useState();
  const [detailOrder, setDetailOrder] = useState(false);
  const [detailPay, setDetailPay] = useState(false);
  const [orderStatus, setOrderStatus] = useState(false);
  const [createOrder, setCreateOrder] = useState(false);
  const [createProduct, setCreateProduct] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(false);
  const [modifyBanners, setModifyBanners] = useState(false);
  const [modifyTermsAndCo, setModifyTermsAndCo] = useState(false);
  const [createPaymentMethod, setCreatePaymentMethod] = useState(false);
  const [deletePaymentMethod, setDeletePaymentMethod] = useState(false);

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
        modifyBanners: modifyBanners,
        modifyTermsAndCo: modifyTermsAndCo,
        createPaymentMethod: createPaymentMethod,
        deletePaymentMethod: deletePaymentMethod,
      };
      const base_url = process.env.REACT_APP_BACKEND_URL + "/adminRole/create";
      const response = await axios.post(
        base_url,
        data,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      );
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
  const handleChangeModifyBanners = () => {
    setModifyBanners(!modifyBanners);
  };

  const handleChangeModifyTermsAndCo = () => {
    setModifyTermsAndCo(!modifyTermsAndCo);
  };

  const handleChangeCreatePaymentMethod = () => {
    setCreatePaymentMethod(!createPaymentMethod);
  };

  const handleChangeDeletePaymentMethod = () => {
    setDeletePaymentMethod(!deletePaymentMethod);
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
