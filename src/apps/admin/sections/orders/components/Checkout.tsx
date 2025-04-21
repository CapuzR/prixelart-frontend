import { useEffect, useState } from "react";
import axios from "axios";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  UnitPrice,
  UnitPriceSug,
  getComission,
  getPVPtext,
  getPVMtext,
  getPVP,
  getPVM,
  getTotalUnitsPVM,
  getTotalUnitsPVP,
} from "../../../../consumer/checkout/pricesFunctions.js";
import CurrencySwitch from "components/CurrencySwitch";
import { Theme, useTheme } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useConversionRate, useCurrency, useSnackBar } from "@context/GlobalContext.js";
import { PaymentMethod } from "../../../../../types/paymentMethod.types.js";
import { useOrder } from "@context/OrdersContext.js";

interface CheckoutProps {
  loadingOrder: boolean;
  createOrder: () => void;
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
    formControl: {
      minWidth: 120,
    },
  };
});

export default function Checkout({ loadingOrder, createOrder }: CheckoutProps) {
  const { classes } = useStyles();
  const theme = useTheme();
  const { state, dispatch } = useOrder();
  const { order, selectedPrixer, prixers } = state;
  const { lines, consumerDetails, shipping, billing } = order;
  const { basic } = consumerDetails;
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const { showSnackBar } = useSnackBar();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const handleEditorChange = (value: string) => {
    dispatch({
      type: "SET_OBSERVATIONS",
      payload: value,
    });
  };

  let shippingCost = Number(shipping?.method?.price);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/payment-method/read-all-v2"
        );
        let methods = response.data;
        if (selectedPrixer) {
          methods.unshift({ name: "Balance Prixer" });
        }
        setPaymentMethods(methods);
      } catch (error) {
        console.error(error);
        showSnackBar('Error al cargar métodos de pago');
      }
    };

    fetchPaymentMethods();
  }, [selectedPrixer]);

  const calculateTotals = () => {
    let subtotal = lines.reduce((acc, line) => {
      if (!line.item.product || !line.item.art) return acc;
      return acc + (line.pricePerUnit * line.quantity);
    }, 0);

    const tax = selectedPrixer ? 0 : subtotal * 0.16;
    const shippingCost = shipping.method?.price || 0;
    const total = subtotal + tax + shippingCost;

    return {
      subtotal,
      tax,
      shippingCost,
      total
    };
  };

  const handlePaymentMethodChange = (method: string) => {
    if (method === "Balance Prixer" && selectedPrixer) {
      dispatch({
        type: "SET_BILLING_DETAILS",
        payload: {
          ...billing,
          method,
          destinatary: selectedPrixer.account
        }
      });
    } else {
      dispatch({
        type: "SET_BILLING_DETAILS",
        payload: {
          ...billing,
          method
        }
      });
    }
  };

  const handleCreateOrder = () => {
    if (lines.length === 0) {
      showSnackBar('Debe agregar al menos un producto');
      return;
    }

    if (!billing.method) {
      showSnackBar('Debe seleccionar un método de pago');
      return;
    }

    const totals = calculateTotals();
    
    dispatch({
      type: "UPDATE_ORDER",
      payload: {
        ...order,
        subTotal: totals.subtotal,
        tax: [{
          id: 'IVA',
          name: 'IVA',
          value: 16,
          amount: totals.tax
        }],
        total: totals.total
      }
    });

    createOrder();
  };

  const getTotal = (x) => {
    let n = [];
    n.push(Number(getTotalPrice(buyState).replace(/[,]/gi, ".")));
    n.push(getIvaCost(buyState));
    {
      shippingData?.shippingMethod && n.push(shippingCost);
    }
    let total = n.reduce(function (a, b) {
      return a + b;
    });
    return total.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getIvaCost = (state) => {
    if (typeof selectedPrixer?.username === "string") {
      return 0;
    } else {
      return Number(getTotalPrice(state).replace(/[,]/gi, ".")) * 0.16;
    }
  };

  const getTotalPrice = (state) => {
    if (selectedPrixer) {
      return getTotalUnitsPVM(
        state,
        currency,
        conversionRate,
        discounts,
        selectedPrixer.username
      )?.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      return getTotalUnitsPVP(
        state,
        currency,
        conversionRate,
        discounts
      )?.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  const PriceSelect = (item) => {
    if (selectedPrixer) {
      return (
        getPVM(
          item,
          currency,
          conversionRate,
          discounts,
          selectedPrixer?.username
        ) * item.quantity
      ).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      return (
        getPVP(item, currency, conversionRate, discounts) * item.quantity
      ).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
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

  const handleShowCertified = async (index: number, value: boolean) => {
    const newState = [...buyState];
    let last = 0;
    const matches = newState.filter(
      (item) => item.art.artId === newState[index].art.artId
    );
    const sequences = matches.map((item) => item.art.certificate.sequence);
    last = Math.max(...sequences);

    newState[index].product.autoCertified = value;
    if (value) {
      newState[index].art.certificate.sequence = last + 1;
    } else {
      newState[index].art.certificate.sequence = 0;
    }
    setBuyState(newState);
    localStorage.setItem("buyState", JSON.stringify(newState));
  };

  useEffect(() => {
    if (basic && basic.name && basic.lastName && prixers) {
      prixers.map((prixer) => {
        if (
          prixer?.firstName &&
          prixer?.firstName?.toLowerCase() ===
            basic.name.toLowerCase().trim() &&
          prixer?.lastName?.toLowerCase() ===
            basic.lastName.toLowerCase().trim()
        ) {
          setSelectedPrixer(prixer);
        } else return;
      });
    }
  }, [prixers]);

  let today = new Date();
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

  let ProdTimes = order.lines?.map((line) => {
    if (
      line.item.product &&
      line.item.art &&
      line.item.product.productionTime !== undefined
    ) {
      return line.item.product.productionTime;
    }
  });

  let orderedProdT = ProdTimes.sort((a, b) => {
    if (a === undefined) return 1;
    if (b === undefined) return -1;
    return a - b;
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

  const getFinalPrice = (line: OrderLine) => {
    if (!line.item.product || !line.item.art) return undefined;
    
    const price = line.item.product.selection
      ? UnitPriceSug(
          line.item.product,
          line.item.art,
          currency,
          conversionRate,
          discounts,
          selectedPrixer?.username,
          checkOrgs(line.item.art),
          type
        )
      : UnitPrice(
          line.item.product,
          line.item.art,
          currency,
          conversionRate,
          discounts,
          selectedPrixer?.username
        );

    return formatPriceForUI(Number(price) * line.quantity, currency, conversionRate);
  };

  return (
    <Grid2
      container
      style={{
        display: "flex",
        padding: "8px",
      }}
    >
      <Grid2 style={{ display: "flex", justifyContent: "end" }}>
        <CurrencySwitch />
      </Grid2>
      <Grid2 size={{ md: 4 }}>
        <Typography>
          Pedido a nombre de
          <strong>
            {basic.name} {basic.lastName}
          </strong>
          .<br></br> A contactar por{" "}
          <strong>{shipping.basic?.phone || basic?.phone}</strong>.<br></br>{" "}
          Entregar en{" "}
          <strong>{shipping.basic?.shortAddress || basic?.shortAddress}</strong>
        </Typography>

        <FormControl
          variant="outlined"
          style={{ minWidth: "100%", marginTop: 20 }}
        >
          <ReactQuill
            value={order.observations}
            onChange={handleEditorChange}
            placeholder="Escribe las observaciones aquí..."
          />
        </FormControl>
      </Grid2>
      <Grid2 size={{ md: 8 }} style={{ paddingLeft: 40 }}>
        <div style={{ fontWeight: "bold" }}>Items:</div>
        <div>
          <List component="div" disablePadding>
            {order.lines.length > 0 ? (
              order.lines?.map(
                (line, index) =>
                  line.item.product &&
                  line.item.art && (
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
                                <Grid2 container>
                                  <Grid2 size={{ xs: 12, md: 8 }}>
                                    <Grid2 style={{ display: "flex" }}>
                                      <Typography
                                        style={{
                                          fontWeight: "bold",
                                          marginRight: 4,
                                        }}
                                      >
                                        Producto:
                                      </Typography>
                                      <Typography>
                                        {line.item.product.name}
                                      </Typography>
                                    </Grid2>
                                    {line.item.product?.selection &&
                                    typeof line.item.product.selection ===
                                      "string"
                                      ? line.item.product?.selection
                                      : line.item.product.selection?.name}
                                    <Grid2 style={{ display: "flex" }}>
                                      <Typography
                                        style={{
                                          fontWeight: "bold",
                                          marginRight: 4,
                                        }}
                                      >
                                        Arte:
                                      </Typography>
                                      <Typography>
                                        {line.item.art.title}
                                      </Typography>
                                    </Grid2>
                                    <Grid2 style={{ display: "flex" }}>
                                      <Typography
                                        style={{
                                          fontWeight: "bold",
                                          marginRight: 4,
                                        }}
                                      >
                                        Prixer:
                                      </Typography>
                                      <Typography>
                                        {line.item.art.prixerUsername}
                                      </Typography>
                                    </Grid2>
                                  </Grid2>
                                  <Grid2
                                    size={{
                                      xs: 12,
                                      md: 4,
                                    }}
                                    style={{
                                      display: "flex",
                                      justifyContent: isMobile
                                        ? "space-between"
                                        : "end",
                                    }}
                                  >
                                    <div>Cantidad: {line.quantity}</div>
                                    <div
                                      style={{
                                        textAlign: "end",
                                        paddingLeft: 10,
                                      }}
                                    >
                                      Precio:
                                      {getFinalPrice(line)}
                                    </div>
                                  </Grid2>
                                </Grid2>
                              }
                            />
                          </ListItem>
                        </List>
                      </Collapse>
                      <Divider />
                    </>
                  )
              )
            ) : (
              <Typography>No has seleccionado nada aún.</Typography>
            )}
            {getTotalCombinedItems(buyState).totalNotCompleted?.length >= 1 && (
              <Typography
                style={{
                  fontSize: "11px",
                }}
              >
                {getTotalCombinedItems(buyState).totalNotCompleted?.length > 1
                  ? `Faltan ${
                      getTotalCombinedItems(buyState).totalNotCompleted.length
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
              <Grid2 size={{ md: 8, xs: 6 }} style={{ paddingLeft: 0 }}>
                <FormControl
                  disabled={order.lines.length == 0}
                  className={classes.formControl}
                  style={{ minWidth: 200, marginTop: 25 }}
                  fullWidth
                >
                  <InputLabel style={{ paddingLeft: 15 }}>
                    Método de pago
                  </InputLabel>
                  <Select
                    variant="outlined"
                    value={billing.method}
                    onChange={(event) =>
                      handlePaymentMethodChange(event.target.value)
                    }
                  >
                    {paymentMethods &&
                      paymentMethods.map((m) =>
                        m.name === "Balance Prixer" ? (
                          <MenuItem
                            value={m}
                            style={{
                              backgroundColor: "#d33f49",
                              color: "white",
                              fontWeight: 600,
                            }}
                          >
                            {m.name + " de " + props.selectedPrixer.username}
                          </MenuItem>
                        ) : (
                          <MenuItem value={m}>{m.name}</MenuItem>
                        )
                      )}
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2
                size={{
                  lg: 4,
                  xs: 6,
                }}
                style={{
                  display: "flex",
                  alignItems: "end",
                  marginTop: "24px",
                  marginRight: "14px",
                  flexDirection: "column",
                }}
              >
                {order.lines.length > 0 && (
                  <>
                    <strong>
                      Subtotal:
                      {currency ? " Bs" : "$"}
                      {getTotalPrice(buyState)}
                    </strong>

                    <strong>
                      IVA:
                      {currency ? " Bs" : "$"}
                      {getIvaCost(buyState).toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>

                    {shipping.method && (
                      <strong>
                        Envío:
                        {currency
                          ? " Bs" +
                            Number(
                              shippingCost * conversionRate
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
                      {currency ? " Bs" : "$"}
                      {getTotal(buyState)}
                    </strong>
                    <br />
                  </>
                )}
              </Grid2>
            </div>
          </List>
        </div>
      </Grid2>
      <Grid2
        style={{
          display: "flex",
          justifyContent: "end",
          marginTop: 20,
          marginBottom: "-20px",
        }}
      >
        <Button
          disabled={loadingOrder || buyState.length == 0}
          variant="contained"
          color={"primary"}
          onClick={handleCreateOrder}
        >
          Crear orden
        </Button>
      </Grid2>
    </Grid2>
  );
}
