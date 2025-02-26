import axios from "axios"
import Grid2 from "@mui/material/Grid2"
import TextField from "@mui/material/TextField"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import { nanoid } from "nanoid"
import { createAccount, createMovement } from "../api"
import { useTheme } from "@mui/material/styles"

export default function CreateWallet({
  selectedPrixer,
  balance,
  date,
  showSnackBar,
  handleClose,
  setBalance,
  readPrixers,
  readOrg,
  getBalance,
}) {
  const theme = useTheme()

  const openNewAccount = async () => {
    let ID
    const data = {
      _id: nanoid(24),
      balance: 0,
      email: selectedPrixer.email,
    }
    const wallet = await createAccount(data)

    if (wallet.status === 200 && balance > 0) {
      ID = wallet.data.createAccount.newAccount._id
      const data2 = {
        _id: nanoid(),
        createdOn: new Date(),
        createdBy: JSON.parse(localStorage.getItem("adminToken")).username,
        date: date,
        destinatary: ID,
        description: "Saldo inicial",
        type: "Depósito",
        value: balance,
      }

      const firstMovement = await createMovement(data2)
      console.log(firstMovement.data)
    }

    showSnackBar("Cartera creada y balance actualizado exitosamente.")
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
        position: "fixed",
        right: "30%",
        top: "38%",
        bottom: "37%",
        left: "40%",
        width: 300,
        backgroundColor: "white",
        boxShadow: theme.shadows[2],
        padding: "16px 32px 24px",
        textAlign: "justify",
        minWidth: 320,
        borderRadius: 10,
        display: "flex",
        flexDirection: "row",
      }}
    >
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
          <Typography>
            Balance de
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
        }}
      >
        <TextField
          variant="outlined"
          value={balance}
          onChange={(e) => {
            setBalance(e.target.value)
          }}
          type={"number"}
        />
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            openNewAccount()
          }}
          style={{ marginRight: 10, marginLeft: 10, marginTop: 5 }}
        >
          Guardar
        </Button>
      </div>
    </Grid2>
  )
}
