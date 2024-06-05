import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Img from "react-cool-img";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";

import axios from "axios";
import { useEffect } from "react";

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
    maxHeight: "90%",
    overflowY: "auto",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "400px",
    backgroundColor: "white",
    boxShadow: theme.shadows[4],
    padding: "16px 32px 24px",
    textAlign: "justify",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    marginBottom: 20,
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

export default function MovOrder(props) {
  const classes = useStyles();
  const theme = useTheme();

  const [order, setOrder] = useState();
  const [discountList, setDiscountList] = useState([]);
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));

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
    const url = process.env.REACT_APP_BACKEND_URL + "/order/readByPrixer";
    axios
      .post(url, {
        order: props.orderId,
      })
      .then((res) => {
        setOrder(res.data);
      });
  }, []);

  const finalPrice = (item) => {
    let unitPrice;
    let discount = discountList.find(
      (dis) => dis._id === item.product.discount
    );
    if (item.product.modifyPrice) {
      unitPrice = Number(item.product.finalPrice * item.quantity);
      return unitPrice;
    } else if (typeof item.product.discount === "string") {
      unitPrice = item.product.finalPrice
        ? item.product.finalPrice
        : item.product?.publicEquation
        ? Number(item.product?.publicEquation)
        : Number(item.product.publicPrice?.from) ||
          Number(item.product.prixerEquation) ||
          Number(item.product.prixerPrice.from);

      if (discount?.type === "Porcentaje") {
        let op = Number(
          (unitPrice - (unitPrice / 100) * discount.value) * item.quantity
        );
        unitPrice = op;
        return unitPrice;
      } else if (discount?.type === "Monto") {
        let op = Number((unitPrice - discount.value) * item.quantity);
        unitPrice = op;
        return unitPrice;
      }
    } else {
      unitPrice = item.product.finalPrice
        ? item.product.finalPrice
        : item.product?.publicEquation
        ? item.product?.publicEquation
        : item.product.publicPrice.from ||
          item.product.prixerEquation ||
          item.product.prixerPrice.from;

      let op = Number(unitPrice * item.quantity);
      unitPrice = op;
      return unitPrice;
    }
    // }
  };

  const getDis = (discount) => {
    if (typeof discount === "string") {
      return discount;
    } else {
      const s = discountList.find((dis) => dis._id === discount)?.name;
      return s;
    }
  };

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      props.handleClose();
    } else return;
  }
  document.addEventListener("keydown", handleKeyDown);

  return (
    <React.Fragment>
      {/* <Backdrop className={classes.backdrop} open={true}>
        <CircularProgress />
      </Backdrop> */}

      <Grid
        container
        className={classes.paper2}
        style={{ width: !isDeskTop && "100%", padding: !isDeskTop && 10 }}
      >
        <Grid
          item
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <IconButton onClick={props.handleClose}>
            <CloseIcon />
          </IconButton>
        </Grid>
        {props.type === "Depósito" ? (
          order?.requests.map(
            (item, index) =>
              item.art.prixerUsername ===
                JSON.parse(localStorage.getItem("token")).username && (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 10,
                      borderColor: "#d33f49",
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="h6"
                      style={{ marginTop: -38, textAlign: "center" }}
                    >
                      {`Orden #${order.orderId}`}
                    </Typography>
                    <Typography
                      variant="body1"
                      style={{ textAlign: "center", marginBottom: 6 }}
                    >
                      {`para ${order.basicData.name} ${order.basicData.lastname}`}
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
                          width: isDeskTop ? "150px" : "120px",
                          height: isDeskTop ? "150px" : "120px",
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
                            maxWidth: isDeskTop ? "150px" : "120px",
                            maxHeight: isDeskTop ? "150px" : "120px",
                            borderRadius: 10,
                          }}
                        />
                      </Paper>
                      <Paper
                        style={{
                          width: isDeskTop ? "150px" : "120px",
                          height: isDeskTop ? "150px" : "120px",
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
                            maxWidth: isDeskTop ? "150px" : "120px",
                            maxHeight: isDeskTop ? "150px" : "120px",
                            borderRadius: 10,
                          }}
                        />
                      </Paper>
                    </div>
                    <div style={{ padding: 10 }}>
                      <div>{"Arte: " + item.art?.title}</div>
                      <div>{"Producto: " + item.product.name}</div>
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
                              {item.product?.selection?.attributes[i]?.name +
                                ": " +
                                item.product?.selection?.attributes[i]?.value}
                            </p>
                          );
                        })}
                      <div style={{ marginTop: 10 }}>
                        {"Cantidad: " + item.quantity}
                      </div>
                      <div>
                        {"Precio unitario: $" +
                          Number(
                            item.product.finalPrice ||
                              item.product?.publicEquation ||
                              item.product?.publicPrice?.from ||
                              item.product.prixerEquation ||
                              item.product.prixerPrice.from
                          ).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </div>
                      {typeof item.product.discount === "string" &&
                        !item.product.modifyPrice && (
                          <div>
                            {"Descuento: " + getDis(item.product.discount)}
                          </div>
                        )}
                      <div>
                        {"Precio final: $" +
                          finalPrice(item)?.toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </div>
                      <strong>
                        {"Tu comisión: $" +
                          (finalPrice(item) / 10)?.toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </strong>
                    </div>
                  </div>
                </>
              )
          )
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            <Typography
              variant="h6"
              style={{ marginTop: -38 }}
              color="secondary"
              align="center"
            >
              {"Orden #"}
              {order?.orderId}
            </Typography>
            {order?.requests?.map((item, index) => (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: 10,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderRadius: 10,
                    // padding: 5,
                    borderColor: "#d33f49",
                    width: "100%",
                  }}
                >
                  <Typography
                    color="secondary"
                    variant="subtitle1"
                    align="center"
                  >
                    Item #{index + 1}
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
                        width: isDeskTop ? "150px" : "120px",
                        height: isDeskTop ? "150px" : "120px",
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
                          maxWidth: isDeskTop ? "150px" : "120px",
                          maxHeight: isDeskTop ? "150px" : "120px",
                          borderRadius: 10,
                        }}
                      />
                    </Paper>
                    <Paper
                      style={{
                        width: isDeskTop ? "150px" : "120px",
                        height: isDeskTop ? "150px" : "120px",
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
                          maxWidth: isDeskTop ? "150px" : "120px",
                          maxHeight: isDeskTop ? "150px" : "120px",
                          borderRadius: 10,
                        }}
                      />
                    </Paper>
                  </div>
                  <div style={{ padding: 10 }}>
                    <div>{"Arte: " + item.art?.title}</div>
                    {/* <div>{"Id: " + item.art?.artId}</div> */}
                    <div style={{ marginBottom: 10 }}>
                      {"Prixer: " + item.art?.prixerUsername}
                    </div>
                    <div>{"Producto: " + item.product.name}</div>
                    {item.product.selection &&
                      item.product.selection.attributes &&
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
                      })}
                    <div>{"Cantidad: " + item.quantity}</div>
                    <div>
                      {"Precio unitario: $" +
                        Number(
                          item.product.finalPrice ||
                            item.product?.publicEquation ||
                            item.product?.publicPrice?.from ||
                            item.product?.prixerEquation ||
                            item.product?.prixerPrice?.price
                        ).toLocaleString("de-DE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </div>
                    {typeof item.product.discount === "string" &&
                      !item.product.modifyPrice && (
                        <div>
                          {"Descuento: " + getDis(item.product.discount)}
                        </div>
                      )}
                  </div>
                </div>
              </>
            ))}
            <Grid
              item
              xs={12}
              sm={12}
              style={{
                display: "flex",
                flexDirection: "column",
                borderWidth: "1px",
                borderStyle: "solid",
                borderRadius: 10,
                borderColor: "grey",
                padding: 10,
              }}
            >
              <div>
                {"Subtotal: $" +
                  order?.subtotal.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </div>
              <div>
                {"IVA: $" +
                  order?.tax.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </div>
              {(order?.shippingCost ||
                order?.shippingData?.shippingMethod?.price) && (
                <div>
                  {"Envío: $" +
                    (
                      order?.shippingCost ||
                      order?.shippingData?.shippingMethod?.price
                    ).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </div>
              )}
              <div>
                <strong>
                  {"Total: $" +
                    order?.total.toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </strong>
              </div>
            </Grid>
          </div>
        )}
      </Grid>
    </React.Fragment>
  );
}
