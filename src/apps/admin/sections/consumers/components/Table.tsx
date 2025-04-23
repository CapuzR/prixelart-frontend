import React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Title from "@apps/admin/components/Title"
import { Typography } from "@mui/material"
import Grid2 from "@mui/material/Grid2"
import TextField from "@mui/material/TextField"
import SearchIcon from "@mui/icons-material/Search"
import InputAdornment from "@mui/material/InputAdornment"
import IconButton from "@mui/material/IconButton"
import AddIcon from "@mui/icons-material/Add"

import Table1 from "@components/Table"
import { useSnackBar, useLoading, getPermissions } from "context/GlobalContext"
import { Consumer } from "../../../../../types/consumer.types"
import { deleteConsumer, getConsumers } from "../api"
import { useConsumerForm } from "@context/ConsumerFormContext"

export default function Table() {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const permissions = getPermissions()
  const { dispatch } = useConsumerForm()

  const [original, setOriginal] = useState<Consumer[]>([])
  const [rows, setRows] = useState<Consumer[]>([])
  const [filter, setFilter] = useState<string>("")
  const [totalConsumers, setTotalConsumers] = useState(rows?.length)
  const [itemsPerPage, setItemPerPage] = useState(20)
  const [pageNumber, setPageNumber] = useState(1)

  const readConsumers = async () => {
    setLoading(true)
    try {
      const consumers = await getConsumers()
      setRows(consumers)
      setOriginal(consumers)
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

  const handleUpdate = (consumer: Consumer) => {
    dispatch({
      type: "SET_CLIENT",
      client: consumer,
    })
    navigate("/admin/consumer/update/" + consumer._id)
  }

  const deleteClient = async (row: Consumer) => {
    setLoading(true)
    const response = await deleteConsumer(row._id)
    showSnackBar(
      `Cliente ${row.firstname} ${row.lastname} eliminado exitosamente.`
    )
    readConsumers()
  }

  const changeFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true)
    let query = e.target.value.toLowerCase()
    console.log(query)
    setFilter(e.target.value)
    if (typeof query === "string" && query.length > 0) {
      let filtered = rows.filter((row) =>
        row.firstname.toLowerCase().includes(query)
      )

      setRows(filtered)
      setTotalConsumers(filtered.length)
      setItemPerPage(filtered.length)
    } else {
      setRows(original)
      setTotalConsumers(original?.length)
      setItemPerPage(20)
    }
  }

  const handleConsumerAction = (action: string) => {
    navigate({ pathname: action })
  }

  const headers = [
    { title: "Activo", type: 'string' },
    { title:"Nombre", type: 'string' },
    { title:"Apellido", type: 'string' },
    { title:"Tipo", type: 'string' },
    { title:"Teléfono", type: 'string' },
    { title:"Email", type: 'string' },
    { title:"Dirección de envío", type: 'string' },
    "",
  ]

  const properties = [
    "active",
    "firstname",
    "lastname",
    "consumerType",
    "phone",
    "email",
    "shippingAddress",
  ]

  return (
    <React.Fragment>
      {permissions?.readConsumers ? (
        <>
          <Grid2 sx={{ display: "flex", justifyContent: "space-between" }}>
            <Title title={"Clientes frecuentes"} />
            <Grid2 sx={{ display: "flex", alignContent: "center", gap: 2 }}>
              <TextField
                variant="outlined"
                value={filter}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  changeFilter(event)
                }}
                style={{ padding: 0 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="secondary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {permissions?.createConsumer && (
                <IconButton
                  color="primary"
                  aria-label="add"
                  onClick={() => {
                    handleConsumerAction("create")
                  }}
                >
                  <AddIcon />
                </IconButton>
              )}
            </Grid2>
          </Grid2>
          <Table1
            headers={headers}
            elements={rows}
            properties={properties}
            updateFunction={handleUpdate}
            deleteFunction={deleteClient}
            setPageNumber={setPageNumber}
            pageNumber={pageNumber}
            itemsPerPage={itemsPerPage}
            maxLength={totalConsumers}
          />
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
