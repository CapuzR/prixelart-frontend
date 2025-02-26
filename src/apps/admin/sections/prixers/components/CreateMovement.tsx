import { useState } from "react"
import Grid2 from "@mui/material/Grid2"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import Button from "@mui/material/Button"
import { Theme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"

import { nanoid } from "nanoid"
import { createMovement } from "../api"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper3: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 800,
      backgroundColor: "white",
      boxShadow: theme.shadows[2],
      padding: "16px 32px 4px",
      textAlign: "justify",
      minWidth: 320,
      borderRadius: 10,
      display: "flex",
      flexDirection: "row",
    },
  }
})

export default function CreateMovement({
  selectedPrixer,
  handleClose,
  date,
  setDate,
  balance,
  setBalance,
  type,
  showSnackBar,
  readPrixers,
  readOrg,
  getBalance,
}) {

  const classes = useStyles()
  const [description, setDescription] = useState<string>()

  const createPayMovement = async () => {
    const data = {
      _id: nanoid(),
      createdOn: new Date(),
      createdBy: JSON.parse(localStorage.getItem("adminToken")).username,
      date: date,
      destinatary: selectedPrixer.account,
      description: description,
      type: type,
      value: balance,
    }
    const response = await createMovement(data)

    console.log(response.data)
    showSnackBar("Balance actualizado exitosamente.")
    handleClose()
    setTimeout(() => {
      readPrixers()
      readOrg()
      getBalance()
    }, 1000)
  }

  return (
    <Grid2 container className={classes.paper3}>
      <Grid2
        style={{
          width: "100%",
          display: "flex",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",

            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {type} de
            {" " + selectedPrixer?.firstName + " " + selectedPrixer?.lastName}
          </Typography>

          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </Grid2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Grid2
          container
          style={{
            display: "flex",
          }}
        >
          <Grid2 size={{ sm: 3 }} style={{ flexBasis: "0" }}>
            <TextField
              variant="outlined"
              label="Fecha"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
              }}
              type={"date"}
            />
          </Grid2>
          <Grid2
            size={{ sm: 6 }}
            style={{ paddingRight: "-20px", marginLeft: "10px" }}
          >
            <TextField
              fullWidth
              variant="outlined"
              label="descripción"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
              }}
            />
          </Grid2>
          <Grid2 size={{ sm: 3 }} style={{ marginLeft: "10px" }}>
            <TextField
              variant="outlined"
              label="Monto"
              value={balance}
              onChange={(e) => {
                setBalance(e.target.value)
              }}
              type="number"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                },
              }}
            />
          </Grid2>
        </Grid2>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            createPayMovement()
          }}
          style={{ margin: 10 }}
        >
          Guardar
        </Button>
      </div>
    </Grid2>
  )
}
