// Importaciones de React
import React, { useEffect, useState } from "react"

// Importaciones de terceros
import { useLocation } from "react-router-dom"

// Importaciones de Material-UI
import { Theme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"
import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"

// Importaciones locales
import ShippingTable from "./components/Table"
import { ShippingMethod } from "../../../../types/shippingMethod.types"
import CreateShippingMethod from "./views/Create"
import UpdateShippingMethod from "./views/Update"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper: {
      padding: theme.spacing(6),
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

export default function ReadShippingMethod({ permissions }) {
  const location = useLocation()

  const { classes, cx } = useStyles()
  const [activeCrud, setActiveCrud] = useState("read")

  const fixedHeightPaper = cx(classes.paper, classes.fixedHeight)
  const [active, setActive] = useState<boolean>(true)
  const [name, setName] = useState<string>()
  const [price, setPrice] = useState<string>()
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>()

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
    <React.Fragment>
      <div style={{ position: "relative" }}>


        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12 }}>
            <Paper className={fixedHeightPaper}>
              {activeCrud === "read" ? (
                <ShippingTable
                  permissions={permissions}
                  setShippingMethod={setShippingMethod}
                  setName={setName}
                  setPrice={setPrice}
                  setActive={setActive}
                />
              ) : activeCrud === "create" ? (
                <CreateShippingMethod />
              ) : (
                <UpdateShippingMethod
                  shippingMethod={shippingMethod}
                  setName={setName}
                  setPrice={setPrice}
                  setActive={setActive}
                  active={active}
                  price={price}
                  name={name}
                />
              )}
            </Paper>
          </Grid2>
        </Grid2>
      </div>
    </React.Fragment>
  )
}
