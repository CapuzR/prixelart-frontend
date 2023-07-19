import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import clsx from "clsx";
import { useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import Title from "../Title";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Modal from "@material-ui/core/Modal";
import RefreshIcon from "@material-ui/icons/Refresh";
import { Backdrop } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tooltip from "@material-ui/core/Tooltip";
import { getAttributes, getEquation } from "../../../products/services";
import { useHistory } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import ReadOrders from "./readOrders";
import OrderDetails from "./orderDetails";
import CreateOrder from "./createOrder";
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
  // const history = useHistory();
  // const location = useLocation();
  const theme = useTheme();

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  // const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // const isIphone = useMediaQuery(theme.breakpoints.down("xs"));
  const [isShowDetails, setIsShowDetails] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);
  const [rows, setRows] = useState();
  const [modalContent, setModalContent] = useState();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("recent");
  const [openCreateOrder, setOpenCreateOrder] = useState(false);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState(undefined);
  const [currency, setCurrency] = useState(false);
  const [dollarValue, setDollarValue] = useState(1);
  const [account, setAccount] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  const [discountList, setDiscountList] = useState([]);
  const [orders, setOrders] = useState([]);

  const getDiscounts = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/discount/read-allv1";
    await axios
      .post(base_url, { adminToken: localStorage.getItem("adminTokenV") })
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
        setOrders(response.data.orders);
      })
      .catch((error) => {
        console.log(error);
      });
    setLoading(false);
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
    if (filter === "recent") {
      let ordersv2 = orders.sort(function (a, b) {
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
      let ordersv2 = orders.sort(function (a, b) {
        if (a.createdOn.toLowerCase() > b.createdOn.toLowerCase()) {
          return 1;
        }
        if (a.createdOn.toLowerCase() < b.createdOn.toLowerCase()) {
          return -1;
        }
        return 0;
      });
      setRows(ordersv2);
    } else if (filter === "coming") {
      let toDeliver = orders.filter(
        (row) =>
          row.shippingData && row.shippingData?.shippingDate !== undefined
      );
      let ordersv2 = toDeliver.sort(function (a, b) {
        if (
          a.shippingData?.shippingDate !== undefined &&
          b.shippingData?.shippingDate !== undefined &&
          a.shippingData?.shippingDate > b.shippingData?.shippingDate
        ) {
          return 1;
        }
        if (
          a.shippingData?.shippingDate !== undefined &&
          b.shippingData?.shippingDate !== undefined &&
          a.shippingData?.shippingDate < b.shippingData?.shippingDate
        ) {
          return -1;
        }
        if (a.shippingData?.shippingDate === undefined) {
          return -1;
        }
        return 0;
      });
      setRows(ordersv2);
    } else if (filter === "later") {
      let toDeliver = orders.filter(
        (row) =>
          row.shippingData && row.shippingData?.shippingDate !== undefined
      );
      let ordersv2 = toDeliver.sort(function (a, b) {
        if (
          a.shippingData?.shippingDate !== undefined &&
          b.shippingData?.shippingDate !== undefined &&
          a.shippingData?.shippingDate < b.shippingData?.shippingDate
        ) {
          return 1;
        }
        if (
          a.shippingData?.shippingDate !== undefined &&
          b.shippingData?.shippingDate !== undefined &&
          a.shippingData?.shippingDate > b.shippingData?.shippingDate
        ) {
          return -1;
        }
        if (a.shippingData?.shippingDate === undefined) {
          return -1;
        }
        return 0;
      });
      setRows(ordersv2);
    } else if (
      filter === "Pagado" ||
      filter === "Abonado" ||
      filter === "Giftcard" ||
      filter === "Obsequio" ||
      filter === "Anulado"
    ) {
      let ordersv2 = orders.filter((row) => row.payStatus === filter);
      setRows(ordersv2);
    } else if (filter === "Pendiente") {
      let ordersv2 = orders.filter(
        (row) => row.payStatus === filter || row.payStatus === undefined
      );
      setRows(ordersv2);
    } else if (
      filter === "Por producir" ||
      filter === "En impresión" ||
      filter === "En producción" ||
      filter === "Por entregar" ||
      filter === "Entregado" ||
      filter === "Concretado" ||
      filter === "Detenido" ||
      filter === "Anulado"
    ) {
      let ordersv2 = orders.filter((row) => row.status === filter);
      setRows(ordersv2);
    } else if (typeof filter === "object") {
      console.log(filter);
      let ordersv2 = orders.filter(
        (row) => row.createdBy.username === filter.seller
      );
      setRows(ordersv2);
    }
    setLoading(false);
  };

  // const deleteOrder = async (id) => {
  //   const URI = process.env.REACT_APP_BACKEND_URL + "/order/delete/" + id;
  //   await axios.delete(
  //     URI,
  //     { adminToken: localStorage.getItem("adminTokenV") },
  //     { withCredentials: true }
  //   );
  //   filterOrders();
  // };

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

  const payComission = async (order) => {
    for (let item of order.requests) {
      let unitPrice;
      let discount = discountList.find(
        (dis) => dis._id === item.product.discount
      );
      if (item.product.modifyPrice) {
        unitPrice = Number(
          (item.product.publicEquation?.replace(/[,]/gi, ".") / 10) *
            item.quantity
        );
      } else if (typeof item.product.discount === "string") {
        unitPrice =
          // item.product?.prixerEquation ||
          // item.product?.prixerPrice?.from ||
          Number(item.product?.publicEquation?.replace(/[,]/gi, ".")) ||
          Number(item.product.publicPrice.from?.replace(/[,]/gi, "."));

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
        unitPrice =
          // item.product?.prixerEquation?.replace(/[,]/gi, ".") ||
          // item.product?.prixerPrice?.from?.replace(/[,]/gi, ".") ||
          item.product?.publicEquation?.replace(/[,]/gi, ".") ||
          item.product.publicPrice.from?.replace(/[,]/gi, ".");

        let op = Number((unitPrice / 10) * item.quantity);
        unitPrice = op;
      }
      const url1 = process.env.REACT_APP_BACKEND_URL + "/prixer/read";
      await axios
        .post(url1, { username: item.art?.prixerUsername })
        .then(async (res) => {
          setAccount(res.data.account);
          const url = process.env.REACT_APP_BACKEND_URL + "/movement/create";
          const data = {
            _id: nanoid(),
            createdOn: new Date(),
            createdBy: JSON.parse(localStorage.getItem("adminToken")).username,
            date: new Date(),
            destinatary: res.data.account,
            description: `Comisión de la orden #${order.orderId}`,
            type: "Depósito",
            value: unitPrice,
            adminToken: localStorage.getItem("adminTokenV"),
          };
          await axios.post(url, data);
        });
      setAccount();
    }
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

  useEffect(() => {
    readOrders();
  }, []);

  const readDollarValue = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/dollarValue/read";
    await axios.get(base_url).then((response) => {
      setDollarValue(response.data.dollarValue);
    });
  };

  useEffect(() => {
    readDollarValue();
  }, []);

  const closeAd = () => {
    setSnackBarError(false);
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
            <ReadOrders
              rows={rows}
              setFilter={setFilter}
              filter={filter}
              filterOrders={filterOrders}
              setModalContent={setModalContent}
              setIsShowDetails={setIsShowDetails}
              isShowDetails={isShowDetails}
              handleChangePayStatus={handleChangePayStatus}
              handleChangeStatus={handleChangeStatus}
              permissions={props.permissions}
              admins={props.admins}
              setErrorMessage={setErrorMessage}
              setSnackBarError={setSnackBarError}
              readOrders={readOrders}
              sellers={props.sellers}
            ></ReadOrders>
          </Paper>
        </Grid>
      </Grid>

      <Modal open={isShowDetails}>
        <OrderDetails
          modalContent={modalContent}
          showVoucher={showVoucher}
          setShowVoucher={setShowVoucher}
          handleClose={handleClose}
          handleCloseVoucher={handleCloseVoucher}
        ></OrderDetails>
      </Modal>

      <Modal open={openCreateOrder}>
        <CreateOrder
          setLoading={setLoading}
          readOrders={readOrders}
          buyState={props.buyState}
          setBuyState={props.setBuyState}
          discountList={discountList}
          deleteItemInBuyState={props.deleteItemInBuyState}
          setSelectedArtToAssociate={props.setSelectedArtToAssociate}
          setSelectedProductToAssociate={props.setSelectedProductToAssociate}
          AssociateProduct={props.AssociateProduct}
          addItemToBuyState={props.addItemToBuyState}
          changeQuantity={props.changeQuantity}
          handleClose={handleClose}
          dollarValue={dollarValue}
        ></CreateOrder>
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
