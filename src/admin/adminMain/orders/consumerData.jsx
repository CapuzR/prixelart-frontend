import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Checkbox from "@material-ui/core/Checkbox";
import { makeStyles } from "@material-ui/core/styles";
import Title from "../Title";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import LocalPhoneIcon from "@material-ui/icons/LocalPhone";
import EmailIcon from "@material-ui/icons/Email";
import HomeIcon from "@material-ui/icons/Home";
import BusinessIcon from "@material-ui/icons/Business";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Typography } from "@material-ui/core";
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  formControl: {
    minWidth: 120,
  },
  form: {
    height: "auto",
  },
  gridInput: {
    display: "flex",
    width: "100%",
    marginBottom: "12px",
  },
  textField: {
    marginRight: "8px",
  },

  toolbar: {
    paddingRight: 24,
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "none",
    flexDirection: "column",
  },
  fixedHeight: {
    height: "auto",
    overflow: "none",
  },
  fab: {
    right: 0,
    position: "absolute",
  },
  paper2: {
    position: "absolute",
    width: "80%",
    maxHeight: "90%",
    overflowY: "auto",
    backgroundColor: "white",
    boxShadow: theme.shadows[2],
    padding: "16px 32px 24px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "justify",
    minWidth: 320,
    borderRadius: 10,
    marginTop: "12px",
    display: "flex",
    flexDirection: "row",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  base: {
    width: "70px",
    height: "37px",
    padding: "0px",
  },
  switchBase: {
    color: "silver",
    padding: "1px",
    "&$checked": {
      "& + $track": {
        backgroundColor: "silver",
      },
    },
  },
  thumb: {
    color: "#d33f49",
    width: "30px",
    height: "30px",
    margin: "2px",
    "&:before": {
      content: "'$'",
      fontSize: "18px",
      color: "white",
      display: "flex",
      marginTop: "3px",
      justifyContent: "center",
    },
  },
  thumbTrue: {
    color: "#d33f49",
    width: "30px",
    height: "30px",
    margin: "2px",
    "&:before": {
      content: "'Bs'",
      fontSize: "18px",
      color: "white",
      display: "flex",
      marginTop: "3px",
      justifyContent: "center",
    },
  },
  track: {
    borderRadius: "20px",
    backgroundColor: "silver",
    opacity: "1 !important",
    "&:after, &:before": {
      color: "black",
      fontSize: "18px",
      position: "absolute",
      top: "6px",
    },
    "&:after": {
      content: "'$'",
      left: "8px",
    },
    "&:before": {
      content: "'Bs'",
      right: "7px",
    },
  },
  checked: {
    color: "#d33f49 !important",
    transform: "translateX(35px) !important",
    padding: "1px",
  },
  snackbar: {
    [theme.breakpoints.down("xs")]: {
      bottom: 90,
    },
    margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      width: "25ch",
    },
  },
}));

