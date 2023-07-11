import { makeStyles } from "@material-ui/core/styles";
import React, { useState, Suspense } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import LocalPhoneIcon from "@material-ui/icons/LocalPhone";
import EmailIcon from "@material-ui/icons/Email";
import HomeIcon from "@material-ui/icons/Home";
import BusinessIcon from "@material-ui/icons/Business";
import UtilVals from "../utils/validations";
import Accordion from "@material-ui/core/Accordion";
import Typography from "@material-ui/core/Typography";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import validations from "./validations";
import InfoIcon from "@material-ui/icons/Info";
import Tooltip from "@material-ui/core/Tooltip";
import { useEffect } from "react";
import axios from "axios";
import { Snackbar } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  gridInput: {
    display: "flex",
    width: "100%",
    marginBottom: "12px",
  },
  textField: {
    marginRight: "8px",
  },
}));
function ConsumerForm(props) {
  const classes = useStyles();
  const [shippingDataCheck, setShippingDataCheck] = useState(true);
  const [billingDataCheck, setBillingDataCheck] = useState(true);
  const [billingShDataCheck, setBillingShDataCheck] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [shippingList, setShippingList] = useState();
  const [openTooltip, setOpenTooltip] = useState(false);
  const [openTooltip2, setOpenTooltip2] = useState(false);
  const [open, setOpen] = useState(false);
  const [openTooltipPh, setOpenTooltipPh] = useState(false);
  const [openTooltipPh2, setOpenTooltipPh2] = useState(false);
  const [openTooltipPh3, setOpenTooltipPh3] = useState(false);
  let today = new Date();
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const monthsOrder = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];
  const days = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];

  let ProdTimes = props.buyState.map((item) => {
    if (item.product && item.art && item.product.productionTime !== undefined) {
      return item.product.productionTime;
    }
  });

  let orderedProdT = ProdTimes.sort(function (a, b) {
    if (a.toLowerCase() > b.toLowerCase()) {
      return 1;
    }
    if (a.toLowerCase() < b.toLowerCase()) {
      return -1;
    }
    return 0;
  });

  let readyDate = new Date(
    today.setDate(today.getDate() + Number(orderedProdT[0]))
  );

  if (readyDate.getDay() === 6) {
    readyDate = new Date(today.setDate(today.getDate() + 2));
  } else if (readyDate.getDay() === 0) {
    readyDate = new Date(today.setDate(today.getDate() + 1));
  }

  const stringReadyDate =
    readyDate.getFullYear() +
    "-" +
    monthsOrder[readyDate.getMonth()] +
    "-" +
    readyDate.getDate();

  useEffect(() => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/shipping-method/read-all-v2";
    axios
      .get(base_url)
      .then((response) => {
        setShippingList(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleAccordionExpansion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleShippingDataCheck = () => {
    if (shippingDataCheck) {
      props.setValues({
        ...props.values,
        shippingName: "",
        shippingLastName: "",
        shippingPhone: "",
        shippingAddress: "",
      });
    } else {
      props.setValues({
        ...props.values,
        shippingName: props.values.name,
        shippingLastName: props.values.lastName,
        shippingPhone: props.values.phone,
        shippingAddress: props.values.address,
      });
    }

    setShippingDataCheck(!shippingDataCheck);
  };

  const handleBillingDataCheck = () => {
    if (shippingDataCheck) {
      props.setValues({
        ...props.values,
        billingName: "",
        billingLastName: "",
        billingPhone: "",
        billingAddress: "",
      });
    } else {
      props.setValues({
        ...props.values,
        billingName: props.values.shippingName,
        billingLastName: props.values.shippingLastName,
        billingPhone: props.values.shippingPhone,
        billingAddress: props.values.shippingAddress,
      });
    }

    setShippingDataCheck(!shippingDataCheck);
  };

  const handleBillingShDataCheck = () => {
    if (billingShDataCheck) {
      props.setValues({
        ...props.values,
        billingName: "",
        billingLastName: "",
        billingPhone: "",
        billingAddress: "",
      });
    } else {
      props.setValues({
        ...props.values,
        shippingName: props.values.shippingName,
        shippingLastName: props.values.shippingLastName,
        shippingPhone: props.values.shippingPhone,
        shippingAddress: props.values.shippingAddress,
      });
    }

    setShippingDataCheck(!shippingDataCheck);
  };

  const selectShDate = (value) => {
    // let date = Date(value);
    // console.log(date)
    if (value < stringReadyDate) {
      props.setOpen(true);
      props.setMessage(
        "Si lo requieres antes, coméntalo en el campo de observaciones y un asesor se comunicará contigo."
      );
    }
    // } else
    props.setValues({
      ...props.values,
      shippingDate: value,
    });
  };

  return (
    <>
      <div>
        <Accordion
          expanded={expanded === "basic"}
          onChange={handleAccordionExpansion("basic")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Datos Básicos</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form autoComplete="off">
              <Grid container>
                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    label="Nombre"
                    fullWidth
                    className={classes.textField}
                    value={props.values?.name ? props.values.name : ""}
                    onChange={(e) =>
                      props.setValues({ ...props.values, name: e.target.value })
                    }
                    required
                    error={!validations.isAValidName(props.values?.name)}
                    helperText={
                      !validations.isAValidName(props.values?.name) &&
                      props.values.name !== undefined &&
                      "Formato no válido."
                    }
                    margin="normal"
                  />
                </Grid>
                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Apellido"
                    fullWidth
                    className={classes.textField}
                    value={props.values?.lastName ? props.values.lastName : ""}
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        lastName: e.target.value,
                      })
                    }
                    error={!validations.isAValidName(props.values?.lastName)}
                    helperText={
                      !validations.isAValidName(props.values?.lastName) &&
                      props.values.lastName !== undefined &&
                      "Formato no válido."
                    }
                    margin="normal"
                  />
                </Grid>

                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="CI o RIF"
                    fullWidth
                    className={classes.textField}
                    value={props.values?.ci ? props.values.ci : ""}
                    onChange={(e) =>
                      props.setValues({ ...props.values, ci: e.target.value })
                    }
                    required
                    error={
                      props.values?.ci !== undefined &&
                      !validations.isAValidCi(props.values?.ci)
                    }
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <Tooltip
                          onClick={(e) => setOpenTooltip(!openTooltip)}
                          open={openTooltip}
                          onClose={(leaveDelay) => setOpenTooltip(false)}
                          title={
                            !validations.isAValidCi(props.values?.ci) &&
                            props.values?.ci !== undefined
                              ? "ej: V12345679 ó 12345678 \n" +
                                "Formato no válido."
                              : "ej: V12345679 ó 12345678"
                          }
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
                <Grid
                  item
                  lg={5}
                  md={5}
                  sm={5}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Telefono"
                    fullWidth
                    className={classes.textField}
                    value={props.values?.phone ? props.values.phone : ""}
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        phone: e.target.value,
                      })
                    }
                    required
                    margin="normal"
                    error={
                      props.values?.phone !== undefined &&
                      !validations.isAValidPhoneNum(props.values?.phone)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalPhoneIcon color="secondary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <Tooltip
                          onClick={(e) => setOpenTooltipPh(!openTooltipPh)}
                          open={openTooltipPh}
                          onClose={(leaveDelay) => setOpenTooltipPh(false)}
                          title={
                            !validations.isAValidPhoneNum(
                              props.values?.phone
                            ) && props.values?.phone !== undefined ? (
                              <div>
                                <div>
                                  ej: 584141234567 ó +584141234567 ó 04143201028
                                </div>
                                Formato no válido.
                              </div>
                            ) : (
                              "ej: 584141234567 ó +584141234567 ó 04143201028"
                            )
                          }
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
                <Grid
                  item
                  lg={7}
                  md={7}
                  sm={7}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    label="Correo"
                    fullWidth
                    className={classes.textField}
                    value={props.values?.email ? props.values.email : ""}
                    helperText={
                      !validations.isAValidEmail(props.values?.email) &&
                      props.values.email !== undefined &&
                      "Formato no válido."
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        email: e.target.value,
                      })
                    }
                    error={!validations.isAValidEmail(props.values?.email)}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid
                  item
                  lg={12}
                  md={12}
                  sm={12}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    fullWidth
                    label="Dirección"
                    className={classes.textField}
                    multiline
                    minRows={3}
                    helperText="Incluir todos los detalles posibles, incluidas referencias."
                    value={props.values?.address ? props.values.address : ""}
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        address: e.target.value,
                      })
                    }
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </form>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expanded === "shipping"}
          onChange={handleAccordionExpansion("shipping")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Datos de Entrega</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form autoComplete="off">
              <Grid container>
                <Grid item lg={12} md={12} sm={12} xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={shippingDataCheck}
                        onChange={() => {
                          handleShippingDataCheck();
                        }}
                      />
                    }
                    label="Igual a datos básicos"
                  />
                </Grid>
                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Nombre"
                    fullWidth
                    className={classes.textField}
                    disabled={shippingDataCheck}
                    value={
                      shippingDataCheck
                        ? props.values?.name
                          ? props.values.name
                          : ""
                        : props.values.shippingName
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        shippingName: e.target.value,
                      })
                    }
                    error={
                      !validations.isAValidName(props.values?.shippingName)
                    }
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Apellido"
                    fullWidth
                    disabled={shippingDataCheck}
                    className={classes.textField}
                    value={
                      shippingDataCheck
                        ? props.values?.lastName
                          ? props.values.lastName
                          : ""
                        : props.values.shippingLastName
                    }
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        shippingLastName: e.target.value,
                      })
                    }
                    margin="normal"
                    error={
                      !validations.isAValidName(props.values?.shippingLastName)
                    }
                  />
                </Grid>
                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Telefono"
                    fullWidth
                    disabled={shippingDataCheck}
                    className={classes.textField}
                    value={
                      shippingDataCheck
                        ? props.values?.phone
                          ? props.values.phone
                          : ""
                        : props.values.shippingPhone
                    }
                    onChange={(e) => {
                      props.setValues({
                        ...props.values,
                        shippingPhone: e.target.value,
                      });
                    }}
                    required
                    margin="normal"
                    error={
                      props.values?.shippingPhone !== undefined &&
                      props.values?.shippingPhone !== "" &&
                      !validations.isAValidPhoneNum(props.values?.shippingPhone)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalPhoneIcon color="secondary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <Tooltip
                          onClick={(e) => setOpenTooltipPh2(!openTooltipPh2)}
                          open={openTooltipPh2}
                          onClose={(leaveDelay) => setOpenTooltipPh2(false)}
                          title={
                            !validations.isAValidPhoneNum(
                              props.values?.phone
                            ) && props.values?.phone !== undefined ? (
                              <div>
                                <div>
                                  ej: 584141234567 ó +584141234567 ó 04143201028
                                </div>
                                Formato no válido.
                              </div>
                            ) : (
                              "ej: 584141234567 ó +584141234567 ó 04143201028"
                            )
                          }
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
                <Grid
                  item
                  lg={12}
                  md={12}
                  sm={12}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    fullWidth
                    label="Dirección de envio"
                    className={classes.textField}
                    multiline
                    disabled={shippingDataCheck}
                    rows={3}
                    helperText="Incluir todos los detalles posibles, incluidas referencias."
                    value={
                      shippingDataCheck
                        ? props.values?.address
                          ? props.values.address
                          : ""
                        : props.values.shippingAddress
                    }
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        shippingAddress: e.target.value,
                      })
                    }
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid
                  item
                  lg={6}
                  md={6}
                  sm={12}
                  xs={12}
                  className={classes.gridInput}
                >
                  <FormControl style={{ minWidth: "100%" }} variant="outlined">
                    <InputLabel>Método de entrega</InputLabel>
                    <Select
                      label="Método de entrega"
                      className={classes.textField}
                      value={props.values?.shippingMethod || ""}
                      onChange={(e) => {
                        props.setValues({
                          ...props.values,
                          shippingMethod: e.target.value,
                        });
                      }}
                    >
                      <MenuItem value="">
                        <em></em>
                      </MenuItem>
                      {shippingList &&
                        shippingList.map((n) => (
                          <MenuItem value={n}>{n.name}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid
                  item
                  lg={6}
                  md={6}
                  sm={12}
                  xs={12}
                  className={classes.gridInput}
                >
                  <FormControl style={{ minWidth: "100%" }} variant="outlined">
                    <TextField
                      style={{
                        width: "100%",
                      }}
                      label="Fecha de Entrega"
                      type="date"
                      variant="outlined"
                      // required
                      format="dd-MM-yyyy"
                      defaultValue={stringReadyDate}
                      value={props.values.today}
                      error={props.values.today < stringReadyDate}
                      // min={stringReadyDate}
                      className={classes.textField}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(e) => {
                        // if (e.target.value < new Date()) {
                        //   console.log("x");
                        // } else {
                        selectShDate(e.target.value);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid>
                  <div style={{ marginTop: 10, marginLeft: 10 }}>
                    {"Tu pedido estará listo el día " +
                      days[readyDate.getDay()] +
                      " " +
                      readyDate.getDate() +
                      " de " +
                      months[readyDate.getMonth()] +
                      ", si está listo antes te lo notificaremos."}
                  </div>
                </Grid>
              </Grid>
            </form>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expanded === "billing"}
          onChange={handleAccordionExpansion("billing")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Datos de Facturación</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form autoComplete="off">
              <Grid container>
                <Grid
                  item
                  lg={12}
                  md={12}
                  sm={12}
                  xs={12}
                  // className={classes.gridInput}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={billingDataCheck}
                        onChange={(e) => {
                          if (billingShDataCheck) {
                            setBillingDataCheck(!billingDataCheck);
                            setBillingShDataCheck(!billingShDataCheck);
                          } else {
                            setBillingDataCheck(!billingDataCheck);
                          }
                        }}
                      />
                    }
                    label="Igual a datos básicos"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={billingShDataCheck}
                        onChange={(e) => {
                          if (billingDataCheck) {
                            setBillingShDataCheck(!billingShDataCheck);
                            setBillingDataCheck(!billingDataCheck);
                          } else {
                            setBillingShDataCheck(!billingShDataCheck);
                          }
                        }}
                      />
                    }
                    label="Igual a datos de envío"
                  />
                </Grid>
                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Nombre"
                    fullWidth
                    className={classes.textField}
                    disabled={billingDataCheck || billingShDataCheck}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingName
                          ? props.values.shippingName
                          : ""
                        : billingDataCheck
                        ? props.values?.name
                          ? props.values.name
                          : ""
                        : props.values.billingShName || ""
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingShName: e.target.value,
                      })
                    }
                    required
                    margin="normal"
                    error={
                      !validations.isAValidName(props.values?.billingShName)
                    }
                  />
                </Grid>
                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Apellido"
                    fullWidth
                    className={classes.textField}
                    disabled={billingDataCheck || billingShDataCheck}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingLastName
                          ? props.values.shippingLastName
                          : ""
                        : billingDataCheck
                        ? props.values?.lastName
                          ? props.values.lastName
                          : ""
                        : props.values.billingShLastName || ""
                    }
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingShLastName: e.target.value,
                      })
                    }
                    margin="normal"
                    error={
                      !validations.isAValidName(props.values?.billingShLastName)
                    }
                  />
                </Grid>
                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Cédula o RIF"
                    fullWidth
                    className={classes.textField}
                    disabled={billingDataCheck || billingShDataCheck}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingCi
                          ? props.values.shippingCi
                          : ""
                        : billingDataCheck
                        ? props.values?.ci
                          ? props.values.ci
                          : ""
                        : props.values.billingCi || ""
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingCi: e.target.value,
                      })
                    }
                    required
                    error={
                      props.values?.ci !== undefined &&
                      !validations.isAValidCi(props.values?.ci)
                    }
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <Tooltip
                          onClick={(e) => setOpenTooltip2(!openTooltip2)}
                          open={openTooltip2}
                          onClose={(leaveDelay) => setOpenTooltip2(false)}
                          title={
                            !validations.isAValidCi(props.values?.ci) &&
                            props.values?.ci !== undefined
                              ? "ej: V12345679 ó J000123456 \n" +
                                "Formato no válido."
                              : "ej: V12345679 ó J000123456"
                          }
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
                <Grid
                  item
                  lg={8}
                  md={8}
                  sm={8}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Razón Social"
                    fullWidth
                    className={classes.textField}
                    disabled={billingDataCheck || billingShDataCheck}
                    value={props.values?.billingCompany || ""}
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingCompany: e.target.value,
                      })
                    }
                    required
                    margin="normal"
                    // error={!validations.isAValidName(props.values?.billingShName)}
                  />
                </Grid>

                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Telefono"
                    fullWidth
                    disabled={billingDataCheck || billingShDataCheck}
                    className={classes.textField}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingPhone
                          ? props.values.shippingPhone
                          : ""
                        : billingDataCheck
                        ? props.values?.phone
                          ? props.values.phone
                          : ""
                        : props.values.billingShPhone || ""
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingShPhone: e.target.value,
                      })
                    }
                    required
                    margin="normal"
                    error={
                      !validations.isAValidPhoneNum(
                        props.values?.billingShPhone
                      ) && props.values?.billingShPhone !== undefined
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalPhoneIcon color="secondary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <Tooltip
                          onClick={(e) => setOpenTooltipPh3(!openTooltipPh3)}
                          open={openTooltipPh3}
                          onClose={(leaveDelay) => setOpenTooltipPh3(false)}
                          title={
                            !validations.isAValidPhoneNum(
                              props.values?.phone
                            ) && props.values?.phone !== undefined ? (
                              <div>
                                <div>
                                  ej: 584141234567 ó +584141234567 ó 04143201028
                                </div>
                                Formato no válido.
                              </div>
                            ) : (
                              "ej: 584141234567 ó +584141234567 ó 04143201028"
                            )
                          }
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
                <Grid
                  item
                  lg={12}
                  md={12}
                  sm={12}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    fullWidth
                    label="Dirección de facturación"
                    multiline
                    minRows={3}
                    disabled={billingDataCheck || billingShDataCheck}
                    className={classes.textField}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingAddress
                          ? props.values.shippingAddress
                          : ""
                        : billingDataCheck
                        ? props.values?.address
                          ? props.values.address
                          : ""
                        : props.values.billingShAddress || ""
                    }
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingShAddress: e.target.value,
                      })
                    }
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </form>
          </AccordionDetails>
        </Accordion>
      </div>
    </>
  );
}

export default ConsumerForm;
