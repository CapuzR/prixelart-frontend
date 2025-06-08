// src/apps/admin/sections/orders/views/ReadOrders.tsx
import React, { useState, useEffect, useCallback, ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"

// MUI Components
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Stack,
  Chip,
  Link,
  TablePagination,
  TextField,
  InputAdornment,
  Fab,
} from "@mui/material"
import Grid2 from "@mui/material/Grid" // Assuming this is Material UI's Unstable_Grid2 or similar
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import InfoIcon from "@mui/icons-material/Info"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import SearchIcon from "@mui/icons-material/Search"
import {
  LocalShippingOutlined,
  PauseCircleFilled,
  GetApp,
} from "@mui/icons-material"

import { useSnackBar } from "context/GlobalContext"
import { Order, OrderStatus, GlobalPaymentStatus } from "types/order.types"
import Title from "@apps/admin/components/Title"
import ConfirmationDialog from "@components/ConfirmationDialog/ConfirmationDialog"
import { deleteOrder, getOrders } from "@api/order.api"
import excelJS from "exceljs"
import moment from "moment"
import "moment/locale/es"
import { format } from "date-fns"
interface OrderSummary {
  _id: string
  orderNumber?: number
  createdOn: Date
  customerName?: string
  customerEmail?: string
  totalUnits: number
  total: number
  primaryStatus?: OrderStatus
  payStatus?: GlobalPaymentStatus
  shippingMethodName?: string
  paymentMethodName?: string
  shippingDate?: Date
  createdBy?: string
}

const formatCurrency = (value: number): string => `$${value.toFixed(2)}`

const getStatusChipProps = (
  status?: OrderStatus
): { label: string; color: any; icon?: React.ReactElement } => {
  const s = status ?? OrderStatus.Pending
  switch (s) {
    case OrderStatus.Pending:
      return { label: "Por producir", color: "secondary" }
    case OrderStatus.Impression:
      return { label: "En impresión", color: "info", icon: <CheckCircleIcon /> }
    case OrderStatus.Production:
      return {
        label: "En producción",
        color: "info",
        icon: <CheckCircleIcon />,
      }
    case OrderStatus.ReadyToShip:
      return {
        label: "Por entregar",
        color: "primary",
        icon: <LocalShippingOutlined />,
      }
    case OrderStatus.Delivered:
      return {
        label: "Entregado",
        color: "success",
        icon: <LocalShippingOutlined />,
      }
    case OrderStatus.Finished:
      return {
        label: "Concretado",
        color: "success",
        icon: <CheckCircleIcon />,
      }
    case OrderStatus.Paused:
      return {
        label: "Detenido",
        color: "warning",
        icon: <PauseCircleFilled />,
      }
    case OrderStatus.Canceled:
      return { label: "Anulado", color: "error", icon: <CancelIcon /> }
    default:
      return { label: "Desconocido", color: "default" }
  }
}

