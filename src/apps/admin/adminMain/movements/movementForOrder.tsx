import React, { useState, useEffect } from "react"

import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"
import { Typography } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import Img from "react-cool-img"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"

import { useSnackBar, useLoading } from "@context/GlobalContext"

import { getDiscounts } from "./api"
import { getOrder } from "../orders/api"
import { Discount } from "../../../../types/discount.types"
import { Order } from "../../../../types/order.types"
import { finalPrice, unitPrice } from "./service"

export default function MovOrder({ orderId, type, handleClose }) {
  const theme = useTheme()
  const { setLoading } = useLoading()

  const [order, setOrder] = useState<Order>()
  const [discountList, setDiscountList] = useState<Discount[]>([])
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"))

  const readDiscounts = async () => {
    try {
      const discounts = await getDiscounts()
      setDiscountList(discounts)
    } catch (error) {
      console.log(error)
    }
  }

  const consultOrder = async () => {
    try {
      const order = await getOrder(orderId)
      setOrder(order)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setLoading(true)
    readDiscounts()
    consultOrder()
  }, [])

  const getDis = (discount: string) => {
    const s = discountList.find((dis) => dis._id === discount)
    return s
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      handleClose()
    } else return
  }

  document.addEventListener("keydown", handleKeyDown)

  return (
    <React.Fragment>
      <Grid2
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid2
          container
          sx={{
            position: "absolute",
            width: "800px",
            backgroundColor: "white",
            boxShadow: 8,
            padding: 8,
            maxHeight: "90%",
            overflowY: "auto",
            textAlign: "justify",
            borderRadius: 10,
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Grid2
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Grid2>
          {type === "Depósito"
            ? order?.requests.map((item, index) => (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: 20,
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderRadius: 10,
                      padding: 5,
                      borderColor: "#d33f49",
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="h6"
                      style={{ textAlign: "center", margin: 5 }}
                    >
                      {"Orden #"}
                      {order.orderId}
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
                          )
                        })}
                    </div>
                  </div>
                  <Grid2
                    size={{
                      xs: 12,
                    }}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: 30,
                    }}
                  >
                    <Grid2
                      sx={{
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderRadius: 10,
                        borderColor: "grey",
                        padding: 15,
                      }}
                    >
                      <Typography
                        variant="h6"
                        style={{ textAlign: "center", margin: 5 }}
                      >
                        Comisión para {item.art.prixerUsername}
                      </Typography>
                      <div>
                        {"Precio unitario: $" +
                          unitPrice(item, discountList).toLocaleString("de-DE", {
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
                      <div>{"Cantidad: " + item?.quantity}</div>
                      <div>
                        {"Precio final: $" +
                          finalPrice(item, discountList).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </div>
                      <strong>
                        {"Comisión: $" +
                          item.product?.comission?.toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </strong>
                    </Grid2>
                  </Grid2>
                </>
              ))
            : order && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    marginTop: -42,
                    // height: "80%",
                  }}
                >
                  <Typography
                    variant="h6"
                    style={{ marginTop: -38, margin: 5 }}
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
                          // margin: "0px 0px 20px 0px",
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
                                  {item.product?.selection?.attributes[i]
                                    ?.name +
                                    ": " +
                                    item.product?.selection?.attributes[i]
                                      ?.value}
                                </p>
                              )
                            })}
                          <div>{"Cantidad: " + item.quantity}</div>
                          <div>
                            {"Precio unitario: $" +
                              unitPrice(item, discountList).toLocaleString("de-DE", {
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
                  <Grid2
                    size={{ xs: 12 }}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      marginTop: 10,
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
                        order.tax?.toLocaleString("de-DE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </div>
                    {(order.shippingCost ||
                      order.shippingData?.shippingMethod?.price) && (
                      <div>
                        {"Envío: $" +
                          (
                            order.shippingCost ||
                            order.shippingData?.shippingMethod?.price ||
                            0
                          )?.toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </div>
                    )}
                    <div>
                      <strong>
                        {"Total: $" +
                          order.total.toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </strong>
                    </div>
                  </Grid2>
                </div>
              )}
        </Grid2>
      </Grid2>
    </React.Fragment>
  )
}
