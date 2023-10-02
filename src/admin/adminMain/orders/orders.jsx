import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import clsx from "clsx";
import { useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import GetAppIcon from "@material-ui/icons/GetApp";
import Title from "../Title";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Modal from "@material-ui/core/Modal";
import RefreshIcon from "@material-ui/icons/Refresh";
import { Backdrop } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tooltip from "@material-ui/core/Tooltip";
import Snackbar from "@material-ui/core/Snackbar";
import ReadOrders from "./readOrders";
import OrderDetails from "./orderDetails";
import CreateOrder from "./createOrder";
import { nanoid } from "nanoid";
const excelJS = require("exceljs");

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
  const moment = require("moment-timezone");

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isIphone = useMediaQuery(theme.breakpoints.down("xs"));
  const [isShowDetails, setIsShowDetails] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);
  const [rows, setRows] = useState();
  const [modalContent, setModalContent] = useState();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("recent");
  const [openCreateOrder, setOpenCreateOrder] = useState(false);
  const [dollarValue, setDollarValue] = useState(1);
  const [account, setAccount] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  const [discountList, setDiscountList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [movements, setMovements] = useState([]);

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

  const readMovements = async () => {
    const base_url2 =
      process.env.REACT_APP_BACKEND_URL + "/movement/readAllMovements";
    axios
      .post(
        base_url2,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setMovements(response.data.movements);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const updateOrders = () => {
    orders.map((order) => {
      const findMov = movements.find((mov) =>
        mov.description.includes(order.orderId)
      );
      if (findMov) {
        const Datev2 = moment(findMov?.createdOn)
          .tz("America/Caracas")
          .format();
        order.date = Datev2;
      }
    });
    setOrders(orders);
  };

  const downloadOrders = async () => {
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Pedidos");
    worksheet.columns = [
      { header: "status", key: "status", width: 16 },
      { header: "ID", key: "ID", width: 10 },
      { header: "Fecha de solicitud", key: "createdOn", width: 11 },
      { header: "Nombre del cliente", key: "basicData", width: 24 },
      { header: "Fecha de entrega", key: "shippingDate", width: 11 },
      { header: "Fecha concretada", key: "date", width: 12 },
      { header: "certificado", key: "", width: 12 },
      { header: "Prixer", key: "prixer", width: 18 },
      { header: "Arte", key: "art", width: 24 },
      { header: "Producto", key: "product", width: 20 },
      { header: "Atributo", key: "attributes", width: 20 },
      { header: "Cantidad", key: "quantity", width: 10 },
      { header: "Observación", key: "observations", width: 18 },
      { header: "Vendedor", key: "createdBy", width: 16 },
      { header: "Método de entrega", key: "shippingData", width: 14 },
      { header: "Validación del pago", key: "payStatus", width: 12 },
      { header: "Fecha de pago", key: "payDate", width: 11 },
      { header: "Costo unitario", key: "price", width: 8 },
      { header: "Fecha concretada", key: "completionDate", width: 11 },
    ];
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
    });
    orders.map((order, i) => {
      const v2 = {
        status: order?.status,
        ID: order.orderId,
        createdOn: order.createdOn?.substring(0, 10),
        date: order.date?.substring(0, 10),
        basicData:
          (order.basicData?.firstname || order.basicData?.name) +
          " " +
          order.basicData?.lastname,
        shippingDate: "",
        // Certificado
        prixer: "",
        art: "",
        product: "",
        attributes: "",
        quantity: "",
        observations: order?.observations,
        createdBy: order.createdBy?.username,
        shippingData: "",
        payStatus: order.payStatus,
        payDate: order?.payDate?.substring(0, 10),
        price: "",
      };

      let shippingData = " ";
      if (order.shippingData?.shippingMethod !== undefined) {
        shippingData = shippingData.concat(
          order.shippingData?.shippingMethod?.name
        );
      }
      let shippingDate;
      if (order.shippingData?.shippingDate !== undefined) {
        shippingDate = order.shippingData?.shippingDate;
      }
      let prixer = "";
      let art = "";
      let product = "";
      let attributes = "";
      let quantity = "";
      let price = "";
      order.requests.map((item) => {
        prixer = item.art.prixerUsername;

        art = item.art.title;

        product = item.product.name;

        if (
          item.product.selection &&
          item.product.selection?.attributes &&
          item.product.selection?.attributes[1]?.value
        ) {
          attributes =
            (item.product.selection?.attributes[0]?.value,
            ", ",
            item.product.selection?.attributes[1]?.value);
        } else if (
          item.product.selection &&
          item.product.selection?.attributes
        ) {
          attributes = item.product.selection.attributes[0].value;
        }

        quantity = item.quantity;
        if (
          item.product.publicEquation !== undefined &&
          item.product.publicEquation !== ""
        ) {
          price = ("$", item.product.publicEquation);
        } else if (
          item.product.prixerEquation !== undefined &&
          item.product.prixerEquation !== ""
        ) {
          price = ("$", item.product.prixerEquation);
        } else price = ("$", item.product?.publicPrice?.from);
        v2.prixer = prixer;
        v2.art = art;
        v2.product = product;
        v2.attributes = attributes;
        v2.quantity = quantity;
        v2.price = price;
        v2.shippingData = shippingData;
        v2.shippingDate = shippingDate;

        worksheet.addRow(v2).eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          };
        });
      });
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Pedidos.xlsx";
      link.click();
    });
  };

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
      let ordersv2 = orders.filter(
        (row) => row.createdBy.username === filter.seller
      );
      setRows(ordersv2);
    } else {
      let ordersv2 = orders.filter((row) =>
        row.orderId.toLowerCase().includes(filter.toLowerCase())
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
    readMovements();
  }, []);

  useEffect(() => {
    if (orders && movements) {
      updateOrders();
    }
  }, [orders, movements]);

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
        transitionDuration={500}
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
                <Tooltip
                  title="Descargar listado"
                  style={{ height: 40, width: 40 }}
                >
                  <Fab
                    color="primary"
                    size="small"
                    onClick={downloadOrders}
                    style={{ marginRight: 10 }}
                    download
                    // href={url}
                  >
                    <GetAppIcon />
                  </Fab>
                </Tooltip>
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

      <Modal open={isShowDetails} onClose={handleClose}>
        <OrderDetails
          permissions={props.permissions}
          modalContent={modalContent}
          setModalContent={setModalContent}
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
          setErrorMessage={setErrorMessage}
          setSnackBarError={setSnackBarError}
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
