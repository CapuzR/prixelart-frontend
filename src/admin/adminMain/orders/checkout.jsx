import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import { useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import Divider from "@material-ui/core/Divider";
import Switch from "@material-ui/core/Switch";

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
export default function Checkout(props) {
  const classes = useStyles();
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [currency, setCurrency] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState(undefined);
  const [prixers, setPrixers] = useState([]);
  // const [selectedPrixer, setSelectedPrixer] = useState();

  let shippingCost = Number(props.shippingData?.shippingMethod?.price);

  useEffect(() => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/prixer/read-all-full";

    axios.get(base_url).then((response) => {
      setPrixers(response.data.prixers);
    });
  }, []);

  useEffect(() => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/payment-method/read-all-v2";
    axios
      .get(base_url)
      .then((response) => {
        let prev = response.data;
        if (props.selectedPrixer) {
          prev.unshift({ name: "Balance Prixer" });
        }
        setPaymentMethods(prev);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [props.selectedPrixer]);

  const getTotal = (x) => {
    let n = [];
    n.push(getTotalPrice(props.buyState));
    n.push(getIvaCost(props.buyState));
    {
      props.shippingData?.shippingMethod && n.push(shippingCost);
    }
    let total = n.reduce(function (a, b) {
      return a + b;
    });
    return total;
  };

  const getIvaCost = (state) => {
    let iva = getTotalPrice(state) * 0.16;
    return iva;
  };

  const getTotalPrice = (state) => {
    let prices = [0];
    state.map((item) => {
      if (item.product.modifyPrice) {
        prices.push(Number(item.product.publicEquation * (item.quantity || 1)));
      } else if (
        item.product &&
        item.art &&
        typeof item.product.discount === "string"
      ) {
        let dis = props.discountList?.find(
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

  const changeCurrency = () => {
    setCurrency(!currency);
  };

  const PriceSelect = (product, quantity) => {
    let dis = props.discountList?.filter(
      (dis) => dis._id === product.discount
    )[0];

    if (product.modifyPrice && currency) {
      return (
        " Bs" +
        Number(
          product.publicEquation.replace(/[,]/gi, ".") *
            (quantity || 1) *
            props.dollarValue
        ).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (product.modifyPrice) {
      return (
        " $" +
        Number(product.publicEquation * (quantity || 1)).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )
      );
    } else if (
      typeof product.discount === "string" &&
      product.publicEquation !== "" &&
      currency
    ) {
      if (dis?.type === "Porcentaje") {
        return (
          " Bs" +
          Number(
            (product.publicEquation -
              (product.publicEquation / 100) * dis?.value) *
              props.dollarValue *
              quantity
          ).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      }
      if (dis?.type === "Monto") {
        return (
          " Bs" +
          Number(
            (product.publicEquation - dis?.value) * props.dollarValue * quantity
          ).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      }
    } else if (
      typeof product.discount === "string" &&
      product.publicEquation !== ""
    ) {
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
    } else if (typeof product.discount === "string" && currency) {
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
    } else if (product.publicEquation !== "" && currency) {
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
    } else if (currency) {
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

  const getTotalCombinedItems = (state) => {
    const totalNotCompleted = state.filter(
      (item) => !item.art || !item.product
    );
    return {
      totalNotCompleted,
    };
  };

  useEffect(() => {
    if (props.basicData && props.basicData.name && props.basicData.lastname) {
      prixers.map((prixer) => {
        if (
          prixer.firstName.toLowerCase() ===
            props.basicData.name.toLowerCase().trim() &&
          prixer.lastName.toLowerCase() ===
            props.basicData.lastname.toLowerCase().trim()
        ) {
          props.setSelectedPrixer(prixer);
        } else return;
      });
    }
  }, [prixers]);

  return (
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
      {props.basicData && (
        <Grid item lg={4} md={4}>
          <Typography>
            Pedido a nombre de{" "}
            <strong>
              {props.basicData.name} {props.basicData.lastname}
            </strong>
            .<br></br> A contactar por{" "}
            <strong>
              {props.shippingData?.phone || props.basicData?.phone}
            </strong>
            .<br></br> Entregar en{" "}
            <strong>
              {props.shippingData?.address || props.basicData?.address}
            </strong>
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
              value={props.observations}
              onChange={(e) => {
                props.setObservations(e.target.value);
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
                      <Collapse in={true} timeout="auto" unmountOnExit>
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
                                    {item.product.name + " X " + item.art.title}
                                    <br></br>
                                    {item.product?.selection &&
                                      item.product?.selection?.name}
                                    {item.product?.selection?.attributes &&
                                      item.product.selection.attributes
                                        ?.length > 1 &&
                                      item.product.selection.attributes[1]
                                        ?.value}
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
                                    <div>Cantidad: {item.quantity || 1}</div>
                                    <div
                                      style={{
                                        textAlign: "end",
                                        paddingLeft: 10,
                                      }}
                                    >
                                      Precio:
                                      {PriceSelect(item.product, item.quantity)}
                                    </div>
                                  </Grid>
                                </Grid>
                              }
                            />
                          </ListItem>
                        </List>
                      </Collapse>
                      <Divider />
                    </>
                  )}
                </>
              ))
            ) : (
              <Typography>No has seleccionado nada aún.</Typography>
            )}
            {getTotalCombinedItems(props.buyState).totalNotCompleted?.length >=
              1 && (
              <Typography
                style={{
                  fontSize: "11px",
                  // color: "primary",
                }}
              >
                {getTotalCombinedItems(props.buyState).totalNotCompleted
                  ?.length > 1
                  ? `Faltan ${
                      getTotalCombinedItems(props.buyState).totalNotCompleted
                        .length
                    } productos por definir.`
                  : `Falta 1 producto por definir.`}
              </Typography>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Grid item lg={6} md={6} sm={6} xs={6} style={{ paddingLeft: 0 }}>
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
                      props.setBillingData({
                        ...props.billingData,
                        orderPaymentMethod: event.target.value.name,
                      })
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
                            getTotalPrice(props.buyState) * props.dollarValue
                          ).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : " $" +
                          Number(getTotalPrice(props.buyState)).toLocaleString(
                            "de-DE",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                    </strong>

                    <strong>
                      IVA:
                      {currency
                        ? " Bs" +
                          Number(
                            getIvaCost(props.buyState) * props.dollarValue
                          ).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : " $" +
                          Number(getIvaCost(props.buyState)).toLocaleString(
                            "de-DE",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                    </strong>

                    {props?.shippingData?.shippingMethod && (
                      <strong>
                        Envío:
                        {currency
                          ? " Bs" +
                            Number(
                              shippingCost * props.dollarValue
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
                            getTotal(props.buyState) * props.dollarValue
                          ).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : " $" +
                          Number(getTotal(props.buyState)).toLocaleString(
                            "de-DE",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
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
          disabled={props.loadingOrder || props.buyState.length == 0}
          variant="contained"
          color={"primary"}
          onClick={props.createOrder}
        >
          Crear orden
        </Button>
      </Grid>
    </Grid>
  );
}
