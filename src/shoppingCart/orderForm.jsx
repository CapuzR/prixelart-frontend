import { makeStyles, useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import Divider from "@material-ui/core/Divider";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import MenuItem from "@material-ui/core/MenuItem";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Button from "@material-ui/core/Button";
// import Tooltip from "@material-ui/core/Tooltip";
import { Typography } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { useEffect, useState } from "react";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  gridInput: {
    width: "100%",
    marginBottom: "12px",
  },
  textField: {
    marginRight: "8px",
  },
}));

export default function OrderForm(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [previewVoucher, setPreviewVoucher] = useState();
  // const isIphone = useMediaQuery(theme.breakpoints.down("xs"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [balance, setBalance] = useState(0);
  const [discountList, setDiscountList] = useState([]);

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

  const getBalance = async () => {
    const url = process.env.REACT_APP_BACKEND_URL + "/account/readById";
    const data = { _id: JSON.parse(localStorage.getItem("token"))?.account };
    await axios
      .post(url, data)
      .then((response) => setBalance(response.data.balance));
  };

  const getPaymentMethod = () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/payment-method/read-all-v2";
    axios
      .get(base_url)
      .then((response) => {
        if (localStorage?.getItem("token")) {
          let prev = response.data;
          prev.push({ name: "Balance Prixer" });
          setPaymentMethods(prev);
        } else {
          setPaymentMethods(response.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    getPaymentMethod();
  }, []);

  useEffect(() => {
    if (
      JSON.parse(localStorage.getItem("token")) &&
      JSON.parse(localStorage.getItem("token")).username
    ) {
      getBalance();
    }
  }, []);

  const onImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      props.setPaymentVoucher(e.target.files[0]);
      setPreviewVoucher(URL.createObjectURL(e.target.files[0]));
    }
  };

  const getTotalPrice = (state) => {
    let prices = [0];
    state.map((item) => {
      if (
        item.product &&
        item.art &&
        (JSON.parse(localStorage?.getItem("token")) ||
          JSON.parse(localStorage?.getItem("adminToken"))) &&
        (JSON.parse(localStorage?.getItem("token"))?.username ||
          JSON.parse(localStorage?.getItem("adminToken"))?.username) &&
        typeof item.product.discount === "string"
      ) {
        let dis = discountList?.filter(
          (dis) => dis._id === item.product.discount
        )[0];
        if (dis?.type === "Porcentaje") {
          prices.push(
            Number(
              ((item.product?.prixerEquation ||
                item.product?.prixerPrice?.from) -
                ((item.product?.prixerEquation ||
                  item.product?.prixerPrice?.from) /
                  100) *
                  dis.value) *
                (item.quantity || 1)
            )
          );
        } else if (dis?.type === "Monto") {
          prices.push(
            Number(
              ((item.product?.prixerEquation ||
                item.product?.prixerPrice?.from) -
                dis.value) *
                (item.quantity || 1)
            )
          );
        }
      } else if (
        item.product &&
        item.art &&
        (JSON.parse(localStorage?.getItem("token")) ||
          JSON.parse(localStorage?.getItem("adminToken"))) &&
        (JSON.parse(localStorage?.getItem("token"))?.username ||
          JSON.parse(localStorage?.getItem("adminToken"))?.username)
      ) {
        prices.push(
          Number(
            (item.product?.prixerEquation || item.product?.prixerPrice?.from) *
              (item.quantity || 1)
          )
        );
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
            Number(
              ((item.product?.publicEquation ||
                item.product?.publicPrice?.from.replace(/[,]/gi, ".")) -
                ((item.product?.publicEquation ||
                  item.product?.publicPrice?.from.replace(/[,]/gi, ".")) /
                  100) *
                  dis.value) *
                (item.quantity || 1)
            )
          );
        } else if (dis?.type === "Monto") {
          prices.push(
            Number(
              ((item.product?.publicEquation ||
                item.product?.publicPrice?.from.replace(/[,]/gi, ".")) -
                dis.value) *
                (item.quantity || 1)
            )
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

  const PriceSelect = (product, quantity) => {
    if (
      typeof product.discount === "string" &&
      (JSON.parse(localStorage?.getItem("token")) ||
        JSON.parse(localStorage?.getItem("adminToken"))) &&
      (JSON.parse(localStorage?.getItem("token"))?.username ||
        JSON.parse(localStorage?.getItem("adminToken"))?.username) &&
      product.prixerEquation !== "" &&
      props.currency
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " Bs" +
              Number(
                (product.prixerEquation -
                  (product.prixerEquation / 100) * dis?.value) *
                  props.dollarValue *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " Bs" +
              Number(
                (product.prixerEquation - dis?.value) *
                  props.dollarValue *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
        </>
      );
    } else if (
      typeof product.discount === "string" &&
      (JSON.parse(localStorage?.getItem("token")) ||
        JSON.parse(localStorage?.getItem("adminToken"))) &&
      (JSON.parse(localStorage?.getItem("token"))?.username ||
        JSON.parse(localStorage?.getItem("adminToken"))?.username) &&
      product.prixerEquation !== ""
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " $" +
              Number(
                (product.prixerEquation -
                  (product.prixerEquation / 100) * dis?.value) *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " $" +
              Number(
                (product.prixerEquation - dis?.value) * quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
        </>
      );
    }
    if (
      typeof product.discount === "string" &&
      (JSON.parse(localStorage?.getItem("token")) ||
        JSON.parse(localStorage?.getItem("adminToken"))) &&
      (JSON.parse(localStorage?.getItem("token"))?.username ||
        JSON.parse(localStorage?.getItem("adminToken"))?.username) &&
      props.currency
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " $" +
              Number(
                (product.prixerPrice.from -
                  (product.prixerPrice.from / 100) * dis?.value) *
                  props.dollarValue *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " $" +
              Number(
                (product.prixerPrice.from - dis?.value) *
                  props.dollarValue *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
        </>
      );
    } else if (
      typeof product.discount === "string" &&
      (JSON.parse(localStorage?.getItem("token")) ||
        JSON.parse(localStorage?.getItem("adminToken"))) &&
      (JSON.parse(localStorage?.getItem("token"))?.username ||
        JSON.parse(localStorage?.getItem("adminToken"))?.username)
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " $" +
              Number(
                (product.prixerPrice.from -
                  (product.prixerPrice.from / 100) * dis?.value) *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " $" +
              Number(
                (product.prixerPrice.from - dis?.value) * quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
        </>
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
              })}
          {dis?.type === "Monto" &&
            " Bs" +
              Number(
                (product.publicEquation - dis?.value) *
                  props.dollarValue *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
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
              })}
          {dis?.type === "Monto" &&
            " $" +
              Number(
                (product.publicEquation - dis?.value) * quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
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
              })}
          {dis?.type === "Monto" &&
            " Bs" +
              Number(
                (product.publicPrice.from - dis?.value) *
                  props.dollarValue *
                  quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
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
              })}
          {dis?.type === "Monto" &&
            " $" +
              Number(
                (product.publicPrice.from - dis?.value) * quantity
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
        </>
      );
    } else if (
      JSON.parse(localStorage.getItem("token")) &&
      JSON.parse(localStorage.getItem("token")).username &&
      product.prixerEquation !== "" &&
      props.currency
    ) {
      return (
        " Bs" +
        Number(
          product.prixerEquation * props.dollarValue * quantity
        ).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        })
      );
    } else if (
      JSON.parse(localStorage.getItem("token")) &&
      JSON.parse(localStorage.getItem("token")).username &&
      product.prixerEquation !== ""
    ) {
      return " $" + product.prixerEquation * quantity;
    } else if (
      JSON.parse(localStorage.getItem("token")) &&
      JSON.parse(localStorage.getItem("token")).username &&
      props.currency
    ) {
      return (
        " Bs" +
        Number(
          product.prixerPrice.from * props.dollarValue * quantity
        ).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        })
      );
    } else if (
      JSON.parse(localStorage.getItem("token")) &&
      JSON.parse(localStorage.getItem("token")).username
    ) {
      return (
        " $" +
        Number(
          product.prixerPrice.from.replace(/[$]/gi, "") * quantity
        ).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        })
      );
    } else if (product.publicEquation !== "" && props.currency) {
      return (
        " Bs" +
        Number(
          product.publicPriceEquation * props.dollarValue * quantity
        ).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        })
      );
    } else if (product.publicEquation !== "") {
      return (
        " $" +
        Number(product.publicEquation * quantity).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        })
      );
    } else if (props.currency) {
      return (
        " Bs" +
        Number(
          product.publicPrice.from * props.dollarValue * quantity
        ).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        })
      );
    } else {
      return (
        " $" +
        Number(
          product.publicPrice.from.replace(/[$]/gi, "") * quantity
        ).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
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

  const getIvaCost = (state) => {
    let iva = getTotalPrice(state) * 0.16;
    return iva;
  };

  const getTotal = (x) => {
    let n = [];
    n.push(getTotalPrice(props.buyState));
    n.push(getIvaCost(props.buyState));
    {
      props.valuesConsumer.shippingMethod && n.push(shippingCost);
    }
    let total = n.reduce(function (a, b) {
      return a + b;
    });
    return total;
  };

  let shippingCost = Number(
    props.valuesConsumer.shippingMethod?.price.replace(/[$]/gi, "")
  );

  return (
    <>
      <form noValidate autoComplete="off">
        <Grid container>
          <Grid
            item
            lg={12}
            md={12}
            sm={12}
            xs={12}
            className={classes.gridInput}
          >
            <AppBar position="static" style={{ borderRadius: 5 }}>
              <Toolbar style={{ fontSize: 20, justifyContent: "center" }}>
                Orden de compra
              </Toolbar>
            </AppBar>
            <div
              style={{
                display: "flex",
                padding: "8px",
              }}
            >
              <div style={{ width: "100%" }}>
                <div style={{ fontWeight: "bold" }}>Items:</div>
                <div>
                  <List component="div" disablePadding>
                    {props.buyState?.map((item, index) => (
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
                                    style={{ marginLeft: 0, paddingLeft: 0 }}
                                    primary={
                                      <Grid container>
                                        <Grid item xs={12} md={8}>
                                          {item.product.name +
                                            " X " +
                                            item.art.title.substring(0, 27)}
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
                                            Cantidad:
                                            <br></br> {item.quantity || 1}
                                          </div>
                                          <div
                                            style={{
                                              textAlign: "end",
                                              paddingLeft: 10,
                                            }}
                                          >
                                            Monto:
                                            <br></br>
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
                    ))}
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
                          variant="outlined"
                          fullWidth
                          style={{ marginTop: 25 }}
                          required
                        >
                          <InputLabel htmlFor="outlined-age-simple">
                            Método de pago
                          </InputLabel>
                          <Select
                            input={<OutlinedInput />}
                            value={props.orderPaymentMethod}
                            onChange={(event) =>
                              props.setOrderPaymentMethod(event.target.value)
                            }
                          >
                            {paymentMethods &&
                              paymentMethods.map((m) => (
                                <MenuItem value={m}>{m.name}</MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                        {props.orderPaymentMethod && (
                          <>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <p align="left">
                                {props?.orderPaymentMethod?.instructions}
                                <br></br>
                                <br></br>
                                {props?.orderPaymentMethod?.paymentData}
                              </p>
                              <div>
                                {props.paymentVoucher && (
                                  <img
                                    src={previewVoucher}
                                    style={{ width: 200, borderRadius: 10 }}
                                  />
                                )}
                                <input
                                  type="file"
                                  id="inputfile"
                                  accept="image/jpeg, image/jpg, image/webp, image/png"
                                  onChange={onImageChange}
                                  style={{ display: "none" }}
                                />
                                <label htmlFor="inputfile">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    component="span"
                                    style={{ textTransform: "capitalize" }}
                                  >
                                    Cargar comprobante
                                  </Button>
                                </label>
                              </div>
                            </div>
                          </>
                        )}
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
                        {props.orderPaymentMethod?.name ===
                          "Balance Prixer" && (
                          <div
                            style={{
                              backgroundColor: "#d33f49",
                              color: "white",
                              fontWeight: "thin",
                              borderRadius: 5,
                              paddingLeft: 5,
                              paddingRight: 5,
                            }}
                          >
                            {props.currency
                              ? "Saldo disponible: Bs" +
                                (balance * props.dollarValue).toLocaleString(
                                  "de-DE",
                                  {
                                    minimumFractionDigits: 2,
                                  }
                                )
                              : "Saldo disponible: $" +
                                balance.toLocaleString("de-DE", {
                                  minimumFractionDigits: 2,
                                })}
                          </div>
                        )}
                        <strong>
                          {props.currency
                            ? "Subtotal: Bs" +
                              (
                                getTotalPrice(props.buyState) *
                                props.dollarValue
                              ).toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                              })
                            : `Subtotal: $${getTotalPrice(
                                props.buyState
                              ).toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                              })}`}
                        </strong>
                        <strong>
                          {props.currency
                            ? "IVA: Bs" +
                              (
                                getIvaCost(props.buyState) * props.dollarValue
                              ).toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                                // maximumSignificantDigits: 2,
                              })
                            : `IVA: $${getIvaCost(
                                props.buyState
                              ).toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`}
                        </strong>
                        {props.valuesConsumer.shippingMethod &&
                        props.currency ? (
                          <strong>{`Envío: Bs${(
                            shippingCost * props.dollarValue
                          ).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            // maximumSignificantDigits: 2,
                          })}`}</strong>
                        ) : (
                          props.valuesConsumer.shippingMethod && (
                            <strong>{`Envío: $${shippingCost}`}</strong>
                          )
                        )}
                        <strong>
                          {props.currency
                            ? "Total: Bs" +
                              (
                                getTotal(props.buyState) * props.dollarValue
                              ).toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                                // maximumSignificantDigits: 2,
                              })
                            : `Total: $${getTotal(
                                props.buyState
                              ).toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                // maximumSignificantDigits: 2,
                              })}`}
                        </strong>
                        <br />
                      </Grid>
                    </div>
                    <Grid
                      item
                      lg={12}
                      md={12}
                      sm={12}
                      xs={12}
                      style={{ paddingLeft: 0, marginTop: 30 }}
                    >
                      <TextField
                        variant="outlined"
                        label="Observaciones"
                        fullWidth
                        className={classes.textField}
                        value={props.observations}
                        onChange={(e) => props.setObservations(e.target.value)}
                      />
                    </Grid>
                  </List>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      </form>
    </>
  );
}
