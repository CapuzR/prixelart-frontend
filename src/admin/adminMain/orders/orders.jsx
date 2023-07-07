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
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
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
import { useHistory } from "react-router-dom";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import GetAppIcon from "@material-ui/icons/GetApp";
import Switch from "@material-ui/core/Switch";
import Snackbar from "@material-ui/core/Snackbar";
import FilterListIcon from "@material-ui/icons/FilterList";

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

export default function Orders(props) {
  const classes = useStyles();
  const history = useHistory();
  // const location = useLocation();
  const theme = useTheme();

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isIphone = useMediaQuery(theme.breakpoints.down("xs"));
  let custom = {
    title: "Personalizado",
  };

  // setArtList({ ...artList, custom });
  const [isShowDetails, setIsShowDetails] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);
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
  const [paymentMethods, setPaymentMethods] = useState(undefined);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState(undefined);
  const steps = [`Datos del comprador`, `Productos`, `Orden de compra`];
  const [imagesVariants, setImagesVariants] = useState([]);
  const [currency, setCurrency] = useState(false);
  const [dollarValue, setDollarValue] = useState(1);
  const [shippingList, setShippingList] = useState();
  const [account, setAccount] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  const [discountList, setDiscountList] = useState([]);
  const [count, setCount] = useState(0);
  const [sellers, setSellers] = useState([]);

  const getDiscounts = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/discount/read-allv2";
    await axios
      .post(base_url)
      .then((response) => {
        setDiscountList(response.data.discounts);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getDiscounts();
  }, []);

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

  useEffect(() => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/payment-method/read-all-v2";
    axios
      .get(base_url)
      .then((response) => {
        setPaymentMethods(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const readOrders = async () => {
    setLoading(true);
    const base_url = process.env.REACT_APP_BACKEND_URL + "/order/read-all";
    await axios
      .post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
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

  const getTotal = (x) => {
    let n = [];
    n.push(getTotalPrice(props.buyState));
    n.push(getIvaCost(props.buyState));
    {
      props.values?.shippingMethod && n.push(shippingCost);
    }
    let total = n.reduce(function (a, b) {
      return a + b;
    });
    return total;
  };

  let shippingCost = Number(props.values?.shippingMethod?.price);

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
    await axios.delete(
      URI,
      { adminToken: localStorage.getItem("adminTokenV") },
      { withCredentials: true }
    );
    filterOrders();
  };

  const handleClose = () => {
    setIsShowDetails(false);
    setOpenCreateOrder(false);
  };

  const handleCloseVoucher = () => {
    setShowVoucher(!showVoucher);
  };

  const downloadOrders = async () => {
    setLoading(true);
    const url = process.env.REACT_APP_BACKEND_URL + "/downloadOrders";
    await axios
      .get(url, { adminToken: localStorage.getItem("adminTokenV") })
      .then((res) => {
        if (res.data.message) {
          setErrorMessage(res.data.message);
          setSnackBarError(true);
        }
      });
    setLoading(false);
    setErrorMessage("Archivo descargado exitosamente");
    setSnackBarError(true);
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
    const consumerData = {
      _id: nanoid(6),
      active: true,
      contactedBy:
        JSON.parse(localStorage.getItem("adminToken")).firstname +
        " " +
        JSON.parse(localStorage.getItem("adminToken")).lastname,
      consumerType: "Particular",
      firstname: props.values?.name,
      lastname: props.values?.lastName,
      ci: props.values?.ci,
      phone: props.values?.phone,
      email: props.values?.email,
      address: props.values?.address,
      billingAddress: props.values?.billingAddress || props.values?.address,
      shippingAddress: props.values?.shippingAddress || props.values?.address,
    };

    const consumer = await axios.post(
      process.env.REACT_APP_BACKEND_URL + "/consumer/create",
      consumerData
    );

    const base_url = process.env.REACT_APP_BACKEND_URL + "/order/create";
    let input = {
      orderId: nanoid(6),
      requests: orderLines,
      basicData: {
        firstname: consumerData.firstname,
        lastname: consumerData.lastname,
        ci: consumerData.ci,
        email: consumerData.email,
        phone: consumerData.phone,
        address: consumerData.address,
      },
      shippingData: {
        name: props.values?.shippingName,
        lastname: props.values?.shippingLastName,
        phone: props.values?.shippingPhone,
        address: props.values?.shippingAddress,
        shippingMethod: props.values?.shippingMethod,
        shippingDate: props.values?.shippingDate,
      },
      billingData: {
        name: props.values?.billingShName,
        lastname: props.values?.billingShLastName,
        ci: props.values?.billingCi,
        company: props.values?.billingCompany,
        phone: props.values?.billingPhone,
        address: props.values?.billingAddress,
        orderPaymentMethod: orderPaymentMethod.name,
      },
      dollarValue: dollarValue,
      observations: props.values.observations,
      tax: getTotalPrice(props.buyState) * 0.16,
      subtotal: getTotalPrice(props.buyState),
      shippingCost: shippingCost,
      total: getTotal(props.buyState),
      createdOn: new Date(),
      createdBy: {
        username:
          JSON.parse(localStorage.getItem("adminToken")).firstname +
          " " +
          JSON.parse(localStorage.getItem("adminToken")).lastname,
      },
      consumerId: consumerData._id,
      orderType: "Particular",
      status: "Por producir",
    };
    const base_url3 = process.env.REACT_APP_BACKEND_URL + "/order/sendEmail";

    const order = await axios.post(base_url, input).then(async () => {
      console.log("Orden generada correctamente. Por favor, revisa tu email");
      await axios.post(base_url3, input).then(async (response) => {
        if (response.data.success === false) {
          await axios.post(base_url3, input);
        } else return;
      });
    });
    setOpenCreateOrder(false);
    props.setValues(undefined);
    localStorage.removeItem("buyState");
    props.setBuyState([]);
    readOrders();
    setLoading(false);
  };

  const getTotalPrice = (state) => {
    let prices = [0];
    state.map((item) => {
      if (item.product.modifyPrice) {
        prices.push(Number(item.product.publicEquation));
      } else if (
        item.product &&
        item.art &&
        typeof item.product.discount === "string"
      ) {
        let dis = discountList?.find(
          ({ _id }) => _id === item.product.discount
        );
        if (dis?.type === "Porcentaje") {
          prices.push(
            ((item.product?.publicEquation ||
              item.product?.publicPrice?.from.replace(/[,]/gi, ".")) -
              ((item.product?.publicEquation ||
                item.product?.publicPrice?.from.replace(/[,]/gi, ".")) /
                100) *
                dis.value) *
              (item.quantity || 1)
          );
        } else if (dis?.type === "Monto") {
          prices.push(
            ((item.product?.publicEquation ||
              item.product?.publicPrice?.from.replace(/[,]/gi, ".")) -
              dis.value) *
              (item.quantity || 1)
          );
        }
      } else if (item.product && item.art) {
        prices.push(
          (item.product?.publicEquation || item.product?.publicPrice?.from) *
            (item.quantity || 1)
        );
      }
    });
    let total = prices?.reduce(function (a, b) {
      return a + b;
    });
    return total;
  };

  const handleChangeStatus = async (order, status) => {
    const URI =
      process.env.REACT_APP_BACKEND_URL + "/order/update/" + order.orderId;
    const body = {
      adminToken: localStorage.getItem("adminTokenV"),
      status: status,
    };
    await axios.put(URI, body, { withCredentials: true }).then((res) => {
      if (res.data.message) {
        setErrorMessage(res.data.message);
        setSnackBarError(true);
      }
    });
    if (
      (order.payStatus === "Pagado" ||
        order.payStatus === "Giftcard" ||
        order.payStatus === "Obsequio") &&
      status === "Concretado"
    ) {
      payComission(order);
    }
    readOrders();
  };

  const payComission = (order) => {
    order.requests.map(async (item) => {
      let unitPrice =
        item.product?.prixerEquation ||
        item.product?.prixerPrice?.from ||
        item.product?.publicEquation ||
        item.product.publicPrice.from;

      let discount;
      if (typeof item.product.discount === "String") {
        discount = discountList.find(
          ({ _id }) => _id === item.product.discount
        );
        if (discount?.type === "Porcentaje") {
          let op = Number(
            ((unitPrice - (unitPrice / 100) * discount.value) / 10) *
              item.quantity
          );
          unitPrice = op;
        } else if (discount?.type === "Monto") {
          let op = Number(((unitPrice - discount.value) / 10) * item.quantity);
          unitPrice = op;
        }
      } else {
        let op = Number((unitPrice / 10) * item.quantity);
        unitPrice = op;
      }

      const url1 = process.env.REACT_APP_BACKEND_URL + "/prixer/read";
      await axios
        .post(url1, { username: item.art?.prixerUsername })
        .then((res) => {
          setAccount(res.data.account);
        });
      const url = process.env.REACT_APP_BACKEND_URL + "/movement/create";
      const data = {
        _id: nanoid(),
        createdOn: new Date(),
        createdBy: JSON.parse(localStorage.getItem("adminToken")).username,
        date: new Date(),
        destinatary: account,
        description: `Comisión de la orden #${order.orderId}`,
        type: "Depósito",
        value: unitPrice,
        adminToken: localStorage.getItem("adminTokenV"),
      };
      await axios.post(url, data);
      setAccount();
    });
  };

  const handleChangePayStatus = async (order, payStatus) => {
    const URI =
      process.env.REACT_APP_BACKEND_URL +
      "/order/updatePayStatus/" +
      order.orderId;
    const body = {
      adminToken: localStorage.getItem("adminTokenV"),
      payStatus: payStatus,
    };
    await axios.put(URI, body, { withCredentials: true }).then((res) => {
      if (res.data.message) {
        setErrorMessage(res.data.message);
        setSnackBarError(true);
      }
    });
    if (
      (payStatus === "Pagado" ||
        payStatus === "Giftcard" ||
        payStatus === "Obsequio") &&
      order.status === "Concretado"
    ) {
      payComission(order);
    }
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
      (result) => result.artId === selectedArt.artId
    );
    props.AssociateProduct({
      index: index,
      item: selectedArtFull,
      type: "art",
    });
  };

  const handleVariantProduct = (variant, index, art, product) => {
    let v = variant.split(",");
    let selectedVariant = product.variants.find((result) => {
      if (v[1] !== "undefined") {
        return result?.name === v[0] && result.attributes[1]?.value === v[1];
      } else {
        return result?.name === v[0];
      }
    });
    product.selection = selectedVariant;
    product.publicEquation = selectedVariant?.publicPrice.equation;
    const prev = props.buyState;
    prev[index].product = product;
    setCount(count + 1);
    localStorage.setItem("buyState", JSON.stringify(prev));
    props.setBuyState(prev);
    // props.AssociateProduct({
    //   index: index,
    //   item: product,
    //   type: "product",
    // });
  };

  const modifyPrice = (product, index, newPrice) => {
    const purchase = props.buyState;
    let item = props.buyState[index];
    item.product.publicEquation = newPrice;
    purchase.splice(index, 1, item);
    product.modifyPrice = true;
    product.publicEquation = newPrice.replace(/[,]/gi, ".");
    localStorage.setItem("buyState", JSON.stringify(purchase));
    props.setBuyState(purchase);
  };

  const setOpen = () => {
    // setIsShowDetails(false);
    setShowVoucher(!showVoucher);
  };

  const readDollarValue = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/dollarValue/read";
    await axios.get(base_url).then((response) => {
      setDollarValue(response.data.dollarValue);
    });
  };

  useEffect(() => {
    readDollarValue();
  }, []);

  const changeCurrency = () => {
    setCurrency(!currency);
  };

  const closeAd = () => {
    setSnackBarError(false);
  };
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

  const PriceSelect = (product, quantity) => {
    if (product.modifyPrice) {
      return (
        " $" +
        Number(product.publicEquation).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (
      typeof product.discount === "string" &&
      product.publicEquation !== "" &&
      props.currency
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " Bs" +
              Number(
                (product.publicEquation -
                  (product.publicEquation / 100) * dis?.value) *
                  props.dollarValue *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " Bs" +
              Number(
                (product.publicEquation - dis?.value) *
                  props.dollarValue *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
        </>
      );
    } else if (
      typeof product.discount === "string" &&
      product.publicEquation !== ""
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " $" +
              Number(
                (product.publicEquation -
                  (product.publicEquation / 100) * dis?.value) *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " $" +
              Number(
                (product.publicEquation - dis?.value) * quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
        </>
      );
    } else if (typeof product.discount === "string" && props.currency) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " Bs" +
              Number(
                (product.publicPrice.from -
                  (product.publicPrice.from / 100) * dis?.value) *
                  props.dollarValue *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " Bs" +
              Number(
                (product.publicPrice.from - dis?.value) *
                  props.dollarValue *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
        </>
      );
    } else if (typeof product.discount === "string") {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " $" +
              Number(
                (product.publicPrice.from -
                  (product.publicPrice.from / 100) * dis?.value) *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " $" +
              Number(
                (product.publicPrice.from - dis?.value) * quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
        </>
      );
    } else if (product.publicEquation !== "" && props.currency) {
      return (
        " Bs" +
        Number(
          product.publicPriceEquation * props.dollarValue * quantity
        ).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (product.publicEquation !== "") {
      return (
        " $" +
        Number(product.publicEquation * quantity).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (props.currency) {
      return (
        " Bs" +
        Number(
          product.publicPrice.from * props.dollarValue * quantity
        ).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else {
      return (
        " $" +
        Number(
          product.publicPrice.from.replace(/[$]/gi, "") * quantity
        ).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
  };
  const UnitPrice = (product) => {
    if (product.modifyPrice) {
      return Number(product.publicEquation).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (
      typeof product.discount === "string" &&
      product.publicEquation !== "" &&
      props.currency
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      if (dis?.type === "Porcentaje") {
        return Number(
          (product.publicEquation -
            (product.publicEquation / 100) * dis?.value) *
            props.dollarValue
        );
      } else if (dis?.type === "Monto") {
        return Number(
          (product.publicEquation - dis?.value) * props.dollarValue
        );
      }
    } else if (
      typeof product.discount === "string" &&
      product.publicEquation !== ""
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      if (dis?.type === "Porcentaje") {
        return Number(
          product.publicEquation - (product.publicEquation / 100) * dis?.value
        );
      } else if (dis?.type === "Monto") {
        return Number(product.publicEquation - dis?.value);
      }
    } else if (typeof product.discount === "string" && props.currency) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      if (dis?.type === "Porcentaje") {
        return Number(
          (product.publicPrice.from -
            (product.publicPrice.from / 100) * dis?.value) *
            props.dollarValue
        );
      }
      if (dis?.type === "Monto") {
        return Number(
          (product.publicPrice.from - dis?.value) * props.dollarValue
        );
      }
    } else if (typeof product.discount === "string") {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      if (dis?.type === "Porcentaje") {
        return Number(
          product.publicPrice.from -
            (product.publicPrice.from / 100) * dis?.value
        );
      }
      if (dis?.type === "Monto") {
        return Number(product.publicPrice.from - dis?.value);
      }
    } else if (product.publicEquation !== "" && props.currency) {
      return Number(product.publicPriceEquation * props.dollarValue);
    } else if (product.publicEquation !== "") {
      return Number(product.publicEquation?.replace(/[,]/gi, "."));
    } else if (props.currency) {
      return Number(product.publicPrice.from * props.dollarValue);
    } else {
      return Number(product.publicPrice.from);
    }
  };

  // const handleChangeSeller = async (order, seller) => {
  //   const url =
  //     process.env.REACT_APP_BACKEND_URL +
  //     "/order/updateSeller/" +
  //     order.orderId;
  //   const body = {
  //     adminToken: localStorage.getItem("adminTokenV"),
  //     seller: { username: seller },
  //   };
  //   await axios.put(url, body, { withCredentials: true }).then((res) => {
  //     if (res.data.message) {
  //       setErrorMessage(res.data.message);
  //       setSnackBarError(true);
  //     }
  //   });
  //   readOrders();
  // };

  // setTimeout(() => {
  //   if (props.admins) {
  //     const selectAdmins = props.admins.filter(
  //       (admin) => admin.area === "Ventas"
  //     );
  //     let sellers = [];
  //     selectAdmins.map((admin) => {
  //       sellers.push(admin.firstname + " " + admin.lastname);
  //     });
  //     setSellers(sellers);
  //   }
  // }, 100);

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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Title variant="h1">Pedidos</Title>
              <div>
                {/* <Tooltip
                  title="Descargar listado"
                  style={{ height: 40, width: 40 }}
                >
                  <Fab
                    color="primary"
                    size="small"
                    onClick={downloadOrders}
                    style={{ marginRight: 10 }}
                  >
                    <GetAppIcon />
                  </Fab>
                </Tooltip> */}
                {props.permissions?.createOrder && (
                  <Tooltip
                    title="Crear pedido"
                    style={{ height: 40, width: 40 }}
                  >
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
                  </Tooltip>
                )}
                <Tooltip
                  title="Recargar listado"
                  style={{ height: 40, width: 40 }}
                >
                  <Fab
                    color="primary"
                    size="small"
                    onClick={() => {
                      readOrders();
                    }}
                    style={{ marginRight: 10 }}
                  >
                    <RefreshIcon />
                  </Fab>
                </Tooltip>
                {/* <Tooltip
                  title="Filtrar listado"
                  style={{ height: 40, width: 40 }}
                >
                  <Fab
                    color="primary"
                    size="small"
                    onClick={() => {
                      readOrders();
                    }}
                  >
                    <FilterListIcon />
                  </Fab>
                </Tooltip> */}
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
                            Fecha
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
                    <TableCell align="center">
                      {/* <div style={{ display: "flex", justifyContent: "end" }}> */}
                      {/* <FormControl className={classes.formControl}> */}
                      {/* <InputLabel> */}
                      Fecha de entrega
                      {/* </InputLabel> */}
                      {/* <Select value={filter} onChange={handleChange}>
                            <MenuItem value={"recent"}>Próximos</MenuItem>
                            <MenuItem value={"previous"}>Lejanos</MenuItem>
                          </Select> */}
                      {/* </FormControl> */}
                      {/* </div> */}
                    </TableCell>
                    <TableCell align="center">Nombre</TableCell>
                    <TableCell align="center">Productos</TableCell>
                    <TableCell align="center">Status de Pago</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Asesor</TableCell>
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
                            {row.shippingData?.shippingDate?.substring(0, 10)}
                          </TableCell>
                          <TableCell align="center">
                            {row.basicData?.firstname} {row.basicData?.lastname}
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
                                Detalles
                              </div>
                            </Button>
                          </TableCell>
                          <TableCell align="center">
                            <FormControl
                              disabled={
                                JSON.parse(localStorage.getItem("adminToken"))
                                  .area !== "Master" &&
                                (!props.permissions?.detailPay ||
                                  row.payStatus === "Pagado")
                              }
                            >
                              <Select
                                id="payStatus"
                                SelectClassKey
                                value={row.payStatus || "Pendiente"}
                                onChange={(e) => {
                                  handleChangePayStatus(row, e.target.value);
                                }}
                              >
                                <MenuItem value={"Pendiente"}>
                                  Pendiente
                                </MenuItem>
                                <MenuItem value={"Pagado"}>Pagado</MenuItem>
                                <MenuItem value={"Abonado"}>Abonado</MenuItem>
                                <MenuItem value={"Giftcard"}>Giftcard</MenuItem>
                                <MenuItem value={"Obsequio"}>Obsequio</MenuItem>
                                <MenuItem value={"Anulado"}>Anulado</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>

                          <TableCell align="center">
                            <FormControl
                              disabled={
                                JSON.parse(localStorage.getItem("adminToken"))
                                  .area !== "Master" &&
                                (!props.permissions?.orderStatus ||
                                  row.status === "Cancelada" ||
                                  row.status === "Concretado")
                              }
                            >
                              <Select
                                id="status"
                                SelectClassKey
                                value={row.status}
                                onChange={(e) => {
                                  handleChangeStatus(row, e.target.value);
                                }}
                              >
                                <MenuItem value={"Por producir"}>
                                  Por producir
                                </MenuItem>
                                <MenuItem value={"En impresión"}>
                                  En impresión
                                </MenuItem>
                                <MenuItem value={"En producción"}>
                                  En producción
                                </MenuItem>
                                <MenuItem value={"Por entregar"}>
                                  Por entregar
                                </MenuItem>
                                <MenuItem value={"Entregado"}>
                                  Entregado
                                </MenuItem>
                                <MenuItem value={"Concretado"}>
                                  Concretado
                                </MenuItem>
                                <MenuItem value={"Detenido"}>Detenido</MenuItem>
                                <MenuItem value={"Anulado"}>Anulado</MenuItem>
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
                          <TableCell align="center">
                            {/* <Select
                              disabled={
                                JSON.parse(localStorage.getItem("adminToken"))
                                  .area !== "Master"
                              }
                              defaultValue={row.createdBy.username}
                              onChange={(e) => {
                                handleChangeSeller(row, e.target.value);
                              }}
                            >
                              <MenuItem value={row.createdBy.username}> */}
                            {row.createdBy.username}
                            {/* </MenuItem> */}

                            {/* {sellers &&
                                sellers.map((seller) => (
                                  <MenuItem value={seller}>{seller}</MenuItem>
                                ))}
                            </Select> */}
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

      <Modal open={isShowDetails}>
        <Grid container className={classes.paper2}>
          <Grid
            item
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {showVoucher && (
              <IconButton onClick={handleCloseVoucher}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Grid>
          {!showVoucher ? (
            modalContent && (
              <>
                {props.permissions?.detailOrder ? (
                  <>
                    <Grid
                      style={{
                        display: "flex",
                        flexDirection: "column",
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
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderRadius: 10,
                            padding: 5,
                            borderColor: "#d33f49",
                          }}
                        >
                          <Typography
                            variant="h6"
                            style={{ textAlign: "center", margin: 5 }}
                          >
                            {"Item #"}
                            {index + 1}
                          </Typography>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-evenly",
                            }}
                          >
                            <Paper
                              style={{
                                width: 150,
                                height: 150,
                                borderRadius: 10,
                                backgroundColor: "#eeeeee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              elevation={3}
                            >
                              <Img
                                src={item.art?.squareThumbUrl}
                                style={{
                                  maxWidth: 150,
                                  maxHeight: 150,
                                  borderRadius: 10,
                                }}
                              />
                            </Paper>
                            <Paper
                              style={{
                                width: 150,
                                height: 150,
                                borderRadius: 10,
                                backgroundColor: "#eeeeee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              elevation={3}
                            >
                              <Img
                                src={
                                  item.product?.thumbUrl ||
                                  item.product?.sources?.images[0]?.url
                                }
                                style={{
                                  maxWidth: 150,
                                  maxHeight: 150,
                                  borderRadius: 10,
                                }}
                              />
                            </Paper>
                          </div>
                          <div style={{ padding: 10 }}>
                            <div>{"Arte: " + item.art?.title}</div>
                            <div>{"Id: " + item.art?.artId}</div>
                            <div style={{ marginBottom: 10 }}>
                              {"Prixer: " + item.art?.prixerUsername}
                            </div>
                            <div>{"Producto: " + item.product.name}</div>
                            <div>{"Id: " + item.product._id}</div>
                            {item.product.selection &&
                              item.product.selection.attributes &&
                              item.product.attributes.map((a, i) => {
                                return (
                                  <p
                                    style={{
                                      // fontSize: 12,
                                      padding: 0,
                                      margin: 0,
                                    }}
                                  >
                                    {item.product?.selection?.attributes[i]
                                      .name +
                                      ": " +
                                      item.product?.selection?.attributes[i]
                                        .value}
                                  </p>
                                );
                              })}
                            {/* <div>
                              {item.product?.discount &&
                                "Descuento: " +
                                  discountList?.find(
                                    ({ _id }) => _id === item.product.discount
                                  ).name}
                            </div> */}

                            <div style={{ marginTop: 10 }}>
                              {"Cantidad: " + item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={6}
                      lg={6}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: 20,
                      }}
                    >
                      <Grid
                        style={{
                          marginBottom: 40,
                          marginRight: 20,
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderRadius: 10,
                          borderColor: "grey",
                          padding: 15,
                        }}
                      >
                        <strong>Datos básicos</strong>
                        <div>
                          {"Nombre: " +
                            modalContent.basicData.firstname +
                            " " +
                            modalContent.basicData.lastname}
                        </div>
                        <div>{"CI o RIF: " + modalContent?.basicData.ci}</div>
                        <div>
                          {"Teléfono: " + modalContent?.basicData.phone}
                        </div>
                        <div>{"Email: " + modalContent?.basicData.email}</div>
                        <div>
                          {"Dirección: " + modalContent?.basicData.address}
                        </div>
                      </Grid>

                      {modalContent.shippingData !== undefined && (
                        <Grid
                          style={{
                            marginBottom: 40,
                            marginRight: 20,
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderRadius: 10,
                            borderColor: "grey",
                            padding: 15,
                          }}
                        >
                          <strong>Datos de entrega</strong>
                          {modalContent.shippingData?.name &&
                            modalContent.shippingData?.lastname && (
                              <div>
                                {"Nombre: " +
                                  modalContent?.shippingData?.name +
                                  " " +
                                  modalContent?.shippingData?.lastname}
                              </div>
                            )}
                          {modalContent.shippingData?.phone && (
                            <div>
                              {"Teléfono: " + modalContent?.shippingData?.phone}
                            </div>
                          )}
                          {modalContent.shippingData?.shippingMethod && (
                            <div>
                              {"Método de entrega: " +
                                modalContent?.shippingData?.shippingMethod.name}
                            </div>
                          )}
                          {modalContent.shippingData?.address ? (
                            <div>
                              {"Dirección de envío: " +
                                modalContent?.shippingData?.address}
                            </div>
                          ) : (
                            modalContent?.basicData?.address && (
                              <div>
                                {"Dirección de envío: " +
                                  modalContent?.basicData?.address}
                              </div>
                            )
                          )}
                          {modalContent.shippingData?.shippingDate && (
                            <div>
                              {"Fecha de entrega: " +
                                modalContent?.shippingData?.shippingDate}
                            </div>
                          )}
                        </Grid>
                      )}

                      {modalContent.billingData !== undefined && (
                        <Grid
                          style={{
                            marginBottom: 40,
                            marginRight: 20,
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderRadius: 10,
                            borderColor: "grey",
                            padding: 15,
                          }}
                        >
                          <strong>Datos de facturación</strong>
                          <div>
                            {modalContent.createdBy.username !== undefined &&
                              "Pedido creado por: " +
                                modalContent.createdBy.username}
                          </div>
                          {modalContent.billingData.name &&
                            modalContent.billingData.lastname && (
                              <div>
                                {"Nombre: " +
                                  modalContent?.billingData.name +
                                  " " +
                                  modalContent?.billingData.lastname}
                              </div>
                            )}
                          {modalContent.billingData.ci && (
                            <div>
                              {"CI o RIF: " + modalContent?.billingData.ci}
                            </div>
                          )}
                          {modalContent.billingData.company && (
                            <div>
                              {"Razón social: " +
                                modalContent?.billingData.company}
                            </div>
                          )}
                          {modalContent.billingData.phone && (
                            <div>
                              {"Teléfono: " + modalContent?.billingData.phone}
                            </div>
                          )}
                          {modalContent.billingData.address && (
                            <div style={{ marginBottom: 20 }}>
                              {"Dirección de cobro: " +
                                modalContent?.billingData.address}
                            </div>
                          )}
                        </Grid>
                      )}

                      <Grid
                        style={{
                          marginBottom: 40,
                          marginRight: 20,
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderRadius: 10,
                          borderColor: "grey",
                          padding: 15,
                        }}
                      >
                        <strong>Datos de pago</strong>
                        <div>
                          {"Subtotal: $" +
                            Number(modalContent?.subtotal).toLocaleString(
                              "de-DE",
                              {
                                minimumFractionDigits: 2,
                                // maximumSignificantDigits: 2,
                              }
                            )}
                        </div>
                        <div>
                          {"IVA: $" +
                            Number(modalContent?.tax).toLocaleString("de-DE", {
                              minimumFractionDigits: 2,
                              // maximumSignificantDigits: 2,
                            })}
                        </div>
                        <div>
                          {modalContent.shippingData?.shippingMethod &&
                            "Envío: $" +
                              Number(
                                modalContent?.shippingData?.shippingMethod
                                  ?.price
                              ).toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                                // maximumSignificantDigits: 2,
                              })}
                        </div>
                        <div>
                          {"Total: $" +
                            Number(modalContent?.total).toLocaleString(
                              "de-DE",
                              {
                                minimumFractionDigits: 2,
                                // maximumSignificantDigits: 2,
                              }
                            )}
                        </div>
                        {modalContent?.dollarValue && (
                          <div style={{ marginBottom: 10 }}>
                            {"Tasa del dólar: Bs" +
                              Number(modalContent?.dollarValue).toLocaleString(
                                "de-DE",
                                {
                                  minimumFractionDigits: 2,
                                  // maximumSignificantDigits: 2,
                                }
                              )}
                          </div>
                        )}
                        <div>
                          {"Forma de pago: " +
                            modalContent?.billingData.orderPaymentMethod}
                        </div>
                        {modalContent.paymentVoucher && (
                          <Paper
                            style={{
                              width: 200,
                              borderRadius: 10,
                              marginTop: 10,
                            }}
                            elevation={3}
                          >
                            <Img
                              style={{ width: 200, borderRadius: 10 }}
                              src={modalContent?.paymentVoucher}
                              alt="voucher"
                              onClick={() => {
                                // setIsShowDetails(false);
                                setShowVoucher(!showVoucher);
                              }}
                            />
                          </Paper>
                        )}
                      </Grid>

                      {modalContent.observations && (
                        <Grid
                          style={{
                            marginBottom: 40,
                            marginRight: 20,
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderRadius: 10,
                            borderColor: "grey",
                            padding: 15,
                          }}
                        >
                          <strong>Observaciones</strong>
                          <div> {modalContent.observations}</div>
                        </Grid>
                      )}
                    </Grid>
                  </>
                ) : (
                  <Grid
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                    item
                    xs={12}
                  >
                    {modalContent?.requests.map((item, index) => (
                      <div
                        style={{
                          margin: "0px 20px 20px 0px",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderRadius: 10,
                          padding: 5,
                          borderColor: "#d33f49",
                        }}
                      >
                        <Typography
                          variant="h6"
                          style={{ textAlign: "center", margin: 5 }}
                        >
                          {"Item #"}
                          {index + 1}
                        </Typography>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-evenly",
                          }}
                        >
                          <div
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <Paper
                              style={{
                                width: 150,
                                height: 150,
                                borderRadius: 10,
                                backgroundColor: "#eeeeee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 10,
                                marginBottom: 10,
                              }}
                              elevation={3}
                            >
                              <Img
                                src={item.art?.squareThumbUrl}
                                style={{
                                  maxWidth: 150,
                                  maxHeight: 150,
                                  borderRadius: 10,
                                }}
                              />
                            </Paper>
                            <div>
                              <div>{"Arte: " + item.art.title}</div>
                              <div>{"Id: " + item.art?.artId}</div>
                              <div style={{ marginBottom: 10 }}>
                                {"Prixer: " + item.art?.prixerUsername}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <Paper
                              style={{
                                width: 150,
                                height: 150,
                                borderRadius: 10,
                                backgroundColor: "#eeeeee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 10,
                              }}
                              elevation={3}
                            >
                              <Img
                                src={
                                  item.product.thumbUrl ||
                                  item.product.sources.images[0].url
                                }
                                style={{
                                  maxWidth: 150,
                                  maxHeight: 150,
                                  borderRadius: 10,
                                }}
                              />
                            </Paper>
                            <div>
                              <div>{"Producto: " + item.product.name}</div>
                              <div>{"Id: " + item.product._id}</div>
                              {item.product.attributes.map((a, i) => {
                                return (
                                  <p
                                    style={{
                                      padding: 0,
                                      margin: 0,
                                    }}
                                  >
                                    {item.product.selection.attributes[i].name +
                                      ": " +
                                      item.product.selection.attributes[i]
                                        .value}
                                  </p>
                                );
                              })}
                              <div style={{ marginTop: 10 }}>
                                {"Cantidad: " + item.quantity}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {modalContent.observations && (
                      <Grid
                        style={{
                          marginBottom: 40,
                          marginRight: 20,
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderRadius: 10,
                          borderColor: "grey",
                          padding: 15,
                        }}
                      >
                        <strong>Observaciones</strong>
                        <div> {modalContent.observations}</div>
                      </Grid>
                    )}
                  </Grid>
                )}
              </>
            )
          ) : (
            <Paper
              elevation={3}
              style={{
                maxWidth: 600,
                maxHeight: 400,
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              <Img
                src={modalContent?.paymentVoucher}
                alt="voucher"
                style={{
                  maxWidth: 600,
                  maxHeight: 400,
                  borderRadius: 10,
                  // marginTop: 10,
                }}
              />
            </Paper>
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
                    <Title>Datos de entrega</Title>
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
                      lg={6}
                      md={6}
                      sm={12}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <FormControl
                        style={{ minWidth: "100%" }}
                        variant="outlined"
                      >
                        <InputLabel>Método de entrega</InputLabel>
                        <Select
                          id="shippingMethod"
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
                      <FormControl
                        style={{ minWidth: "100%" }}
                        variant="outlined"
                      >
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
                          value={props.values?.shippingDate}
                          error={props.values?.today < stringReadyDate}
                          min={stringReadyDate}
                          className={classes.textField}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onChange={(e) => {
                            props.setValues({
                              ...props.values,
                              shippingDate: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    {readyDate !== "Invalid Date" && (
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
                          billingDataCheck
                            ? props.values?.name
                              ? props.values.name
                              : ""
                            : billingShDataCheck
                            ? props.values?.shippingName
                              ? props.values.shippingName
                              : ""
                            : props.values.billingShName || ""
                        }
                        onChange={(e) =>
                          props.setValues({
                            ...props.values,
                            billingShName: e.target.value,
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
                        disabled={billingDataCheck || billingShDataCheck}
                        value={
                          billingDataCheck
                            ? props.values?.lastName
                              ? props.values.lastName
                              : ""
                            : billingShDataCheck
                            ? props.values?.shippingLastName
                              ? props.values.shippingLastName
                              : ""
                            : props.values.billingShLastName || ""
                        }
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
                          billingDataCheck
                            ? props.values?.phone
                              ? props.values.phone
                              : ""
                            : billingShDataCheck
                            ? props.values?.shippingPhone
                              ? props.values.shippingPhone
                              : ""
                            : props.values.billingShPhone || ""
                        }
                        onChange={(e) =>
                          props.setValues({
                            ...props.values,
                            billingShPhone: e.target.value,
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
                        label="RIF"
                        fullWidth
                        disabled={billingDataCheck || billingShDataCheck}
                        className={classes.textField}
                        helperText="ej: V-12345679 o V-1234567-0"
                        value={
                          billingDataCheck
                            ? props.values?.ci
                              ? props.values.ci
                              : ""
                            : // billingShDataCheck
                              //   ? props.values?.shippingPhone
                              //     ? props.values.shippingPhone
                              //     : ""
                              //   :
                              props.values.billingCi || ""
                        }
                        onChange={(e) =>
                          props.setValues({
                            ...props.values,
                            billingCi: e.target.value,
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
                        rows={3}
                        disabled={billingDataCheck || billingShDataCheck}
                        className={classes.textField}
                        value={
                          billingDataCheck
                            ? props.values?.address
                              ? props.values.address
                              : ""
                            : billingShDataCheck
                            ? props.values?.shippingAddress
                              ? props.values.shippingAddress
                              : ""
                            : props.values.billingShAddress || ""
                        }
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
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                          }}
                          elevation={3}
                        >
                          <Grid
                            container
                            style={{
                              display: "flex",
                            }}
                          >
                            <Grid item xs={5} sm={5} md={5} lg={5} xl={5}>
                              <div
                                style={{
                                  display: "flex",
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
                                      id={"product " + index}
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
                                        id={"variant " + index}
                                        value={
                                          // buy.product?.selection[0] !== null
                                          //   ? buy.product?.selection?.attributes
                                          //       .length > 1
                                          //     ? buy.product.selection.name +
                                          //       "," +
                                          //       buy.product.selection
                                          //         .attributes[1].value
                                          //     : buy.product.selection.attributes
                                          //         .length === 1 &&
                                          buy.product.selection.name
                                          // : ""
                                        }
                                        variant="outlined"
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
                                            <MenuItem
                                              value={
                                                a.name +
                                                "," +
                                                a.attributes[1]?.value
                                              }
                                            >
                                              {a.name}
                                              {a.attributes[1]?.value &&
                                                " " + a.attributes[1]?.value}
                                            </MenuItem>
                                          );
                                        })}
                                      </Select>
                                    </FormControl>
                                  )}
                                  {typeof buy.product.discount === "string" && (
                                    <Typography
                                      variant="p"
                                      style={{ paddingTop: 5, color: "grey" }}
                                    >
                                      Este producto tiene aplicado un descuento
                                      de
                                      {discountList.find(
                                        ({ _id }) =>
                                          _id === buy.product.discount
                                      ).type === "Porcentaje"
                                        ? " %" +
                                          discountList.find(
                                            ({ _id }) =>
                                              _id === buy.product.discount
                                          ).value
                                        : discountList.find(
                                            ({ _id }) =>
                                              _id === buy.product.discount
                                          ).type === "Monto" &&
                                          " $" +
                                            discountList.find(
                                              ({ _id }) =>
                                                _id === buy.product.discount
                                            ).value}
                                    </Typography>
                                  )}
                                </div>
                              </div>
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
                                    src={buy.art ? buy.art?.squareThumbUrl : ""}
                                    debounce={1000}
                                    cache
                                    error="/imgError.svg"
                                    alt={buy.art && buy.art.title}
                                    id={buy.art && buy.art?.artId}
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
                                    id={"Art " + index}
                                    variant="outlined"
                                    value={
                                      buy.art?.title.substring(0, 22) +
                                      " - " +
                                      buy.art?.prixerUsername
                                    }
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
                                          <MenuItem value={art}>
                                            {art.title.substring(0, 22) +
                                              " - " +
                                              art?.prixerUsername}
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
                                        // padding: 0,
                                        marginBottom: 10,
                                        marginTop: -2,
                                      }}
                                    >
                                      <strong> Arte: </strong> {buy.art?.artId}
                                    </p>
                                  </>
                                )}
                                {buy.product && (
                                  <Grid
                                    item
                                    xs={12}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      // margin: "10px 0",
                                    }}
                                  >
                                    <TextField
                                      variant="outlined"
                                      label={
                                        buy.product.selection
                                          ? "Precio variante: " +
                                            UnitPrice(buy.product)
                                          : "Precio base: " +
                                            UnitPrice(buy.product)
                                      }
                                      // type="Number"
                                      style={{ width: 200, height: 80 }}
                                      defaultValue={UnitPrice(buy.product)}
                                      // value={UnitPrice(buy.product) || ""}
                                      onChange={(e) => {
                                        modifyPrice(
                                          buy.product,
                                          index,
                                          e.target.value
                                        );
                                      }}
                                    />
                                    <div
                                      style={{
                                        display: "flex",
                                        // alignItems: "center",
                                        alignItems: "end",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          marginBottom: "10px",
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
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={12}
                  xl={12}
                  style={{ display: "flex", justifyContent: "end" }}
                >
                  <Switch
                    classes={{
                      root: classes.base,
                      switchBase: classes.switchBase,
                      thumb: currency ? classes.thumbTrue : classes.thumb,
                      track: classes.track,
                      checked: classes.checked,
                    }}
                    color="primary"
                    value={currency}
                    onChange={(e) => {
                      changeCurrency(e);
                    }}
                    style={{ marginRight: "-5px" }}
                  />
                </Grid>
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
                        minRows="3"
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
                                              <br></br>
                                              {item.product.selection.name}{" "}
                                              {item.product.selection.attributes
                                                .length > 1 &&
                                                item.product.selection
                                                  .attributes[1].value}
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
                                                Precio:
                                                {PriceSelect(
                                                  item.product,
                                                  item.quantity
                                                )}
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
                              value={orderPaymentMethod}
                              onChange={(event) =>
                                setOrderPaymentMethod(event.target.value)
                              }
                            >
                              {paymentMethods &&
                                paymentMethods.map((m) => (
                                  <MenuItem value={m}>{m.name}</MenuItem>
                                ))}
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
                              <strong>
                                Subtotal:
                                {currency
                                  ? " Bs" +
                                    Number(
                                      getTotalPrice(props.buyState) *
                                        dollarValue
                                    ).toLocaleString("de-DE", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  : " $" +
                                    Number(
                                      getTotalPrice(props.buyState)
                                    ).toLocaleString("de-DE", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                              </strong>

                              <strong>
                                IVA:
                                {currency
                                  ? " Bs" +
                                    Number(
                                      getIvaCost(props.buyState) * dollarValue
                                    ).toLocaleString("de-DE", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  : " $" +
                                    Number(
                                      getIvaCost(props.buyState)
                                    ).toLocaleString("de-DE", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                              </strong>

                              {props?.values?.shippingMethod && (
                                <strong>
                                  Envío:
                                  {currency
                                    ? " Bs" +
                                      Number(
                                        shippingCost * dollarValue
                                      ).toLocaleString("de-DE", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })
                                    : " $" +
                                      shippingCost.toLocaleString("de-DE", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                </strong>
                              )}
                              <strong>
                                Total:
                                {currency
                                  ? " Bs" +
                                    Number(
                                      getTotal(props.buyState) * dollarValue
                                    ).toLocaleString("de-DE", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  : " $" +
                                    Number(
                                      getTotal(props.buyState)
                                    ).toLocaleString("de-DE", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                              </strong>
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
                    color={"primary"}
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
      <Snackbar
        open={snackBarError}
        autoHideDuration={4000}
        message={errorMessage}
        className={classes.snackbar}
        onClose={closeAd}
      />
    </>
  );
}
