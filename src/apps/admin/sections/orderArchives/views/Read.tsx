import React, { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Box,
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
  Link,
  Chip,
  TablePagination,
  TableSortLabel,
  FormControl,
  Select,
  TextField,
  InputLabel,
  MenuItem,
  Skeleton,
  Typography,
  Stack,
  ToggleButton,
  SelectChangeEvent,
  InputAdornment,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  DialogContentText,
  Fab,
} from "@mui/material"
import { GetApp } from "@mui/icons-material"
import VisibilityIcon from "@mui/icons-material/Visibility"
import FilterListOffIcon from "@mui/icons-material/FilterListOff"
import { visuallyHidden } from "@mui/utils"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import EditIcon from "@mui/icons-material/Edit"
import { useSnackBar } from "context/GlobalContext"
import Title from "@apps/admin/components/Title"
import {
  OrderArchive,
  Status as OrderStatus,
  PayStatus as OrderPayStatus,
  Status,
  SelectionClass,
  AttributeName,
} from "types/orderArchive.types"
import { getOrderArchives, updateOrderArchive } from "@api/orderArchive.api"
import {
  formatCurrency,
  formatDate,
  getCustomerName,
  getPayStatusColor,
  getStatusColor,
} from "../helpers/orderArchiveHelpers"
import { format, parseISO, isValid } from "date-fns"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import {
  PickerChangeHandlerContext,
  DateValidationError,
} from "@mui/x-date-pickers"
import Grid2 from "@mui/material/Grid"
import excelJS from "exceljs"
// --- Constants ---
const ALL_STATUSES: OrderStatus[] = [
  "Anulado",
  "Concretado",
  "En producción",
  "Por entregar",
  "Entregado",
  "En impresión",
  "Por producir",
]
const ALL_PAY_STATUSES: OrderPayStatus[] = [
  "Pagado",
  "Anulado",
  "Obsequio",
  "Abonado",
  "Pendiente",
]
const FINAL_STATUSES: OrderStatus[] = ["Concretado", "Entregado", "Anulado"]
const UPDATABLE_TARGET_STATUSES: OrderStatus[] = ALL_STATUSES.filter(
  (s) => !FINAL_STATUSES.includes(s) || s === "Concretado"
)

// --- Sortable Columns ---
interface HeadCell {
  id:
    | keyof Pick<
        OrderArchive,
        | "orderId"
        | "createdOn"
        | "shippingData"
        | "orderType"
        | "status"
        | "payStatus"
        | "total"
      >
    | "customerName"
    | "createdBy"
    | "actions"
  label: string
  numeric: boolean
  sortable: boolean
  display?: any
  width?: string | number
}

const headCells: readonly HeadCell[] = [
  {
    id: "orderId",
    numeric: false,
    label: "ID Orden",
    sortable: true,
    width: "10%",
  },
  {
    id: "createdOn",
    numeric: false,
    label: "Fecha Creación",
    sortable: true,
    width: "15%",
  },
  {
    id: "shippingData",
    numeric: false,
    label: "Fecha de entrega estimada",
    sortable: true,
    width: "15%",
  },
  {
    id: "customerName",
    numeric: false,
    label: "Cliente",
    sortable: false,
    display: { xs: "none", sm: "table-cell" },
    width: "20%",
  },
  {
    id: "orderType",
    numeric: false,
    label: "Tipo",
    sortable: true,
    display: { xs: "none", md: "table-cell" },
    width: "10%",
  },
  {
    id: "status",
    numeric: false,
    label: "Status Orden",
    sortable: true,
    width: "15%",
  },
  {
    id: "payStatus",
    numeric: false,
    label: "Status Pago",
    sortable: true,
    display: { xs: "none", lg: "table-cell" },
    width: "10%",
  },
  {
    id: "createdBy",
    numeric: true,
    label: "Asesor",
    sortable: true,
    width: "10%",
  },
  {
    id: "actions",
    numeric: false,
    label: "Acciones",
    sortable: false,
    width: "10%",
  },
]

type OrderSortKey = keyof Pick<
  OrderArchive,
  "orderId" | "createdOn" | "orderType" | "status" | "payStatus" | "total"
>
type SortDirection = "asc" | "desc"

const parseDateParam = (param: string | null): Date | null => {
  if (!param) return null
  const date = parseISO(param)
  return isValid(date) ? date : null
}

