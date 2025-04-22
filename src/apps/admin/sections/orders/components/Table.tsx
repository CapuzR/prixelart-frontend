import React, { useEffect, useState, Dispatch, SetStateAction } from "react"
import axios from "axios"
import { TableCell, TableHead, TableRow, TableBody, Theme } from "@mui/material"
import Table from "@mui/material/Table"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import { SelectChangeEvent } from "@mui/material"

import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import SearchIcon from "@mui/icons-material/Search"
import InputAdornment from "@mui/material/InputAdornment"
import moment from "moment"
import "moment/locale/es"
import ArrowBack from "@mui/icons-material/ArrowBackIos"
import ArrowForward from "@mui/icons-material/ArrowForwardIos"
import IconButton from "@mui/material/IconButton"
import { makeStyles } from "tss-react/mui"
import { getPermissions, useLoading, useSnackBar } from "@context/GlobalContext"
import { Order } from "../../../../../types/order.types"
import { Consumer } from "../../../../../types/consumer.types"

interface TableProps {
  setActiveRemoveFilters: Dispatch<SetStateAction<boolean>>
  activeRemoveFilters: boolean
  setRefresh: Dispatch<SetStateAction<null>>
  rows: Order[]
  clients: string[]
  setModalContent: (row: Order) => void
  setIsShowDetails: (x: boolean) => void
  isShowDetails: boolean
  handleChangePayStatus: (order: Order, value: string) => void
  handleChangeStatus: (order: Order, value: string) => void
}

// interface Filter {
//   creationDate: string | undefined
//   shippingDate: string | undefined
//   client: string | undefined
//   payStatus: string | undefined
//   status: string | undefined
//   seller: string | undefined
// }
const useStyles = makeStyles()((theme: Theme) => {
  return {
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
  }
})

