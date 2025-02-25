import React, { useState } from "react"

import { Theme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"

import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import MovOrder from "./components/Detail"
import Modal from "@mui/material/Modal"

import MovementsTable from "./components/Table"
import { Movement } from "../../../../types/movement.types"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper: {
      padding: theme.spacing(2),
      display: "flex",
      overflow: "none",
      flexDirection: "column",
      marginLeft: 30,
    },
    fixedHeight: {
      height: "auto",
      overflow: "none",
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: theme.palette.primary.main,
    },
  }
})

export default function Movements({ permissions }) {
  const { classes, cx } = useStyles()

  const fixedHeightPaper = cx(classes.paper, classes.fixedHeight)
  const [openOrderDetails, setOpenOrderDetails] = useState<boolean>(false)
  const [orderId, setOrderId] = useState<string>()
  const [type, setType] = useState<string>()

  const openDetails = (row: Movement) => {
    setOpenOrderDetails(true)
    setOrderId(row.description.split("#")?.[1])
    setType(row.type)
  }

  const handleClose = () => {
    setOpenOrderDetails(false)
  }

  return (
    <React.Fragment>
      <Grid2 container>
        <Grid2 size={{ xs: 12 }}>
          <Paper className={fixedHeightPaper}>
            {permissions?.readMovements ? (
              <MovementsTable
                openDetails={openDetails}
                permissions={permissions}
              />
            ) : (
              <Typography
                variant="h3"
                color="secondary"
                align="center"
                style={{ paddingTop: 30, marginTop: 60, marginBottom: 80 }}
              >
                No tienes permiso para entrar a esta área.
              </Typography>
            )}
          </Paper>
        </Grid2>
      </Grid2>
      <Modal open={openOrderDetails} onClose={handleClose}>
        <MovOrder orderId={orderId} type={type} handleClose={handleClose} />
      </Modal>
    </React.Fragment>
  )
}
