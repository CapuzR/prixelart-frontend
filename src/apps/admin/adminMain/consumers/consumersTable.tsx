import React from "react"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Title from "../Title"
import axios from "axios"
import Checkbox from "@mui/material/Checkbox"
import EditIcon from "@mui/icons-material/Edit"
import Fab from "@mui/material/Fab"
import { Typography } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import Grid2 from "@mui/material/Grid2"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import SearchIcon from "@mui/icons-material/Search"
import InputAdornment from "@mui/material/InputAdornment"

import { useSnackBar, useLoading } from "context/GlobalContext"
import { Consumer } from "../../../../types/consumer.types"
import { deleteConsumer, getConsumers } from "./api"

export default function ConsumersTable({ permissions, setConsumer }) {
  const history = useHistory()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const [rows, setRows] = useState<Consumer[]>([])
  const [filter, setFilter] = useState<string>("")
  const [totalConsumers, setTotalConsumers] = useState(rows?.length)
  const [itemsPerPage, setItemPerPage] = useState(20)
  const noOfPages = Math.ceil(totalConsumers / itemsPerPage)
  const [pageNumber, setPageNumber] = useState(1)
  const itemsToSkip = (pageNumber - 1) * itemsPerPage
  const [rowsv2, setRowsv2] = useState<Consumer[]>([])

  const readConsumers = async () => {
    setLoading(true)
    try {
      const consumers = await getConsumers()
      setRows(consumers)
      setRowsv2(consumers?.slice(itemsToSkip, itemsPerPage + itemsToSkip))
      setTotalConsumers(consumers.length)
    } catch (error) {
      showSnackBar(
        "Error obteniendo lista de clientes, por favor recarga la ventana."
      )
      console.error("Error obteniendo listado de clientes:", error)
    }
  }

  useEffect(() => {
    readConsumers()
  }, [])

  const handleActive = (consumer: Consumer, action: string) => {
    setConsumer(consumer)
    history.push("/consumer/" + action + "/" + consumer._id)
  }

  const deleteClient = async (row: Consumer) => {
    setLoading(true)
    const response = await deleteConsumer(row._id)
    showSnackBar(
      `Cliente ${row.firstname} ${row.lastname} eliminado exitosamente.`
    )
    readConsumers()
  }

  const changeFilter = (e) => {
    setLoading(true)
    let f = e.target.value.toLowerCase()

    setFilter(e.target.value)
    if (typeof f === "string" && f.length > 0) {
      let filtered = rows.filter((row) =>
        row.firstname.toLowerCase().includes(f)
      )
      setRowsv2(filtered)
      setTotalConsumers(filtered.length)
      setItemPerPage(filtered.length)
    } else {
      setRowsv2(rows?.slice(itemsToSkip, itemsPerPage + itemsToSkip)) // setRowsv2(rowsLimited);
      setTotalConsumers(rows?.length)
      setItemPerPage(20)
    }
  }
  useEffect(() => {
    setRowsv2(rows?.slice(itemsToSkip, itemsPerPage + itemsToSkip))
  }, [pageNumber])

  const changePage = (i) => {
    setPageNumber(i)
  }

  return (
    <React.Fragment>
      {permissions?.readConsumers ? (
        <>
          <Title>Clientes frecuentes</Title>
          <Grid2>
            <TextField
              variant="outlined"
              value={filter}
              onChange={(e) => {
                changeFilter(e)
              }}
              style={{ padding: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="secondary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid2>
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Activo</TableCell>
                  <TableCell align="center">Nombre</TableCell>
                  <TableCell align="center">Apellido</TableCell>
                  <TableCell align="center">Tipo</TableCell>
                  <TableCell align="center">Teléfono</TableCell>
                  <TableCell align="center">Email</TableCell>
                  <TableCell align="center">Envío</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rowsv2?.length > 0 ? (
                  rowsv2.map((row, i) => (
                    <>
                      <TableRow key={i}>
                        <TableCell align="center">
                          <Checkbox
                            disabled
                            checked={row.active}
                            color="primary"
                            inputProps={{ "aria-label": "secondary checkbox" }}
                          />
                        </TableCell>
                        <TableCell align="center">{row.firstname}</TableCell>
                        <TableCell align="center">{row.lastname}</TableCell>
                        <TableCell align="center">
                          {row?.consumerType}
                        </TableCell>
                        <TableCell align="center">{row.phone}</TableCell>
                        <TableCell align="center">{row.email}</TableCell>
                        <TableCell align="center">
                          {row.shippingAddress}
                        </TableCell>
                        <TableCell align="center">
                          <Grid2 style={{ display: "flex" }}>
                            {permissions?.createConsumer && (
                              <Fab
                                color="default"
                                style={{
                                  width: 35,
                                  height: 35,
                                  marginRight: 16,
                                }}
                                aria-label="edit"
                                onClick={(e) => {
                                  handleActive(row, "update")
                                }}
                              >
                                <EditIcon />
                              </Fab>
                            )}
                            {permissions?.deleteConsumer && (
                              <Fab
                                color="default"
                                style={{
                                  width: 35,
                                  height: 35,
                                }}
                                onClick={() => {
                                  deleteClient(row)
                                }}
                              >
                                <DeleteIcon />
                              </Fab>
                            )}
                          </Grid2>
                        </TableCell>
                      </TableRow>
                    </>
                  ))
                ) : (
                  <Typography
                    style={{ margin: 20 }}
                    align="center"
                    color="secondary"
                  >
                    No hay clientes que coincidan con tu criterio de búsqueda,
                    intenta de nuevo.
                  </Typography>
                )}
              </TableBody>
            </Table>

            <Box
              style={{
                display: "flex",
                alignSelf: "center",
                paddingTop: 5,
                marginBottom: 4,
              }}
            >
              {pageNumber - 3 > 0 && (
                <Button
                  style={{ minWidth: 30, marginRight: 5 }}
                  onClick={() => {
                    setPageNumber(1)
                  }}
                >
                  {1}
                </Button>
              )}
              {pageNumber - 3 > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 5,
                  }}
                >
                  ...
                </div>
              )}
              {pageNumber - 2 > 0 && (
                <Button
                  style={{ minWidth: 30, marginRight: 5 }}
                  onClick={() => {
                    setPageNumber(pageNumber - 2)
                  }}
                >
                  {pageNumber - 2}
                </Button>
              )}
              {pageNumber - 1 > 0 && (
                <Button
                  style={{ minWidth: 30, marginRight: 5 }}
                  onClick={() => {
                    setPageNumber(pageNumber - 1)
                  }}
                >
                  {pageNumber - 1}
                </Button>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 80,
                  marginRight: 5,
                  backgroundColor: "rgb(238, 238, 238)",
                  borderRadius: 4,
                }}
              >
                Página {pageNumber}
              </div>
              {pageNumber + 1 <= noOfPages && (
                <Button
                  style={{ minWidth: 30, marginRight: 5 }}
                  onClick={() => {
                    changePage(pageNumber + 1)
                  }}
                >
                  {pageNumber + 1}
                </Button>
              )}

              {pageNumber + 2 <= noOfPages && (
                <Button
                  style={{ minWidth: 30, marginRight: 5 }}
                  onClick={() => {
                    setPageNumber(pageNumber + 2)
                  }}
                >
                  {pageNumber + 2}
                </Button>
              )}
              {pageNumber + 3 <= noOfPages && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 5,
                  }}
                >
                  ...
                </div>
              )}
              {pageNumber + 3 <= noOfPages && (
                <Button
                  style={{ minWidth: 30, marginRight: 5 }}
                  onClick={() => {
                    setPageNumber(noOfPages)
                  }}
                >
                  {noOfPages}
                </Button>
              )}
            </Box>
          </>
        </>
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
    </React.Fragment>
  )
}