export default function ReadOrders({
  setActiveRemoveFilters,
  setRefresh,
  rows,
  clients,
  setModalContent,
  setIsShowDetails,
  isShowDetails,
  handleChangePayStatus,
  handleChangeStatus,
}: TableProps) {
  const { classes } = useStyles()
  const { setLoading } = useLoading()
  const { showSnackBar } = useSnackBar()

  const permissions = getPermissions()
  const adminToken = localStorage.getItem("adminToken")
  const adminData = adminToken ? JSON.parse(adminToken) : null

  const itemsPerPage = 20
  const [pageNumber, setPageNumber] = useState(1)
  const [rowsL, setRows] = useState<Order[]>(rows)
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(1)
  const [sellers, setSellers] = useState([])
  const [filters, setFilters] = useState<any>({
    creationDate: undefined,
    shippingDate: undefined,
    client: undefined,
    payStatus: undefined,
    status: undefined,
    seller: undefined,
  })

  const handleID = (event: React.ChangeEvent<HTMLInputElement>) => {
    let query = event.target.value
    if (query !== "") {
      findOrder(event.target.value)
    } else {
      setRows(orders)
    }
  }

  const handleFilters = (filter: string, value: string) => {
    let f = filters
    f[filter] = value
    setFilters(f)
    setPageNumber(1)
    readOrders()
  }

  const removeFilters = async () => {
    setFilters({
      creationDate: undefined,
      shippingDate: undefined,
      client: undefined,
      payStatus: undefined,
      status: undefined,
      seller: undefined,
    })
  }

  // useEffect(() => {
  //   setActiveRemoveFilters(() => removeFilters)
  //   setRefresh(() => readOrders)
  // }, [])

  useEffect(() => {
    readOrders()
  }, [filters])

  const findOrder = async (ID: string) => {
    const url = import.meta.env.VITE_BACKEND_URL + "/order/readById/" + ID

    await axios.get(url, { withCredentials: true }).then((res) => {
      // if (res.data.success) {
      showSnackBar(res.data.message)
      setRows(res.data.orders)
      // }
    })
  }

  const handleCreationDate = (event: SelectChangeEvent<string>) => {
    handleFilters("creationDate", event.target.value)
    // setFilters({ ...filters, creationDate: event.target.value });
  }

  const handleShippingDate = (event: SelectChangeEvent<string>) => {
    handleFilters("shippingDate", event.target.value)
  }

  const handleClient = (event: SelectChangeEvent<string>) => {
    handleFilters("client", event.target.value)
  }

  const handlePayStatus = (event: SelectChangeEvent<string>) => {
    handleFilters("payStatus", event.target.value)
  }

  const handleStatus = (event: SelectChangeEvent<string>) => {
    handleFilters("status", event.target.value)
  }

  const handleSeller = (event: SelectChangeEvent<string>) => {
    handleFilters("seller", event.target.value)
  }

  const handleChangeSeller = async (order: Order, seller: string) => {
    const url =
      import.meta.env.VITE_BACKEND_URL + "/order/updateSeller/" + order.orderId
    const body = {
      adminToken: localStorage.getItem("adminTokenV"),
      seller: { username: seller },
    }
    await axios.put(url, body, { withCredentials: true }).then((res) => {
      if (res.data.message) {
        showSnackBar(res.data.message)
      }
    })
    readOrders()
  }

  const readOrders = async () => {
    setLoading(true)
    const base_url = import.meta.env.VITE_BACKEND_URL + "/order/read-allv2"
    await axios
      .post(
        base_url,
        {
          initialPoint: (pageNumber - 1) * itemsPerPage,
          itemsPerPage: itemsPerPage,
          filters: filters,
        },
        { withCredentials: true }
      )
      .then((response) => {
        setRows(response.data.orders)
        setTotal(response.data.length)
        if (response.data.aboutFilters === false) {
          setOrders(response.data.orders)
        }
      })
      .catch((error) => {
        console.log(error)
      })
    setLoading(false)
  }

  const getSellers = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/admin/getSellers"
    await axios
      .get(base_url)
      .then((response) => {
        setSellers(response.data)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  useEffect(() => {
    getSellers()
  }, [])

  useEffect(() => {
    readOrders()
  }, [pageNumber])

  const handleNextPage = () => {
    setPageNumber((pageNumber) => pageNumber + 1)
  }

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber((pageNumber) => pageNumber - 1)
    }
  }

  return (
    <>
      <Table style={{ overflowX: "scroll" }}>
        <TableHead>
          <TableRow>
            <TableCell align="center">
              <TextField
                variant="outlined"
                // fullWidth
                label="ID"
                onChange={handleID}
                // style={{ width: "100%" }}
              />
            </TableCell>
            <TableCell align="center">
              <div style={{ display: "flex", justifyContent: "end" }}>
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel id="demo-simple-select-label">
                    Fecha de creación
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={filters.creationDate}
                    onChange={handleCreationDate}
                  >
                    <MenuItem key={0} value={"recent"}>
                      Recientes
                    </MenuItem>
                    <MenuItem key={1} value={"previous"}>
                      Anteriores
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
            </TableCell>
            <TableCell align="center">
              <div style={{ display: "flex", justifyContent: "end" }}>
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel>Fecha de entrega</InputLabel>
                  <Select
                    value={filters.shippingDate}
                    onChange={handleShippingDate}
                  >
                    <MenuItem key={0} value={"coming"}>
                      Próximos
                    </MenuItem>
                    <MenuItem key={1} value={"later"}>
                      Lejanos
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
            </TableCell>
            <TableCell align="center">
              <div style={{ display: "flex", justifyContent: "end" }}>
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel>Cliente</InputLabel>
                  <Select value={filters.client} onChange={handleClient}>
                    <MenuItem style={{ color: "gray" }} value={undefined}>
                      <em>Todos</em>
                    </MenuItem>
                    {clients &&
                      clients.map((c, i) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>
            </TableCell>
            <TableCell align="center">
              <Typography color="secondary">Productos</Typography>
            </TableCell>
            <TableCell align="center">
              <div style={{ display: "flex", justifyContent: "end" }}>
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel> Status de Pago</InputLabel>
                  <Select value={filters.payStatus} onChange={handlePayStatus}>
                    <MenuItem value={undefined}>
                      <em>Todos</em>
                    </MenuItem>
                    <MenuItem key={0} value={"Pendiente"}>
                      Pendiente
                    </MenuItem>
                    <MenuItem key={1} value={"Pagado"}>
                      Pagado
                    </MenuItem>
                    <MenuItem key={2} value={"Abonado"}>
                      Abonado
                    </MenuItem>
                    <MenuItem key={3} value={"Giftcard"}>
                      Giftcard
                    </MenuItem>
                    <MenuItem key={4} value={"Obsequio"}>
                      Obsequio
                    </MenuItem>
                    <MenuItem key={5} value={"Anulado"}>
                      Anulado
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
            </TableCell>
            <TableCell align="center">
              <div style={{ display: "flex", justifyContent: "end" }}>
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel>Status</InputLabel>
                  <Select value={filters.status} onChange={handleStatus}>
                    <MenuItem value={undefined}>
                      <em>Todos</em>
                    </MenuItem>

                    <MenuItem key={0} value={"Por producir"}>
                      Por producir
                    </MenuItem>
                    <MenuItem key={1} value={"En impresión"}>
                      En impresión
                    </MenuItem>
                    <MenuItem key={2} value={"En producción"}>
                      En producción
                    </MenuItem>
                    <MenuItem key={3} value={"Por entregar"}>
                      Por entregar
                    </MenuItem>
                    <MenuItem key={4} value={"Entregado"}>
                      Entregado
                    </MenuItem>
                    <MenuItem key={5} value={"Concretado"}>
                      Concretado
                    </MenuItem>
                    <MenuItem key={6} value={"Detenido"}>
                      Detenido
                    </MenuItem>
                    <MenuItem key={7} value={"Anulado"}>
                      Anulado
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
            </TableCell>
            <TableCell align="center">
              <div style={{ display: "flex", justifyContent: "end" }}>
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel>Asesor</InputLabel>
                  <Select value={filters.seller} onChange={handleSeller}>
                    <MenuItem style={{ color: "gray" }} value={undefined}>
                      <em>Todos</em>
                    </MenuItem>
                    {sellers &&
                      sellers?.length > 0 &&
                      sellers?.map((seller, index) => (
                        <MenuItem key={index} value={seller}>
                          {seller}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rowsL?.length > 0 &&
            rowsL.map((row, index) => (
              <>
                <TableRow key={index}>
                  <TableCell align="center">{row.orderId}</TableCell>
                  <TableCell align="center" style={{ padding: 10 }}>
                    {moment(row.createdOn).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell align="center" style={{ padding: 10 }}>
                    {moment(row?.shippingData?.shippingDate).format(
                      "DD/MM/YYYY"
                    )}
                  </TableCell>
                  <TableCell align="center" style={{ padding: 10 }}>
                    {row.basicData?.firstname || row.basicData?.name}{" "}
                    {row.basicData?.lastname}
                  </TableCell>
                  <TableCell align="center" style={{ padding: 10 }}>
                    <Button
                      onClick={() => {
                        setModalContent(row)
                        setIsShowDetails(!isShowDetails)
                      }}
                      style={{
                        padding: 10,
                        textTransform: "none",
                        backgroundColor: "#eee",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        Detalles
                      </div>
                    </Button>
                  </TableCell>
                  <TableCell align="center" style={{ padding: 10 }}>
                    <FormControl
                      disabled={
                        adminData.area !== "Master" &&
                        (!permissions?.detailPay || row.payStatus === "Pagado")
                      }
                      variant="outlined"
                    >
                      <Select
                        id="payStatus"
                        value={row.payStatus || "Pendiente"}
                        onChange={(e) => {
                          handleChangePayStatus(row, e.target.value)
                        }}
                      >
                        <MenuItem key={0} value={"Pendiente"}>
                          Pendiente
                        </MenuItem>
                        <MenuItem key={1} value={"Pagado"}>
                          Pagado
                        </MenuItem>
                        <MenuItem key={2} value={"Abonado"}>
                          Abonado
                        </MenuItem>
                        <MenuItem key={3} value={"Giftcard"}>
                          Giftcard
                        </MenuItem>
                        <MenuItem key={4} value={"Obsequio"}>
                          Obsequio
                        </MenuItem>
                        <MenuItem key={5} value={"Anulado"}>
                          Anulado
                        </MenuItem>
                      </Select>
                      {row.payStatus === "Pagado" && row.payDate && (
                        <Typography variant="body2" color="secondary">
                          el {moment(row.payDate).format("DD/MM/YYYY")}
                        </Typography>
                      )}
                    </FormControl>
                  </TableCell>

                  <TableCell align="center" style={{ padding: 10 }}>
                    <FormControl
                      disabled={
                        !permissions?.orderStatus ||
                        (adminData.area !== "Master" &&
                          (row.status === "Cancelada" ||
                            row.status === "Concretado"))
                      }
                      variant="outlined"
                    >
                      <Select
                        id="status"
                        value={row.status}
                        onChange={(e) => {
                          handleChangeStatus(row, e.target.value)
                        }}
                      >
                        <MenuItem key={0} value={"Por producir"}>
                          Por producir
                        </MenuItem>
                        <MenuItem key={1} value={"En impresión"}>
                          En impresión
                        </MenuItem>
                        <MenuItem key={2} value={"En producción"}>
                          En producción
                        </MenuItem>
                        <MenuItem key={0} value={"Por entregar"}>
                          Por entregar
                        </MenuItem>
                        <MenuItem key={1} value={"Entregado"}>
                          Entregado
                        </MenuItem>
                        <MenuItem key={2} value={"Concretado"}>
                          Concretado
                        </MenuItem>
                        <MenuItem key={3} value={"Detenido"}>
                          Detenido
                        </MenuItem>
                        <MenuItem key={4} value={"Anulado"}>
                          Anulado
                        </MenuItem>
                      </Select>
                      {row.status === "Concretado" && row.completionDate && (
                        <Typography variant="body2" color="secondary">
                          el {moment(row?.completionDate).format("DD/MM/YYYY")}
                        </Typography>
                      )}
                    </FormControl>
                    {/* <Fab
                        color="default"
                        style={{ width: 35, height: 35 }}
                        aria-label="Delete"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteOrder(row.orderId);
                          readOrders();
                        }}
                      >
                        <DeleteIcon />
                      </Fab> */}
                  </TableCell>
                  <TableCell align="center" style={{ padding: 10 }}>
                    <Select
                      variant="outlined"
                      disabled={adminData.area !== "Master"}
                      value={
                        row.createdBy.username !== undefined
                          ? row.createdBy.username
                          : ""
                      }
                      onChange={(e) => {
                        handleChangeSeller(row, e.target.value)
                      }}
                    >
                      {sellers &&
                        sellers.map((seller) => (
                          <MenuItem key={seller} value={seller}>
                            {seller}
                          </MenuItem>
                        ))}
                    </Select>
                  </TableCell>
                </TableRow>
              </>
            ))}
        </TableBody>
      </Table>
      {rowsL?.length < 1 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: 20,
          }}
        >
          <Typography style={{ margin: 20 }} align="center" color="secondary">
            No hay órdenes que coincidan con tu criterio de búsqueda, intenta de
            nuevo.
          </Typography>
          <Button
            style={{
              textTransform: "none",
              backgroundColor: "gainsboro",
              color: "#404e5c",
              width: 200,
            }}
            size="small"
            onClick={() => removeFilters()}
          >
            Borrar filtros
          </Button>
        </div>
      )}
      {rowsL?.length > 0 && (
        <Box
          style={{
            display: "flex",
            alignSelf: "center",
            margin: "1rem 0",
          }}
        >
          <IconButton
            onClick={handlePreviousPage}
            disabled={pageNumber === 1}
            style={{
              minWidth: "auto",
              padding: "2px",
              marginRight: "0.2rem",
              transform: "scale(0.75)",
            }}
            color="primary"
          >
            <ArrowBack />
          </IconButton>
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
          <IconButton
            onClick={handleNextPage}
            disabled={pageNumber === Math.ceil(total / itemsPerPage)}
            style={{
              minWidth: "auto",
              padding: "2px",
              marginLeft: "0.2rem",
              transform: "scale(0.75)",
            }}
            color="primary"
          >
            <ArrowForward />
          </IconButton>
        </Box>
      )}
    </>
  )
}
