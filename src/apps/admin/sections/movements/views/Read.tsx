import React, { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Modal,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import Grid2 from "@mui/material/Grid"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import FilterListOffIcon from "@mui/icons-material/FilterListOff"
import { visuallyHidden } from "@mui/utils"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { useSnackBar } from "context/GlobalContext"
import Title from "@apps/admin/components/Title"
import { Movement } from "types/movement.types"
import { getMovements } from "@api/movement.api"
import { User } from "types/user.types"
import { getUsers } from "@api/user.api"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import {
  CalendarToday,
  PersonOutline,
  ReceiptOutlined,
  StorefrontOutlined,
} from "@mui/icons-material"

import { getOrderById } from "@api/order.api"

import {
  Order,
  OrderLine,
  OrderStatus,
  GlobalPaymentStatus,
  CustomImage,
} from "../../../../../types/order.types"

import { Product, Variant } from "../../../../../types/product.types"
import { Art } from "../../../../../types/art.types"

interface UserAccountMap {
  [accountId: string]: {
    name: string
    avatar?: string
  }
}

const formatCurrency = (value: number): string => `$${value.toFixed(2)}`
const formatDate = (date?: Date): string =>
  date ? new Date(date).toLocaleString() : "N/A"

interface HeadCell {
  id: keyof Movement | "actions"
  label: string
  numeric: boolean
  sortable: boolean
}

interface ProductOption {
  id: string
  label: string
  fullProduct: Product
}
interface ArtOption {
  id: string
  label: string
  thumb: string
  fullArt: Art | CustomImage
}
interface VariantOption {
  id: string
  label: string
  fullVariant: Variant
}
interface OrderLineFormState extends Partial<OrderLine> {
  tempId: string
  selectedArt: ArtOption | null
  selectedProduct: ProductOption | null
  selectedVariant: VariantOption | null
  availableVariants: VariantOption[]
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const headCells: readonly HeadCell[] = [
  { id: "date", numeric: false, label: "Fecha", sortable: true },
  { id: "type", numeric: false, label: "Tipo", sortable: true },
  { id: "description", numeric: false, label: "Descripción", sortable: true },
  { id: "destinatary", numeric: false, label: "Destinatario", sortable: false },
  { id: "order", numeric: false, label: "Orden Asociada", sortable: true },
  { id: "value", numeric: true, label: "Valor", sortable: true },
  { id: "actions", numeric: false, label: "Acciones", sortable: false },
]

type Sort = "asc" | "desc"

const ReadMovements: React.FC = () => {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()

  const [movements, setMovements] = useState<Movement[]>([])
  const [ownerInfoMap, setOwnerInfoMap] = useState<UserAccountMap>({})
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [totalMovements, setTotalMovements] = useState<number>(0)

  const [orderBy, setOrderBy] = useState<keyof Movement>("date")
  const [order, setOrder] = useState<Sort>("desc")

  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterType, setFilterType] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [modal, setModal] = useState<boolean>(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(
    undefined
  )
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>()

  const [editableOrderLines, setEditableOrderLines] = useState<
    OrderLineFormState[]
  >([])

  const openModal = () => {
    setModal(!modal)
  }

  const getOverallOrderStatus = (
    orderLines: OrderLineFormState[]
  ): OrderStatus => {
    if (!orderLines || orderLines.length === 0) return OrderStatus.Pending
    const statuses = orderLines.map((line) => getLatestStatus(line.status))
    if (statuses.every((s) => s === OrderStatus.Delivered))
      return OrderStatus.Delivered
    if (statuses.every((s) => s === OrderStatus.Canceled))
      return OrderStatus.Canceled
    if (statuses.some((s) => s === OrderStatus.Delivered))
      return OrderStatus.Delivered
    if (statuses.some((s) => s === OrderStatus.ReadyToShip))
      return OrderStatus.ReadyToShip
    if (statuses.some((s) => s === OrderStatus.Pending))
      return OrderStatus.Pending
    if (statuses.some((s) => s === OrderStatus.Impression))
      return OrderStatus.Impression
    if (statuses.some((s) => s === OrderStatus.Production))
      return OrderStatus.Production
    if (statuses.some((s) => s === OrderStatus.Finished))
      return OrderStatus.Finished
    if (statuses.some((s) => s === OrderStatus.Pending))
      return OrderStatus.Pending
    return OrderStatus.Pending
  }

  const getLatestStatus = (
    statusHistory?: [OrderStatus, Date][]
  ): OrderStatus => {
    if (!statusHistory || statusHistory.length === 0) return OrderStatus.Pending
    return statusHistory[statusHistory.length - 1][0]
  }

  const renderBasicInfoItem = (
    itemKey: React.Key,
    icon: React.ReactNode,
    primary: string,
    secondary: string | React.ReactNode | undefined,
    isLink: boolean = false,
    href?: string
  ) =>
    secondary ? (
      <ListItem key={itemKey} sx={{ py: 0.5, px: 0 }}>
        {icon && (
          <ListItemIcon sx={{ minWidth: "36px", color: "text.secondary" }}>
            {icon}
          </ListItemIcon>
        )}
        <ListItemText
          primary={primary}
          secondary={
            isLink && href ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {secondary}
              </a>
            ) : (
              secondary
            )
          }
          primaryTypographyProps={{ variant: "body2", fontWeight: "medium" }}
          secondaryTypographyProps={{
            variant: "body2",
            color: "text.secondary",
          }}
        />
      </ListItem>
    ) : null

  const loadMovementsAndUsers = useCallback(
    async (showLoadingIndicator = true) => {
      if (showLoadingIndicator) setIsLoading(true)

      try {
        const apiPage = page + 1
        const response = await getMovements({
          page: apiPage,
          limit: rowsPerPage,
          sortBy: orderBy,
          sortOrder: order,
          search: searchQuery,
          type: filterType,
          dateFrom: startDate?.toISOString(),
          dateTo: endDate?.toISOString(),
        })

        setMovements(response.data)
        setTotalMovements(response.totalCount)
        setError(null)

        const accountIds = [
          ...new Set(
            response.data.map((m) => m.destinatary).filter((id) => !!id)
          ),
        ] as string[]

        if (accountIds.length > 0) {
          const idsToFetch = accountIds.filter((id) => !ownerInfoMap[id])
          if (idsToFetch.length > 0) {
            const allUsers = (await getUsers()) as User[]
            const relevantUsers = allUsers.filter(
              (user) => user.account && idsToFetch.includes(user.account)
            )

            setOwnerInfoMap((prevMap) => {
              const newMap = { ...prevMap }
              relevantUsers.forEach((user) => {
                if (user?.account) {
                  newMap[user.account] = {
                    name:
                      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                      user.username ||
                      "Usuario Desconocido",
                    avatar: user.avatar,
                  }
                }
              })
              return newMap
            })
          }
        }
      } catch (err: any) {
        const message = err.message || "Error al cargar movimientos."
        setError(message)
        if (!showLoadingIndicator) {
          showSnackBar(`Error al actualizar: ${message}`)
        }
        console.error("Error fetching filtered/paginated data:", err)
      } finally {
        if (showLoadingIndicator || movements.length === 0) {
          setIsLoading(false)
        } else {
          setIsLoading(false)
        }
      }
    },
    [
      page,
      rowsPerPage,
      order,
      orderBy,
      showSnackBar,
      searchQuery,
      filterType,
      startDate,
      endDate,
      ownerInfoMap,
    ]
  )

  const loadOrder = async () => {
    // const showSnackBar = showSnackBarRef.current
    if (!selectedOrderId) {
      return
    }
    setIsLoading(true)
    try {
      const orderData = await getOrderById(selectedOrderId)
      if (!orderData) throw new Error("Orden no encontrada.")
      if (orderData.payment && !Array.isArray(orderData.payment.payment)) {
        console.warn(
          "API devolvió orderData.payment sin un array 'Payments' válido. " +
            "Inicializando como array vacío."
        )
        orderData.payment.payment = []
      } else if (!orderData.payment) {
        console.warn(
          "API devolvió orderData sin el objeto 'payment'. " +
            "Inicializando con valores por defecto. Esto puede indicar un problema."
        )
      }
      setSelectedOrder(orderData)
      //   if (orderData.consumerDetails?.basic) {
      //     setEditableClientInfo(
      //       JSON.parse(JSON.stringify(orderData.consumerDetails.basic))
      //     )
      //   } else {
      //     setEditableClientInfo({ name: "", lastName: "", email: "", phone: "" })
      //   }

      //   const transformedLines: OrderLineFormState[] = orderData.lines.map(
      //     (line) => {
      //       const selectedProductOpt = productOpts.find(
      //         (p) => p.id === line.item?.product?._id?.toString()
      //       )
      //       const variants = selectedProductOpt?.fullProduct.variants || []
      //       const variantOptions = variants
      //         .filter((v) => v._id)
      //         .map((v) => ({ id: v._id!, label: v.name, fullVariant: v }))
      //       const currentVariantOpt =
      //         variantOptions.find(
      //           (vo) =>
      //             vo.fullVariant.attributes.length ===
      //               (line.item?.product?.selection?.length || 0) &&
      //             vo.fullVariant.attributes.every((attr) =>
      //               line.item?.product?.selection?.find(
      //                 (selAttr) =>
      //                   selAttr.name === attr.name && selAttr.value === attr.value
      //               )
      //             )
      //         ) || null

      //       const artIdToFind = line.item?.art
      //         ? "_id" in line.item.art
      //           ? line.item.art._id?.toString()
      //           : "id" in line.item.art && line.item.art.id
      //         : undefined

      //       return {
      //         ...line,
      //         tempId: line.id || uuidv4(),
      //         selectedArt: artIdToFind
      //           ? artOpts.find((a) => a.id === artIdToFind) || null // <-- ✨ ¡AÑADE ESTO!
      //           : null,
      //         selectedProduct: selectedProductOpt || null,
      //         selectedVariant: currentVariantOpt,
      //         availableVariants: variantOptions,
      //         pricePerUnit: line.pricePerUnit,
      //         quantity: line.quantity,
      //       }
      //     }
      //   )

      //   const orderShip = orderData.shipping?.method
      //   const orderPay = orderData.payment?.payment[0]?.method
    } catch (err: any) {
      console.error("Failed to load data:", err)
      const errorMsg = err.message || "Error al cargar los datos."
      showSnackBar(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [selectedOrderId])

  useEffect(() => {
    loadMovementsAndUsers()
  }, [loadMovementsAndUsers])

  const triggerSearch = useCallback(() => {
    setPage(0)
    loadMovementsAndUsers(false)
  }, [loadMovementsAndUsers])

  const handleCreate = () => navigate("/admin/movements/create")
  const handleUpdate = (movementId: string) => {
    if (!movementId) {
      showSnackBar("Falta ID.")
      return
    }
    navigate(`/admin/movements/update/${movementId}`)
  }

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Movement
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
      triggerSearch()
    }, 500)
  }

  const handleFilterChange =
    (setter: React.Dispatch<React.SetStateAction<any>>) => (event: any) => {
      const value = event?.target?.value ?? event // Handle both event types
      setter(value)
      setPage(0) // Reset page on filter change
      // loadMovementsAndUsers(false); // Let useEffect handle the refetch triggered by state change
    }

  const handleClearFilters = () => {
    setSearchQuery("")
    setFilterType("")
    setStartDate(null)
    setEndDate(null)
    setPage(0) // Reset page
    // Clear debounce timeout if a search was pending
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    // loadMovementsAndUsers(false); // Let useEffect handle the refetch
  }

  const getLatestOrderStatus = (currentOrder: Order): OrderStatus => {
    if (currentOrder.status && currentOrder.status.length > 0) {
      return currentOrder.status[currentOrder.status.length - 1][0]
    }
    return OrderStatus.Pending
  }

  const getLatestpayOrderStatus = (
    currentOrder: Order
  ): GlobalPaymentStatus => {
    if (currentOrder.payment.status && currentOrder.payment.status.length > 0) {
      return currentOrder.payment.status[
        currentOrder.payment.status.length - 1
      ][0]
    }
    return GlobalPaymentStatus.Pending
  }

  // --- Enhanced Table Head ---
  interface EnhancedTableProps {
    onRequestSort: (
      event: React.MouseEvent<unknown>,
      property: keyof Movement
    ) => void
    order: Sort
    orderBy: string
  }

  function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } = props
    const createSortHandler =
      (property: keyof Movement) => (event: React.MouseEvent<unknown>) => {
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
              sx={{ fontWeight: "bold" }}
            >
              {headCell.sortable ? (
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={createSortHandler(headCell.id as keyof Movement)}
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

  // --- Render Logic ---
  const renderContent = () => {
    // Initial loading state (full screen spinner handled outside this function)
    // Error on initial load
    if (!isLoading && error && movements.length === 0) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
          <Button onClick={() => loadMovementsAndUsers(true)} size="small">
            Reintentar
          </Button>
        </Alert>
      )
    }
    // No data found after load/filter
    if (!isLoading && movements.length === 0 && !error) {
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          No se encontraron movimientos con los filtros aplicados.
        </Alert>
      )
    }
    // If loading but we already have *some* data (paging/sorting/filtering), show skeletons
    const showSkeletons = isLoading && movements.length > 0

    return (
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-label="movements table">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {showSkeletons
                ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} style={{ height: 53 }}>
                      {headCells.map((cell) => (
                        <TableCell
                          key={cell.id}
                          align={cell.numeric ? "right" : "left"}
                        >
                          <Skeleton animation="wave" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : movements.map((movement) => {
                    const destinataryInfo = movement.destinatary
                      ? ownerInfoMap[movement.destinatary]
                      : null
                    const isDestinataryLoading =
                      movement.destinatary && !destinataryInfo

                    return (
                      <TableRow
                        hover
                        key={movement._id?.toString()}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell>{formatDate(movement.date)}</TableCell>
                        <TableCell>{movement.type}</TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", md: "table-cell" } }}
                        >
                          {movement.description}
                        </TableCell>{" "}
                        <TableCell>
                          {movement.destinatary ? (
                            destinataryInfo ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Avatar
                                  src={destinataryInfo.avatar || undefined}
                                  sx={{ width: 24, height: 24 }}
                                />
                                <Typography variant="body2">
                                  {destinataryInfo.name}
                                </Typography>
                              </Box>
                            ) : isDestinataryLoading ? (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                Cargando...
                              </Typography>
                            ) : (
                              <Tooltip title="ID de cuenta (Usuario no encontrado o no cargado)">
                                <Typography
                                  variant="caption"
                                  fontStyle="italic"
                                >
                                  {movement.destinatary}
                                </Typography>
                              </Tooltip>
                            )
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", lg: "table-cell" } }}
                        >
                          {movement.order ? (
                            <Link
                              component="button"
                              variant="body2"
                              onClick={
                                () => {
                                  setSelectedOrderId(movement.order)
                                  openModal()
                                }
                                //     navigate(
                                //       `/admin/order/detail/${movement.order}`
                                //     )
                              }
                              sx={{ textAlign: "left" }}
                            >
                              {movement.order}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              movement.value >= 0
                                ? "success.main"
                                : "error.main",
                            fontWeight: "medium",
                          }}
                        >
                          {formatCurrency(movement.value)}
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 0.5,
                            }}
                          >
                            <Tooltip title="Editar Movimiento">
                              {/* Disable edit if ID is somehow missing */}
                              <IconButton
                                aria-label="edit"
                                color="primary"
                                onClick={() =>
                                  handleUpdate(movement._id!.toString())
                                }
                                disabled={!movement._id || isLoading}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
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
        {/* --- Pagination --- */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalMovements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>
    )
  }

  // --- Main Return Structure ---
  return (
    // Wrap with LocalizationProvider for Date Pickers
    <LocalizationProvider dateAdapter={AdapterDateFns} /* adapterLocale={es} */>
      <>
        <Title title="Historial de Movimientos" />

        {/* --- Filter and Search Controls --- */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                label="Buscar (Descripción, Dest., Orden)"
                variant="outlined"
                fullWidth
                size="small"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filterType}
                  label="Tipo"
                  onChange={handleFilterChange(setFilterType)}
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>
                  <MenuItem value="Depósito">Depósito</MenuItem>
                  <MenuItem value="Retiro">Retiro</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
              <DatePicker
                label="Fecha Desde"
                value={startDate}
                onChange={handleFilterChange(setStartDate)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
                maxDate={endDate || undefined} // Prevent start date being after end date
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
              <DatePicker
                label="Fecha Hasta"
                value={endDate}
                onChange={handleFilterChange(setEndDate)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
                minDate={startDate || undefined} // Prevent end date being before start date
              />
            </Grid2>
            <Grid2
              size={{ xs: 12, sm: 6, md: 2 }}
              container
              justifyContent="flex-end"
              alignItems="center"
            >
              <Tooltip title="Limpiar Filtros y Búsqueda">
                <span>
                  <IconButton
                    onClick={handleClearFilters}
                    disabled={
                      !searchQuery && !filterType && !startDate && !endDate
                    }
                    color="default"
                  >
                    <FilterListOffIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Grid2>
          </Grid2>
        </Paper>

        {/* --- Action Buttons --- */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          mb={2}
          mt={1}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={isLoading && movements.length === 0}
          >
            Crear Movimiento
          </Button>
        </Stack>

        {/* --- Loading / Error / Content --- */}
        {isLoading && movements.length === 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        )}
        {/* Show persistent error/warning if fetch failed during filtering/paging */}
        {error && !isLoading && movements.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No se pudo actualizar la lista: {error}
            <Button
              onClick={() => loadMovementsAndUsers(false)}
              size="small"
              sx={{ ml: 1 }}
            >
              Reintentar
            </Button>
          </Alert>
        )}
        {renderContent()}
      </>

      <Modal
        open={modal}
        onClose={openModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            bgcolor: "background.paper",
            // border: "2px solid #000",
            boxShadow: 24,
            borderRadius: 2,
            pt: 2,
            px: 4,
            pb: 3,
          }}
        >
          {selectedOrder !== undefined ? (
            <Grid2>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  backgroundColor: "transparent",
                }}
              >
                <Grid2
                  container
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      component="h1"
                      fontWeight="bold"
                      color="secondary"
                    >
                      Orden #
                      {selectedOrder.number ||
                        selectedOrder._id?.toString().slice(-6)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                    >
                      <CalendarToday fontSize="small" sx={{ mr: 0.5 }} />{" "}
                      Realizada el: {formatDate(selectedOrder.createdOn)}
                    </Typography>
                  </Box>
                </Grid2>
              </Paper>
              <Grid2 container spacing={{ xs: 2, md: 3 }}>
                <Grid2 size={{ xs: 12, lg: 7 }}>
                  <Typography
                    variant="h5"
                    fontWeight="medium"
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    Artículos del Pedido
                  </Typography>
                  {selectedOrder.lines.map((line, index) => (
                    <Card
                      key={index}
                      sx={{ mb: 2.5, borderRadius: 2, boxShadow: 2 }}
                    >
                      <CardHeader title={line.item.product.name} />
                      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                        <Grid2 container spacing={2} alignItems="flex-start">
                          <Grid2
                            size={{ xs: 12 }}
                            sx={{
                              textAlign: "center",
                              mb: { xs: 1, sm: 0 },
                            }}
                          >
                            <Avatar
                              variant="rounded"
                              src={line.item.product?.sources?.images?.[0]?.url}
                              alt={line.item.product?.name || "Producto"}
                              sx={{
                                width: { xs: 60, sm: 70 },
                                height: { xs: 60, sm: 70 },
                                m: "auto",
                                borderRadius: 1.5,
                                border: "1px solid #eee",
                              }}
                            />
                          </Grid2>
                          <Grid2 container spacing={1.5} alignItems="center">
                            <Grid2 size={{ xs: 12, md: 6 }}>
                              <Typography>
                                {`Arte: ${line.item?.art?.title}`}
                              </Typography>
                              <Typography>
                                {`Artista: ${line.item?.art?.prixerUsername!}`}
                              </Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                              <Typography>
                                {`Producto: ${line.item?.product?.name}`}
                              </Typography>
                              <Typography>
                                {`Variante: ${line.item?.product?.selection?.map((sel) => `${sel.name}: ${sel.value}<br/>`)}`}
                              </Typography>
                            </Grid2>
                          </Grid2>
                          <Grid2
                            container
                            spacing={1.5}
                            alignItems="center"
                            sx={{ mt: 1 }}
                          >
                            <Typography>{`Unidad${line?.quantity! > 1 ? "es" : ""}: ${line.quantity! || 1}`}</Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "medium" }}
                            >
                              $
                              {(line?.item?.price
                                ? Number(line?.item?.price)
                                : 0
                              ).toFixed(2)}{" "}
                              c/u
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              color="primary.main"
                            >
                              Subtotal: $
                              {(
                                (line.quantity || 0) *
                                (line?.item?.price
                                  ? Number(line?.item?.price)
                                  : 0)
                              ).toFixed(2)}
                            </Typography>
                          </Grid2>
                        </Grid2>
                      </CardContent>
                    </Card>
                  ))}
                </Grid2>

                <Grid2 size={{ xs: 12, lg: 5 }}>
                  <Paper
                    elevation={1}
                    sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5, borderRadius: 2 }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                    >
                      <ReceiptOutlined sx={{ mr: 1, color: "primary.main" }} />
                      Resumen del Pedido
                    </Typography>
                    <List dense disablePadding>
                      {renderBasicInfoItem(
                        "summary-subtotal",
                        null,
                        "Subtotal:",
                        `$${selectedOrder.subTotal.toFixed(2)}`
                      )}
                      {selectedOrder.discount
                        ? renderBasicInfoItem(
                            "summary-discount",
                            null,
                            "Descuento:",
                            <Typography color="error.main">
                              -$
                              {selectedOrder.discount?.toFixed(2)}
                            </Typography>
                          )
                        : null}
                      {selectedOrder.shippingCost
                        ? renderBasicInfoItem(
                            "summary-shipping",
                            null,
                            "Costo de Envío:",
                            `$${selectedOrder.shippingCost?.toFixed(2)}`
                          )
                        : null}
                      {selectedOrder.tax.map((t, idx) =>
                        renderBasicInfoItem(
                          `summary-tax-${idx}`,
                          null,
                          `${t.name} (${t.value}%):`,
                          `$${t.amount.toFixed(2)}`
                        )
                      )}
                      <Divider sx={{ my: 1 }} />
                      <ListItem
                        sx={{ py: 1, px: 0, justifyContent: "space-between" }}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          Total:
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          ${selectedOrder.total.toFixed(2)}
                        </Typography>
                      </ListItem>
                      <ListItem sx={{ px: 0, justifyContent: "space-between" }}>
                        <Typography variant="body2">Items Totales:</Typography>
                      </ListItem>
                    </List>
                  </Paper>

                  {selectedOrder.consumerDetails && (
                    <Paper
                      elevation={1}
                      sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5, borderRadius: 2 }}
                      id="client-details-section"
                    >
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <PersonOutline sx={{ mr: 1, color: "primary.main" }} />
                        {selectedOrder?.consumerDetails?.basic.name!}{" "}
                        {selectedOrder?.consumerDetails?.basic.lastName!}
                      </Typography>
                    </Paper>
                  )}

                  {selectedOrder.seller && (
                    <Paper
                      elevation={1}
                      sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}
                    >
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <StorefrontOutlined
                          sx={{ mr: 1, color: "primary.main" }}
                        />
                        Información del Vendedor
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedOrder.seller}
                      </Typography>
                    </Paper>
                  )}
                </Grid2>
              </Grid2>
            </Grid2>
          ) : (
            <Typography>
              No hemos podido encontrar el pedido que señalaste, inténtalo de
              nuevo.
            </Typography>
          )}
        </Box>
      </Modal>
    </LocalizationProvider>
  )
}

export default ReadMovements
