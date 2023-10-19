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
import { useNavigate } from "react-router-dom";
import Backdrop from "@mui/material/Backdrop";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  form: {
    height: "auto",
    padding: "15px",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function UpdatePaymentMethod(props) {
  const classes = useStyles();
  const navigate = useNavigate();
  const [active, setActive] = useState(props.paymentMethod.active);
  // const [ id, setId ] = useState(props.paymentMethod._id);
  const [name, setName] = useState(props.paymentMethod.name);
  const [instructions, setInstructions] = useState(
    props.paymentMethod.instructions
  );
  const [paymentData, setPaymentData] = useState(
    props.paymentMethod.paymentData
  );
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!instructions || !name) {
      setErrorMessage("Por favor completa todos los campos requeridos.");
      setSnackBarError(true);
    } else {
      setLoading(true);
      setButtonState(true);

      const data = {
        id: props.paymentMethod._id,
        active: active,
        name: name,
        instructions: instructions,
        paymentData: paymentData,
        adminToken: localStorage.getItem("adminTokenV"),
      };
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/payment-method/update";
      const response = await axios.put(base_url, data);
      if (response.data.success === false) {
        setLoading(false);
        setButtonState(false);
        setErrorMessage(response.data.message);
        setSnackBarError(true);
      } else {
        setErrorMessage("Actualización del método de pago exitosa.");
        setSnackBarError(true);
        navigate("/admin/payment-method/read");
      }
    }
  };

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      }
      <Title>Actualización de Método de pago</Title>
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
                      active ? setActive(false) : setActive(true);
                    }}
                  />{" "}
                  Habilitado
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl variant="outlined" xs={12} fullWidth={true}>
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
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl variant="outlined" xs={12} fullWidth={true}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  multiline
                  display="inline"
                  id="paymentData"
                  label="Datos para el pago:"
                  name="paymentData"
                  autoComplete="paymentData"
                  value={paymentData}
                  onChange={(e) => {
                    setPaymentData(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  required
                  display="inline"
                  fullWidth
                  id="instructions"
                  label="Intrucciones"
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
            disabled={buttonState}
            style={{ marginTop: 20 }}
          >
            Actualizar
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
