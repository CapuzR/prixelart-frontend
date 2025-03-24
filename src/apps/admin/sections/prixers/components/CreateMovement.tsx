import { useState } from "react"
import Grid2 from "@mui/material/Grid2"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import Button from "@mui/material/Button"
import { useTheme } from "@mui/material/styles"

import { nanoid } from "nanoid"
import { createMovement } from "../api"
import { Prixer } from "../../../../../types/prixer.types"

interface MovProps {
  selectedPrixer: Prixer | undefined
  handleClose: () => void
  date: Date
  setDate: (date: Date) => void
  balance: string | number
  setBalance: (date: string) => void
  type: string
  showSnackBar: (text: string) => void
  readPrixers: () => Promise<void>
  readOrg: () => Promise<void>
  getBalance: () => Promise<void>
}

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
}: MovProps) {
  const theme = useTheme()
  const [description, setDescription] = useState<string>()
  const adminToken = localStorage.getItem("adminToken")
  const adminData = adminToken ? JSON.parse(adminToken).username : null

  const createPayMovement = async () => {
    const data = {
      _id: nanoid(),
      createdOn: new Date(),
      createdBy: adminData,
      date: new Date(date),
      destinatary: selectedPrixer?.account,
      description: description,
      type: type,
      value: Number(balance),
    }
    const response = await createMovement(data)

    showSnackBar("Balance actualizado exitosamente.")
    handleClose()
    setTimeout(() => {
      readPrixers()
      readOrg()
      getBalance()
    }, 1000)
  }

  return (
    <Grid2
      container
      sx={{
        margin: "auto",
        minWidth: 800,
        backgroundColor: "white",
        boxShadow: theme.shadows[2],
        padding: 3,
        textAlign: "justify",
        borderRadius: 10,
        display: "flex",
        flexDirection: "row",
        gap: 1,
        height: "fit-content",
      }}
    >
      <Grid2
        sx={{
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
          gap: 16,
        }}
      >
        <Grid2
          container
          spacing={3}
          style={{
            display: "flex",
          }}
        >
          <Grid2 size={{ sm: 3 }}>
            <TextField
              variant="outlined"
              label="Fecha"
              value={date}
              onChange={(e) => {
                setDate(new Date(e.target.value))
              }}
              type={"date"}
            />
          </Grid2>
          <Grid2
            size={{ sm: 6 }}
            // style={{ paddingRight: "-20px", marginLeft: "10px" }}
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
          <Grid2 size={{ sm: 3 }}>
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
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
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
