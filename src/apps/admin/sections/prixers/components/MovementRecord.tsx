import { useState, useEffect } from "react"
import Grid2 from "@mui/material/Grid2"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"

// import moment from "moment"
// import "moment/locale/es"

import { useTheme } from "@mui/material/styles"
import { getMovementsForPrixer } from "../api"
import { Movement } from "../../../../../types/movement.types"
import Table1 from "@components/Table"
import { Prixer } from "../../../../../types/prixer.types"

interface MovProps {
  selectedPrixer: Prixer | undefined
  handleClose: () => void
}

export default function MovementRecord({
  selectedPrixer,
  handleClose,
}: MovProps) {
  const theme = useTheme()
  const [movements, setMovements] = useState<Movement[]>()
  const totalElements = movements?.length
  const itemsPerPage = 20
  const [pageNumber, setPageNumber] = useState(1)
  const headers = [
    { title: "Fecha efectiva", type: "string" },
    { title: "Descripción", type: "string" },
    { title: "Monto", type: "string" },
    { title: "Fecha", type: "string" },
    { title: "Creado por", type: "string" },
  ]

  const properties = ["date", "description", "value", "createdOn", "createdBy"]

  const getMovements = async (account: string) => {
    const data = await getMovementsForPrixer(account)
    setMovements(data)
  }

  useEffect(() => {
    selectedPrixer && getMovements(selectedPrixer?.account)
  }, [])

  return (
    <Grid2
      container
      sx={{
        position: "absolute",
        width: "80%",
        maxHeight: "90%",
        overflowY: "auto",
        backgroundColor: "white",
        boxShadow: theme.shadows[2],
        padding: 4,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "justify",
        borderRadius: 10,
        display: "flex",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Typography variant="h6">
          Historial de
          {" " + selectedPrixer?.firstName + " " + selectedPrixer?.lastName}
        </Typography>

        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </div>

      {movements && movements?.length > 0 ? (
        <Table1
          headers={headers}
          elements={movements}
          properties={properties}
          setPageNumber={setPageNumber}
          pageNumber={pageNumber}
          itemsPerPage={itemsPerPage}
          maxLength={totalElements}
        />
      ) : (
        <Typography style={{ display: "flex", justifyContent: "center" }}>
          Aún no hay movimientos registrados para este Prixer.
        </Typography>
      )}
    </Grid2>
  )
}