const ReadOrderArchives: React.FC = () => {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()
  const [searchParams, setSearchParams] = useSearchParams()

  // --- State ---
  const [orders, setOrders] = useState<OrderArchive[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isFilteringLoading, setIsFilteringLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // --- Pagination State ---
  const [page, setPage] = useState<number>(() =>
    parseInt(searchParams.get("page") || "0", 10)
  )
  const [rowsPerPage, setRowsPerPage] = useState<number>(() =>
    parseInt(searchParams.get("limit") || "10", 10)
  )
  const [totalOrders, setTotalOrders] = useState<number>(0)

  // --- Sorting State ---
  const [orderBy, setOrderBy] = useState<OrderSortKey>(
    () => (searchParams.get("sortBy") as OrderSortKey) || "createdOn"
  )
  const [order, setOrder] = useState<SortDirection>(
    () => (searchParams.get("sortOrder") as SortDirection) || "desc"
  )

  // --- Filtering & Search State ---
  const [searchQuery, setSearchQuery] = useState<string>(
    () => searchParams.get("search") || ""
  )
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "">(
    () => (searchParams.get("status") as OrderStatus) || ""
  )
  const [filterPayStatus, setFilterPayStatus] = useState<OrderPayStatus | "">(
    () => (searchParams.get("payStatus") as OrderPayStatus) || ""
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

  // --- Update Status Modal State ---
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false)
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] =
    useState<OrderArchive | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("")
  const [newPayStatus, setNewPayStatus] = useState<OrderPayStatus | "">()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)

  // --- Data Fetching ---
  const loadOrders = useCallback(
    async (showInitialLoadingIndicator = true) => {
      const loadingStateSetter = showInitialLoadingIndicator
        ? setIsLoading
        : setIsFilteringLoading
      loadingStateSetter(true)
      if (!showInitialLoadingIndicator) setError(null)

      try {
        const apiPage = page + 1
        const filters: Record<string, string | undefined> = {
          search: searchQuery || undefined,
          status: filterStatus || undefined,
          payStatus: filterPayStatus || undefined,
          startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
          endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
          excludeStatus: filterIsNotConcretado ? "Concretado" : undefined,
        }

        Object.keys(filters).forEach(
          (key) => filters[key] === undefined && delete filters[key]
        )

        const response = await getOrderArchives({
          page: apiPage,
          limit: rowsPerPage,
          sortBy: orderBy,
          sortOrder: order,
          ...filters,
        })

        setOrders(response.data)
        setTotalOrders(response.totalCount)
        if (showInitialLoadingIndicator) setError(null)
      } catch (err: any) {
        const message = err.message || "Error al cargar órdenes."
        let displayMessage = message
        if (err.message?.includes("Network Error")) {
          displayMessage = "Error de red. Verifique su conexión."
        } else if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          displayMessage = "No autorizado. Por favor, inicie sesión de nuevo."
        } else if (err.response?.status >= 500) {
          displayMessage = "Error del servidor. Intente más tarde."
        }

        setError(displayMessage)
        if (!showInitialLoadingIndicator) {
          showSnackBar(`Error al actualizar: ${displayMessage}`)
        }
        console.error("Error fetching order data:", err)
      } finally {
        loadingStateSetter(false)
      }
    },
    [
      page,
      rowsPerPage,
      order,
      orderBy,
      showSnackBar,
      searchQuery,
      filterStatus,
      filterPayStatus,
      startDate,
      endDate,
      filterIsNotConcretado,
    ]
  )

  // --- URL Parameter Sync ---
  useEffect(() => {
    if (!isInitialMount.current) {
      const params: Record<string, string> = {}
      if (page > 0) params.page = String(page)
      if (rowsPerPage !== 10) params.limit = String(rowsPerPage)
      if (orderBy !== "createdOn") params.sortBy = orderBy
      if (order !== "desc") params.sortOrder = order
      if (searchQuery) params.search = searchQuery
      if (filterStatus) params.status = filterStatus
      if (filterPayStatus) params.payStatus = filterPayStatus
      if (startDate && isValid(startDate))
        params.startDate = format(startDate, "yyyy-MM-dd")
      if (endDate && isValid(endDate))
        params.endDate = format(endDate, "yyyy-MM-dd")
      if (filterIsNotConcretado) params.excludeStatus = "Concretado"

      setSearchParams(params, { replace: true })
    } else {
      isInitialMount.current = false
    }
  }, [
    page,
    rowsPerPage,
    order,
    orderBy,
    searchQuery,
    filterStatus,
    filterPayStatus,
    startDate,
    endDate,
    filterIsNotConcretado,
    setSearchParams,
  ])

  useEffect(() => {
    loadOrders(!orders.length)
  }, [loadOrders])

  // --- Event Handlers ---
  const triggerSearchOrFilter = useCallback(() => {
    setPage(0)
  }, [])

  const handleViewDetail = (id?: string) => {
    if (!id) {
      showSnackBar("ID de orden no encontrado.")
      return
    }
    navigate(`/admin/orderArchives/detail/${id}`)
  }

  const handleOpenUpdateModal = (orderItem: OrderArchive) => {
    setSelectedOrderForUpdate(orderItem)
    setNewStatus("")
    setNewPayStatus("") // ADDED: Reset new pay status
    setIsUpdateModalOpen(true)
  }

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false)
    setSelectedOrderForUpdate(null)
    setNewStatus("")
    setNewPayStatus("") // ADDED: Reset new pay status
    setIsUpdatingStatus(false)
  }

  const handleStatusChangeInModal = (event: SelectChangeEvent<OrderStatus>) => {
    setNewStatus(event.target.value as OrderStatus)
  }

  const handlePayStatusChangeInModal = (
    event: SelectChangeEvent<OrderPayStatus>
  ) => {
    setNewPayStatus(event.target.value as OrderPayStatus)
  }

  const handleConfirmUpdateStatus = async () => {
    if (!selectedOrderForUpdate?._id) {
      showSnackBar("Error: Orden no seleccionada.")
      return
    }

    const statusChanged =
      newStatus && newStatus !== selectedOrderForUpdate.status
    const payStatusChanged =
      newPayStatus && newPayStatus !== selectedOrderForUpdate.payStatus

    if (!statusChanged && !payStatusChanged) {
      showSnackBar(
        "Por favor seleccione un estado o estado de pago diferente al actual."
      )
      return
    }

    const orderId = selectedOrderForUpdate._id.toString()
    setIsUpdatingStatus(true)
    setError(null)

    const payload: { status?: OrderStatus; payStatus?: OrderPayStatus } = {}
    if (statusChanged && newStatus) {
      // ensure newStatus is not empty
      payload.status = newStatus
    }
    if (payStatusChanged && newPayStatus) {
      // ensure newPayStatus is not empty
      payload.payStatus = newPayStatus
    }

    try {
      // Call your actual API function
      const updatedOrder = await updateOrderArchive(orderId, payload)

      // Update local state with the complete object returned by the API
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id?.toString() === orderId ? updatedOrder : o
        )
      )

      let updateMessage = `Orden ${selectedOrderForUpdate.orderId} actualizada:`
      const updates = []
      if (statusChanged && newStatus) updates.push(`Status a "${newStatus}"`)
      if (payStatusChanged && newPayStatus)
        updates.push(`Status de Pago a "${newPayStatus}"`)
      updateMessage += " " + updates.join(", ") + "."

      showSnackBar(updateMessage)
      handleCloseUpdateModal()
    } catch (err: any) {
      console.error("Error updating order status/payStatus:", err)
      const message = err.message || "Error al actualizar."
      setError(
        `Error actualizando orden ${selectedOrderForUpdate.orderId}: ${message}`
      )
      showSnackBar(`Error: ${message}`)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: OrderSortKey
  ) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
    setPage(0)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchQuery(value)

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      triggerSearchOrFilter()
    }, 500)
  }

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

  const handleNotConcretadoToggle = () => {
    const newValue = !filterIsNotConcretado
    setFilterIsNotConcretado(newValue)
    if (newValue) {
      setFilterStatus("")
    }
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

  interface EnhancedTableProps {
    onRequestSort: (
      event: React.MouseEvent<unknown>,
      property: OrderSortKey
    ) => void
    order: SortDirection
    orderBy: string
  }

  function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } = props
    const createSortHandler =
      (property: OrderSortKey) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property)
      }

    return (
      <TableHead
        sx={{ backgroundColor: (theme) => theme.palette.action.hover }}
      >
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? "right" : "left"}
              padding={"normal"}
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{
                fontWeight: "bold",
                display: headCell.display,
                width: headCell.width,
              }}
            >
              {headCell.sortable ? (
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={createSortHandler(headCell.id as OrderSortKey)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
              ) : (
                headCell.label
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    )
  }

  const renderActiveFilters = () => {
    const activeFilters: React.ReactNode[] = []

    if (searchQuery) {
      activeFilters.push(
        <Chip
          key="search"
          label={`Buscar: ${searchQuery}`}
          size="small"
          onDelete={() => {
            setSearchQuery("")
            triggerSearchOrFilter()
          }}
        />
      )
    }
    if (filterIsNotConcretado) {
      activeFilters.push(
        <Chip
          key="not_concretado"
          label="Status: Pendientes"
          size="small"
          onDelete={handleNotConcretadoToggle}
        />
      )
    }
    if (filterStatus) {
      activeFilters.push(
        <Chip
          key="status"
          label={`Status: ${filterStatus}`}
          size="small"
          onDelete={() => {
            setFilterStatus("")
            triggerSearchOrFilter()
          }}
        />
      )
    }
    if (filterPayStatus) {
      activeFilters.push(
        <Chip
          key="payStatus"
          label={`Pago: ${filterPayStatus}`}
          size="small"
          onDelete={() => {
            setFilterPayStatus("")
            triggerSearchOrFilter()
          }}
        />
      )
    }
    if (startDate && isValid(startDate)) {
      activeFilters.push(
        <Chip
          key="startDate"
          label={`Desde: ${format(startDate, "dd/MM/yyyy")}`}
          size="small"
          onDelete={() => {
            setStartDate(null)
            triggerSearchOrFilter()
          }}
        />
      )
    }
    if (endDate && isValid(endDate)) {
      activeFilters.push(
        <Chip
          key="endDate"
          label={`Hasta: ${format(endDate, "dd/MM/yyyy")}`}
          size="small"
          onDelete={() => {
            setEndDate(null)
            triggerSearchOrFilter()
          }}
        />
      )
    }

    if (activeFilters.length === 0) return null

    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{ p: 1, flexWrap: "wrap", gap: 1 }}
      >
        <Typography variant="caption" sx={{ alignSelf: "center", mr: 1 }}>
          Filtros Activos:
        </Typography>
        {activeFilters}
      </Stack>
    )
  }

  const renderContent = () => {
    if (isLoading && orders.length === 0 && !error) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      )
    }

    if (error && orders.length === 0 && !isLoading) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
          <Button onClick={() => loadOrders(true)} size="small">
            Reintentar
          </Button>
        </Alert>
      )
    }

    if (!isLoading && !isFilteringLoading && orders.length === 0 && !error) {
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          No se encontraron órdenes con los filtros aplicados.
        </Alert>
      )
    }

    const showSkeletons = isFilteringLoading && orders.length > 0

    return (
      <Paper
        sx={{ width: "100%", mb: 2, overflow: "hidden", position: "relative" }}
      >
        {/* Overlay for filtering loading state */}
        {isFilteringLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10, // Ensure it's above the table but below modal
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {/* Display Active Filters */}
        {renderActiveFilters()}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table
            stickyHeader
            sx={{ minWidth: 750 }}
            aria-label="orders table"
            size="small"
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {showSkeletons
                ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} sx={{ height: 33 }}>
                      {headCells.map((cell) => (
                        <TableCell
                          key={cell.id}
                          align={cell.numeric ? "right" : "left"}
                          sx={{ display: cell.display, width: cell.width }}
                        >
                          <Skeleton animation="wave" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : orders.map((orderItem) => {
                    // Determine if the update action should be enabled
                    const isUpdatable = !FINAL_STATUSES.includes(
                      orderItem.status
                    )

                    return (
                      <TableRow
                        hover
                        key={orderItem._id?.toString()}
                        // Make row clickable only if not updating
                        onClick={
                          !isUpdatingStatus
                            ? () => handleViewDetail(orderItem._id.toString())
                            : undefined
                        }
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": {
                            cursor: "pointer",
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <TableCell>
                          <Link
                            component="button"
                            variant="body2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDetail(orderItem._id.toString())
                            }}
                            sx={{ textAlign: "left" }}
                          >
                            {orderItem.orderId || "N/A"}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(orderItem.createdOn)}</TableCell>
                        <TableCell>
                          {formatDate(orderItem?.shippingData?.shippingDate)}
                        </TableCell>

                        <TableCell
                          sx={{
                            display: headCells.find(
                              (h) => h.id === "customerName"
                            )?.display,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 150,
                          }}
                        >
                          <Tooltip
                            title={getCustomerName(orderItem) || ""}
                            placement="top-start"
                          >
                            <span>{getCustomerName(orderItem)}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell
                          sx={{
                            display: headCells.find((h) => h.id === "orderType")
                              ?.display,
                          }}
                        >
                          {orderItem.orderType || "-"}
                        </TableCell>
                        <TableCell>
                          {orderItem.status ? (
                            <Chip
                              label={orderItem.status}
                              color={getStatusColor(orderItem.status)}
                              size="small"
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            display: headCells.find((h) => h.id === "payStatus")
                              ?.display,
                          }}
                        >
                          {orderItem.payStatus ? (
                            <Chip
                              label={orderItem.payStatus}
                              color={getPayStatusColor(orderItem.payStatus)}
                              size="small"
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{orderItem.createdBy.username}</TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 0.5,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip title="Ver Detalles de Orden">
                              <IconButton
                                aria-label="view details"
                                color="primary"
                                onClick={() =>
                                  handleViewDetail(orderItem._id.toString())
                                }
                                disabled={
                                  !orderItem._id ||
                                  isLoading ||
                                  isFilteringLoading
                                } // Disable if loading
                                size="small"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={
                                isUpdatable
                                  ? "Actualizar Status"
                                  : `No se puede actualizar (Status: ${orderItem.status})`
                              }
                            >
                              <span>
                                <IconButton
                                  aria-label="update status"
                                  color="secondary"
                                  onClick={() =>
                                    handleOpenUpdateModal(orderItem)
                                  }
                                  disabled={
                                    !isUpdatable ||
                                    isLoading ||
                                    isFilteringLoading ||
                                    isUpdatingStatus
                                  } // Disable based on status or loading states
                                  size="small"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={totalOrders}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          getItemAriaLabel={(type) => {
            if (type === "first") return "Primera página"
            if (type === "last") return "Última página"
            if (type === "next") return "Siguiente página"
            return "Página anterior"
          }}
        />
      </Paper>
    )
  }

  const stripHtml = (html?: string): string => {
    return html ? html.replace(/<[^>]+>/g, "") : ""
  }

  const downloadOrders = async (orders: OrderArchive[]): Promise<void> => {
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
      for (const line of order.requests) {
        const rowData = {
          status: order.status as Status,
          orderId: order.orderId,
          createdOn: formatDate(order.createdOn),
          customerName: `${order?.basicData?.firstname || ""} ${order?.basicData?.lastname || ""}`,
          customerType: order?.consumerData?.consumerType,
          observations: stripHtml(order.observations),
          seller: order.createdBy.username,
          paymentMethod: order.billingData?.orderPaymentMethod,
          paymentStatus: order.payStatus,
          paymentDate: order.payDate || "No registrado",
          shippingMethod:
            typeof order?.shippingData?.shippingMethod === "object"
              ? order?.shippingData?.shippingMethod?.name
              : order?.shippingData?.shippingMethod,
          deliveryDate: formatDate(order.shippingData.shippingDate),
          prixer: line.art?.prixerUsername || "N/A",
          art: line.art?.title || "N/A",
          product: line.product?.name || "N/A",
          attributes:
            Array.isArray(line.product?.selection)
              ? line.product?.selection.join(", ")
              : typeof line.product?.selection === "object" && line.product?.selection.attributes
              ? line.product?.selection.attributes.map(
                  (attr: any) => `${attr.name}: ${attr.value}`
                ).join(", ")
              : typeof line.product?.selection === "string"
              ? line.product?.selection
              : "",
          quantity: line.quantity,
          unitPrice: line.product.finalPrice,
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
    <LocalizationProvider dateAdapter={AdapterDateFns} /* adapterLocale={es} */>
      <>
        <Title title="Órdenes Archivadas" />

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TextField
                label="Buscar (ID, Cliente, Email, CI...)"
                variant="outlined"
                fullWidth
                size="small"
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={isFilteringLoading}
                InputProps={{
                  endAdornment: isFilteringLoading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 6, sm: 3, md: 2, lg: 1.5 }}>
              <Tooltip
                title={
                  filterIsNotConcretado
                    ? "Mostrar todas las ordenes"
                    : "Mostrar solo órdenes pendientes"
                }
              >
                <span>
                  <ToggleButton
                    value="check"
                    selected={filterIsNotConcretado}
                    onChange={handleNotConcretadoToggle}
                    size="small"
                    fullWidth
                    disabled={isFilteringLoading}
                    sx={{ height: "40px" }}
                  >
                    {filterIsNotConcretado
                      ? "Mostrar todas"
                      : "Mostrar Solo Pendientes"}
                  </ToggleButton>
                </span>
              </Tooltip>
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
                    <MenuItem
                      key={s}
                      value={s}
                      disabled={filterIsNotConcretado}
                    >
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
            >
              <Tooltip title="Limpiar Filtros">
                <span>
                  <IconButton
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
                  >
                    <FilterListOffIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Grid2>
            <Tooltip
              title="Descargar listado"
              style={{ height: 40, width: 40 }}
            >
              <Fab
                color="secondary"
                size="small"
                onClick={() => downloadOrders(orders)}
                style={{ marginRight: 10 }}
              >
                <GetApp />
              </Fab>
            </Tooltip>
          </Grid2>
        </Paper>

        {/* --- Loading / Error / Content --- */}
        {error && !isLoading && !isFilteringLoading && orders.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No se pudo actualizar la lista: {error}
            <Button
              onClick={() => loadOrders(false)}
              size="small"
              sx={{ ml: 1 }}
            >
              Reintentar
            </Button>
          </Alert>
        )}
        {renderContent()}

        {/* --- Update Status Modal --- */}
        <Dialog
          open={isUpdateModalOpen}
          onClose={handleCloseUpdateModal}
          aria-labelledby="update-status-dialog-title"
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle id="update-status-dialog-title">
            Actualizar Estado de la Orden
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Orden ID: <strong>{selectedOrderForUpdate?.orderId}</strong>{" "}
              <br />
              Status Actual:{" "}
              <Chip
                label={selectedOrderForUpdate?.status}
                color={getStatusColor(selectedOrderForUpdate?.status)}
                size="small"
              />{" "}
              <br />
              Status Pago Actual:{" "}
              <Chip
                label={selectedOrderForUpdate?.payStatus || "N/A"}
                color={getPayStatusColor(selectedOrderForUpdate?.payStatus)}
                size="small"
              />
            </DialogContentText>

            {/* Order Status Selector */}
            <FormControl
              fullWidth
              margin="normal"
              disabled={
                isUpdatingStatus ||
                (selectedOrderForUpdate
                  ? FINAL_STATUSES.includes(selectedOrderForUpdate.status) &&
                    selectedOrderForUpdate.status !== "Concretado"
                  : false)
              }
            >
              <InputLabel id="new-status-select-label">
                Nuevo Status Orden
              </InputLabel>
              <Select
                labelId="new-status-select-label"
                id="new-status-select"
                value={newStatus}
                label="Nuevo Status Orden"
                onChange={handleStatusChangeInModal}
              >
                {UPDATABLE_TARGET_STATUSES.filter(
                  (s) => s !== selectedOrderForUpdate?.status
                ).map((statusOption) => (
                  <MenuItem key={statusOption} value={statusOption}>
                    {statusOption}
                  </MenuItem>
                ))}
              </Select>
              {selectedOrderForUpdate &&
                FINAL_STATUSES.includes(selectedOrderForUpdate.status) &&
                selectedOrderForUpdate.status !== "Concretado" && (
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mt: 0.5 }}
                  >
                    El status de la orden no se puede cambiar desde '
                    {selectedOrderForUpdate.status}'.
                  </Typography>
                )}
            </FormControl>

            {/* Pay Status Selector */}
            <FormControl fullWidth margin="normal" disabled={isUpdatingStatus}>
              <InputLabel id="new-pay-status-select-label">
                Nuevo Status Pago
              </InputLabel>
              <Select
                labelId="new-pay-status-select-label"
                id="new-pay-status-select"
                value={newPayStatus}
                label="Nuevo Status Pago"
                onChange={handlePayStatusChangeInModal}
              >
                {ALL_PAY_STATUSES.filter(
                  (ps) => ps !== selectedOrderForUpdate?.payStatus
                ).map((payStatusOption) => (
                  <MenuItem key={payStatusOption} value={payStatusOption}>
                    {payStatusOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseUpdateModal}
              color="inherit"
              disabled={isUpdatingStatus}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmUpdateStatus}
              color="primary"
              variant="contained"
              disabled={
                isUpdatingStatus ||
                ((!newStatus || newStatus === selectedOrderForUpdate?.status) &&
                  (!newPayStatus ||
                    newPayStatus === selectedOrderForUpdate?.payStatus))
              }
            >
              {isUpdatingStatus ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Actualizar"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </LocalizationProvider>
  )
}

export default ReadOrderArchives
