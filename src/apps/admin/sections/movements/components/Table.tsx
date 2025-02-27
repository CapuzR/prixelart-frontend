import { useState, useEffect } from "react"

import { useSnackBar, useLoading } from "@context/GlobalContext"

import { Theme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import DeleteIcon from "@mui/icons-material/Delete"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import { Button } from "@mui/material"

import { Movement } from "../../../../../types/movement.types"
// import { Prixer } from "../../../../types/prixer.types"
import Title from "../../../components/Title"

import { deleteMovement, getMovements } from "../api"
// import { getAllPrixers, getAllOrgs } from "../prixers/api"
import { getPrixersNames, sortMovements } from "../service"
import PaginationBar from "@components/Pagination/PaginationBar"

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

export default function MovementsTable({ openDetails, permissions }) {
  const { classes } = useStyles()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const [filter, setFilter] = useState<string>()
  const [rows, setRows] = useState<Movement[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [prixersNames, setPrixersNames] = useState<string[]>([])
  //   const [prixers, setPrixers] = useState<Prixer[]>([])
  //   const [orgs, setOrgs] = useState([])

  const totalMovements = rows?.length
  const itemsPerPage = 20
  const [pageNumber, setPageNumber] = useState(1)
  const itemsToSkip = (pageNumber - 1) * itemsPerPage
  const rowsv2 = rows?.slice(itemsToSkip, itemsPerPage + itemsToSkip)

  const headers = [
    "ID",
    "Fecha efectiva",
    "Destinatario",
    "Descripción",
    "Monto",
    "Fecha de creación",
    "Creado por",
    "",
  ]

  const readMovements = async () => {
    try {
      const movements = await getMovements()
      const sortedMov = sortMovements(movements)
      const prixers = getPrixersNames(movements)

      setRows(sortedMov)
      setMovements(sortedMov)
      setPrixersNames(prixers)
    } catch (error) {
      console.log(error)
    }
  }

  //   const readPrixers = async () => {
  //     try {
  //       const prixers = await getAllPrixers()
  //     //   setPrixers(prixers)
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }

  //   const getORGs = async () => {
  //     try {
  //       const orgs = await getAllOrgs()
  //     //   setOrgs(orgs)
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }

  const deleteMov = async (mov: Movement) => {
    setLoading(true)
    try {
      const response = await deleteMovement(mov._id)
      showSnackBar(`Movimiento de  ${mov.destinatary} eliminado exitosamente.`)
      readMovements()
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value)
    filterMovements(event.target.value)
  }

  const filterMovements = (filter: string) => {
    setLoading(true)
    if (filter === undefined) {
      setRows(movements)
    } else {
      let movementsv2 = movements.filter((row) => row.destinatary === filter)
      setRows(movementsv2)
    }
  }

  useEffect(() => {
    setLoading(true)
    readMovements()
    // readPrixers()
    // getORGs()
  }, [])

  return (
    <>
      <div style={{ display: "flex", justifyContent: "start", margin: 20 }}>
        <Title title={"Movimientos"} />
      </div>
      <Table size="small">
        <TableHead>
          <TableRow>
            {headers.map((head: string, i: number) =>
              head === "Destinatario" ? (
                <TableCell align="center">
                  <FormControl className={classes.formControl}>
                    <InputLabel id="demo-simple-select-label">
                      Destinatario
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={filter}
                      onChange={handleChange}
                    >
                      <MenuItem key={"none"} value={undefined}></MenuItem>
                      {prixersNames?.length > 0 &&
                        prixersNames?.map((prixer, i) => (
                          <MenuItem key={i} value={prixer}>
                            {prixer}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </TableCell>
              ) : (
                <TableCell
                  key={i}
                  align="center"
                  style={{ fontWeight: "bold" }}
                >
                  {head}
                </TableCell>
              )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows &&
            rowsv2.map((row, i) => (
              <TableRow key={`mov-0${i}`}>
                <TableCell align="center">{row._id.toString()}</TableCell>
                <TableCell align="center">
                  {row.date
                    ? new Date(row?.date)?.toLocaleDateString()
                    : new Date(row?.createdOn)?.toLocaleDateString()}
                </TableCell>
                <TableCell align="center">{row.destinatary}</TableCell>

                <TableCell align="center">
                  {row.description?.includes("#") ? (
                    <div>
                      <Typography>
                        {row.description?.split("#")?.[0]}
                      </Typography>
                      <Button
                        onClick={() => {
                          openDetails(row)
                        }}
                      >
                        {row.description.split("#")?.[1]}
                      </Button>
                    </div>
                  ) : (
                    <Typography>{row.description}</Typography>
                  )}
                </TableCell>

                <TableCell align="center">
                  {row.type === "Retiro" && "-"}$
                  {row.value
                    .toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                    .replace("-", "")}
                </TableCell>
                <TableCell align="center">
                  {new Date(row.createdOn).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">{row.createdBy}</TableCell>
                <TableCell align="center">
                  {permissions?.deletePaymentMethod && (
                    <IconButton
                      sx={{
                        width: 35,
                        height: 35,
                        marginRight: "16px !important",
                        "&:hover": {
                          color: "darkred", // Cambia el color al hacer hover
                        },
                      }}
                      onClick={() => {
                        deleteMov(row)
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <PaginationBar
        setPageNumber={setPageNumber}
        pageNumber={pageNumber}
        itemsPerPage={itemsPerPage}
        maxLength={totalMovements}
      />
    </>
  )
}
