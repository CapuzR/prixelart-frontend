import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
} from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

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
  Chip,
  Link,
  TablePagination,
  TextField,
  InputAdornment,
  Fab,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material"
import Grid2 from "@mui/material/Grid" // Assuming this is Material UI's Unstable_Grid2 or similar
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import FilterListOffIcon from "@mui/icons-material/FilterListOff"
import {
  LocalShippingOutlined,
  PauseCircleFilled,
  GetApp,
} from "@mui/icons-material"
import {
  PickerChangeHandlerContext,
  DateValidationError,
} from "@mui/x-date-pickers"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"

import { useSnackBar } from "context/GlobalContext"
import { Order, OrderStatus, GlobalPaymentStatus, ShippingDetails } from "types/order.types"
import Title from "@apps/admin/components/Title"
import ConfirmationDialog from "@components/ConfirmationDialog/ConfirmationDialog"
import { deleteOrder, getOrders } from "@api/order.api"
import excelJS from "exceljs"
import "moment/locale/es"
import { format, parseISO, isValid } from "date-fns"
import { Permissions } from "types/permissions.types"
import { getPermissions } from "@api/admin.api"
import dayjs, { Dayjs } from "dayjs"

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
  shipping: ShippingDetails
}

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [permissions, setPermissions] = useState<Permissions | null>(null)

  const [rawOrders, setRawOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<OrderSummary[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderSummary | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilteringLoading, setIsFilteringLoading] = useState<boolean>(false)

  const parseDateParam = (param: string | null): Date | null => {
    if (!param) return null
    const date = parseISO(param)
    return isValid(date) ? date : null
  }

  const [searchQuery, setSearchQuery] = useState<string>(
    () => searchParams.get("search") || ""
  )
  const [filterStatus, setFilterStatus] = useState<string>(
    () => searchParams.get("status") || ""
  )
  const [filterPayStatus, setFilterPayStatus] = useState<string>(
    () => searchParams.get("payStatus") || ""
  )
  const [startDate, setStartDate] = useState<Date | null>(() =>
    parseDateParam(searchParams.get("startDate"))
  )
  const [endDate, setEndDate] = useState<Date | null>(() =>
    parseDateParam(searchParams.get("endDate"))
  )
  const [filterIsNotConcretado, setFilterIsNotConcretado] = useState<boolean>(
    () => searchParams.get("excludeStatus") === "Concretado"
  )
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const loadOrders = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true)
      setError(null)
      try {
        const orders = (await getOrders()) as Order[]

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
            shipping: order.shipping
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

  const readPermissions = async () => {
    const response = await getPermissions()
    setPermissions(response)
  }
  const ALL_STATUSES = [
    "Por producir",
    "En impresión",
    "En producción",
    "Por entregar",
    "Entregado",
    "Concretado",
    "Detenido",
    "Anulado",
  ]

  const ALL_PAY_STATUSES = ["Pendiente", "Pagado", "Abonado", "Anulado"]

  useEffect(() => {
    loadOrders()
    readPermissions()
  }, [loadOrders])

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase()
    let adjustedEndDate: Date | null = null
    if (endDate) {
      adjustedEndDate = new Date(endDate)
      adjustedEndDate.setHours(23, 59, 59, 999)
    }
    const filtered = allOrders.filter((order) => {
      const textMatch =
        !searchTerm ||
        order._id?.toString().toLowerCase().includes(lowerSearchTerm) ||
        order.customerName?.toLowerCase().includes(lowerSearchTerm) ||
        order.customerEmail?.toLowerCase().includes(lowerSearchTerm)

      const statusMatch =
        filterStatus === "" ||
        order?.primaryStatus?.toString() ===
        ALL_STATUSES.indexOf(filterStatus).toString()

      const payStatusMatch =
        filterPayStatus === "" ||
        order?.payStatus?.toString() ===
        ALL_PAY_STATUSES.indexOf(filterPayStatus).toString()

      const dateMatch =
        (!startDate || new Date(order.createdOn) >= startDate) &&
        (!adjustedEndDate || new Date(order.createdOn) <= adjustedEndDate)

      return textMatch && statusMatch && payStatusMatch && dateMatch
    })
    setFilteredOrders(filtered)
    setPage(0)
  }, [searchTerm, filterStatus, filterPayStatus, allOrders, startDate, endDate])

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value
    setSearchTerm(value)

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      triggerSearchOrFilter()
    }, 500)
  }

  const triggerSearchOrFilter = useCallback(() => {
    setPage(0)
  }, [])

  const handleSelectFilterChange =
    (setter: React.Dispatch<React.SetStateAction<any>>) =>
      (event: SelectChangeEvent<any>) => {
        const value = event.target.value
        setter(value)
        if (setter === setFilterStatus && value !== "") {
          setFilterIsNotConcretado(false)
        }
        triggerSearchOrFilter()
      }

  const handleDateFilterChange =
    (setter: React.Dispatch<React.SetStateAction<Date | null>>) =>
      (
        value: unknown,
        context: PickerChangeHandlerContext<DateValidationError>
      ) => {
        setter(value as Date | null)
        triggerSearchOrFilter()
      }

  const handleClearFilters = () => {
    setSearchQuery("")
    setFilterStatus("")
    setFilterPayStatus("")
    setStartDate(null)
    setEndDate(null)
    setFilterIsNotConcretado(false)
    setPage(0)
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
  }

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
                  Fecha de entrega estimada
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Estado de Pago
                </TableCell>
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
                      {order.shipping.preferredDeliveryDate
                        ? dayjs(order.shipping.preferredDeliveryDate).format('DD/MM/YYYY')
                        : ""}
                    </TableCell>
                    <TableCell>
                      {order.customerName || "Sin Registrar"}
                      <br />
                      <Typography variant="caption">
                        {order.customerEmail || ""}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusProps.icon}
                        label={statusProps.label}
                        color={statusProps.color}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>{" "}
                    <TableCell>
                      <Chip
                        icon={payStatusProps.icon}
                        label={payStatusProps.label}
                        color={payStatusProps.color}
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
                            color="secondary"
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
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
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

  const getStringLatestStatus = <T,>(
    statusHistory: [T, Date][] | undefined
  ): T | undefined | any => {
    if (!statusHistory || statusHistory.length === 0) {
      return undefined
    }
    const st1 = statusHistory[statusHistory.length - 1][0]
    const st = OrderStatus[st1 as OrderStatus]
    if (st === "Pending") return "Pendiente"
    else if (st === "Impression") return "En impresión"
    else if (st === "Production") return "En producción"
    else if (st === "ReadyToShip") return "Listo para enviar"
    else if (st === "Delivered") return "Entregado"
    else if (st === "Finished") return "Completado"
    else if (st === "Paused") return "Detenido"
    else if (st === "Canceled") return "Cancelado"
    else return "Pendiente"
  }

  const getStringLatestPayStatus = <T,>(
    statusHistory: [T, Date][] | undefined
  ): T | undefined | any => {
    if (!statusHistory || statusHistory.length === 0) {
      return undefined
    }
    const st1 = statusHistory[statusHistory.length - 1][0]
    const st = GlobalPaymentStatus[st1 as GlobalPaymentStatus]
    console.log(st)

    if (st === "Pending") return "Pendiente"
    else if (st === "Credited") return "Abonado"
    else if (st === "Paid") return "Pagado"
    else if (st === "Canceled") return "Cancelado"
    else return "Pendiente"
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
    if (permissions?.area !== "Master") {
      showSnackBar("No tienes autorización para acceder a esta información.")
      return
    }
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
      { header: "Fecha de completado", key: "completionDate", width: 11 },
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
          status: getStringLatestStatus(order.status),
          // OrderStatus[getLatestStatus(order.status) ?? OrderStatus.Pending],
          orderId: order._id?.toString().slice(-6),
          createdOn: formatDate(order.createdOn),
          customerName: `${order.consumerDetails?.basic.name || ""} ${order.consumerDetails?.basic.lastName || ""}`,
          customerType: "N/A", // NOTA: 'consumerType' no está en la nueva interfaz. Necesitarías agregarlo a ConsumerDetails si lo requieres.
          observations: stripHtml(order.observations),
          seller: order.seller || order.createdBy,
          paymentMethod: order.payment?.payment
            ? order.payment?.payment[0]?.method.name
            : "N/A",
          paymentStatus: getStringLatestPayStatus(order.payment.status),
          // GlobalPaymentStatus[
          //   getLatestStatus(order.payment.status) ??
          //     GlobalPaymentStatus.Pending
          // ],
          paymentDate: formatDate(
            getLatestStatus(order.payment.status)
              ? order.payment.status[order.payment.status.length - 1][1]
              : undefined
          ),
          completionDate: formatDate(
            getLatestStatus(order.status)
              ? order.status[order.status.length - 1][1]
              : undefined
          ),
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
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid2 container spacing={2} alignItems="center">
          <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <TextField
              label="Buscar (ID, Cliente, Email, CI...)"
              variant="outlined"
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e)}
              disabled={isFilteringLoading}
              slotProps={{
                input: {
                  endAdornment: isFilteringLoading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Grid2>
          <Grid2 size={{ xs: 6, sm: 3, md: 2, lg: 1.5 }}>
            <FormControl
              fullWidth
              size="small"
              disabled={isFilteringLoading || filterIsNotConcretado}
            >
              <InputLabel>Status Orden</InputLabel>
              <Select
                value={filterStatus}
                label="Status Orden"
                onChange={handleSelectFilterChange(setFilterStatus)}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {ALL_STATUSES.map((s) => (
                  <MenuItem key={s} value={s} disabled={filterIsNotConcretado}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 6, sm: 4, md: 2, lg: 1.5 }}>
            <FormControl fullWidth size="small" disabled={isFilteringLoading}>
              <InputLabel>Status Pago</InputLabel>
              <Select
                value={filterPayStatus}
                label="Status Pago"
                onChange={handleSelectFilterChange(setFilterPayStatus)}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {ALL_PAY_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 6, sm: 4, md: 2, lg: 1.75 }}>
            <DatePicker
              label="Fecha Desde"
              value={startDate}
              onChange={handleDateFilterChange(setStartDate)}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
              maxDate={endDate || undefined}
              disabled={isFilteringLoading}
            />
          </Grid2>
          <Grid2 size={{ xs: 6, sm: 4, md: 2, lg: 1.75 }}>
            <DatePicker
              label="Fecha Hasta"
              value={endDate}
              onChange={handleDateFilterChange(setEndDate)}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
              minDate={startDate || undefined}
              disabled={isFilteringLoading}
            />
          </Grid2>
          <Grid2
            size={{ xs: 12, sm: 12, md: 12, lg: 1 }}
            container
            justifyContent="flex-end"
            alignItems="center"
          ></Grid2>
          <Grid2 sx={{ display: "flex", marginLeft: "auto" }}>
            <Tooltip title="Limpiar Filtros" style={{ height: 40, width: 40 }}>
              <Fab
                onClick={handleClearFilters}
                disabled={
                  (!searchQuery &&
                    !filterStatus &&
                    !filterPayStatus &&
                    !startDate &&
                    !endDate &&
                    !filterIsNotConcretado) ||
                  isFilteringLoading
                }
                color="default"
                size="small"
                style={{ marginRight: 10 }}
              >
                <FilterListOffIcon />
              </Fab>
            </Tooltip>
            <Tooltip
              title="Descargar listado"
              style={{ height: 40, width: 40 }}
            >
              <Fab
                disabled={permissions?.area !== "Master"}
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
        </Grid2>
      </Paper>

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
