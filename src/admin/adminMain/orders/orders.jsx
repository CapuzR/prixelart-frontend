import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import clsx from "clsx";
import { useTheme } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import { makeStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import Title from "../Title";
import {
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Typography,
} from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Table from "@material-ui/core/Table";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Modal from "@material-ui/core/Modal";
import CloseIcon from "@material-ui/icons/Close";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import DeleteIcon from "@material-ui/icons/Delete";
import RefreshIcon from "@material-ui/icons/Refresh";
import { Backdrop } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import LocalPhoneIcon from "@material-ui/icons/LocalPhone";
import EmailIcon from "@material-ui/icons/Email";
import HomeIcon from "@material-ui/icons/Home";
import CartReview from "../../../shoppingCart/cartReview";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepButton from "@material-ui/core/StepButton";
import BusinessIcon from "@material-ui/icons/Business";
import Img from "react-cool-img";
import Tooltip from "@material-ui/core/Tooltip";
import { getAttributes, getEquation } from "../../../products/services";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import Divider from "@material-ui/core/Divider";
import OutlinedInput from "@material-ui/core/OutlinedInput";

import ConsumerForm from "../../../shoppingCart/consumerForm";
import OrderBasicInfo from "../../orderCrud/createOrder/orderBasicInfo";
import OrderDetails from "../../orderCrud/createOrder/orderDetails";
import Autocomplete from "@material-ui/lab/Autocomplete";

import { useHistory } from "react-router-dom";

import utils from "../../../utils/utils";
import { nanoid } from "nanoid";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
  },
  form: {
    height: "auto",
    // padding: "15px",
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
}));