const getpayStatusChipProps = (
  status?: GlobalPaymentStatus
): { label: string; color: any; icon?: React.ReactElement } => {
  const s = status ?? GlobalPaymentStatus.Pending
  switch (s) {
    case GlobalPaymentStatus.Pending:
      return { label: "Pendiente", color: "secondary" }
    case GlobalPaymentStatus.Paid:
      return { label: "Pagado", color: "success", icon: <CheckCircleIcon /> }
    case GlobalPaymentStatus.Credited:
      return {
        label: "Abonado",
        color: "info",
        icon: <CheckCircleIcon />,
      }
    case GlobalPaymentStatus.Cancelled:
      return {
        label: "Cancelado",
        color: "primary",
        icon: <CancelIcon />,
      }
    default:
      return { label: "Pendiente", color: "default" }
  }
}
const ReadOrders: React.FC = () => {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()

  const [rawOrders, setRawOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<OrderSummary[]>([]) // Store all fetched orders
  const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([]) // Orders after filtering
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderSummary | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")

  const loadOrders = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true)
      setError(null)
      try {
        const orders = (await getOrders()) as Order[] // Obtienes las órdenes completas

        const fetchedOrders: OrderSummary[] = orders.map((order) => {
          const getLatestStatus = (
            history: [OrderStatus, Date][] | undefined
          ): OrderStatus | undefined => {
            return history && history.length > 0
              ? history[history.length - 1][0]
              : OrderStatus.Pending // O undefined si lo prefieres
          }

          const getLatestPaymentStatus = (
            history: [GlobalPaymentStatus, Date][] | undefined
          ): GlobalPaymentStatus | undefined => {
            return history && history.length > 0
              ? history[history.length - 1][0]
              : GlobalPaymentStatus.Pending
          }

          const customer = order.consumerDetails?.basic
          const shipping = order.shipping
          const payment = order.payment

          return {
            _id: order._id!.toString(),
            orderNumber: order.number,
            createdOn: order.createdOn,
            updates: order.updates,
            totalUnits: order.totalUnits,
            // status: order.status,
            payStatus: getLatestPaymentStatus(order.payment.status),
            subTotal: order.subTotal,
            discount: order.discount,
            surcharge: order.surcharge,
            shippingCost: order.shippingCost,
            totalWithoutTax: order.totalWithoutTax,
            total: order.total,
            seller: order.seller,
            observations: order.observations,
            createdBy: order.seller,
            customerName: customer
              ? `${customer.name} ${customer.lastName}`.trim()
              : "Sin Registrar",
            customerEmail: customer?.email || "",
            primaryStatus: getLatestStatus(order.status),
            shippingMethodName: shipping?.method?.name || "N/A",
            paymentMethodName: payment?.payment?.[0]?.method?.name || "N/A",
          }
        })

        if (fetchedOrders.some((o) => !o._id))
          console.error("Some orders missing '_id'.")
        fetchedOrders.sort(
          (a, b) =>
            new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
        )
        setAllOrders(fetchedOrders)
        setRawOrders(orders)
        setFilteredOrders(fetchedOrders)
      } catch (err: any) {
        const message = err.message || "Error al cargar las órdenes."
        setError(message)
        showSnackBar(message)
        console.error("Error fetching orders:", err)
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [showSnackBar]
  )

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase()
    const filtered = allOrders.filter((order) => {
      const orderNumMatch = order.orderNumber
        ?.toString()
        .includes(lowerSearchTerm)
      const customerMatch = order.customerName
        ?.toLowerCase()
        .includes(lowerSearchTerm)
      const emailMatch = order.customerEmail
        ?.toLowerCase()
        .includes(lowerSearchTerm)
      const idMatch = order._id?.toLowerCase().includes(lowerSearchTerm)
      // Add more fields to search  (status, etc.)
      return orderNumMatch || customerMatch || emailMatch || idMatch
    })
    setFilteredOrders(filtered)
    setPage(0) // Reset page when filter changes
  }, [searchTerm, allOrders])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenDeleteDialog = (order: OrderSummary) => {
    if (!order._id) {
      showSnackBar("Falta ID.")
      return
    }
    setOrderToDelete(order)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    if (isDeleting) return
    setDialogOpen(false)
    setOrderToDelete(null)
  }
  const handleConfirmDelete = async () => {
    if (!orderToDelete?._id) {
      showSnackBar("Error.")
      setIsDeleting(false)
      handleCloseDialog()
      return
    }
    setIsDeleting(true)
    try {
      await deleteOrder(orderToDelete._id)
      showSnackBar(`Orden #${orderToDelete._id} eliminada.`)
      // Refetch *all* orders after delete to ensure consistency
      await loadOrders(false)
      handleCloseDialog()
    } catch (err: any) {
      console.error("Error deleting order:", err)
      showSnackBar(err.message || "Error.")
      handleCloseDialog()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdate = (orderId: string) => {
    if (!orderId) {
      showSnackBar("Falta ID.")
      return
    }
    navigate(`/admin/orders/update/${orderId}`)
  }
  const handleCreate = () => {
    navigate("/admin/orders/create")
  }

  const renderContent = () => {
    // ... (Loading, Empty, Error states handled above table) ...
    if (isLoading) return null
    if (error && allOrders.length === 0) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
          <Button onClick={() => loadOrders()} size="small">
            Reintentar
          </Button>
        </Alert>
      )
    }
    if (!isLoading && allOrders.length === 0 && !error) {
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          No se encontraron órdenes.
        </Alert>
      )
    }

    // Paginate the filtered orders
    const paginatedOrders = filteredOrders.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    )

    return (
      <Paper sx={{ width: "100%", overflow: "hidden", mt: 2 }}>
        <TableContainer>
          <Table stickyHeader sx={{ minWidth: 900 }} aria-label="orders table">
            <TableHead
              sx={{ backgroundColor: (theme) => theme.palette.action.hover }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}># Orden</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Fecha de creación
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Fecha de envío
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Estado de Pago
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Envío</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Asesor</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No hay órdenes que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              )}
              {paginatedOrders.map((order) => {
                const statusProps = getStatusChipProps(order.primaryStatus)
                const payStatusProps = getpayStatusChipProps(order.payStatus)

                return (
                  <TableRow
                    hover
                    key={order._id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => handleUpdate(order._id)}
                      >
                        #{order._id.slice(-6)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdOn).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {order.shippingDate
                        ? new Date(order.shippingDate).toLocaleDateString()
                        : ""}
                    </TableCell>
                    <TableCell>
                      {order.customerName || "Sin Registrar"}
                      <br />
                      <Typography variant="caption">
                        {order.customerEmail || ""}
                      </Typography>
                    </TableCell>
                    {/* <TableCell>{order.totalUnits || "N/A"}</TableCell> */}
                    <TableCell>
                      <Chip
                        icon={payStatusProps.icon}
                        label={payStatusProps.label}
                        color={payStatusProps.color}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusProps.icon}
                        label={statusProps.label}
                        color={statusProps.color}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{order.shippingMethodName || "N/A"}</TableCell>
                    <TableCell>{order?.createdBy}</TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="Ver/Editar Orden">
                          <IconButton
                            aria-label="edit"
                            color="primary"
                            onClick={() => handleUpdate(order._id)}
                            disabled={!order._id || isDeleting}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar Orden">
                          <IconButton
                            aria-label="delete"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(order)}
                            disabled={
                              !order._id ||
                              (isDeleting && orderToDelete?._id === order._id)
                            }
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredOrders.length} // Count based on filtered results
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Órdenes por página:"
        />
      </Paper>
    )
  }

  const getLatestStatus = <T,>(
    statusHistory: [T, Date][] | undefined
  ): T | undefined | any => {
    if (!statusHistory || statusHistory.length === 0) {
      return undefined
    }
    return statusHistory[statusHistory.length - 1][0]
  }

  const formatDate = (date: Date | undefined): string => {
    return date ? format(new Date(date), "dd/MM/yyyy") : ""
  }

  const formatPrice = (price: number | undefined): string => {
    return price !== undefined ? `$${price.toFixed(2)}` : "$0.00"
  }

  const stripHtml = (html?: string): string => {
    return html ? html.replace(/<[^>]+>/g, "") : ""
  }

  const downloadOrders = async (orders: Order[]): Promise<void> => {
    const workbook = new excelJS.Workbook()
    const worksheet = workbook.addWorksheet(`Pedidos Detallados`)

    worksheet.columns = [
      { header: "status", key: "status", width: 16 },
      { header: "ID", key: "orderId", width: 10 },
      { header: "Fecha de solicitud", key: "createdOn", width: 12 },
      { header: "Nombre del cliente", key: "customerName", width: 24 },
      { header: "Tipo de cliente", key: "customerType", width: 12 }, // Dato a revisar
      { header: "Prixer", key: "prixer", width: 18 },
      { header: "Arte", key: "art", width: 24 },
      { header: "Producto", key: "product", width: 20 },
      { header: "Atributo", key: "attributes", width: 20 },
      { header: "Cantidad", key: "quantity", width: 10 },
      { header: "Costo unitario", key: "unitPrice", width: 12 },
      { header: "Observación", key: "observations", width: 18 },
      { header: "Vendedor", key: "seller", width: 16 },
      { header: "Método de pago", key: "paymentMethod", width: 14 },
      { header: "Validación del pago", key: "paymentStatus", width: 12 },
      { header: "Fecha de pago", key: "paymentDate", width: 11 },
      { header: "Método de entrega", key: "shippingMethod", width: 14 },
      { header: "Fecha de entrega", key: "deliveryDate", width: 11 },
    ]

    worksheet.getRow(1).eachCell((cell: any) => {
      cell.font = { bold: true }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      }
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      }
    })

    for (const order of orders) {
      for (const line of order.lines) {
        const rowData = {
          status:
            OrderStatus[getLatestStatus(order.status) ?? OrderStatus.Pending],
          orderId: order.number,
          createdOn: formatDate(order.createdOn),
          customerName: `${order.consumerDetails?.basic.name || ""} ${order.consumerDetails?.basic.lastName || ""}`,
          customerType: "N/A", // NOTA: 'consumerType' no está en la nueva interfaz. Necesitarías agregarlo a ConsumerDetails si lo requieres.
          observations: stripHtml(order.observations),
          seller: order.seller || order.createdBy,
          paymentMethod: order.payment?.payment
            ? order.payment?.payment[0]?.method.name
            : "N/A",
          paymentStatus:
            GlobalPaymentStatus[
              getLatestStatus(order.payment.status) ??
                GlobalPaymentStatus.Pending
            ],
          paymentDate: formatDate(
            getLatestStatus(order.payment.status)
              ? order.payment.status[order.payment.status.length - 1][1]
              : undefined
          ), // Antigua: order.payDate
          shippingMethod: order.shipping.method?.name,
          deliveryDate: formatDate(order.shipping.estimatedDeliveryDate),
          prixer: line.item.art?.prixerUsername || "N/A",
          art: line.item.art?.title || "N/A",
          product: line.item.product?.name || "N/A",
          attributes:
            typeof line.item.product?.selection === "string"
              ? line.item.product.selection
              : line.item.product?.selection
                  ?.map((attr: any) => attr.value)
                  .join(", ") || "",
          quantity: line.quantity,
          unitPrice: formatPrice(line.pricePerUnit),
        }

        const row = worksheet.addRow(rowData)
        row.eachCell({ includeEmpty: true }, (cell: any) => {
          cell.font = { bold: true }
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          }
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          }
        })
      }
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    const date = format(new Date(), "dd-MM-yyyy")
    link.download = `Pedidos ${date}.xlsx`
    link.click()
  }

  return (
    <>
      <Title title="Gestionar Órdenes" />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        mb={2}
        mt={1}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar por #, cliente, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: 350 } }} // Responsive width
        />
        {/* TO DO: Check if works succesfully */}
        <Grid2 sx={{ display: "flex" }}>
          <Tooltip title="Descargar listado" style={{ height: 40, width: 40 }}>
            <Fab
              color="secondary"
              size="small"
              onClick={() => downloadOrders(rawOrders)}
              style={{ marginRight: 10 }}
            >
              <GetApp />
            </Fab>
          </Tooltip>
          <Tooltip title="Crear pedido" style={{ height: 40, width: 40 }}>
            <Fab
              color="primary"
              size="small"
              onClick={handleCreate}
              disabled={isLoading || isDeleting}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Grid2>
      </Stack>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && !isLoading && allOrders.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pudo actualizar la lista: {error}
        </Alert>
      )}

      {renderContent()}

      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={
          <>
            ¿Estás seguro de que deseas eliminar la orden{" "}
            <strong>#{orderToDelete?._id.slice(-6)}</strong>?
          </>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        isPerformingAction={isDeleting}
      />
    </>
  )
}

export default ReadOrders
