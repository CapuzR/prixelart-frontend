import React, { useEffect, useState } from "react"
import axios from "axios"

import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import Grid2 from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import Paper from "@mui/material/Paper"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { Button } from "@mui/material"
import MovDetails from "./MovDetails"
import CircularProgress from "@mui/material/CircularProgress"
import Modal from "@mui/material/Modal"

import { Theme, useTheme } from "@mui/material"
import { makeStyles } from "tss-react/mui"
import { useUser } from "@context/GlobalContext"
import { Movement } from "types/movement.types"
import { Order, OrderStatus } from "types/order.types"
import { ObjectId } from "mongodb"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper: {
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
    },
    paper2: {
      display: "flex",
      justifyContent: "center",
      marginTop: 80,
    },
    tabs: {
      borderRight: `1px solid ${theme.palette.divider}`,
    },
  }
})

export default function PrixerProfile() {
  const { classes } = useStyles()
  const theme = useTheme()
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"))
  const { user } = useUser()

  const [balance, setBalance] = useState(0)
  const [movements, setMovements] = useState<Movement[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState(0)
  const [openOrderDetails, setOpenOrderDetails] = useState(false)
  const [orderId, setOrderId] = useState<ObjectId | string | undefined>()
  const [placement, setPlacement] = useState<string | undefined>()
  const [type, setType] = useState<string | undefined>()

  const handleClick =
    (newPlacement: string, orderId: string | undefined, type?: string) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpenOrderDetails((prev) => placement !== newPlacement || !prev)
      setPlacement("right-start")
      setOrderId(orderId)
      setType(type)
    }

  const getBalance = async () => {
    const url = import.meta.env.VITE_BACKEND_URL + "/account/readById"
    const data = { _id: user?.account }
    await axios
      .post(url, data)
      .then((response) => setBalance(response.data.result.balance))
  }

  const getMovements = async () => {
    const url = import.meta.env.VITE_BACKEND_URL + "/movement/readByAccount"
    const data = { _id: user?.account }
    await axios
      .post(url, data)
      .then((response) => setMovements(response.data.movements.reverse()))
  }

  const getOrders = async () => {
    const url = import.meta.env.VITE_BACKEND_URL + "/order/byEmail"
    const data = {
      email: user?.email,
      prixerId: user?.prixer?._id,
    }
    await axios
      .post(url, data)
      .then((response) => setOrders(response.data.result.reverse()))
  }

  useEffect(() => {
    if (user?.account !== undefined) {
      getBalance()
      getMovements()
    }
    getOrders()
  }, [user])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  const handleClose = () => {
    setOpenOrderDetails(false)
  }

  const getPercentage = (status: [OrderStatus, Date][]) => {
    const latest =
      !status || status.length === 0
        ? OrderStatus.Pending
        : status[status.length - 1][0]

    switch (latest) {
      case 0:
        return 10
        break
      case 1:
        return 20
        break
      case 2:
        return 30
        break
      case 3:
        return 80
        break
      case 4:
        return 90
        break
      case 5:
        return 100
        break
      case 6:
        return 50
        break
      case 7:
        return 0
        break
      default:
        return 10
    }
  }

  const getStatus = (status: [OrderStatus, Date][]) => {
    const latest =
      !status || status.length === 0
        ? OrderStatus.Pending
        : status[status.length - 1][0]

    switch (latest) {
      case 0:
        return "Por producir"
        break
      case 1:
        return "En impresión"
        break
      case 2:
        return "En producción"
        break
      case 3:
        return "Por entregar"
        break
      case 4:
        return "Entregado"
        break
      case 5:
        return "Concretado"
        break
      case 6:
        return "Detenido"
        break
      case 7:
        return "Anulado"
        break
      default:
        return "Por producir"
    }
  }

  return (
    <Container component="main" maxWidth="xl" className={classes.paper}>
      <CssBaseline />
      {/* <Grid>
        <AppBar prixerUsername={prixerUsername} />
      </Grid2> */}
      <Grid2 className={classes.paper2}>
        <Paper
          sx={{
            width: isDeskTop ? "70%" : "100%",
            padding: 5,
            borderRadius: 10,
          }}
          elevation={2}
        >
          <Typography
            color="primary"
            variant={isDeskTop ? "h4" : "h5"}
            style={{
              color: "#404e5c",
              textAlign: "center",
              marginBottom: 40,
              marginTop: 0,
            }}
          >
            Mi Resumen
          </Typography>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 3 }}>
              <Tabs
                onChange={handleChange}
                orientation={isDeskTop ? "vertical" : "horizontal"}
                value={tab}
                indicatorColor="primary"
                className={classes.tabs}
                variant="scrollable"
              >
                <Tab
                  label="Balance General"
                  style={{
                    textTransform: "none",
                    fontSize: isDeskTop ? 18 : 11,
                    color: "#404e5c",
                    padding: isDeskTop ? "6px 12px" : "6px 6px",
                  }}
                />
                <Tab
                  label="Pedidos"
                  style={{
                    textTransform: "none",
                    fontSize: isDeskTop ? 18 : 11,
                    color: "#404e5c",
                    padding: isDeskTop ? "6px 12px" : "6px 6px",
                  }}
                />
                <Tab
                  label="Movimientos"
                  style={{
                    textTransform: "none",
                    fontSize: isDeskTop ? 18 : 11,
                    color: "#404e5c",
                    padding: isDeskTop ? "6px 12px" : "6px 6px",
                  }}
                />
                <Tab
                  label="Interacciones"
                  style={{
                    textTransform: "none",
                    fontSize: isDeskTop ? 18 : 11,
                    color: "#404e5c",
                    padding: isDeskTop ? "6px 12px" : "6px 6px",
                  }}
                />
              </Tabs>
            </Grid2>

            <Grid2
              size={{
                xs: 12,
                sm: 9,
              }}
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                minHeight: 200,
                marginLeft: 0,
              }}
            >
              {tab === 0 && (
                <Grid2>
                  {user?.account ? (
                    <>
                      <Typography
                        variant="body1"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          color: "#404e5c",
                        }}
                      >
                        Tu balance es de:
                      </Typography>
                      <Typography
                        variant="h2"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          color: "#404e5c",
                        }}
                      >
                        $
                        {balance?.toLocaleString("de-DE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      variant="body1"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        color: "#404e5c",
                      }}
                    >
                      Aún no tienes una cuenta asignada, nuestro equipo pronto
                      te asignará una.
                    </Typography>
                  )}
                </Grid2>
              )}
              {tab === 1 && (
                <Grid2>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <Grid2
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "grey",
                          backgroundColor: "ghostwhite",
                          padding: 10,
                          borderRadius: 10,
                          margin: "10px 0px 10px 0px",
                          alignItems: "center",
                        }}
                      >
                        <Grid2 style={{ fontSize: isDeskTop ? "14px" : "9px" }}>
                          {new Date(order.createdOn)
                            .toLocaleString("en-GB", {
                              timeZone: "UTC",
                            })
                            .slice(0, 10)}
                        </Grid2>
                        <Grid2 style={{ fontSize: isDeskTop ? "14px" : "9px" }}>
                          <Button
                            style={{
                              textTransform: "none",
                              color: "#404e5c",
                              fontSize: isDeskTop ? "14px" : "9px",
                              minWidth: 32,
                            }}
                            onClick={handleClick(
                              "right-start",
                              order._id?.toString(),
                              "Depósito"
                            )}
                          >
                            {order?._id?.toString().slice(-6)}
                          </Button>
                        </Grid2>
                        <Grid2
                          style={{
                            fontWeight: "bold",
                            fontSize: isDeskTop ? "14px" : "9px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {getStatus(order.status)}
                          <CircularProgress
                            style={{ marginLeft: 10 }}
                            variant="determinate"
                            value={getPercentage(order?.status)}
                          />
                        </Grid2>
                      </Grid2>
                    ))
                  ) : (
                    <Typography align="center" variant="h5" color="secondary">
                      Aún no hay pedidos registrados para ti.
                    </Typography>
                  )}
                </Grid2>
              )}
              {tab === 2 && (
                <Grid2>
                  {movements.length > 0 ? (
                    movements.map((mov) => (
                      <Grid2
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "grey",
                          backgroundColor: "ghostwhite",
                          padding: 10,
                          borderRadius: 10,
                          margin: "10px 0px 10px 0px",
                          alignItems: "center",
                        }}
                      >
                        <Grid2 style={{ fontSize: isDeskTop ? "14px" : "9px" }}>
                          {mov.date
                            ? new Date(mov.date)
                                .toLocaleString("en-GB", {
                                  timeZone: "UTC",
                                })
                                .slice(0, 10)
                            : new Date(mov.createdOn)
                                .toLocaleString("en-GB", {
                                  timeZone: "UTC",
                                })
                                .slice(0, 10)}
                        </Grid2>
                        <Grid2 style={{ fontSize: isDeskTop ? "14px" : "9px" }}>
                          {mov.description.split("#")[0]}{" "}
                          <Button
                            style={{
                              textTransform: "none",
                              color: "#404e5c",
                              fontSize: isDeskTop ? "14px" : "9px",
                              minWidth: 32,
                            }}
                            onClick={handleClick(
                              "right-start",
                              mov.description.split("#")[1],
                              mov.type
                            )}
                          >
                            {mov.description.split("#")[1]}
                          </Button>
                        </Grid2>
                        {mov.type === "Depósito" ? (
                          <Grid2
                            style={{
                              color: "green",
                              fontWeight: "bold",
                              fontSize: isDeskTop ? "14px" : "9px",
                            }}
                          >
                            + $
                            {mov.value?.toLocaleString("de-DE", {
                              minimumFractionDigits: 2,
                            })}
                          </Grid2>
                        ) : (
                          mov.type === "Retiro" && (
                            <Grid2
                              style={{
                                color: "red",
                                fontWeight: "bold",
                                fontSize: isDeskTop ? "14px" : "9px",
                              }}
                            >
                              - $
                              {mov.value?.toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                              })}
                            </Grid2>
                          )
                        )}
                      </Grid2>
                    ))
                  ) : (
                    <Typography align="center" variant="h5" color="secondary">
                      Aún no hay movimientos registrados para ti.
                    </Typography>
                  )}
                </Grid2>
              )}
              {tab === 3 && (
                <Typography align="center" variant="h5" color="secondary">
                  ¡Próximamente!
                </Typography>
              )}
            </Grid2>
          </Grid2>
        </Paper>
      </Grid2>
      <div style={{ maxWidth: "80%" }}>
        <Modal open={openOrderDetails} onClose={handleClose}>
          {/* <Popper
          open={openOrderDetails}
          anchorEl={anchorEl}
          placement={placement}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <ClickAwayListener onClickAway={handleClose}> */}
          <MovDetails orderId={orderId} handleClose={handleClose} type={type} />
          {/* </ClickAwayListener>
            </Fade>
          )}
        </Popper> */}
        </Modal>
      </div>
    </Container>
  )
}
