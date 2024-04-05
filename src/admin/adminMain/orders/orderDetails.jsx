import React, { useEffect, useState } from "react";
import axios from "axios";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import OutlinedInput from "@material-ui/core/OutlinedInput";

import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Img from "react-cool-img";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import x from "../../../apple-touch-icon-180x180.png";
import {
  getPVP,
  getPVM,
  getTotalUnitsPVM,
  getTotalUnitsPVP,
  getComission,
} from "../../../shoppingCart/pricesFunctions";
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

export default function OrderDetails(props) {
  const classes = useStyles();
  const moment = require("moment-timezone");
  const [consumer, setConsumer] = useState(undefined);

  const checkMov = async (Id) => {
    const url =
      process.env.REACT_APP_BACKEND_URL + "/movement/readMovementByOrderId";

    const body = {
      adminToken: localStorage.getItem("adminTokenV"),
      order: Id,
    };
    await axios.post(url, body).then((res) => {
      const oDate = res.data.createdOn;
      const Datev2 = moment(oDate).tz("America/Caracas").format();
    });
  };

  const checkConsumer = async (Id) => {
    const url = process.env.REACT_APP_BACKEND_URL + "/consumer/read-by-id";

    const body = {
      adminToken: localStorage.getItem("adminTokenV"),
      consumer: Id,
    };
    await axios.post(url, body).then((res) => {
      // console.log(res.data);
      setConsumer(res.data);
    });
  };

  const updateItemStatus = async (newStatus, index, orderId) => {
    const url = process.env.REACT_APP_BACKEND_URL + "/order/updateItemStatus";
    const body = {
      adminToken: localStorage.getItem("adminTokenV"),
      status: newStatus,
      index: index,
      order: orderId,
    };
    await axios.put(url, body).then((res) => {
      if (res.data.auth) {
        props.setModalContent(res.data.order);
        props.updateItemFromOrders(orderId, index, newStatus);
      }
    });
  };

  const PriceSelect = (item) => {
    if (typeof item.selectedPrixer?.username === "string") {
      return getPVM(
        item,
        false,
        props?.dollarValue,
        props.discountList,
        props?.selectedPrixer?.username
      ).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      return getPVP(
        item,
        false,
        props?.dollarValue,
        props.discountList
      ).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  const RenderHTML = ({ htmlString }) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      props.handleClose();
    } else return;
  }
  document.addEventListener("keydown", handleKeyDown);

  useEffect(() => {
    checkConsumer(props.modalContent.consumerId);
  }, []);

  console.log(props.modalContent);

  return (
    <Grid container className={classes.paper2}>
      <Grid
        item
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Typography
          variant="h6"
          style={{ display: "flex", width: "100%", justifyContent: "center" }}
        >
          Pedido de{" "}
          {(props.modalContent.basicData.firstname ||
            props.modalContent.basicData.name) +
            " " +
            props.modalContent.basicData.lastname}
        </Typography>
        {props.showVoucher && (
          <IconButton onClick={props.handleCloseVoucher}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <IconButton onClick={props.handleClose}>
          <CloseIcon />
        </IconButton>
      </Grid>
      {!props.showVoucher ? (
        props.modalContent && (
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
                  {props.modalContent?.requests.map((item, index) => (
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
                            src={
                              item.art.title === "Personalizado"
                                ? x
                                : item.art?.squareThumbUrl
                            }
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
                              item.product?.thumbUrl &&
                              item.product?.thumbUrl !== "undefined"
                                ? item.product?.thumbUrl
                                : item.product?.sources?.images[0]?.url
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
                        {item.art?.title !== "Personalizado" ? (
                          <>
                            <div>{"Id: " + item.art?.artId}</div>
                            <div style={{ marginBottom: 10 }}>
                              {item.art?.prixerUsername !== undefined &&
                                "Prixer: " + item.art?.prixerUsername}
                            </div>
                          </>
                        ) : (
                          <>
                            <div>{"Arte: " + item.art?.title}</div>
                            <div style={{ marginBottom: 10 }}>
                              {"Prixer: " + item.art?.prixerUsername}
                            </div>
                          </>
                        )}
                        <div>{"Producto: " + item.product.name}</div>
                        <div>{"Id: " + item.product._id}</div>
                        {item.product.selection &&
                        typeof item.product.selection === "object" ? (
                          item.product.attributes.map((a, i) => {
                            return (
                              <p
                                style={{
                                  padding: 0,
                                  margin: 0,
                                }}
                              >
                                {item.product?.selection?.attributes[i]?.name +
                                  ": " +
                                  item.product?.selection?.attributes[i]?.value}
                              </p>
                            );
                          })
                        ) : item.product.selection &&
                          typeof item.product.selection === "string" &&
                          item.product?.selection?.includes(" ") ? (
                          <div>
                            {item.product.selection}{" "}
                            {item.products?.variants &&
                              item.products?.variants.length > 0 &&
                              item.product.variants?.find(
                                (v) => v.name === item.product.selection
                              )?.attributes[1]?.value}
                          </div>
                        ) : (
                          item.product.selection && (
                            <div>{item.product.selection}</div>
                          )
                        )}
                        Precio unitario: $
                        {item.product?.finalPrice
                          ? item.product?.finalPrice?.toLocaleString("de-DE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : PriceSelect(item)}
                        <div>
                          {
                            typeof item.product?.discount === "string" &&
                              "Descuento: " + item.product?.discount
                            //     props.discountList?.find(
                            //       ({ _id }) => _id === item.product.discount
                            //     )?.name +
                            //     " ("}
                            // {typeof item.product?.discount === "string" &&
                            // props.discountList?.find(
                            //   ({ _id }) => _id === item.product.discount
                            // )?.type === "Monto"
                            //   ? "$" +
                            //     props.discountList?.find(
                            //       ({ _id }) => _id === item.product.discount
                            //     )?.value +
                            //     ")"
                            //   : typeof item.product?.discount === "string" &&
                            //     props.discountList?.find(
                            //       ({ _id }) => _id === item.product.discount
                            //     )?.type === "Porcentaje" &&
                            //     "%" +
                            //       props.discountList?.find(
                            //         ({ _id }) => _id === item.product.discount
                            //       )?.value +
                            //       ")"
                          }
                          {consumer?.consumerType === "Prixer" && "No aplicado"}
                        </div>
                        <div
                          style={{
                            marginTop: 10,
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          {"Cantidad: " + (item.quantity || 1)}
                          <Select
                            input={<OutlinedInput />}
                            id="status"
                            value={
                              item.product?.status
                                ? item.product?.status
                                : "Por producir"
                            }
                            onChange={(e) => {
                              updateItemStatus(
                                e.target.value,
                                index,
                                props.modalContent.orderId
                              );
                            }}
                          >
                            <MenuItem key={0} value={"Por producir"}>
                              Por producir
                            </MenuItem>
                            <MenuItem key={1} value={"En impresión"}>
                              En impresión
                            </MenuItem>
                            <MenuItem key={2} value={"En producción"}>
                              En producción
                            </MenuItem>
                            <MenuItem key={0} value={"Por entregar"}>
                              Por entregar
                            </MenuItem>
                            <MenuItem key={1} value={"Entregado"}>
                              Entregado
                            </MenuItem>
                            <MenuItem key={2} value={"Concretado"}>
                              Concretado
                            </MenuItem>
                            <MenuItem key={3} value={"Detenido"}>
                              Detenido
                            </MenuItem>
                            <MenuItem key={4} value={"Anulado"}>
                              Anulado
                            </MenuItem>
                          </Select>
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
                        (props.modalContent.basicData.firstname ||
                          props.modalContent.basicData.name) +
                        " " +
                        props.modalContent.basicData.lastname}
                    </div>
                    <div>{"CI o RIF: " + props.modalContent?.basicData.ci}</div>
                    <div>
                      {"Teléfono: " + props.modalContent?.basicData.phone}
                    </div>
                    <div>{"Email: " + props.modalContent?.basicData.email}</div>
                    <div>
                      {"Dirección: " + props.modalContent?.basicData.address}
                    </div>
                  </Grid>

                  {props.modalContent.shippingData !== undefined && (
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
                      {props.modalContent.shippingData?.name &&
                        props.modalContent.shippingData?.lastname && (
                          <div>
                            {"Nombre: " +
                              props.modalContent?.shippingData?.name +
                              " " +
                              props.modalContent?.shippingData?.lastname}
                          </div>
                        )}
                      {props.modalContent.shippingData?.phone && (
                        <div>
                          {"Teléfono: " +
                            props.modalContent?.shippingData?.phone}
                        </div>
                      )}
                      {props.modalContent.shippingData?.shippingMethod && (
                        <div>
                          {"Método de entrega: " +
                            props.modalContent?.shippingData?.shippingMethod
                              .name}
                        </div>
                      )}
                      {props.modalContent.shippingData?.address ? (
                        <div>
                          {"Dirección de envío: " +
                            props.modalContent?.shippingData?.address}
                        </div>
                      ) : (
                        props.modalContent?.basicData?.address && (
                          <div>
                            {"Dirección de envío: " +
                              props.modalContent?.basicData?.address}
                          </div>
                        )
                      )}
                      {props.modalContent.shippingData?.shippingDate && (
                        <div>
                          {"Fecha de entrega: " +
                            new Date(
                              props.modalContent?.shippingData?.shippingDate
                            )?.toLocaleDateString()}
                        </div>
                      )}
                    </Grid>
                  )}

                  {props.modalContent.billingData !== undefined && (
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
                        {props.modalContent.createdBy.username !== undefined &&
                          "Pedido creado por: " +
                            props.modalContent.createdBy.username}
                      </div>
                      {props.modalContent.billingData.name &&
                        props.modalContent.billingData.lastname && (
                          <div>
                            {"Nombre: " +
                              props.modalContent?.billingData.name +
                              " " +
                              props.modalContent?.billingData.lastname}
                          </div>
                        )}
                      {props.modalContent.billingData.ci && (
                        <div>
                          {"CI o RIF: " + props.modalContent?.billingData.ci}
                        </div>
                      )}
                      {props.modalContent.billingData.company && (
                        <div>
                          {"Razón social: " +
                            props.modalContent?.billingData.company}
                        </div>
                      )}
                      {props.modalContent.billingData.phone && (
                        <div>
                          {"Teléfono: " + props.modalContent?.billingData.phone}
                        </div>
                      )}
                      {props.modalContent.billingData.address && (
                        <div style={{ marginBottom: 20 }}>
                          {"Dirección de cobro: " +
                            props.modalContent?.billingData.address}
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
                        Number(props.modalContent?.subtotal).toLocaleString(
                          "de-DE",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                    </div>
                    <div>
                      IVA: $
                      {props.modalContent?.billingData?.orderPaymentMethod ===
                      "Balance Prixer"
                        ? "0,00"
                        : Number(props.modalContent?.tax).toLocaleString(
                            "de-DE",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                    </div>
                    <div>
                      {props.modalContent.shippingData?.shippingMethod &&
                        "Envío: $" +
                          Number(
                            props.modalContent?.shippingData?.shippingMethod
                              ?.price
                          ).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                    </div>
                    <div>
                      {"Total: $" +
                        Number(props.modalContent?.total).toLocaleString(
                          "de-DE",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,

                            // maximumSignificantDigits: 2,
                          }
                        )}
                    </div>
                    {props.modalContent?.dollarValue && (
                      <div style={{ marginBottom: 10 }}>
                        {"Tasa del dólar: Bs" +
                          Number(
                            props.modalContent?.dollarValue
                          ).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,

                            // maximumSignificantDigits: 2,
                          })}
                      </div>
                    )}
                    <div>
                      {"Forma de pago: " +
                        props.modalContent?.billingData?.orderPaymentMethod}
                    </div>
                    {props.modalContent.paymentVoucher && (
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
                          src={props.modalContent?.paymentVoucher}
                          alt="voucher"
                          onClick={() => {
                            // setIsShowDetails(false);
                            props.setShowVoucher(!props.showVoucher);
                          }}
                        />
                      </Paper>
                    )}
                  </Grid>

                  {props.modalContent.observations && (
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
                      <RenderHTML
                        htmlString={props.modalContent.observations}
                      />
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
                {props.modalContent?.requests.map((item, index) => (
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
                      <div style={{ display: "flex", flexDirection: "row" }}>
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

                      <div style={{ display: "flex", flexDirection: "row" }}>
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
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            width: 400,
                          }}
                        >
                          <div>{"Producto: " + item.product.name}</div>
                          <div>{"Id: " + item.product._id}</div>
                          {item.product.selection &&
                          typeof item.product.selection === "object" ? (
                            item.product.attributes.map((a, i) => {
                              return (
                                <p
                                  style={{
                                    padding: 0,
                                    margin: 0,
                                  }}
                                >
                                  {item.product?.selection?.attributes[i]
                                    ?.name +
                                    ": " +
                                    item.product?.selection?.attributes[i]
                                      ?.value}
                                </p>
                              );
                            })
                          ) : item.product.selection &&
                            typeof item.product.selection === "string" &&
                            item.product?.selection?.includes(" ") ? (
                            <div>
                              {item.product.selection}{" "}
                              {item.products?.variants &&
                                item.products?.variants.length > 0 &&
                                item.product.variants.find(
                                  (v) => v.name === item.product.selection
                                ).attributes[1]?.value}
                            </div>
                          ) : (
                            item.product.selection && (
                              <div>{item.product.selection}</div>
                            )
                          )}
                          <div
                            style={{
                              marginTop: 10,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            {"Cantidad: " + (item.quantity || 1)}
                            <Select
                              input={<OutlinedInput />}
                              id="status"
                              value={
                                item.product?.status
                                  ? item.product?.status
                                  : "Por producir"
                              }
                              onChange={(e) => {
                                updateItemStatus(
                                  e.target.value,
                                  index,
                                  props.modalContent.orderId
                                );
                              }}
                            >
                              <MenuItem key={0} value={"Por producir"}>
                                Por producir
                              </MenuItem>
                              <MenuItem key={1} value={"En impresión"}>
                                En impresión
                              </MenuItem>
                              <MenuItem key={2} value={"En producción"}>
                                En producción
                              </MenuItem>
                              <MenuItem key={0} value={"Por entregar"}>
                                Por entregar
                              </MenuItem>
                              <MenuItem key={1} value={"Entregado"}>
                                Entregado
                              </MenuItem>
                              <MenuItem key={2} value={"Concretado"}>
                                Concretado
                              </MenuItem>
                              <MenuItem key={3} value={"Detenido"}>
                                Detenido
                              </MenuItem>
                              <MenuItem key={4} value={"Anulado"}>
                                Anulado
                              </MenuItem>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {props.modalContent.observations && (
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
                    <RenderHTML htmlString={props.modalContent.observations} />
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
            src={props.modalContent?.paymentVoucher}
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
  );
}
