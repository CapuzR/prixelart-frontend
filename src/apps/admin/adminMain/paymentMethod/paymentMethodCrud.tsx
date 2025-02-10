import React, { useEffect, useState } from "react"

import { useHistory, useLocation } from "react-router-dom"
import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"

import { Theme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"
import Fab from "@mui/material/Fab"
import AddIcon from "@mui/icons-material/Add"
import ViewListIcon from "@mui/icons-material/ViewList"
import CreatePaymentMethod from "./createPaymentMethod"
import UpdatePaymentMethod from "./updatePaymentMethod"
import PaymentTable from "./paymentTable"

const useStyles = makeStyles()((theme: Theme) => {
  return {
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
  }
})

export default function PaymentMethods({ permissions }) {
  const { classes, cx } = useStyles()
  const history = useHistory()
  const location = useLocation()
  const fixedHeightPaper = cx(classes.paper, classes.fixedHeight)
  const [activeCrud, setActiveCrud] = useState("read")
  const [paymentMethod, setPaymentMethod] = useState()
  const [paymentMethodEdit, setPaymentMethodEdit] = useState(true)

  const handlePaymentMethodAction = (action: string) => {
    history.push({ pathname: "/payment-method/" + action })
  }

  useEffect(() => {
    location.pathname.split("/").length === 5
      ? setActiveCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 2]
        )
      : location.pathname.split("/").length === 4 &&
        setActiveCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 1]
        )
  }, [location.pathname])

  return (
    <div style={{ position: "relative" }}>
      {/* {paymentMethodEdit && (
        <div style={{ position: "absolute", right: 10, marginTop: 15 }}>
          <Fab
            color="default"
            aria-label="edit"
            style={{ marginRight: 10 }}
            onClick={() => {
              handlePaymentMethodAction("read")
            }}
          >
            <ViewListIcon />
          </Fab>
          {props.permissions?.createPaymentMethod && (
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => {
                handlePaymentMethodAction("create")
              }}
            >
              <AddIcon />
            </Fab>
          )}
        </div>
      )} */}
      <Grid2 container spacing={3}>
        <Grid2 sx={{ xs: 12 }}>
          <Paper className={fixedHeightPaper}>
            {activeCrud === "create" ? (
              <CreatePaymentMethod />
            ) : activeCrud === "read" ? (
              <PaymentTable
                setPaymentMethod={setPaymentMethod}
                permissions={permissions}
              />
            ) : (
              activeCrud == "update" && (
                <div>
                  <UpdatePaymentMethod
                    paymentMethod={paymentMethod}
                    setPaymentMethodEdit={setPaymentMethodEdit}
                  />
                </div>
              )
            )}
          </Paper>
        </Grid2>
      </Grid2>
    </div>
  )
}