export default function Orders(props) {
  const classes = useStyles();
  const history = useHistory();
  // const location = useLocation();
  const theme = useTheme();

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isIphone = useMediaQuery(theme.breakpoints.down("xs"));

  const [isShowDetails, setIsShowDetails] = useState(false);
  const [rows, setRows] = useState();
  const [modalContent, setModalContent] = useState();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("recent");
  const [openCreateOrder, setOpenCreateOrder] = useState(false);
  const [shippingDataCheck, setShippingDataCheck] = useState(true);
  const [billingDataCheck, setBillingDataCheck] = useState(true);
  const [billingShDataCheck, setBillingShDataCheck] = useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [productList, setProductList] = useState([]);
  const [artList, setArtList] = useState([]);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState(undefined);
  const steps = [`Datos del comprador`, `Productos`, `Orden de compra`];
  const [imagesVariants, setImagesVariants] = useState([]);
  // const [selectedProduct, setSelectedProduct] = useState("");
  const orderTypeList = ["Consignación", "Venta", "Obsequio"];
  const productionStatusList = [
    "Por solicitar",
    "Solicitado",
    "Por producir",
    "En producción",
    "En diseño",
  ];
  const shippingStatusList = [
    "Por entregar",
    "Entregado",
    "Devuelto",
    "Cambio",
  ];
  const internalShippingList = ["Yalo", "DH", "CC", "No aplica"];
  const domesticShippingList = ["Tealca", "Zoom", "MRW", "No aplica"];
  const internationalShippingList = ["FedEx", "DHL", "MRW", "No aplica"];

  const readOrders = async () => {
    setLoading(true);
    const base_url = process.env.REACT_APP_BACKEND_URL + "/order/read-all";
    await axios
      .get(base_url)
      .then((response) => {
        setRows(response.data.orders);
      })
      .catch((error) => {
        console.log(error);
      });
    setLoading(false);
  };

  const getTotalCombinedItems = (state) => {
    const totalNotCompleted = state.filter(
      (item) => !item.art || !item.product
    );
    return {
      totalNotCompleted,
    };
  };

  const getIvaCost = (state) => {
    let iva = getTotalPrice(state) * 0.16;
    return iva;
  };

  const filterOrders = (filter) => {
    setLoading(true);

    if (filter === "finished") {
      let ordersv2 = rows.sort(function (a, b) {
        if (a.status.toLowerCase() > b.status.toLowerCase()) {
          return 1;
        }
        if (a.status.toLowerCase() < b.status.toLowerCase()) {
          return -1;
        }
        return 0;
      });
      setRows(ordersv2);
    } else if (filter === "processing") {
      let ordersv2 = rows.sort(function (a, b) {
        if (a.status.toLowerCase() < b.status.toLowerCase()) {
          return 1;
        }
        if (a.status.toLowerCase() > b.status.toLowerCase()) {
          return -1;
        }
        return 0;
      });
      setRows(ordersv2);
    } else if (filter === "recent") {
      let ordersv2 = rows.sort(function (a, b) {
        if (a.createdOn.toLowerCase() < b.createdOn.toLowerCase()) {
          return 1;
        }
        if (a.createdOn.toLowerCase() > b.createdOn.toLowerCase()) {
          return -1;
        }
        return 0;
      });
      setRows(ordersv2);
    } else if (filter === "previous") {
      let ordersv2 = rows.sort(function (a, b) {
        if (a.createdOn.toLowerCase() > b.createdOn.toLowerCase()) {
          return 1;
        }
        if (a.createdOn.toLowerCase() < b.createdOn.toLowerCase()) {
          return -1;
        }
        return 0;
      });
      setRows(ordersv2);
    }
    setLoading(false);
  };

  const deleteOrder = async (id) => {
    const URI = process.env.REACT_APP_BACKEND_URL + "/order/delete/" + id;
    await axios.delete(URI);
    filterOrders();
  };

  const handleClose = () => {
    setIsShowDetails(false);
    setOpenCreateOrder(false);
  };

  const createOrder = async () => {
    setLoading(true);

    let orderLines = [];

    props.buyState.map((s) => {
      s.product &&
        s.art &&
        orderLines.push({
          product: s.product,
          art: s.art,
          quantity: s.quantity,
        });
    });

    const consumer = await axios.post(
      process.env.REACT_APP_BACKEND_URL + "/consumer/create",
      {
        active: true,
        contactedBy: {
          username: "web",
          id: 1,
          phone: "",
          email: "hola@prixelart.com",
        },
        consumerType: "Particular",
        firstname: props.values?.name,
        lastname: props.values?.lastName,
        username: props.values?.username,
        ci: props.values?.ci,
        phone: props.values?.phone,
        email: props.values?.email,
        address: props.values?.address,
        billingAddress: props.values?.billingAddress || props.values?.address,
        shippingAddress: props.values?.shippingAddress || props.values?.address,
      }
    );

    const base_url = process.env.REACT_APP_BACKEND_URL + "/order/create";
    let input = {
      orderId: nanoid(6),
      firstname: consumer.data.newConsumer.firstname,
      lastname: consumer.data.newConsumer.lastname,
      ci: consumer.data.newConsumer.ci,
      requests: orderLines,
      email: consumer.data.newConsumer.email,
      phone: consumer.data.newConsumer.phone,
      billingAddress: consumer.data.newConsumer.billingAddress,
      shippingAddress: consumer.data.newConsumer.shippingAddress,
      internalShippingMethod: props.values.shippingAgencyLocal,
      domesticShippingMethod: props.values.shippingAgencyNational,
      internationalShippingMethod: props.values.shippingAgencyInternational,
      observations: props.values.observations,
      tax: getTotalPrice(props.buyState) * 0.16,
      subtotal: getTotalPrice(props.buyState),
      total:
        getTotalPrice(props.buyState) + getTotalPrice(props.buyState) * 0.16,
      createdOn: new Date(),
      createdBy: consumer.data.newConsumer,
      orderType: "Particular",
      // consumerId: consumer.data.newConsumer._id,
      status: "Procesando",
      orderPaymentMethod: orderPaymentMethod,
    };
    const order = await axios.post(base_url, input).then(() => {
      console.log("Orden generada correctamente. Por favor, revisa tu email");
    });
    props.setValues(undefined);
    localStorage.removeItem("buyState");
    props.setBuyState([]);
    setOpenCreateOrder(false);
    readOrders();
    setLoading(false);
  };
  console.log(modalContent);

  const getTotalPrice = (state) => {
    let prices = [];
    state.map(
      (item) =>
        item.product &&
        item.art &&
        prices.push(
          (item.product.publicEquation ||
            item.product.publicPrice.from.replace(/[$]/gi, "")) *
            (item.quantity || 1)
        )
    );
    let total = prices.reduce(function (a, b) {
      return a + b;
    });
    return total;
  };

  const handleChangeStatus = async (id, status) => {
    const URI = process.env.REACT_APP_BACKEND_URL + "/order/update/" + id;
    await axios.put(URI, { status: status });
    readOrders();
  };

  const handleChange = (event) => {
    setFilter(event.target.value);
    filterOrders(event.target.value);
  };

  useEffect(() => {
    readOrders();
  }, []);

  const handleStep = (step) => () => {
    setActiveStep(step);
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

  useEffect(() => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-all";
    axios.get(base_url).then(async (response) => {
      let productsAttTemp1 = response.data.products;
      await productsAttTemp1.map(async (p, iProd, pArr) => {
        p.variants.map((variant) => {
          imagesVariants.push(variant.variantImage);
        });
        productsAttTemp1 = await getEquation(p, iProd, pArr);
      });
      setProductList(getAttributes(productsAttTemp1));
    });
  }, []);

  useEffect(() => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/art/read-all";
    axios.get(base_url).then((response) => {
      setArtList(response.data.arts);
    });
  }, []);

  const handleProduct = (event) => {
    let selectedProduct = event.target.value;
    let selectedProductFull = productList.find(
      (result) => result.name === selectedProduct
    );
    props.addItemToBuyState({
      type: "product",
      item: selectedProductFull,
    });
  };

  const changeProduct = (event, art, index, variant) => {
    props.setSelectedArtToAssociate({
      index,
      item: art,
      previous: true,
    });
    let selectedProduct = event.target.value;
    let selectedProductFull = productList.find(
      (result) => result.name === selectedProduct
    );
    if (variant) {
      props.AssociateProduct({
        index: index,
        item: selectedProductFull.push({ selection: variant }),
        type: "product",
      });
    } else
      props.AssociateProduct({
        index: index,
        item: selectedProductFull,
        type: "product",
      });
  };

  const changeArt = (art, product, index) => {
    props.setSelectedProductToAssociate({
      index,
      item: product,
      previous: true,
    });
    let selectedArt = art;
    let selectedArtFull = artList.find(
      (result) => result.title === selectedArt
    );
    props.AssociateProduct({
      index: index,
      item: selectedArtFull,
      type: "art",
    });
  };

  const handleVariantProduct = (variant, index, art, product) => {
    props.setSelectedArtToAssociate({
      index,
      item: art,
      previous: true,
    });
    let selectedVariant = product.variants.find(
      (result) => result.name === variant
    );
    product.selection = selectedVariant;
    product.publicEquation = selectedVariant.publicPrice.equation;
    props.AssociateProduct({
      index: index,
      item: product,
      type: "product",
    });
  };

  return (
    <>
      <Backdrop
        className={classes.backdrop}
        open={loading}
        transitionDuration={1000}
      >
        <CircularProgress />
      </Backdrop>
      <Grid container spacing={3} style={{ margin: isDesktop ? "12px" : "" }}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={fixedHeightPaper}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Title>Órdenes</Title>
              <div>
                <Fab
                  color="primary"
                  size="small"
                  onClick={() => {
                    setOpenCreateOrder(true);
                  }}
                  style={{ marginRight: 10 }}
                >
                  <AddIcon />
                </Fab>
                <Fab
                  color="primary"
                  size="small"
                  onClick={() => {
                    readOrders();
                  }}
                >
                  <RefreshIcon />
                </Fab>
              </div>
            </div>

            {rows && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">ID</TableCell>
                    <TableCell align="center">
                      <div style={{ display: "flex", justifyContent: "end" }}>
                        <FormControl className={classes.formControl}>
                          <InputLabel id="demo-simple-select-label">
                            Fecha{" "}
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={filter}
                            onChange={handleChange}
                          >
                            <MenuItem value={"recent"}>Recientes</MenuItem>
                            <MenuItem value={"previous"}>Anteriores</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                    </TableCell>
                    <TableCell align="center">Nombre</TableCell>
                    <TableCell align="center">Productos</TableCell>
                    <TableCell align="center">Total</TableCell>
                    <TableCell align="center">
                      <div style={{ display: "flex", justifyContent: "end" }}>
                        <FormControl className={classes.formControl}>
                          <InputLabel id="demo-simple-select-label">
                            Status
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={filter}
                            onChange={handleChange}
                          >
                            <MenuItem value={"finished"}>Finalizadas</MenuItem>
                            <MenuItem value={"processing"}>Procesando</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                    </TableCell>
                    {/* <TableCell align="center">Total</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows &&
                    rows.map((row, index) => (
                      <>
                        <TableRow key={index}>
                          <TableCell align="center">{row.orderId}</TableCell>
                          <TableCell align="center">
                            {row.createdOn.substring(0, 10)}
                          </TableCell>
                          <TableCell align="center">
                            {row.createdBy.firstname} {row.createdBy.lastname}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              onClick={() => {
                                setModalContent(row);
                                setIsShowDetails(!isShowDetails);
                              }}
                              style={{
                                padding: 10,
                                textTransform: "none",
                                backgroundColor: "#eee",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {row.requests?.map((item) => (
                                  <div>
                                    {item.art.title +
                                      " X " +
                                      item.product.name +
                                      " X " +
                                      item.quantity}
                                  </div>
                                ))}
                              </div>
                            </Button>
                          </TableCell>

                          <TableCell align="center">
                            ${row.total.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <FormControl disabled={row.status !== "Procesando"}>
                              <Select
                                SelectClassKey
                                value={row.status}
                                onChange={(e) => {
                                  handleChangeStatus(
                                    row.orderId,
                                    e.target.value
                                  );
                                }}
                              >
                                <MenuItem value={"Procesando"}>
                                  Procesando
                                </MenuItem>

                                <MenuItem value={"Cancelada"}>
                                  Cancelada
                                </MenuItem>
                                <MenuItem value={"Completada"}>
                                  Completada
                                </MenuItem>
                              </Select>
                            </FormControl>
                            {/* <Fab
                              color="default"
                              style={{ width: 35, height: 35 }}
                              aria-label="Delete"
                              onClick={(e) => {
                                e.preventDefault();
                                deleteOrder(row.orderId);
                                readOrders();
                              }}
                            >
                              <DeleteIcon />
                            </Fab> */}
                          </TableCell>
                        </TableRow>
                      </>
                    ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Modal
        open={isShowDetails}

        // xl={12}
        // lg={12}
        // md={12}
        // sm={12}
        // xs={12}
        // onClose={!}
      >
        <Grid container className={classes.paper2}>
          <Grid
            item
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Grid>
          {modalContent && (
            <>
              <Grid
                style={{
                  display: "flex",
                  flexDirection:
                    rows?.lenght > 2 || isMobile ? "column" : "row",
                  // margin: "10px 0px 20px 0px",
                }}
                item
                xs={12}
                sm={6}
                md={6}
                lg={6}
              >
                {modalContent?.requests.map((item, index) => (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      margin: "0px 20px 20px 0px",
                      // borderWidth: 1,
                    }}
                  >
                    <strong>
                      {"Item #"}
                      {index + 1}
                    </strong>
                    <div>{"Arte: " + item.art.title}</div>
                    <div>{"Id: " + item.art.artId}</div>
                    <div style={{ marginBottom: 10 }}>
                      {"Prixer: " + item.art.prixerUsername}
                    </div>
                    <div>{"Producto: " + item.product.name}</div>
                    <div>{"Id: " + item.product._id}</div>
                    {item.product.attributes.map((a, i) => {
                      return (
                        <p
                          style={{
                            // fontSize: 12,
                            padding: 0,
                            margin: 0,
                            marginBottom: 10,
                          }}
                        >
                          {a.name + ": "}
                          {item.product.selection[i]}
                        </p>
                      );
                    })}
                    <div>{"Cantidad: " + item.quantity}</div>
                  </div>
                ))}
              </Grid>

              <Grid
                item
                xs={12}
                sm={12}
                md={6}
                lg={3}
                style={{ marginBottom: 20 }}
              >
                <strong>Datos de pago</strong>
                <div>{"Subtotal: $" + modalContent?.subtotal.toFixed(2)}</div>
                <div>{"IVA: $" + modalContent?.tax.toFixed(2)}</div>
                <div style={{ marginBottom: 10 }}>
                  {"Total: $" + modalContent?.total.toFixed(2)}
                </div>
                <div style={{ marginBottom: 40 }}>
                  {"Forma de pago: " + modalContent?.orderPaymentMethod}
                </div>
                <strong>Datos de envío</strong>
                <div>
                  {"Nombre: " +
                    modalContent?.createdBy.firstname +
                    " " +
                    modalContent?.createdBy.lastname}
                </div>
                {modalContent.createdBy.email && (
                  <div>{"Email: " + modalContent?.createdBy.email}</div>
                )}
                {modalContent.createdBy.phone && (
                  <div>{"Teléfono: " + modalContent?.createdBy.phone}</div>
                )}
                <div>
                  {"Dirección de cobro: " +
                    modalContent?.createdBy.billingAddress}
                </div>
                <div>
                  {"Dirección de envío: " +
                    modalContent?.createdBy.shippingAddress}
                </div>
                {(modalContent.domesticShippingMethod ||
                  modalContent.internalShippingMethod ||
                  modalContent.internationalShippingMethod) && (
                  <div>
                    {"Agencia de envío: " +
                      modalContent?.domesticShippingMethod ||
                      modalContent?.internalShippingMethod ||
                      modalContent?.internationalShippingMethod}
                  </div>
                )}
                {modalContent.observations && (
                  <div>{"Observaciones: " + modalContent.observations}</div>
                )}
              </Grid>
            </>
          )}
        </Grid>
      </Modal>

      <Modal open={openCreateOrder}>
        <Grid
          container
          spacing={2}
          style={{ justifyContent: "space-between", alignItems: "center" }}
          className={classes.paper2}
        >
          <Grid
            item
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant={"h5"} color={"primary"}>
              Creación de orden
            </Typography>

            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Grid>
          <Stepper activeStep={activeStep} nonLinear style={{ width: "100%" }}>
            {steps.map((label, index) => {
              return (
                <Step key={label} {...props}>
                  <StepButton onClick={handleStep(index)}>{label}</StepButton>
                </Step>
              );
            })}
          </Stepper>
          <div
            style={{
              paddingRight: "10px",
              marginLeft: "13px",
              paddingBottom: 10,
              maxHeight: "70%",
              width: "100%",
            }}
          >
            {activeStep === 0 && (
              <>
                <Grid container spacing={2}>
                  <Grid container style={{ marginTop: 20 }}>
                    <Title>Información del cliente</Title>
                  </Grid>
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
                        id="standard-name"
                        label="Nombre"
                        fullWidth
                        className={classes.textField}
                        value={props.values?.name ? props.values.name : ""}
                        onChange={(e) =>
                          props.setValues({
                            ...props.values,
                            name: e.target.value,
                          })
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
                        value={
                          props.values?.lastName ? props.values.lastName : ""
                        }
                        onChange={(e) =>
                          props.setValues({
                            ...props.values,
                            lastName: e.target.value,
                          })
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
                        label="Cédula o RIF"
                        fullWidth
                        helperText="ej: V-12345679 o V-1234567-0"
                        className={classes.textField}
                        value={props.values?.ci ? props.values.ci : ""}
                        onChange={(e) =>
                          props.setValues({
                            ...props.values,
                            ci: e.target.value,
                          })
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
                        label="Telefono"
                        fullWidth
                        className={classes.textField}
                        helperText="ej: 584141234567 o +584141234567 o 04143201028"
                        value={props.values?.phone ? props.values.phone : ""}
                        //   error={!UtilVals.isAValidPhoneNum(props.values?.phone)}
                        onChange={(e) =>
                          props.setValues({
                            ...props.values,
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
                        label="Correo"
                        fullWidth
                        className={classes.textField}
                        value={props.values?.email ? props.values.email : ""}
                        onChange={(e) =>
                          props.setValues({
                            ...props.values,
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
                        rows={3}
                        helperText="Incluir todos los detalles posibles, incluidas referencias."
                        value={
                          props.values?.address ? props.values.address : ""
                        }
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
                    <Title>Datos de envío</Title>
                  </Grid>
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
                            checked={shippingDataCheck}
                            onChange={() => {
                              handleShippingDataCheck();
                            }}
                          />
                        }
                        label="Igual a Datos básicos"
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
                        helperText="ej: 584141234567 o +584141234567 o 04143201028"
                        value={
                          shippingDataCheck
                            ? props.values?.phone
                              ? props.values.phone
                              : ""
                            : props.values.shippingPhone
                        }
                        // error={
                        //   shippingDataCheck
                        //     ? props.values?.phone != undefined &&
                        //       !UtilVals.isAValidPhoneNum(props.values?.phone)
                        //     : props.values?.shippingPhone != undefined &&
                        //       !UtilVals.isAValidPhoneNum(props.values?.shippingPhone)
                        // }
                        onChange={(e) => {
                          props.setValues({
                            ...props.values,
                            shippingPhone: e.target.value,
                          });
                        }}
                        required
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
                              <HomeIcon />
                            </InputAdornment>
                          ),
                        }}
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
                      <FormControl
                        style={{ minWidth: "100%" }}
                        variant="outlined"
                      >
                        <InputLabel>En Caracas</InputLabel>
                        <Select
                          className={classes.textField}
                          value={props.values?.shippingAgencyLocal || ""}
                          onChange={(e) => {
                            props.setValues({
                              ...props.values,
                              shippingAgencyLocal: e.target.value,
                            });
                          }}
                        >
                          <MenuItem value="">
                            <em></em>
                          </MenuItem>
                          {internalShippingList.map((n) => (
                            <MenuItem key={n} value={n}>
                              {n}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid
                      item
                      lg={4}
                      md={4}
                      sm={4}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <FormControl
                        style={{ minWidth: "100%" }}
                        variant="outlined"
                      >
                        <InputLabel>En Venezuela</InputLabel>
                        <Select
                          className={classes.textField}
                          value={props.values?.shippingAgencyNational || ""}
                          onChange={(e) => {
                            props.setValues({
                              ...props.values,
                              shippingAgencyNational: e.target.value,
                            });
                          }}
                        >
                          <MenuItem value="">
                            <em></em>
                          </MenuItem>
                          {domesticShippingList.map((n) => (
                            <MenuItem key={n} value={n}>
                              {n}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid
                      item
                      lg={4}
                      md={4}
                      sm={4}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <FormControl
                        style={{ minWidth: "100%" }}
                        variant="outlined"
                      >
                        <InputLabel required id="internationalShippingMethod">
                          Internacional
                        </InputLabel>
                        <Select
                          className={classes.textField}
                          value={
                            props.values?.shippingAgencyInternational || ""
                          }
                          onChange={(e) => {
                            props.setValues({
                              ...props.values,
                              shippingAgencyInternational: e.target.value,
                            });
                          }}
                        >
                          <MenuItem value="">
                            <em></em>
                          </MenuItem>
                          {internationalShippingList.map((n) => (
                            <MenuItem key={n} value={n}>
                              {n}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
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
                        label="Igual a Datos de envío"
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
                            : props.values.billingShName
                        }
                        onChange={(e) =>
                          props.setValues({
                            ...props.values,
                            billingShName: e.target.value,
                          })
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
                            : props.values.billingShLastName
                        }
                        required
                        onChange={(e) =>
                          props.setValues({
                            ...props.values,
                            billingShLastName: e.target.value,
                          })
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
                        label="Telefono"
                        fullWidth
                        disabled={billingDataCheck || billingShDataCheck}
                        className={classes.textField}
                        helperText="ej: 584141234567 o +584141234567 o 04143201028"
                        value={
                          billingShDataCheck
                            ? props.values?.shippingPhone
                              ? props.values.shippingPhone
                              : ""
                            : billingDataCheck
                            ? props.values?.phone
                              ? props.values.phone
                              : ""
                            : props.values.billingShPhone
                        }
                        // error={
                        //   billingDataCheck
                        //     ? props.values?.phone != undefined &&
                        //       !UtilVals.isAValidPhoneNum(props.values?.phone)
                        //     : billingShDataCheck
                        //     ? (props.values?.billingPhone != undefined ||
                        //         (shippingDataCheck &&
                        //           props.values?.phone != undefined)) &&
                        //       !UtilVals.isAValidPhoneNum(props.values?.billingPhone)
                        //     : props.values?.billingShPhone != undefined &&
                        //       !UtilVals.isAValidPhoneNum(props.values?.billingShPhone)
                        // }
                        onChange={(e) =>
                          props.setValues({
                            ...props.values,
                            billingShPhone: e.target.value,
                          })
                        }
                        required
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
                        label="Dirección de facturación"
                        multiline
                        rows={3}
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
                            : props.values.billingShAddress
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
                  </Grid>{" "}
                </Grid>
              </>
            )}
            {activeStep === 1 && (
              <Grid
                container
                style={{ display: "flex", justifyContent: "center" }}
              >
                {props.buyState.length > 0 &&
                  props.buyState.map((buy, index) => {
                    return (
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        xl={12}
                        key={index}
                        style={{
                          // height: isMobile ? "370px" : "240px",
                          marginBottom: 20,
                          width: "100%",
                        }}
                      >
                        <Paper
                          style={{
                            padding: isMobile ? 10 : "10px 10px 0px 10px",
                            marginTop: "2px",
                            // height: isMobile ? "400px" : "230px",
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                          }}
                          elevation={3}
                        >
                          <Grid
                            container
                            // xs={12}
                            // sm={12}
                            // md={12}
                            // lg
                            // xl
                            style={{
                              display: "flex",
                              // height: isIphone ? 160 : 220,
                            }}
                          >
                            <Grid item xs={5} sm={5} md={5} lg={5} xl={5}>
                              {/* {buy.product ? ( */}
                              <div
                                style={{
                                  display: "flex",
                                  // flexDirection: "column",
                                  height: 120,
                                  marginRight: 20,
                                }}
                              >
                                <Img
                                  placeholder="/imgLoading.svg"
                                  style={{
                                    backgroundColor: "#eeeeee",
                                    height: 120,
                                    borderRadius: "10px",
                                    marginRight: "20px",
                                    marginLeft: "20px",
                                  }}
                                  src={buy.product ? buy.product.thumbUrl : ""}
                                  debounce={1000}
                                  cache
                                  error="/imgError.svg"
                                  alt={buy.product && buy.product.name}
                                  id={index}
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                  }}
                                >
                                  <FormControl
                                    className={classes.formControl}
                                    style={{
                                      minWidth: 200,
                                      marginBottom: 10,
                                    }}
                                  >
                                    <InputLabel style={{ paddingLeft: 15 }}>
                                      {buy.product
                                        ? "Producto"
                                        : "Agrega un producto"}
                                    </InputLabel>
                                    <Select
                                      variant="outlined"
                                      value={buy.product.name}
                                      onChange={(e) =>
                                        changeProduct(e, buy.art, index)
                                      }
                                    >
                                      {productList !== "" &&
                                        productList.map((product) => {
                                          return (
                                            <MenuItem value={product.name}>
                                              {product.name}
                                            </MenuItem>
                                          );
                                        })}
                                    </Select>
                                  </FormControl>

                                  {buy.product.attributes.length > 0 && (
                                    <FormControl
                                      className={classes.formControl}
                                      style={{ minWidth: 200 }}
                                    >
                                      <InputLabel style={{ paddingLeft: 15 }}>
                                        {buy.product.attributes[0]?.name}
                                      </InputLabel>
                                      <Select
                                        variant="outlined"
                                        value={buy.product.selection.name}
                                        onChange={(e) => {
                                          handleVariantProduct(
                                            e.target.value,
                                            index,
                                            buy.art,
                                            buy.product
                                          );
                                        }}
                                      >
                                        {buy.product.variants.map((a) => {
                                          return (
                                            <MenuItem value={a.name}>
                                              {a.name}
                                            </MenuItem>
                                          );
                                        })}
                                      </Select>
                                    </FormControl>
                                  )}
                                </div>
                              </div>
                              {/* ) : (
                                <div
                                  style={{
                                    height: "180px",
                                    width: "180px",
                                    display: "grid",
                                    marginLeft: "20px",
                                    marginRight: "20px",
                                  }}
                                >
                                  <IconButton
                                    className={classes.addItemContainer}
                                    onClick={() => {
                                      props.setSelectedArtToAssociate({
                                        index,
                                        item: buy.art,
                                        previous: true,
                                      });
                                      history.push({ pathname: "/productos" });
                                    }}
                                  >
                                    <AddIcon
                                      style={{ fontSize: 80 }}
                                      color="primary"
                                    />
                                  </IconButton>
                                </div>
                              )} */}
                            </Grid>
                            <Grid
                              item
                              xs={5}
                              sm={5}
                              md={6}
                              lg={6}
                              xl={6}
                              style={{ display: "flex" }}
                            >
                              {buy.art && (
                                <div
                                  style={{
                                    backgroundColor: "#eeeeee",
                                    width: 120,
                                    height: 120,
                                    borderRadius: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 20,
                                  }}
                                >
                                  <Img
                                    placeholder="/imgLoading.svg"
                                    style={{
                                      backgroundColor: "#eeeeee",
                                      maxWidth: 120,
                                      maxHeight: 120,
                                      borderRadius: 10,
                                    }}
                                    src={buy.art ? buy.art.squareThumbUrl : ""}
                                    debounce={1000}
                                    cache
                                    error="/imgError.svg"
                                    alt={buy.art && buy.art.title}
                                    id={buy.art && buy.art.artId}
                                  />
                                </div>
                              )}
                              <div
                                style={{
                                  width: "100%",
                                  // height: 200,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignContent: "space-between",
                                }}
                              >
                                <FormControl
                                  className={classes.formControl}
                                  style={{
                                    marginBottom: 10,
                                  }}
                                >
                                  <InputLabel style={{ paddingLeft: 15 }}>
                                    {buy.art ? "Arte" : "título del arte"}
                                  </InputLabel>
                                  <Select
                                    variant="outlined"
                                    value={buy.art?.title || ""}
                                    onChange={(e) =>
                                      changeArt(
                                        e.target.value,
                                        buy.product,
                                        index
                                      )
                                    }
                                  >
                                    {artList !== "" &&
                                      artList.map((art) => {
                                        return (
                                          <MenuItem value={art.title}>
                                            {art.title.substring(0, 22)} -{" "}
                                            {art.prixerUsername}
                                          </MenuItem>
                                        );
                                      })}
                                  </Select>
                                </FormControl>

                                {buy.art && (
                                  <>
                                    <p
                                      style={{
                                        fontSize: "12px",
                                        padding: 0,
                                        margin: 0,
                                      }}
                                    >
                                      <strong> Arte: </strong> {buy.art.artId}
                                    </p>
                                    {/* <p
                                          style={{
                                            fontSize: "12px",
                                            padding: 0,
                                            margin: 0,
                                          }}
                                        >
                                          <strong> Prixer: </strong>{" "}
                                          {buy.art?.prixerUsername}
                                        </p> */}
                                  </>
                                )}
                                {buy.product && (
                                  <Grid
                                    item
                                    xs={12}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "end",
                                      margin: "10px 0",
                                    }}
                                  >
                                    <div style={{ paddingBottom: 5 }}>
                                      <strong>Precio: </strong>
                                      {`$${
                                        buy.product?.publicEquation ||
                                        buy.product?.publicPrice.from.replace(
                                          /[$]/gi,
                                          ""
                                        )
                                      }`}
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <strong>Cantidad: </strong>
                                      <input
                                        style={{
                                          width: 80,
                                          padding: "10px",
                                          borderRadius: 4,
                                        }}
                                        type="number"
                                        defaultValue={1}
                                        value={buy.quantity}
                                        min="1"
                                        InputLabelProps={{
                                          shrink: true,
                                        }}
                                        onChange={(e) => {
                                          props.changeQuantity({
                                            index,
                                            art: buy.art,
                                            product: buy.product,
                                            quantity: e.target.value,
                                          });
                                        }}
                                      />
                                    </div>
                                  </Grid>
                                )}
                              </div>
                            </Grid>

                            <Grid
                              item
                              xs={1}
                              sm={1}
                              md={1}
                              lg={1}
                              xl={1}
                              style={{
                                display: "flex",
                                justifyContent: "end",
                                height: 160,
                              }}
                            >
                              <Tooltip
                                title="Eliminar item"
                                style={{ height: 40, width: 40 }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    props.deleteItemInBuyState({ id: index })
                                  }
                                  color="primary"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    );
                  })}
                <Grid
                  style={{
                    // height: isMobile ? "370px" : "240px",
                    // marginBottom: 20,
                    width: "50%",
                  }}
                >
                  <Paper
                    style={{
                      padding: 10,
                      marginTop: "2px",
                      // height: isMobile ? "400px" : "230px",
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: isMobile ? "column" : "row",
                    }}
                    elevation={3}
                  >
                    <FormControl
                      className={classes.formControl}
                      style={{ width: "100%" }}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{ paddingLeft: 15 }}
                      >
                        Agrega un producto
                      </InputLabel>
                      <Select
                        variant="outlined"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={""}
                        onChange={handleProduct}
                      >
                        {productList !== "" &&
                          productList.map((product, index) => {
                            return (
                              <MenuItem value={product.name}>
                                {product.name}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                  </Paper>
                </Grid>
              </Grid>
            )}
            {activeStep === 2 && (
              <Grid
                container
                style={{
                  display: "flex",
                  padding: "8px",
                }}
              >
                {props.values && (
                  <Grid item lg={4} md={4}>
                    <Typography>
                      Pedido a nombre de{" "}
                      <strong>
                        {props.values.name} {props.values.lastName}
                      </strong>
                      .<br></br> A contactar por{" "}
                      <strong>{props.values.phone}</strong>.<br></br> Entregar
                      en <strong>{props.values.address}</strong>
                    </Typography>

                    <FormControl
                      variant="outlined"
                      style={{ minWidth: "100%", marginTop: 20 }}
                    >
                      <TextField
                        className={classes.textField}
                        variant="outlined"
                        rows="3"
                        multiline
                        // fullWidth
                        display="inline"
                        id="observations"
                        label="Observaciones"
                        name="observations"
                        autoComplete="observations"
                        value={props.values.observations}
                        onChange={(e) => {
                          props.setValues({
                            ...props.values,
                            observations: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                )}
                <Grid item md={8} lg={8} style={{ paddingLeft: 40 }}>
                  <div style={{ fontWeight: "bold" }}>Items:</div>
                  <div>
                    <List component="div" disablePadding>
                      {props.buyState.length > 0 ? (
                        props.buyState?.map((item, index) => (
                          <>
                            {item.product && item.art && (
                              <>
                                <ListItem>
                                  <ListItemText primary={`#${index + 1}`} />
                                </ListItem>
                                <Collapse
                                  in={true}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <List component="div" disablePadding>
                                    <ListItem>
                                      <ListItemText
                                        inset
                                        style={{
                                          marginLeft: 0,
                                          paddingLeft: 0,
                                        }}
                                        primary={
                                          <Grid container>
                                            <Grid item xs={12} md={8}>
                                              {item.product.name +
                                                " X " +
                                                item.art.title}
                                            </Grid>
                                            <Grid
                                              item
                                              xs={12}
                                              md={4}
                                              style={{
                                                display: "flex",
                                                justifyContent: isMobile
                                                  ? "space-between"
                                                  : "",
                                              }}
                                            >
                                              <div>
                                                Cantidad: {item.quantity || 1}
                                              </div>
                                              <div
                                                style={{
                                                  textAlign: "end",
                                                  paddingLeft: 10,
                                                }}
                                              >
                                                {`Precio: $${
                                                  (item.product
                                                    .publicEquation ||
                                                    item.product.publicPrice.from.replace(
                                                      /[$]/gi,
                                                      ""
                                                    )) * (item.quantity || 1)
                                                }`}
                                              </div>
                                            </Grid>
                                          </Grid>
                                        }
                                      />
                                    </ListItem>
                                  </List>
                                </Collapse>
                                <Divider />
                                {getTotalCombinedItems(props.buyState)
                                  .totalNotCompleted?.length >= 1 && (
                                  <Typography
                                    style={{
                                      fontSize: "11px",
                                      // color: "primary",
                                    }}
                                  >
                                    {getTotalCombinedItems(props.buyState)
                                      .totalNotCompleted?.length > 1
                                      ? `Faltan ${
                                          getTotalCombinedItems(props.buyState)
                                            .totalNotCompleted.length
                                        } productos por definir.`
                                      : `Falta 1 producto por definir.`}
                                  </Typography>
                                )}
                              </>
                            )}
                          </>
                        ))
                      ) : (
                        <Typography>No has seleccionado nada aún.</Typography>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Grid
                          item
                          lg={6}
                          md={6}
                          sm={6}
                          xs={6}
                          style={{ paddingLeft: 0 }}
                        >
                          <FormControl
                            disabled={props.buyState.length == 0}
                            className={classes.formControl}
                            style={{ minWidth: 200, marginTop: 25 }}
                          >
                            <InputLabel style={{ paddingLeft: 15 }}>
                              Método de pago
                            </InputLabel>
                            <Select
                              variant="outlined"
                              value={props.orderPaymentMethod}
                              onChange={(event) =>
                                setOrderPaymentMethod(event.target.value)
                              }
                            >
                              <MenuItem value={"Pago móvil"}>
                                Pago Movil
                              </MenuItem>
                              <MenuItem value={"Transferecia en Bolívares"}>
                                Transferencia en Bs
                              </MenuItem>
                              <MenuItem value={"Banco Panamá"}>
                                Banco Panamá
                              </MenuItem>
                              <MenuItem value={"Zelle"}>Zelle</MenuItem>
                              <MenuItem value={"USD efectivo"}>
                                Efectivo en dólares
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid
                          item
                          lg={6}
                          md={6}
                          sm={6}
                          xs={6}
                          style={{
                            display: "flex",
                            alignItems: "end",
                            marginTop: "24px",
                            marginRight: "14px",
                            flexDirection: "column",
                          }}
                        >
                          {props.buyState.length > 0 && (
                            <>
                              <strong>{`Subtotal: $${getTotalPrice(
                                props.buyState
                              ).toFixed(2)}`}</strong>
                              <strong>
                                {`IVA: $${getIvaCost(props.buyState).toFixed(
                                  2
                                )}`}
                              </strong>
                              <strong>{`Total: $${
                                getTotalPrice(props.buyState) +
                                getIvaCost(props.buyState)
                              }`}</strong>
                              <br />
                            </>
                          )}
                        </Grid>
                      </div>
                    </List>
                  </div>
                </Grid>
                <Grid
                  item
                  lg={12}
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    marginTop: 20,
                    marginBottom: "-20px",
                  }}
                >
                  <Button
                    disabled={props.buyState.length == 0}
                    variant="contained"
                    color="primary"
                    onClick={createOrder}
                  >
                    Crear orden
                  </Button>
                </Grid>
              </Grid>
            )}
          </div>
        </Grid>
      </Modal>
    </>
  );
}
