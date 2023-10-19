import React from "react";
import { useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import Title from "../adminMain/Title";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import clsx from "classnames";
import Checkbox from "@mui/material/Checkbox";
import Backdrop from "@mui/material/Backdrop";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  form: {
    padding: "15px",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function CreatePaymentMethod(props) {
  const classes = useStyles();
  const [active, setActive] = useState(true);
  const [name, setName] = useState();
  const [instructions, setInstructions] = useState();
  const [paymentData, setPaymentData] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      active: active,
      name: name,
      createdOn: new Date(),
      createdBy: JSON.parse(localStorage.getItem("adminToken")),
      instructions: instructions,
      paymentData: paymentData,
      adminToken: localStorage.getItem("adminTokenV"),
    };

    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/payment-method/create";
    const response = await axios.post(base_url, data);
    if (response.data.success === false) {
      setLoading(false);
      setErrorMessage(response.data.message);
      setSnackBarError(true);
    } else {
      setErrorMessage("Registro del método de pago exitoso.");
      setSnackBarError(true);
      setActive(true);
      setName("");
      setInstructions("");
      setPaymentData("");
      navigate({ pathname: "/admin/payment-method/read" });
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      }
      <Title>Agregar método de pago</Title>
      <form className={classes.form} noValidate onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container xs={6}>
                <Grid item xs={12}>
                  <Checkbox
                    checked={active}
                    color="primary"
                    inputProps={{ "aria-label": "secondary checkbox" }}
                    onChange={() => {
                      setActive(!active);
                    }}
                  />
                  Habilitado
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                variant="outlined"
                required
                fullWidth
                display="inline"
                id="name"
                label="Nombre"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={6}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={5}
                  id="paymentData"
                  label="Datos para el pago"
                  name="paymentData"
                  autoComplete="paymentData"
                  value={paymentData}
                  onChange={(e) => {
                    setPaymentData(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  required
                  multiline
                  fullWidth
                  minRows={5}
                  id="instructions"
                  label="Instrucciones"
                  name="instructions"
                  autoComplete="instructions"
                  value={instructions}
                  onChange={(e) => {
                    setInstructions(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!name}
            style={{ marginTop: 20 }}
          >
            Crear
          </Button>
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
