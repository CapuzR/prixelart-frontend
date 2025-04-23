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
import { Prixer } from "../../../../../types/prixer.types"
interface WalletProps {
  selectedPrixer: Prixer | undefined
  handleClose: () => void
  date: Date
  balance: string | number
  setBalance: (date: number | string) => void
  showSnackBar: (text: string) => void
  readPrixers: () => Promise<void>
  readOrg: () => Promise<void>
  getBalance: () => Promise<void>
}

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
}: WalletProps) {
  const theme = useTheme()

  const openNewAccount = async () => {
    let ID
    const data = {
      _id: nanoid(24),
      balance: 0,
      email: selectedPrixer?.email,
    }
    const wallet = await createAccount(data)
    const adminToken = localStorage.getItem("adminToken")
    const adminData = adminToken ? JSON.parse(adminToken).username : null

    if (wallet && wallet.status === 200 && balance) {
      ID = wallet.data.createAccount.newAccount._id
      const data2 = {
        _id: nanoid(),
        createdOn: new Date(),
        createdBy: adminData,
        date: new Date(date),
        destinatary: ID,
        description: "Saldo inicial",
        type: "Depósito",
        value: Number(balance),
      }

      const firstMovement = await createMovement(data2)
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
        width: 320,
        backgroundColor: "white",
        boxShadow: theme.shadows[2],
        padding: 3,
        textAlign: "justify",
        borderRadius: 10,
        display: "flex",
        flexDirection: "row",
        margin: "auto",
        gap: 16,
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
          gap: 16,
          width: "100%",
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
          style={{
            marginRight: 10,
            marginLeft: 10,
            marginTop: 5,
            textTransform: "none",
          }}
        >
          Crear
        </Button>
      </div>
    </Grid2>
  )
}
