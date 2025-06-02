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
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import InfoIcon from "@mui/icons-material/Info"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import SearchIcon from "@mui/icons-material/Search"

// Hooks, Types, Context, API
import { useSnackBar } from "context/GlobalContext"
import { Order, OrderStatus } from "types/order.types"
import Title from "@apps/admin/components/Title"
import ConfirmationDialog from "@components/ConfirmationDialog/ConfirmationDialog"
import { deleteOrder, getOrders } from "@api/order.api"

// Interface for Order data from API (assuming more details might be available)
interface OrderSummary {
  _id: string
  orderNumber?: number
  createdOn: Date
  customerName?: string
  customerEmail?: string
  totalUnits: number
  total: number
  primaryStatus?: OrderStatus
  shippingMethodName?: string
  paymentMethodName?: string
}

// Helper to format currency (same as before)
const formatCurrency = (value: number): string => `$${value.toFixed(2)}`
// Helper to get Status chip props (same as before)
const getStatusChipProps = (
  status?: OrderStatus
): { label: string; color: any; icon?: React.ReactElement } => {
  /* ... same as before ... */
  const s = status ?? OrderStatus.Pending
  switch (s) {
    case OrderStatus.Pending:
      return { label: "En espera", color: "warning" }
    case OrderStatus.Impression:
      return { label: "En impresión", color: "error" }
    case OrderStatus.Production:
      return { label: "En producción", color: "info" }
    case OrderStatus.ReadyToShip:
      return {
        label: "Listo para envío",
        color: "secondary",
        icon: <CheckCircleIcon />,
      }
    case OrderStatus.Delivered:
      return { label: "Entregado", color: "success", icon: <CheckCircleIcon /> }
    case OrderStatus.Canceled:
      return { label: "Cancelado", color: "error", icon: <CancelIcon /> }
    case OrderStatus.Finished:
      return { label: "Completado", color: "default", icon: <InfoIcon /> }
    case OrderStatus.Paused:
      return { label: "Pausado", color: "warning" }
    case OrderStatus.Canceled:
      return { label: "Cancelado", color: "info" }
    default:
      return { label: "Desconocido", color: "default" }
  }
}

const ReadOrders: React.FC = () => {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()

  // --- State ---
  const [allOrders, setAllOrders] = useState<OrderSummary[]>([]) // Store all fetched orders
  const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([]) // Orders after filtering
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderSummary | null>(null)
  // --- Pagination State ---
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  // --- Filtering State ---
  const [searchTerm, setSearchTerm] = useState("")

  // --- Fetch Data ---
  const loadOrders = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true)
      setError(null)
      try {
        const orders = (await getOrders()) as Order[] // Obtienes las órdenes completas

        // --- CORRECCIÓN AQUÍ ---
        const fetchedOrders: OrderSummary[] = orders.map((order) => {
          // Función auxiliar para obtener el último estado
          const getLatestStatus = (
            history: [OrderStatus, Date][] | undefined
          ): OrderStatus | undefined => {
            return history && history.length > 0
              ? history[history.length - 1][0]
              : OrderStatus.Pending // O undefined si lo prefieres
          }

          const customer = order.consumerDetails?.basic
          const shipping = order.shipping
          const payment = order.payment // Accedes a PaymentDetails

          // Construyes el objeto OrderSummary
          return {
            _id: order._id!.toString(), // Asegúrate que _id siempre exista y sea ObjectId
            orderNumber: order.number,
            createdOn: order.createdOn,
            updates: order.updates, // Mantén los campos que Omit no quita, si los necesitas
            totalUnits: order.totalUnits,
            status: order.status, // Mantén si lo necesitas, aunque uses primaryStatus
            paymentStatus: order.paymentStatus, // Mantén si lo necesitas
            subTotal: order.subTotal,
            discount: order.discount,
            surcharge: order.surcharge,
            shippingCost: order.shippingCost,
            totalWithoutTax: order.totalWithoutTax,
            total: order.total,
            seller: order.seller,
            observations: order.observations,

            // Campos personalizados poblados:
            customerName: customer
              ? `${customer.name} ${customer.lastName}`.trim()
              : "Sin Registrar",
            customerEmail: customer?.email || "",
            primaryStatus: getLatestStatus(order.status),
            shippingMethodName: shipping?.method?.name || "N/A",
            // Accede al nombre del método desde la primera cuota (installment)
            paymentMethodName:
              payment?.installments?.[0]?.method?.name || "N/A",
          }
        })
        // --- FIN CORRECCIÓN ---

        if (fetchedOrders.some((o) => !o._id))
          console.error("Some orders missing '_id'.")
        fetchedOrders.sort(
          (a, b) =>
            new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
        )
        setAllOrders(fetchedOrders)
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

  // --- Filtering Logic ---
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

  // --- Pagination Handlers ---
  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // --- Delete Handling (same as before) ---
  const handleOpenDeleteDialog = (order: OrderSummary) => {
    /* ... */ if (!order._id) {
      showSnackBar("Falta ID.")
      return
    }
    setOrderToDelete(order)
    setDialogOpen(true)
  }
  const handleCloseDialog = () => {
    /* ... */ if (isDeleting) return
    setDialogOpen(false)
    setOrderToDelete(null)
  }
  const handleConfirmDelete = async () => {
    /* ... */
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

  // --- Update & Create Handling (same as before) ---
  const handleUpdate = (orderId: string) => {
    /* ... */ if (!orderId) {
      showSnackBar("Falta ID.")
      return
    }
    navigate(`/admin/orders/update/${orderId}`)
  }
  const handleCreate = () => {
    /* ... */ navigate("/admin/orders/create")
  }

  // --- Render Logic ---
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
                <TableCell sx={{ fontWeight: "bold" }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Items</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Envío</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Pago</TableCell>
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
                      {order.customerName || "Sin Registrar"}
                      <br />
                      <Typography variant="caption">
                        {order.customerEmail || ""}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.totalUnits || "N/A"}</TableCell>

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
                    <TableCell>{order.paymentMethodName || "N/A"}</TableCell>
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

  return (
    <>
      <Title title="Gestionar Órdenes" />
      {/* Header with Create Button and Search Bar */}
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={isLoading || isDeleting}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Crear Orden
        </Button>
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
