import React, { useState, useEffect } from "react";
import Grid2 from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Img from "react-cool-img";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Theme, useTheme } from "@mui/material";

import axios from "axios";
import { makeStyles } from "tss-react/mui";
import { ObjectId } from "mongodb";
import { Order } from "@prixpon/types/order.types";
import { useUser } from "@prixpon/context/GlobalContext";

import favicon from "@assets/images/favicon.png";

const useStyles = makeStyles()((theme: Theme) => {
  return {
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
  };
});
interface MovDetailsProps {
  orderId: string | ObjectId | undefined;
  handleClose: () => void;
  type: string | undefined;
}
export default function MovOrder(props: MovDetailsProps) {
  const { classes } = useStyles();
  const theme = useTheme();
  const { user } = useUser();
  const [order, setOrder] = useState<Order>();
  const [discountList, setDiscountList] = useState([]);
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));

  const getDiscounts = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/discount/read-allv2";
    await axios
      .post(base_url)
      .then((response) => {
        setDiscountList(response.data.discounts);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getOrderDetail = async () => {
    const url =
      import.meta.env.VITE_BACKEND_URL + "/order/read/" + props.orderId;
    await axios
      .get(url)
      .then((response) => {
        setOrder(response.data.result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getDiscounts();
    getOrderDetail();
  }, []);

  function handleKeyDown(event: any) {
    if (event.key === "Escape") {
      props.handleClose();
    } else return;
  }
  document.addEventListener("keydown", handleKeyDown);

  return (
    <React.Fragment>
      <Grid2
        container
        className={classes.paper2}
        sx={{
          width: !isDeskTop ? "100%" : "auto",
          padding: !isDeskTop ? 10 : 0,
        }}
      >
        <Grid2
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <IconButton onClick={props.handleClose}>
            <CloseIcon />
          </IconButton>
        </Grid2>
        {props.type === "Depósito" ? (
          order?.lines.map(
            (orderLine, index) =>
              orderLine.item.art?.prixerUsername === user?.username && (
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
                      {`Orden #${order._id?.toString().slice(-6)}`}
                    </Typography>
                    <Typography
                      variant="body1"
                      style={{ textAlign: "center", marginBottom: 6 }}
                    >
                      {`para ${order.consumerDetails?.basic.name} ${order.consumerDetails?.basic.lastName}`}
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
                          src={
                            orderLine.item.art &&
                            "largeThumbUrl" in orderLine.item.art
                              ? orderLine.item.art.largeThumbUrl
                              : favicon
                          }
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
                          src={orderLine.item.product?.sources.images[0].url}
                          style={{
                            maxWidth: isDeskTop ? "150px" : "120px",
                            maxHeight: isDeskTop ? "150px" : "120px",
                            borderRadius: 10,
                          }}
                        />
                      </Paper>
                    </div>
                    <div style={{ padding: 10 }}>
                      <div>{"Arte: " + orderLine.item.art?.title}</div>
                      <div>{"Producto: " + orderLine.item.product.name}</div>
                      {orderLine.item.product.selection?.map(
                        (attribute, index) => (
                          <p
                            key={attribute.name + index} // Importante: añade una 'key' única para cada elemento de la lista
                            style={{
                              padding: 0,
                              margin: 0,
                            }}
                          >
                            {attribute.name}: {attribute.value}
                          </p>
                        ),
                      )}
                      <div style={{ marginTop: 10 }}>
                        {"Cantidad: " + orderLine.quantity}
                      </div>
                      <div>
                        {"Precio unitario: $" +
                          Number(orderLine.pricePerUnit).toLocaleString(
                            "de-DE",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                      </div>
                      {/* {typeof orderLine.discount === 'string' &&  (
                        <div>{'Descuento: ' + getDis(orderLine.discount)}</div>
                      )}
                      <div>
                        {'Precio final: $' +
                          finalPrice(item)?.toLocaleString('de-DE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </div> */}
                      <strong>
                        {"Tu comisión: $" +
                          (orderLine.pricePerUnit / 10)?.toLocaleString(
                            "de-DE",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                      </strong>
                    </div>
                  </div>
                </>
              ),
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
              {order?._id?.toString().slice(-6)}
            </Typography>
            {order?.lines?.map((orderLine, index) => (
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
                        src={
                          orderLine.item.art &&
                          "largeThumbUrl" in orderLine.item.art
                            ? orderLine.item.art.largeThumbUrl
                            : favicon
                        }
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
                        src={orderLine.item.product?.sources?.images[0]?.url}
                        style={{
                          maxWidth: isDeskTop ? "150px" : "120px",
                          maxHeight: isDeskTop ? "150px" : "120px",
                          borderRadius: 10,
                        }}
                      />
                    </Paper>
                  </div>
                  <div style={{ padding: 10 }}>
                    <div>{"Arte: " + orderLine.item.art?.title}</div>
                    <div style={{ marginBottom: 10 }}>
                      {"Prixer: " + orderLine.item.art?.prixerUsername}
                    </div>
                    <div>{"Producto: " + orderLine.item.product.name}</div>
                    {orderLine.item.product.selection?.map(
                      (attribute, index) => (
                        <p
                          key={attribute.name + index} // Importante: añade una 'key' única para cada elemento de la lista
                          style={{
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          {attribute.name}: {attribute.value}
                        </p>
                      ),
                    )}
                    <div>{"Cantidad: " + orderLine.quantity}</div>
                    <div>
                      {"Precio unitario: $" +
                        Number(orderLine.pricePerUnit).toLocaleString("de-DE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </div>
                    {/* {typeof item.product.discount === "string" &&
                      !item.product.modifyPrice && (
                        <div>
                          {"Descuento: " + getDis(item.product.discount)}
                        </div>
                      )} */}
                  </div>
                </div>
              </>
            ))}
            <Grid2
              size={{
                xs: 12,
                sm: 12,
              }}
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
                  order?.subTotal.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </div>
              <div>
                {"IVA: $" +
                  order?.tax[0]?.amount.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </div>
              {order?.shippingCost && (
                <div>
                  {"Envío: $" +
                    (order?.shippingCost).toLocaleString("de-DE", {
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
            </Grid2>
          </div>
        )}
      </Grid2>
    </React.Fragment>
  );
}