export default function ConsumerData(props) {
  const classes = useStyles();

  const [loading, setLoading] = useState(true);
  const [shippingDataCheck, setShippingDataCheck] = useState(true);
  const [shippingList, setShippingList] = useState();
  const [billingDataCheck, setBillingDataCheck] = useState(true);
  const [billingShDataCheck, setBillingShDataCheck] = useState(false);
  const [consumers, setConsumers] = useState([]);
  const [prixers, setPrixers] = useState([]);
  const [options, setOptions] = useState([]);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
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

  const stringReadyDate =
    readyDate.getFullYear() +
    "-" +
    monthsOrder[readyDate.getMonth()] +
    "-" +
    readyDate.getDate();

  const getShippingMethods = () => {
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
  };

  const getConsumers = () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/consumer/read-all";
    axios
      .post(base_url)
      .then((response) => {
        setConsumers(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getPrixers = () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/prixer/read-all-full";
    axios
      .get(base_url)
      .then((response) => {
        setPrixers(response.data.prixers);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    setLoading(true);
    getShippingMethods();
    getConsumers();
    getPrixers();
    setLoading(false);
  }, []);

  const handleShippingDataCheck = () => {
    if (shippingDataCheck) {
      props.setShippingData({
        ...props.shippingData,
        shippingName: "",
        shippingLastName: "",
        shippingPhone: "",
        shippingAddress: "",
      });
    } else {
      props.setValues({
        ...props.shippingData,
        shippingName: props.values.name,
        shippingLastName: props.values.lastName,
        shippingPhone: props.values.phone,
        shippingAddress: props.values.address,
      });
    }

    setShippingDataCheck(!shippingDataCheck);
  };

  useEffect(() => {
    let updatedv2 = [];
    const updated = consumers?.filter((consumer) =>
      consumer.firstname
        ?.toLowerCase()
        .includes(props?.basicData?.name?.toLowerCase())
    );
    updated.map((p) => {
      updatedv2.push(p.firstname + ", " + p.lastname);
    });

    const updatedv3 = prixers?.filter((prixer) =>
      prixer?.firstName
        ?.toLowerCase()
        .includes(props?.basicData?.name?.toLowerCase())
    );

    updatedv3.map((p) => {
      if (updatedv2.includes(p.firstName + ", " + p.lastName)) {
        return;
      } else {
        updatedv2.push(p.firstName + ", " + p.lastName);
      }
    });

    setOptions(updatedv2);
  }, [props?.basicData?.name]);

  const handleInputChange = (event, value, reason) => {
    if (reason === "clear") {
      props.setSelectedPrixer(undefined);
      props.setSelectedConsumer(undefined);
      props.setBasicData(undefined);
    } else if (event?.type === "change") {
      props.setBasicData({
        ...props.basicData,
        name: value,
      });
    } else if (event?.type === "click") {
      const valuev2 = value.split(",");
      let prixer = prixers.find(
        (prixer) =>
          prixer?.firstName === valuev2[0] &&
          prixer?.lastName === valuev2[1]?.trim()
      );
      let selected = consumers.find(
        (consumer) =>
          consumer.firstname === valuev2[0] &&
          consumer.lastname === valuev2[1]?.trim()
      );
      if (prixer) {
        props.setSelectedPrixer(prixer);
        props.setSelectedConsumer(undefined);
        props.setBasicData({
          ...props.basicData,
          name: valuev2[0],
          lastname: valuev2[1]?.trim(),
          phone: prixer?.phone,
          email: prixer?.email,
          address: prixer?.address,
          ci: prixer?.ci,
        });
      } else if (selected) {
        props.setSelectedConsumer(selected);
        props.setSelectedPrixer(undefined);
        props.setBasicData({
          ...props.basicData,
          name: valuev2[0],
          lastname: valuev2[1]?.trim(),
          phone: selected?.phone,
          email: selected?.email,
          address: selected?.address,
          ci: selected?.ci,
        });
      }
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid container style={{ marginTop: 20 }}>
          <Title>Información del cliente</Title>
          {loading && <Typography>Cargando clientes </Typography>}
        </Grid>
        <Grid container>
          <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
            <Autocomplete
              freeSolo
              loading={loading}
              options={options}
              getOptionLabel={(option) => option}
              onInputChange={handleInputChange}
              value={props.basicData?.name}
              fullWidth
              style={{ marginRight: 8 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nombre"
                  margin="normal"
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                  value={props.basicData?.name}
                  onChange={(e) =>
                    props.setBasicData({
                      ...props.basicData,
                      name: e.target.value,
                    })
                  }
                />
              )}
            />
          </Grid>
          <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Apellido"
              fullWidth
              className={classes.textField}
              value={props.basicData?.lastname}
              onChange={(e) =>
                props.setBasicData({
                  ...props.basicData,
                  lastname: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid>

          <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Cédula o RIF"
              fullWidth
              helperText="ej: V-12345679 o V-1234567-0"
              className={classes.textField}
              value={props.basicData?.ci}
              onChange={(e) =>
                props.setBasicData({
                  ...props.basicData,
                  ci: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid>
          <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Telefono"
              fullWidth
              className={classes.textField}
              helperText="ej: 584141234567 o +584141234567 o 04143201028"
              value={props.basicData?.phone}
              //   error={!UtilVals.isAValidPhoneNum(props.values?.phone)}
              onChange={(e) =>
                props.setBasicData({
                  ...props.basicData,
                  phone: e.target.value,
                })
              }
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalPhoneIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Correo"
              fullWidth
              className={classes.textField}
              value={props.basicData?.email}
              onChange={(e) =>
                props.setBasicData({
                  ...props.basicData,
                  email: e.target.value,
                })
              }
              // error={!UtilVals.isAValidEmail(props.values?.email)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
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
              label="Dirección de envio"
              className={classes.textField}
              multiline
              minRows={3}
              helperText="Incluir todos los detalles posibles, incluidas referencias."
              value={props.basicData?.address}
              onChange={(e) =>
                props.setBasicData({
                  ...props.basicData,
                  address: e.target.value,
                })
              }
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid container style={{ marginTop: 20 }}>
          <Title>Datos de entrega</Title>
        </Grid>
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
              label="Igual a Datos básicos"
            />
          </Grid>
          <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Nombre"
              fullWidth
              className={classes.textField}
              disabled={shippingDataCheck}
              value={
                shippingDataCheck
                  ? props.basicData?.name
                    ? props.basicData?.name
                    : ""
                  : props.shippingData?.name
              }
              onChange={(e) =>
                props.setShippingData({
                  ...props.shippingData,
                  name: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid>
          <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Apellido"
              fullWidth
              disabled={shippingDataCheck}
              className={classes.textField}
              value={
                shippingDataCheck
                  ? props.basicData?.lastname
                    ? props.basicData?.lastname
                    : ""
                  : props.shippingData?.lastname
              }
              onChange={(e) =>
                props.setShippingData({
                  ...props.shippingData,
                  lastname: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid>
          <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Telefono"
              fullWidth
              disabled={shippingDataCheck}
              className={classes.textField}
              helperText="ej: 584141234567 o +584141234567 o 04143201028"
              value={
                shippingDataCheck
                  ? props.basicData?.phone
                    ? props.basicData?.phone
                    : ""
                  : props.shippingData?.phone
              }
              // error={
              //   shippingDataCheck
              //     ? props.values?.phone != undefined &&
              //       !UtilVals.isAValidPhoneNum(props.values?.phone)
              //     : props.values?.shippingPhone != undefined &&
              //       !UtilVals.isAValidPhoneNum(props.values?.shippingPhone)
              // }
              onChange={(e) => {
                props.setShippingData({
                  ...props.shippingData,
                  phone: e.target.value,
                });
              }}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalPhoneIcon />
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
              label="Dirección de envio"
              className={classes.textField}
              multiline
              disabled={shippingDataCheck}
              minRows={3}
              helperText="Incluir todos los detalles posibles, incluidas referencias."
              value={
                shippingDataCheck
                  ? props.basicData?.address
                    ? props.basicData?.address
                    : ""
                  : props.shippingData?.address
              }
              onChange={(e) =>
                props.setShippingData({
                  ...props.shippingData,
                  address: e.target.value,
                })
              }
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon />
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
                id="shippingMethod"
                label="Método de entrega"
                className={classes.textField}
                value={props.shippingData?.shippingMethod?.name}
                onChange={(e) => {
                  props.setShippingData({
                    ...props.shippingData,
                    shippingMethod: e.target.value,
                  });
                  props.setShippingMethod(e.target.value);
                }}
              >
                <MenuItem value="" key={"vacío"}>
                  <em></em>
                </MenuItem>
                {shippingList &&
                  shippingList.map((n) => (
                    <MenuItem key={n.name} value={n}>
                      {n.name}
                    </MenuItem>
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
                //
                format="dd-MM-yyyy"
                defaultValue={stringReadyDate}
                value={props.shippingData?.shippingDate}
                error={props.values?.today < stringReadyDate}
                // min={stringReadyDate}
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => {
                  props.setShippingData({
                    ...props.shippingData,
                    shippingDate: e.target.value,
                  });
                }}
              />
            </FormControl>
          </Grid>
          {props.buyState.length > 0 && readyDate !== "Invalid Date" && (
            <Grid>
              <div style={{ marginTop: 10, marginLeft: 10 }}>
                {"El pedido estará listo el día " +
                  days[readyDate.getDay()] +
                  " " +
                  readyDate.getDate() +
                  " de " +
                  months[readyDate.getMonth()] +
                  "."}
              </div>
            </Grid>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid container style={{ marginTop: 20 }}>
          <Title>Datos de facturación</Title>
        </Grid>
        <Grid container>
          <Grid item lg={12} md={12} sm={12} xs={12}>
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
              label="Igual a Datos básicos"
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
              label="Igual a Datos de entrega"
            />
          </Grid>
          <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Nombre"
              fullWidth
              className={classes.textField}
              disabled={billingDataCheck || billingShDataCheck}
              value={
                billingDataCheck
                  ? props.basicData?.name
                    ? props.basicData?.name
                    : ""
                  : billingShDataCheck
                  ? props.shippingData?.name
                    ? props.shippingData?.name
                    : ""
                  : props.billingData?.name
              }
              onChange={(e) =>
                props.setBillingData({
                  ...props.billingData,
                  name: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid>
          <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Apellido"
              fullWidth
              className={classes.textField}
              disabled={billingDataCheck || billingShDataCheck}
              value={
                billingDataCheck
                  ? props.basicData?.lastname
                    ? props.basicData?.lastname
                    : ""
                  : billingShDataCheck
                  ? props.shippingData?.lastname
                    ? props.shippingData?.lastname
                    : ""
                  : props.billingData?.lastname
              }
              onChange={(e) =>
                props.setBillingData({
                  ...props.billingData,
                  lastname: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid>
          <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Telefono"
              fullWidth
              disabled={billingDataCheck || billingShDataCheck}
              className={classes.textField}
              helperText="ej: 584141234567 o +584141234567 o 04143201028"
              value={
                billingDataCheck
                  ? props.basicData?.phone
                    ? props.basicData?.phone
                    : ""
                  : billingShDataCheck
                  ? props.shippingData?.phone
                    ? props.shippingData?.phone
                    : ""
                  : props.billingData?.phone
              }
              onChange={(e) =>
                props.setBillingData({
                  ...props.billingData,
                  phone: e.target.value,
                })
              }
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalPhoneIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item lg={8} md={8} sm={8} xs={12} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Razón Social"
              fullWidth
              className={classes.textField}
              disabled={billingDataCheck || billingShDataCheck}
              value={props.billingData?.billingCompany}
              onChange={(e) =>
                props.setBillingData({
                  ...props.billingData,
                  billingCompany: e.target.value,
                })
              }
              required
              margin="normal"
            />
          </Grid>
          <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="RIF"
              fullWidth
              disabled={billingDataCheck || billingShDataCheck}
              className={classes.textField}
              helperText="ej: V-12345679 o V-1234567-0"
              value={
                billingDataCheck
                  ? props.basicData?.ci
                    ? props.basicData?.ci
                    : ""
                  : props.billingData?.Ci
              }
              onChange={(e) =>
                props.setBillingData({
                  ...props.billingData,
                  ci: e.target.value,
                })
              }
              margin="normal"
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
                billingDataCheck
                  ? props.basicData?.address
                    ? props.basicData?.address
                    : ""
                  : billingShDataCheck
                  ? props.shippingData?.address
                    ? props.shippingData?.address
                    : ""
                  : props.billingData?.address
              }
              onChange={(e) =>
                props.setBillingData({
                  ...props.billingData,
                  address: e.target.value,
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
      </Grid>
    </>
  );
}
