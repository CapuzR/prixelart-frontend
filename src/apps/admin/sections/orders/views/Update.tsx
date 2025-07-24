// src/apps/admin/sections/orders/views/UpdateOrder.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
  useMemo,
  useRef,
  forwardRef,
} from "react"
import { useParams, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import favicon from "../../../../../images/favicon.png"

// Hooks, Types, Context, API
import { useSnackBar, usePrixerCreator, useUser } from "context/GlobalContext" // useLoading no se usa directamente aquí
import {
  Address,
  BasicInfo,
  Item,
  Order,
  OrderLine,
  OrderStatus,
  PaymentMethod,
  ShippingMethod,
  Tax,
  Payment,
  GlobalPaymentStatus,
  PaymentDetails,
  CustomImage,
  // Asumiendo que PaymentVoucher es un string (URL) en tu tipo Order
} from "../../../../../types/order.types" // Ajusta la ruta a tus tipos
import {
  fetchShippingMethods,
  getOrderById,
  readAllPaymentMethods,
  updateOrder,
} from "@api/order.api" // Ajusta la ruta a tu API
import { fetchActiveProducts } from "@api/product.api"
import {
  Product,
  Variant,
  VariantAttribute,
} from "../../../../../types/product.types"
import { Art, PickedArt } from "../../../../../types/art.types"
import { getArts } from "@api/art.api"

// MUI Components
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Select,
  SelectChangeEvent,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  Avatar,
  Chip,
  List,
  Autocomplete,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Tooltip,
  IconButton,
  ListItemText,
  Container,
  Card,
  CardContent,
  CardHeader,
  ListItemIcon,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  useMediaQuery,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@mui/material"
import Grid2 from "@mui/material/Grid"

import { TransitionProps } from "@mui/material/transitions"
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import InfoIcon from "@mui/icons-material/Info"
import DeleteIcon from "@mui/icons-material/Delete"
import {
  CalendarToday,
  PersonOutline,
  LocalShippingOutlined,
  ReceiptOutlined,
  StorefrontOutlined,
  PaletteOutlined,
  CollectionsOutlined,
  InfoOutlined,
  AddCircleOutline,
  PauseCircleFilled,
} from "@mui/icons-material"
import { Theme, useTheme } from "@mui/material"
import { makeStyles } from "tss-react/mui"

import * as tus from "tus-js-client"
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { BACKEND_URL } from "@api/utils.api"
import PhotoCameraBackIcon from "@mui/icons-material/PhotoCameraBack"
import BrokenImageIcon from "@mui/icons-material/BrokenImage"

import { getCurrentOrderStatus } from "@apps/consumer/trackOrder/utils"
import EditableAddressForm from "./components/EditableAddressForm"

import { fetchSellers, getPermissions } from "@api/admin.api"
import { Permissions } from "types/permissions.types"

import dayjs, { Dayjs } from "dayjs"
import "dayjs/locale/es"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import MDEditor from "@uiw/react-md-editor"

interface MethodOption {
  id: string
  label: string
  fullMethod: ShippingMethod | PaymentMethod
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
  quantity?: number
}
interface DisplayTotals {
  subTotal: number
  discount: number
  shippingCost: number
  taxes: Tax[]
  total: number
  totalUnits: number
}

// Estado para una imagen individual (reutilizado)
interface ImageUploadState {
  id: string
  url: string
  file?: File
  progress?: number
  error?: string
  isExisting?: boolean // Para diferenciar imágenes cargadas vs. nuevas
}

const VOUCHER_IMAGE_ASPECT = 0

const useStyles = makeStyles()((theme: Theme) => {
  return {
    appBar: { position: "relative" },
    title: { marginLeft: theme.spacing(2), flex: 1 },
    paper: {
      marginTop: theme.spacing(3),
      padding: theme.spacing(2),
      [theme.breakpoints.up("sm")]: { padding: theme.spacing(3) },
    },
    form: { width: "100%" },
    imagePreviewItem: {
      width: "100%",
      // paddingTop: "75%",
      position: "relative",
      border: "1px solid gainsboro",
      borderColor: "divider",
      borderRadius: 8,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",

      "& img": {
        // position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        // marginTop: 16,
      },
    },
    imageGridItem: {
      width: "calc(33.33% - 16px)",
      minWidth: 100,
      [theme.breakpoints.down("sm")]: {
        width: "calc(50% - 8px)",
      },
    },
  }
})

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

const getPayStatusChipProps = (
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

const getLatestStatus = (
  statusHistory?: [OrderStatus, Date][]
): OrderStatus => {
  if (!statusHistory || statusHistory.length === 0) return OrderStatus.Pending
  return statusHistory[statusHistory.length - 1][0]
}

const formatDate = (
  date: Date | string | undefined,
  includeTime: boolean = true
): string => {
  if (!date) return "N/A"
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  if (includeTime) {
    options.hour = "2-digit"
    options.minute = "2-digit"
  }
  return new Date(date).toLocaleDateString("es-ES", options)
}

async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("No 2d context")
  }
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const pixelRatio = window.devicePixelRatio || 1
  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)
  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = "high"
  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY
  const rotateRads = (rotate * Math.PI) / 180
  const centerX = image.naturalWidth / 2
  const centerY = image.naturalHeight / 2
  ctx.save()
  ctx.translate(-cropX, -cropY)
  ctx.translate(centerX, centerY)
  ctx.rotate(rotateRads)
  ctx.scale(scale, scale)
  ctx.translate(-centerX, -centerY)
  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight)
  ctx.restore()
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  if (aspect <= 0) {
    return { unit: "%", width: 100, height: 100, x: 0, y: 0 }
  }
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 100 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function UpdateOrder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [permissions, setPermissions] = useState<Permissions | null>(null)
  const { showSnackBar: showSnackBarFromContext, showSnackBar } = useSnackBar()
  const showSnackBarRef = useRef(showSnackBarFromContext)

  useEffect(() => {
    showSnackBarRef.current = showSnackBarFromContext
  }, [showSnackBarFromContext])

  const theme = useTheme()
  const { classes } = useStyles()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [order, setOrder] = useState<Order | null>(null)
  const [observations, setObservations] = useState<string>("")
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<MethodOption | null>(null)
  const [editableClientInfo, setEditableClientInfo] =
    useState<BasicInfo | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<MethodOption | null>(null)
  const [editableShippingAddress, setEditableShippingAddress] =
    useState<Address | null>(null)
  const [editableBillingAddress, setEditableBillingAddress] =
    useState<Address | null>(null)
  const [useShippingForBilling, setUseShippingForBilling] =
    useState<boolean>(true)
  const [sellers, setSellers] = useState<string[]>([])
  const [shippingMethodOptions, setShippingMethodOptions] = useState<
    MethodOption[]
  >([])
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<
    MethodOption[]
  >([])
  const [prefDate, setPrefDate] = useState<Dayjs>(dayjs())

  const [prevPayments, setPrevPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorFetch, setErrorFetch] = useState<string | null>(null)
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null)

  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [artOptions, setArtOptions] = useState<ArtOption[]>([])
  const [editableOrderLines, setEditableOrderLines] = useState<
    OrderLineFormState[]
  >([])
  const [displayTotals, setDisplayTotals] = useState<DisplayTotals | null>(null)

  const [currentVoucherImage, setCurrentVoucherImage] =
    useState<ImageUploadState | null>(null)
  const [currentDescription, setCurrentDescription] = useState<string>("")
  const [currentAmount, setCurrentAmount] = useState<Number>(0)
  const [currentMethod, setCurrentMethod] = useState<
    string | MethodOption | null
  >(null)
  const [paymentVouchers, setPaymentVouchers] = useState<ImageUploadState[]>([])
  const [imageToCropDetails, setImageToCropDetails] = useState<{
    originalFile: File
    targetType: "paymentVoucher"
    tempId: string
  } | null>(null)
  const [imageSrcForCropper, setImageSrcForCropper] = useState<string | null>(
    null
  )
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const [activeStep, setActiveStep] = React.useState(0)

  const isPickupSelected = useMemo(() => {
    if (!selectedShippingMethod || !selectedShippingMethod.fullMethod)
      return false
    const method = selectedShippingMethod.fullMethod as ShippingMethod
    const methodName = method.name?.toLowerCase() || ""
    return methodName.includes("pickup") || methodName.includes("recoger")
  }, [selectedShippingMethod])

  const initialOrderLineFormStateForUpdate: Omit<
    OrderLineFormState,
    "id" | "status" | "item" | "tempId"
  > & { item: undefined } = {
    selectedArt: null,
    selectedProduct: null,
    selectedVariant: null,
    availableVariants: [],
    quantity: 1,
    item: undefined,
    pricePerUnit: 0,
    subtotal: 0,
  }

  const createBlankAddress = useCallback((): Address => {
    return {
      recepient: { name: "", lastName: "", phone: "", email: "" },
      address: {
        line1: "",
        city: "",
        state: "",
        country: "",
        line2: "",
        reference: "",
        zipCode: "",
      },
    }
  }, [])

  const readPermissions = async () => {
    const response = await getPermissions()
    setPermissions(response)
  }

  const readSellers = async () => {
    const response = await fetchSellers()
    setSellers(response)
  }

  const loadData = useCallback(async () => {
    const showSnackBar = showSnackBarRef.current
    if (!id) {
      return
    }
    setIsLoading(true)
    setErrorFetch(null)
    try {
      const [orderData, shippingMethods, paymentMethods, products, arts] =
        await Promise.all([
          getOrderById(id) as Promise<Order>,
          fetchShippingMethods() as Promise<ShippingMethod[]>,
          readAllPaymentMethods() as Promise<PaymentMethod[]>,
          fetchActiveProducts("A-Z") as Promise<Product[]>,
          getArts() as Promise<Art[]>,
        ])
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
      setOrder(orderData)
      setObservations(orderData.observations || "")
      if (orderData.consumerDetails?.basic) {
        setEditableClientInfo(
          JSON.parse(JSON.stringify(orderData.consumerDetails.basic))
        )
      } else {
        setEditableClientInfo({ name: "", lastName: "", email: "", phone: "" })
      }
      const productOpts = products
        .filter((p) => p._id)
        .map((p) => ({ id: p._id!.toString(), label: p.name, fullProduct: p }))

      const artOpts = arts
        .filter((a) => a._id)
        .map((a) => ({
          id: a._id!.toString(),
          label: a.title,
          thumb: a.squareThumbUrl || a.smallThumbUrl || "",
          fullArt: a,
        }))

      const allArtist = arts.map((art) => art.prixerUsername)
      const onlyPrixers = [...new Set(allArtist)]

      const customImageOptions: ArtOption[] = onlyPrixers.map(
        (prixerUsername) => {
          const customArtPlaceholder: CustomImage = {
            artId: `custom-image-${prixerUsername}`,
            title: `Personalizado de ${prixerUsername}`,
            prixerUsername: prixerUsername,
            url: "",
          }

          return {
            id: customArtPlaceholder.artId,
            label: customArtPlaceholder.title,
            thumb: favicon,
            fullArt: customArtPlaceholder,
          }
        }
      )

      const genericCustom: ArtOption = {
        id: "custom-image-without-prixer",
        label: `Personalizado`,
        thumb: favicon,
        fullArt: {
          artId: `custom-image-without-prixer`,
          title: `Personalizado`,
          prixerUsername: "",
          url: "",
        },
      }

      setProductOptions(productOpts)
      customImageOptions.unshift(genericCustom)
      setArtOptions([...artOpts, ...customImageOptions])

      const transformedLines: OrderLineFormState[] = orderData.lines.map(
        (line) => {
          const selectedProductOpt = productOpts.find(
            (p) => p.id === line.item?.product?._id?.toString()
          )
          const variants = selectedProductOpt?.fullProduct.variants || []
          const variantOptions = variants
            .filter((v) => v._id)
            .map((v) => ({ id: v._id!, label: v.name, fullVariant: v }))
          const currentVariantOpt =
            variantOptions.find(
              (vo) =>
                vo.fullVariant.attributes.length ===
                  (line.item?.product?.selection?.length || 0) &&
                vo.fullVariant.attributes.every((attr) =>
                  line.item?.product?.selection?.find(
                    (selAttr) =>
                      selAttr.name === attr.name && selAttr.value === attr.value
                  )
                )
            ) || null

          const artIdToFind = line.item?.art
            ? "_id" in line.item.art
              ? line.item.art._id?.toString()
              : "id" in line.item.art && line.item.art.id
            : undefined

          return {
            ...line,
            tempId: line.id || uuidv4(),
            selectedArt: artIdToFind
              ? artOpts.find((a) => a.id === artIdToFind) || null // <-- ✨ ¡AÑADE ESTO!
              : null,
            selectedProduct: selectedProductOpt || null,
            selectedVariant: currentVariantOpt,
            availableVariants: variantOptions,
            pricePerUnit: line.pricePerUnit,
            quantity: line.quantity,
          }
        }
      )

      setEditableOrderLines(transformedLines)

      const shippingOptions = shippingMethods
        .filter((s) => s._id && s.active)
        .map((s) => ({
          id: s._id!.toString(),
          label: `${s.name} ($${s.price})`,
          fullMethod: s,
        }))

      const paymentOptions = paymentMethods
        .filter((p) => p._id && p.active)
        .map((p) => ({ id: p._id!.toString(), label: p.name, fullMethod: p }))
      setShippingMethodOptions(shippingOptions)
      setPaymentMethodOptions(paymentOptions)

      const orderShip = orderData.shipping?.method

      const currentSelectedShippingMethod =
        shippingOptions.find((opt) =>
          !!orderShip?._id
            ? opt.id === orderShip._id.toString()
            : opt.fullMethod.name === orderShip?.name
        ) || null

      setSelectedShippingMethod(currentSelectedShippingMethod)

      const orderPay = orderData.payment?.payment[0]?.method

      const currentSelectedPaymentMethod = orderPay
        ? paymentOptions.find((opt) =>
            !!orderPay?._id
              ? opt.id === orderPay._id.toString()
              : opt.fullMethod.name === orderPay?.name
          ) || null
        : null

      setSelectedPaymentMethod(currentSelectedPaymentMethod)

      setEditableShippingAddress(
        orderData.shipping?.address
          ? JSON.parse(JSON.stringify(orderData.shipping.address))
          : createBlankAddress()
      )

      setEditableBillingAddress(
        orderData.billing?.address
          ? JSON.parse(JSON.stringify(orderData.billing.address))
          : createBlankAddress()
      )

      const isInitiallyPickup =
        currentSelectedShippingMethod?.fullMethod &&
        ((currentSelectedShippingMethod.fullMethod as ShippingMethod).name
          ?.toLowerCase()
          .includes("pickup") ||
          (currentSelectedShippingMethod.fullMethod as ShippingMethod).name
            ?.toLowerCase()
            .includes("recoger"))

      if (isInitiallyPickup) {
        setUseShippingForBilling(false)
        setEditableShippingAddress(createBlankAddress())
        if (!orderData.billing?.address?.address?.line1) {
          setEditableBillingAddress(createBlankAddress())
        }
      } else {
        setUseShippingForBilling(
          !!orderData.shipping?.address &&
            !!orderData.billing?.address &&
            JSON.stringify(orderData.shipping.address) ===
              JSON.stringify(orderData.billing.address)
        )
      }

      const existingVoucherImages: ImageUploadState[] = []
      if (
        orderData.payment?.payment &&
        Array.isArray(orderData.payment.payment)
      ) {
        setPrevPayments(orderData.payment.payment)
        orderData.payment.payment.forEach(
          (payments: Payment, index: number) => {
            if (payments.voucher) {
              existingVoucherImages.push({
                id: `payments-${payments.id || index}-voucher-${uuidv4()}`, // Ensure unique ID for ImageUploadState
                url: payments.voucher,
                isExisting: true,
              })
            }
          }
        )
      }
      setPaymentVouchers(existingVoucherImages)
    } catch (err: any) {
      console.error("Failed to load data:", err)
      const errorMsg = err.message || "Error al cargar los datos."
      setErrorFetch(errorMsg)
      showSnackBar(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [id, showSnackBarRef, createBlankAddress, navigate])

  useEffect(() => {
    loadData()
    readPermissions()
    readSellers()
  }, [])

  useEffect(() => {
    if (!order) return setDisplayTotals(null)
    const newSubTotal = editableOrderLines.reduce(
      (sum, line) =>
        sum +
        (line?.pricePerUnit ? Number(line?.pricePerUnit) : 0) *
          (line.quantity || 1),
      0
    )
    const newShippingCost = selectedShippingMethod
      ? parseFloat(
          (selectedShippingMethod.fullMethod as ShippingMethod).price || "0"
        )
      : order.shippingCost || 0
    const base = newSubTotal - (order.discount || 0) + newShippingCost
    const newTaxes: Tax[] = (order.tax || []).map((taxRule) => ({
      ...taxRule,
      amount:
        base > 0 ? parseFloat((base * (taxRule.value / 100)).toFixed(2)) : 0,
    }))
    const totalTaxAmount = newTaxes.reduce((sum, t) => sum + t.amount, 0)
    const newTotal =
      newSubTotal - (order.discount || 0) + newShippingCost + totalTaxAmount
    setDisplayTotals({
      subTotal: newSubTotal,
      discount: order.discount || 0,
      shippingCost: newShippingCost,
      taxes: newTaxes,
      total: newTotal,
      totalUnits: editableOrderLines.reduce((u, l) => u + (l.quantity || 0), 0),
    })
  }, [editableOrderLines, selectedShippingMethod, order])

  useEffect(() => {
    let newPrefDate
    if (order?.shipping?.preferredDeliveryDate) {
      newPrefDate = dayjs(order?.shipping?.preferredDeliveryDate)
    } else {
      newPrefDate = calculatePreferredDate(editableOrderLines)
    }
    setPrefDate(newPrefDate)
  }, [editableOrderLines])

  useEffect(() => {
    if (isPickupSelected) {
      setEditableShippingAddress(createBlankAddress())
      setUseShippingForBilling(false)
      if (!editableBillingAddress?.address?.line1) {
        setEditableBillingAddress(
          order?.billing?.address
            ? JSON.parse(JSON.stringify(order.billing.address))
            : createBlankAddress()
        )
      }
    } else {
      if (useShippingForBilling && editableShippingAddress) {
        setEditableBillingAddress(
          JSON.parse(JSON.stringify(editableShippingAddress))
        )
      } else if (!useShippingForBilling) {
        const shippingAndBillingWereSameOrBillingEmpty =
          (editableShippingAddress &&
            editableBillingAddress &&
            !editableBillingAddress?.address.line1 &&
            JSON.stringify(editableShippingAddress) ===
              JSON.stringify(editableBillingAddress)) ||
          !editableBillingAddress?.address?.line1
        if (shippingAndBillingWereSameOrBillingEmpty) {
          setEditableBillingAddress(
            order?.billing?.address
              ? JSON.parse(JSON.stringify(order.billing.address))
              : createBlankAddress()
          )
        }
      }
    }
  }, [
    isPickupSelected,
    useShippingForBilling,
    order,
    editableBillingAddress?.address?.line1,
  ])

  const calculatePreferredDate = (lines: OrderLineFormState[]): Dayjs => {
    const today = dayjs()
    if (!lines || lines.length === 0) {
      return today
    }

    const productionTimesInDays = lines.map((line) => {
      const timeString = line.selectedProduct?.fullProduct?.productionTime

      return parseInt(timeString || "0", 10)
    })

    const maxProductionTime = Math.max(...productionTimesInDays)

    // return today.add(maxProductionTime, 'day');

    let deliveryDate = dayjs()
    let daysAdded = 0

    while (daysAdded < maxProductionTime) {
      deliveryDate = deliveryDate.add(1, "day")

      const dayOfWeek = deliveryDate.day()

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++
      }
    }

    return deliveryDate
  }

  const onVoucherImageLoadInCropper = (
    e: React.SyntheticEvent<HTMLImageElement>
  ) => {
    imgRef.current = e.currentTarget
    const { naturalWidth, naturalHeight } = e.currentTarget
    if (naturalWidth > 0 && naturalHeight > 0) {
      setCrop(
        centerAspectCrop(naturalWidth, naturalHeight, VOUCHER_IMAGE_ASPECT)
      )
    } else {
      showSnackBarRef.current(
        "Error al cargar imagen para recorte: dimensiones inválidas."
      )
      closeAndResetCropper()
    }
  }

  const openVoucherCropperWithFile = (file: File, tempId: string) => {
    setImageToCropDetails({
      originalFile: file,
      targetType: "paymentVoucher",
      tempId,
    })
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImageSrcForCropper(reader.result?.toString() || null)
      setCropModalOpen(true)
    })
    reader.readAsDataURL(file)
  }

  const handleVoucherImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      if (paymentVouchers.length >= 6) {
        showSnackBarRef.current(
          "Has alcanzado el límite de 6 imágenes de comprobantes."
        )
        return
      }
      const file = event.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        // Límite de 5MB para comprobantes
        showSnackBarRef.current(
          "El archivo es muy grande. Máximo 5MB para comprobantes."
        )
        if (event.target) (event.target as HTMLInputElement).value = ""
        return
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        showSnackBarRef.current("Formato no permitido. Solo JPG, PNG, WEBP.")
        if (event.target) (event.target as HTMLInputElement).value = ""
        return
      }
      const tempImageId = uuidv4()
      openVoucherCropperWithFile(file, tempImageId)
    }
  }

  const closeAndResetCropper = () => {
    setCropModalOpen(false)
    setImageSrcForCropper(null)
    setImageToCropDetails(null)
    setCrop(undefined)
    setCompletedCrop(undefined)
    if (imgRef.current) imgRef.current = null
    const fileInput = document.getElementById(
      "voucher-image-input"
    ) as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const handleConfirmVoucherCropAndUpload = async () => {
    const showSnackBar = showSnackBarRef.current
    if (
      !completedCrop ||
      !imgRef.current ||
      !previewCanvasRef.current ||
      !imageToCropDetails ||
      imageToCropDetails.targetType !== "paymentVoucher"
    ) {
      showSnackBar("Error: No se pudo procesar el recorte del comprobante.")
      return
    }
    await canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop)
    previewCanvasRef.current.toBlob(
      (blob) => {
        if (!blob) {
          showSnackBar(
            "Error: No se pudo crear el archivo WebP del comprobante."
          )
          return
        }
        const { originalFile, tempId } = imageToCropDetails
        let originalNameWithoutExtension = originalFile.name
        const lastDotIndex = originalFile.name.lastIndexOf(".")
        if (lastDotIndex > 0)
          originalNameWithoutExtension = originalFile.name.substring(
            0,
            lastDotIndex
          )
        const webpFileName = `voucher_${originalNameWithoutExtension.replace(/[^a-zA-Z0-9.]/g, "_")}_${Date.now()}.webp`
        const croppedWebpFile = new File([blob], webpFileName, {
          type: "image/webp",
        })

        closeAndResetCropper()
        setCurrentVoucherImage({
          id: tempId,
          url: "",
          file: croppedWebpFile,
          progress: 0,
          isExisting: false,
        })
        startTusUploadForVoucher(croppedWebpFile, tempId)
      },
      "image/webp",
      0.85
    )
  }

  const startTusUploadForVoucher = (file: File, imageId: string) => {
    const showSnackBar = showSnackBarRef.current
    const upload = new tus.Upload(file, {
      endpoint: `${BACKEND_URL}/files`,
      retryDelays: [0, 1000, 3000, 5000],
      metadata: {
        filename: file.name,
        filetype: file.type,
        context: "paymentVoucher",
        imageId: imageId,
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = Math.floor((bytesUploaded / bytesTotal) * 100)
        setPaymentVouchers((prevVouchers) =>
          prevVouchers.map((img) =>
            img.id === imageId ? { ...img, progress: percentage } : img
          )
        )
        // Opcional: Actualizar el progreso del 'currentVoucherImage' si lo estás usando
        // para mostrar el progreso de la imagen individual que se está subiendo.
        setCurrentVoucherImage((prevCurrent) =>
          prevCurrent && prevCurrent.id === imageId
            ? { ...prevCurrent, progress: percentage }
            : prevCurrent
        )
      },
      onSuccess: async () => {
        const tusUploadInstance = upload as any
        let finalS3Url: string | null = null
        if (tusUploadInstance._req?._xhr?.getResponseHeader) {
          finalS3Url =
            tusUploadInstance._req._xhr.getResponseHeader("x-final-url") ||
            tusUploadInstance._req._xhr.getResponseHeader("X-Final-URL")
        } else if (tusUploadInstance.xhr?.getResponseHeader) {
          finalS3Url =
            tusUploadInstance.xhr.getResponseHeader("x-final-url") ||
            tusUploadInstance.xhr.getResponseHeader("X-Final-URL")
        }
        if (finalS3Url && finalS3Url.startsWith("https://https//")) {
          finalS3Url = finalS3Url.replace("https://https//", "https://")
        }
        const imageUrl = finalS3Url || upload.url // Fallback a la URL de TUS

        if (imageUrl) {
          setPaymentVouchers((prevVouchers) =>
            prevVouchers.map((img) =>
              img.id === imageId
                ? {
                    ...img,
                    url: imageUrl,
                    progress: 100,
                    file: undefined,
                    error: undefined,
                  }
                : img
            )
          )

          setCurrentVoucherImage((prevCurrentVoucher) => {
            if (prevCurrentVoucher && prevCurrentVoucher.id === imageId) {
              return {
                ...prevCurrentVoucher,
                url: imageUrl,
                progress: 100,
                file: undefined,
                error: undefined,
              }
            } else if (
              !prevCurrentVoucher ||
              prevCurrentVoucher.id !== imageId
            ) {
              console.warn(
                `[setCurrentVoucherImage onSuccess] 'prevCurrentVoucher' era nulo o su ID no coincidía. Creando/actualizando con imageId: ${imageId}`
              )
              return {
                id: imageId,
                url: imageUrl,
                progress: 100,
                file: undefined,
                error: undefined,
              }
            }
            return prevCurrentVoucher
          })

          showSnackBar(`Comprobante subido.`)
        } else {
          const errorMsg = "Error al obtener URL del comprobante"
          setPaymentVouchers((prevVouchers) =>
            prevVouchers.map((img) =>
              img.id === imageId
                ? {
                    ...img,
                    error: errorMsg,
                    file: undefined,
                    progress: undefined,
                  }
                : img
            )
          )
          setCurrentVoucherImage((prevCurrentVoucher) =>
            prevCurrentVoucher && prevCurrentVoucher.id === imageId
              ? {
                  ...prevCurrentVoucher,
                  error: errorMsg,
                  file: undefined,
                  progress: undefined,
                }
              : prevCurrentVoucher
          )
          showSnackBar(errorMsg)
        }
      },
      onError: (error) => {
        const errorMsg = error.message || "Error desconocido"
        setPaymentVouchers((prevVouchers) =>
          prevVouchers.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  error: errorMsg,
                  file: undefined,
                  progress: undefined,
                }
              : img
          )
        )
        setCurrentVoucherImage((prevCurrentVoucher) =>
          prevCurrentVoucher && prevCurrentVoucher.id === imageId
            ? {
                ...prevCurrentVoucher,
                error: errorMsg,
                file: undefined,
                progress: undefined,
              }
            : prevCurrentVoucher
        )
        showSnackBar(`Error al subir comprobante: ${errorMsg}`)
      },
    })
    upload.start()
  }

  const handleRemoveVoucherImage = (idToRemove: string) => {
    setPaymentVouchers((prev) => prev.filter((img) => img.id !== idToRemove))
    showSnackBarRef.current(
      "Comprobante eliminado de la lista (se guardará al actualizar)."
    )
  }

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setActiveStep(newValue)
  }

  const handleAddOrderLine = () => {
    setEditableOrderLines((prev) => [
      ...prev,
      {
        ...initialOrderLineFormStateForUpdate,
        tempId: uuidv4(),
        status: [[OrderStatus.Pending, new Date()]],
        id: "",
      },
    ])
  }

  const handleRemoveOrderLine = (lineTempIdToRemove: string) => {
    setEditableOrderLines((prev) =>
      prev.filter((line) => line.tempId !== lineTempIdToRemove)
    )
  }

  const updateEditableLine = (
    lineTempIdToUpdate: string,
    newValues: Partial<OrderLineFormState>
  ) => {
    setEditableOrderLines((prevLines) =>
      prevLines.map((line) =>
        line.tempId === lineTempIdToUpdate ? { ...line, ...newValues } : line
      )
    )
  }

  const handleArtSelection = (
    lineTempIdToUpdate: string,
    newValue: ArtOption | null
  ) => {
    updateEditableLine(lineTempIdToUpdate, {
      selectedArt: newValue,
    })
  }

  const handleProductSelection = (
    lineTempIdToUpdate: string,
    newValue: ProductOption | null
  ) => {
    const variants = newValue?.fullProduct.variants || []
    const variantOptions = variants
      .filter((v) => v._id)
      .map((v) => ({ id: v._id!, label: v.name, fullVariant: v }))
    const basePrice = parseFloat(newValue?.fullProduct.cost || "0")
    updateEditableLine(lineTempIdToUpdate, {
      selectedProduct: newValue,
      availableVariants: variantOptions,
      selectedVariant: null,
      pricePerUnit: basePrice,
    })
  }

  const handleVariantSelection = (
    lineTempIdToUpdate: string,
    newValue: VariantOption | null
  ) => {
    const line = editableOrderLines.find((l) => l.tempId === lineTempIdToUpdate)
    const productBasePrice = parseFloat(
      line?.selectedProduct?.fullProduct.cost || "0"
    )
    const pricePerUnit = parseFloat(
      newValue?.fullVariant.publicPrice || productBasePrice.toString() || "0"
    )
    updateEditableLine(lineTempIdToUpdate, {
      selectedVariant: newValue,
      pricePerUnit: pricePerUnit,
    })
  }

  const handleQuantityChange = (
    lineTempIdToUpdate: string,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const q = parseInt(event.target.value, 10)
    const quantity = q >= 1 ? q : 1
    updateEditableLine(lineTempIdToUpdate, { quantity })
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

  const handleOrderStatusChange = (
    event: SelectChangeEvent<OrderStatus>,
    currentOrder: Order
  ) => {
    const newSelectedStatus = event.target.value as OrderStatus
    const newStatusEntry: [OrderStatus, Date] = [newSelectedStatus, new Date()]
    const existingStatusHistory = Array.isArray(currentOrder.status)
      ? currentOrder.status
      : []
    const updatedStatusHistory: [OrderStatus, Date][] = [
      ...existingStatusHistory,
      newStatusEntry,
    ]

    setOrder({ ...currentOrder, status: updatedStatusHistory })
    showSnackBar("¡Recuerda guardar los cambios en el botón rojo!")
  }

  const handleOrderPayStatusChange = (
    event: SelectChangeEvent<GlobalPaymentStatus>,
    currentOrder: Order
  ) => {
    const newSelectedStatus = event.target.value as GlobalPaymentStatus
    const newStatusEntry: [GlobalPaymentStatus, Date] = [
      newSelectedStatus,
      new Date(),
    ]
    const existingStatusHistory = Array.isArray(currentOrder.payment.status)
      ? currentOrder.payment.status
      : []
    const updatedStatusHistory: [GlobalPaymentStatus, Date][] = [
      ...existingStatusHistory,
      newStatusEntry,
    ]

    setOrder({
      ...currentOrder,
      payment: { ...currentOrder.payment, status: updatedStatusHistory },
    })
    showSnackBar("¡Recuerda guardar los cambios en el botón rojo!")
  }

  const handleStatusChange = (
    lineTempIdToUpdate: string,
    event: SelectChangeEvent<OrderStatus>
  ) => {
    const newStatus = event.target.value as OrderStatus
    setEditableOrderLines((prevLines) =>
      prevLines.map((line) => {
        if (line.tempId === lineTempIdToUpdate) {
          const currentLatestStatusTuple = getCurrentOrderStatus(line.status!)
          const currentLatestStatus = currentLatestStatusTuple
            ? currentLatestStatusTuple[0]
            : getLatestStatus(line.status)
          if (currentLatestStatus !== newStatus) {
            const newStatusHistory: [OrderStatus, Date][] = [
              ...(line.status || []),
              [newStatus, new Date()],
            ]
            return { ...line, status: newStatusHistory }
          }
        }
        return line
      })
    )
  }

  const handleObservationsChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setObservations(event.target.value)

  const handleShippingChange = (
    event: SyntheticEvent,
    newValue: MethodOption | null
  ) => setSelectedShippingMethod(newValue)

  const handlePaymentChange = (
    event: SyntheticEvent,
    newValue: MethodOption | null
  ) => setSelectedPaymentMethod(newValue)

  const handleClientInfoChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setEditableClientInfo((prev) => (prev ? { ...prev, [name]: value } : null))
  }
  const handleShippingAddressChange = (updatedAddress: Address) => {
    setEditableShippingAddress(updatedAddress)
  }
  const handleBillingAddressChange = (updatedAddress: Address) => {
    setEditableBillingAddress(updatedAddress)
  }
  const handleUseShippingForBillingChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked
    setUseShippingForBilling(checked)
    if (checked && editableShippingAddress) {
      setEditableBillingAddress(
        JSON.parse(JSON.stringify(editableShippingAddress))
      )
    } else if (!checked) {
      setEditableBillingAddress(
        order?.billing?.address
          ? JSON.parse(JSON.stringify(order.billing.address))
          : createBlankAddress()
      )
    }
  }

  const validateForm = (): boolean => {
    /* ... (sin cambios, pero asegurarse que no valide imágenes de voucher si no es necesario aquí) ... */ const showSnackBar =
      showSnackBarRef.current
    if (!selectedShippingMethod) {
      showSnackBar("Método de envío es requerido.")
      return false
    }
    if (!selectedPaymentMethod) {
      showSnackBar("Método de pago es requerido.")
      return false
    }
    // if (!isPickupSelected) {
    //   if (
    //     !editableShippingAddress?.address?.line1 ||
    //     !editableShippingAddress?.address?.city ||
    //     !editableShippingAddress?.address?.country ||
    //     !editableShippingAddress?.recepient?.name
    //   ) {
    //     showSnackBar(
    //       "Dirección de Envío: campos requeridos (Destinatario, Línea 1, Ciudad, País) están incompletos."
    //     )
    //     return false
    //   }
    // }
    // if (
    //   !useShippingForBilling &&
    //   (!editableBillingAddress?.address?.line1 ||
    //     !editableBillingAddress?.address?.city ||
    //     !editableBillingAddress?.address?.country ||
    //     !editableBillingAddress?.recepient?.name)
    // ) {
    //   showSnackBar(
    //     "Dirección de Facturación: campos requeridos (Destinatario, Línea 1, Ciudad, País) están incompletos."
    //   )
    //   return false
    // }
    return true
  }

  const handleSelectedMethod = (id: string | MethodOption | null) => {
    const selectedMethod = paymentMethodOptions.find((el) => el.id === id)
    if (!selectedMethod) return
    setCurrentMethod(selectedMethod)
  }

  const handleSeller = (selected: string | undefined) => {
    if (order) {
      setOrder({ ...order, seller: selected })
    }
  }

  const handleAddPaymentVoucher = async () => {
    if (
      // !currentVoucherImage ||
      // !currentDescription ||
      !currentAmount ||
      !currentMethod
    ) {
      // showSnackBar("Por favor, completa todos los campos del comprobante.")
      return
    }
    if (!currentVoucherImage?.url) return
    const newPayment: any = {
      id: uuidv4(),
      voucher: currentVoucherImage.url,
      description: currentDescription,
      createdOn: new Date(),
      amount: currentAmount,
      method: currentMethod,
      metadata: `Voucher linked to ${typeof currentMethod === "object" ? currentMethod.label : currentMethod}`,
    }

    const updatedPayments: Payment[] = [...prevPayments, newPayment]
    setPrevPayments(updatedPayments)
    const updatedPaymentDetails: PaymentDetails = {
      total: order?.payment?.total || Number(currentAmount) || 0,
      status: order?.payment?.status || [
        [GlobalPaymentStatus.Pending, new Date()],
      ],
      payment: updatedPayments,
    }

    const payloadForAPI: Partial<Order> = {
      ...(order || {}),
      _id: order?._id,
      payment: updatedPaymentDetails,
    }

    setOrder((currentOrder) => {
      if (!currentOrder) {
        console.error(
          "Error: El estado de la orden es null, no se puede actualizar."
        )
        return null
      }

      const newPaymentDetails: PaymentDetails = {
        ...(currentOrder.payment || {}),
        total: currentOrder.payment?.total || 0,
        status: currentOrder.payment?.status,
        payment: updatedPayments,
      }

      return {
        ...currentOrder,
        payment: newPaymentDetails,
      }
    })
    try {
      console.log(
        "Updating Order Data with new vouchers:",
        id,
        JSON.stringify(payloadForAPI, null, 2)
      )
      const response = await updateOrder(id!, payloadForAPI)

      if (response) {
        // Asume que 'response' indica éxito
        showSnackBar(
          `Orden #${order?.number || id} actualizada con nuevo comprobante.`
        )
        setCurrentVoucherImage(null) // Limpia el estado del voucher actual
        setCurrentDescription("")
        setCurrentAmount(0)
        // setCurrentMethod(""); // Comentado si currentMethod no es un estado para el voucher individual
        // Opcional: Recargar los datos de la orden desde el backend para asegurar consistencia total
        // loadData();
      } else {
        throw new Error(
          "La actualización de la orden no devolvió una respuesta exitosa."
        )
      }
    } catch (err: any) {
      console.error("Failed to update order with voucher:", err)
      showSnackBar(
        err?.response?.data?.message ||
          err.message ||
          "Error al actualizar la orden con el comprobante."
      )
      // No reviertas el estado aquí a menos que sea necesario, el usuario podría querer reintentar.
    } finally {
      setIsSubmitting(false) // Asegúrate de resetear isSubmitting
    }
    // Limpiar los campos del formulario para el siguiente comprobante

    // Revocar el object URL para liberar memoria
    // if (currentVoucherImage?.preview) {
    //   URL.revokeObjectURL(currentVoucherImage.preview)
    // }
    // const fileInput = document.getElementById("voucher-image-input")
    // if (fileInput) {
    //   fileInput.value = ""
    // }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const showSnackBar = showSnackBarRef.current
    setIsSubmitting(true)

    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }
    for (const [index, line] of editableOrderLines.entries()) {
      if (!line.selectedProduct) {
        showSnackBar(`Item #${index + 1}: Producto es requerido.`)
        setIsSubmitting(false)
        return
      }
      if (
        line.selectedProduct.fullProduct.variants &&
        line.selectedProduct.fullProduct.variants.length > 0 &&
        !line.selectedVariant
      ) {
        showSnackBar(
          `Item #${index + 1}: Variante es requerida para ${line.selectedProduct.label}.`
        )
        setIsSubmitting(false)
        return
      }
      if (!line.quantity || line.quantity < 1) {
        showSnackBar(`Item #${index + 1}: Cantidad inválida.`)
        setIsSubmitting(false)
        return
      }
    }
    setErrorSubmit(null)
    if (!order) {
      setErrorSubmit("Error: Datos de la orden no disponibles.")
      setIsSubmitting(false)
      return
    }
    // if (!isPickupSelected && !editableShippingAddress?.address?.line1) {
    //   setErrorSubmit("Dirección de envío no seleccionada o inválida.")
    //   setIsSubmitting(false)
    //   return
    // }
    // if (!editableBillingAddress?.address?.line1 && !useShippingForBilling) {
    //   setErrorSubmit("Dirección de facturación no seleccionada o inválida.")
    //   setIsSubmitting(false)
    //   return
    // }

    const shippingAddr = isPickupSelected
      ? createBlankAddress()
      : editableShippingAddress || createBlankAddress()
    const billingAddr = useShippingForBilling
      ? shippingAddr
      : editableBillingAddress || createBlankAddress()
    const finalOrderLines: OrderLine[] = editableOrderLines.map((lineState) => {
      if (!lineState.selectedProduct)
        throw new Error("Producto no seleccionado en una línea.")
      const pricePerUnit = parseFloat(
        lineState.pricePerUnit?.toString() ||
          lineState.selectedVariant?.fullVariant.publicPrice ||
          lineState.selectedProduct.fullProduct.cost ||
          "0"
      )
      const item: Item = {
        sku: `${lineState.selectedProduct.id}-${lineState.selectedVariant?.id || "novar"}-${lineState.selectedArt?.id || "noart"}`,
        art: lineState.selectedArt
          ? (() => {
              const fullArt = lineState?.selectedArt?.fullArt
              if ("_id" in fullArt) {
                return {
                  _id: fullArt._id,
                  artId: fullArt.artId,
                  title: fullArt.title,
                  largeThumbUrl: fullArt.largeThumbUrl,
                  prixerUsername: fullArt.prixerUsername,
                  exclusive: fullArt.exclusive,
                }
              } else {
                return fullArt
              }
            })()
          : undefined,
        product: {
          _id: lineState.selectedProduct.fullProduct._id,
          name: lineState.selectedProduct.fullProduct.name,
          productionTime: lineState.selectedProduct.fullProduct.productionTime,
          sources: lineState.selectedProduct.fullProduct.sources,
          variants: lineState.selectedProduct.fullProduct.variants,
          selection: lineState.selectedVariant?.fullVariant.attributes || [],
          mockUp: lineState.selectedProduct.fullProduct.mockUp,
        },
        price: pricePerUnit.toString(),
      }
      return {
        id:
          lineState.id && lineState.id !== lineState.tempId
            ? lineState.id
            : uuidv4(),
        item: item,
        quantity: lineState.quantity || 1,
        pricePerUnit: pricePerUnit,
        subtotal: (lineState.quantity || 1) * pricePerUnit,
        status: lineState.status || [[OrderStatus.Pending, new Date()]],
        discount: lineState.discount,
        surcharge: lineState.surcharge,
      }
    })
    const finalSubTotal = finalOrderLines.reduce(
      (sum, line) => sum + line.subtotal,
      0
    )
    const finalTotalUnits = finalOrderLines.reduce(
      (sum, line) => sum + line.quantity,
      0
    )
    const finalShippingCost = selectedShippingMethod
      ? parseFloat(
          (selectedShippingMethod.fullMethod as ShippingMethod).price || "0"
        )
      : 0
    const orderDiscount = order.discount || 0
    const finalTaxes: Tax[] = (order.tax || []).map((taxRule) => {
      const taxableAmount = finalSubTotal - orderDiscount
      const amount =
        (taxableAmount > 0 ? taxableAmount : 0) * (taxRule.value / 100)
      return { ...taxRule, amount }
    })
    const finalTotalTaxAmount = finalTaxes.reduce((sum, t) => sum + t.amount, 0)
    const finalTotal =
      finalSubTotal - orderDiscount + finalShippingCost + finalTotalTaxAmount
    let finalBillToInfo: BasicInfo | undefined =
      editableClientInfo || order?.consumerDetails?.basic
    if (
      !useShippingForBilling &&
      billingAddr?.recepient &&
      (billingAddr.recepient.name || billingAddr.recepient.lastName)
    ) {
      finalBillToInfo = billingAddr.recepient
    } else if (
      useShippingForBilling &&
      shippingAddr?.recepient &&
      (shippingAddr.recepient.name || shippingAddr.recepient.lastName)
    ) {
      finalBillToInfo = shippingAddr.recepient
    }

    // Recolectar URLs de comprobantes subidos
    const voucherPaymentObjects: Payment[] = paymentVouchers
      .filter((imgState) => imgState.url && !imgState.error)
      .map((imgState) => {
        let description = `Comprobante`
        if (imgState.file?.name) {
          description = imgState.file.name
        } else if (imgState.url) {
          try {
            const urlParts = imgState.url.split("/")
            const lastPart = urlParts[urlParts.length - 1]
            description = decodeURIComponent(lastPart.split("?")[0])
          } catch (e) {
            console.warn(
              "No se pudo generar descripción desde la URL del voucher:",
              imgState.url
            )
            description = `Comprobante ${imgState.id.substring(0, 8)}`
          }
        }

        if (!selectedPaymentMethod) {
          // Handle cases where a payment method (needed for the Payment object) isn't selected.
          // This might involve an error, a default, or skipping.
          // For this example, we'll log an error and skip, but you should decide the best approach.
          console.error(
            "Cannot create voucher payment entry without a selectedPaymentMethod."
          )
          showSnackBar(
            "Error: Se necesita un método de pago principal para asociar los comprobantes."
          )
          return null
        }

        return {
          id: imgState.isExisting
            ? imgState.id.split("-voucher-")[0].replace("payments-", "")
            : uuidv4(), // Attempt to reuse existing ID or generate new
          description: description,
          voucher: imgState.url, // <<< Key change: property name
          method: selectedPaymentMethod.fullMethod as PaymentMethod, // Assign the order's selected payment method
          amount: "0", // Vouchers typically don't have a separate amount here or it's part of the total
          metadata: `Voucher linked to ${selectedPaymentMethod.label}`, // Optional metadata
        }
      })
      .filter(Boolean) as Payment[]

    const productionStatus = order.status
    const paymentStatus = order.payment.status

    const payload: Partial<Order> = {
      observations: observations || undefined,
      lines: finalOrderLines,
      consumerDetails: order.consumerDetails
        ? {
            ...order.consumerDetails,
            basic: editableClientInfo || order.consumerDetails.basic,
          }
        : undefined,
      shipping: selectedShippingMethod
        ? {
            ...(order?.shipping || {}),
            method: selectedShippingMethod.fullMethod as ShippingMethod,
            address: isPickupSelected ? createBlankAddress() : shippingAddr,
            country: isPickupSelected
              ? createBlankAddress().address.country
              : shippingAddr.address.country || "",
            preferredDeliveryDate: prefDate ? prefDate.toDate() : new Date(),
          }
        : undefined,
      payment: {
        ...order.payment,
        ...(selectedPaymentMethod && {
          method: [selectedPaymentMethod.fullMethod as PaymentMethod],
          status: paymentStatus,
        }),
        total: finalTotal,
      },
      billing: billingAddr
        ? {
            ...(order?.billing || {}),
            address: billingAddr,
            billTo: finalBillToInfo,
          }
        : undefined,
      subTotal: finalSubTotal,
      totalUnits: finalTotalUnits,
      shippingCost: finalShippingCost,
      status: productionStatus,
      tax: finalTaxes,
      totalWithoutTax: finalSubTotal - orderDiscount,
      total: finalTotal,
      discount: orderDiscount,
      updates: [
        ...(order?.updates || []),
        [
          new Date(),
          "Order updated via admin panel (v2 UI - with TUS vouchers)",
        ],
      ],
      seller: order.seller,
    }
    let mainPayments: Payment[] = []
    if (selectedPaymentMethod) {
      const existingMainInstallment = order.payment?.payment?.find(
        (inst) =>
          !inst.voucher ||
          !paymentVouchers.some((pv) => pv.url === inst.voucher)
      )

      if (existingMainInstallment) {
        mainPayments.push({
          ...existingMainInstallment,
          method: selectedPaymentMethod.fullMethod as PaymentMethod,
          amount: (
            displayTotals?.total ??
            parseFloat(existingMainInstallment.amount || "0")
          ).toString(),
        })
      } else {
        mainPayments.push({
          id: uuidv4(),
          createdOn: new Date(),
          description: selectedPaymentMethod.label || "Pago Principal",
          method: selectedPaymentMethod.fullMethod as PaymentMethod,
          amount: (displayTotals?.total ?? 0).toString(),
          voucher: undefined,
        })
      }
    } else if (order.payment?.payment) {
      mainPayments = order.payment.payment.filter(
        (inst) =>
          !inst.voucher ||
          !paymentVouchers.some(
            (pv) => pv.url === inst.voucher && pv.isExisting
          )
      )
    }

    const finalPayments = [...mainPayments, ...voucherPaymentObjects]

    payload.payment = {
      ...(order.payment || {}),
      total: finalTotal,
      payment: finalPayments,
    }

    try {
      const response = await updateOrder(id!, payload)
      if (response) {
        showSnackBar(`Orden #${order?.number || id} actualizada.`)
        navigate("/admin/orders/read")
      } else {
        throw new Error("La actualización no devolvió respuesta.")
      }
    } catch (err: any) {
      console.error("Failed to submit order update:", err)
      const errorMsg = err.message || "Error al guardar la orden."
      setErrorSubmit(errorMsg)
      showSnackBar(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
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

  const renderVariantAttributes = (
    selection: VariantAttribute[] | undefined
  ) => {
    if (!selection || selection.length === 0) return null
    return (
      <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
        <PaletteOutlined
          fontSize="small"
          sx={{ mr: 0.5, color: "text.secondary" }}
        />
        <Typography variant="caption" color="textSecondary">
          Variante:
          {selection.map((attr) => `${attr.name}: ${attr.value}`).join(", ")}
        </Typography>
      </Box>
    )
  }

  const renderArtDetails = (art: PickedArt | undefined) => {
    if (!art) return null
    return (
      <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
        <CollectionsOutlined
          fontSize="small"
          sx={{ mr: 0.5, color: "text.secondary" }}
        />
        <Typography variant="caption" color="textSecondary">
          Arte: "{art.title}" por {art.prixerUsername}
        </Typography>
      </Box>
    )
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

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }
  if (errorFetch) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {errorFetch}
        <Button onClick={loadData} size="small">
          Reintentar
        </Button>
      </Alert>
    )
  }
  if (!order) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        No se pudo cargar la orden.
      </Alert>
    )
  }

  const overallStatusChipProps = getStatusChipProps(
    getOverallOrderStatus(editableOrderLines)
  )

  const handlePricePerUnitChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    line: OrderLineFormState
  ) => {
    const newPrice = parseFloat(event.target.value)
    if (!isNaN(newPrice)) {
      const newSubtotal = (line.quantity || 1) * newPrice - (line.discount || 0)
      updateLine(line.tempId, { pricePerUnit: newPrice, subtotal: newSubtotal })
      updateEditableLine(line.tempId, {
        pricePerUnit: newPrice,
      })
    }
  }

  const updateLine = (lineId: string, values: Partial<OrderLine>) => {
    setOrder((prevOrder) => {
      if (!prevOrder) return null
      const updatedLines = prevOrder.lines.map((line) => {
        if (line.id === lineId) {
          return { ...line, ...values }
        }
        return line
      })

      const updatedOrder = {
        ...prevOrder,
        lines: updatedLines,
      }

      return recalculateOrderTotals(updatedOrder)
    })
  }

  const recalculateOrderTotals = (order: Order): Order => {
    const subTotal = order.lines.reduce(
      (sum, line) =>
        sum + (line.quantity * line.pricePerUnit - (line.discount || 0)),
      0
    )

    const totalUnits = order.lines.reduce((sum, line) => sum + line.quantity, 0)

    const orderDiscount = order.discount || 0
    const shippingCost = order.shippingCost || 0

    const finalTaxes = (order.tax || []).map((taxRule) => {
      const taxableAmount = subTotal - orderDiscount
      const amount =
        (taxableAmount > 0 ? taxableAmount : 0) * (taxRule.value / 100)
      return { ...taxRule, amount }
    })

    const finalTotalTaxAmount = finalTaxes.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    )

    const total = subTotal - orderDiscount + shippingCost + finalTotalTaxAmount

    return {
      ...order,
      subTotal,
      totalUnits,
      tax: finalTaxes,
      totalWithoutTax: subTotal - orderDiscount,
      total,
    }
  }

  const allowNumericWithDecimal = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const target = event.target as HTMLInputElement // Type assertion
    if (
      !/[0-9.]/.test(event.key) &&
      ![
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
        "Enter",
      ].includes(event.key)
    ) {
      event.preventDefault()
    }
    if (event.key === "." && target.value.includes(".")) {
      event.preventDefault()
    }
  }

  console.log(order)

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <form onSubmit={handleSubmit} id="update-order-form">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            // mb: 3,
            backgroundColor: "transparent",
          }}
        >
          <Grid2
            container
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              // mb: 2,
              flexWrap: "wrap",
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
                Orden #{order.number || order._id?.toString().slice(-6)}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
              >
                <CalendarToday fontSize="small" sx={{ mr: 0.5 }} /> Creada el:{" "}
                {formatDate(order.createdOn)}
                {permissions?.area !== "Master" &&
                  order.seller &&
                  " por " + order.seller}
              </Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                isSubmitting ||
                isLoading ||
                paymentVouchers.some(
                  (img) =>
                    img.file &&
                    typeof img.progress === "number" &&
                    img.progress < 100
                )
              }
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </Grid2>
          {order.shipping?.preferredDeliveryDate &&
            getOverallOrderStatus(editableOrderLines) !==
              OrderStatus.Delivered &&
            getOverallOrderStatus(editableOrderLines) !==
              OrderStatus.Canceled && (
              <Alert
                severity="info"
                icon={<LocalShippingOutlined />}
                sx={{ borderRadius: 2, mt: 2 }}
              >
                Fecha estimada de entrega:
                <strong>
                  {formatDate(order.shipping.preferredDeliveryDate, false)}
                </strong>
              </Alert>
            )}
        </Paper>
        <Tabs
          centered
          value={activeStep}
          onChange={handleChangeTab}
          aria-label="basic tabs example"
        >
          <Tab label="Detalles" {...a11yProps(0)} />
          <Tab label="Pago" {...a11yProps(1)} />
          <Tab label="Historial" {...a11yProps(2)} />
        </Tabs>

        <CustomTabPanel value={activeStep} index={0}>
          <Grid2 container spacing={{ xs: 2, md: 3 }}>
            <Grid2 size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {permissions?.area === "Master" && (
                  <FormControl
                    size="small"
                    disabled={isSubmitting}
                    sx={{ minWidth: 200 }}
                  >
                    <InputLabel>Vendedor</InputLabel>
                    <Select
                      sx={{ width: "100%" }}
                      value={order.seller}
                      onChange={(e) => handleSeller(e.target.value)}
                      label="Vendedor"
                    >
                      {sellers.map((seller, i) => (
                        <MenuItem key={seller + i} value={seller}>
                          {seller}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <FormControl size="small" disabled={isSubmitting}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={getLatestOrderStatus(order)}
                    label="Estado"
                    onChange={(e) =>
                      handleOrderStatusChange(
                        e as SelectChangeEvent<OrderStatus>,
                        order
                      )
                    }
                  >
                    {Object.values(OrderStatus)
                      .filter((v) => typeof v === "number")
                      .map((statusValue) => {
                        const props = getStatusChipProps(
                          statusValue as OrderStatus
                        )
                        return (
                          <MenuItem key={statusValue} value={statusValue}>
                            <Chip
                              icon={props.icon}
                              label={props.label}
                              color={props.color as any}
                              size="small"
                              variant="outlined"
                              sx={{
                                mr: 1,
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                              }}
                            />
                            {/* {props.label} */}
                          </MenuItem>
                        )
                      })}
                  </Select>
                  {order.status && order.status.length > 0 && (
                    <FormHelperText sx={{ textAlign: "right" }}>
                      Últ. act:
                      {formatDate(order.status[order.status.length - 1][1])}
                    </FormHelperText>
                  )}
                </FormControl>
                <FormControl size="small" disabled={isSubmitting}>
                  <InputLabel>Estado de Pago</InputLabel>
                  <Select
                    label="Estado de pago"
                    disabled={!permissions?.detailPay}
                    value={getLatestpayOrderStatus(order)}
                    onChange={(e) =>
                      handleOrderPayStatusChange(
                        e as SelectChangeEvent<GlobalPaymentStatus>,
                        order
                      )
                    }
                  >
                    {Object.values(GlobalPaymentStatus)
                      .filter((v) => typeof v === "number")
                      .map((statusValue) => {
                        const props = getPayStatusChipProps(
                          statusValue as GlobalPaymentStatus
                        )
                        return (
                          <MenuItem key={statusValue} value={statusValue}>
                            <Chip
                              icon={props.icon}
                              label={props.label}
                              color={props.color as any}
                              size="small"
                              variant="outlined"
                              sx={{
                                mr: 1,
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                              }}
                            />
                          </MenuItem>
                        )
                      })}
                  </Select>
                  {order.status && order.status.length > 0 && (
                    <FormHelperText sx={{ textAlign: "right" }}>
                      Últ. act:
                      {formatDate(order.status[order.status.length - 1][1])}
                    </FormHelperText>
                  )}
                </FormControl>
              </Stack>
            </Grid2>
            <Grid2 size={{ xs: 12, lg: 7 }}>
              <Typography
                variant="h5"
                fontWeight="medium"
                gutterBottom
                sx={{ mb: 2 }}
              >
                Artículos del Pedido
              </Typography>
              {editableOrderLines.map((line, index) => {
                const lineStatus = getLatestStatus(line.status)
                const productImageUrl =
                  line.selectedProduct?.fullProduct.sources?.images?.[0]?.url
                return (
                  <Card
                    key={line.tempId}
                    sx={{ mb: 2.5, borderRadius: 2, boxShadow: 2 }}
                  >
                    <CardHeader
                      title={
                        line.selectedProduct?.label || "Seleccionar Producto"
                      }
                      action={
                        <IconButton
                          onClick={() => handleRemoveOrderLine(line.tempId)}
                          disabled={
                            isSubmitting || editableOrderLines.length <= 1
                          }
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      }
                    />
                    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                      <Grid2 container spacing={2} alignItems="flex-start">
                        <Grid2
                          size={{ xs: 12 }}
                          sx={{ textAlign: "center", mb: { xs: 1, sm: 0 } }}
                        >
                          <Avatar
                            variant="rounded"
                            src={productImageUrl}
                            alt={line.selectedProduct?.label || "Producto"}
                            sx={{
                              width: { xs: 60, sm: 70 },
                              height: { xs: 60, sm: 70 },
                              m: "auto",
                              borderRadius: 1.5,
                              border: "1px solid #eee",
                            }}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                          <Grid2 container spacing={1.5} alignItems="center">
                            <Grid2 size={{ xs: 12, md: 6 }}>
                              <Autocomplete
                                fullWidth
                                options={artOptions}
                                value={
                                  line.selectedArt
                                    ? line.selectedArt
                                    : line.item?.art?.title
                                }
                                onChange={(e, v) =>
                                  handleArtSelection(
                                    line.tempId,
                                    v as ArtOption
                                  )
                                }
                                disabled={isSubmitting}
                                renderOption={(props, option) => (
                                  <Box
                                    component="li"
                                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                                    {...props}
                                    key={
                                      typeof option === "object"
                                        ? option.id
                                        : index + 1000
                                    }
                                  >
                                    <Avatar
                                      variant="rounded"
                                      src={
                                        typeof option === "object"
                                          ? option.thumb
                                          : favicon
                                      }
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        mr: 1,
                                        border: "1px solid lightgrey",
                                      }}
                                    />
                                    {typeof option === "object"
                                      ? option.label
                                      : option}
                                  </Box>
                                )}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    label="Arte"
                                    helperText={
                                      line.selectedArt?.fullArt.prixerUsername
                                        ? `Artista: ${line.selectedArt.fullArt.prixerUsername}`
                                        : ""
                                    }
                                  />
                                )}
                              />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                              <Autocomplete
                                fullWidth
                                options={productOptions}
                                value={line.selectedProduct}
                                onChange={(e, v) =>
                                  handleProductSelection(line.tempId, v)
                                }
                                disabled={isSubmitting}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    label="Producto *"
                                    required
                                  />
                                )}
                              />
                            </Grid2>
                          </Grid2>
                          <Grid2
                            container
                            spacing={1.5}
                            alignItems="center"
                            sx={{ mt: 1 }}
                          >
                            <Grid2 size={{ xs: 12, md: 6 }}>
                              <Autocomplete
                                fullWidth
                                options={line.availableVariants}
                                value={line.selectedVariant}
                                onChange={(e, v) =>
                                  handleVariantSelection(line.tempId, v)
                                }
                                disabled={
                                  isSubmitting ||
                                  !line.selectedProduct ||
                                  !line.availableVariants.length
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    label="Variante *"
                                    required={
                                      !!(
                                        line.selectedProduct &&
                                        line.availableVariants.length > 0
                                      )
                                    }
                                    helperText={
                                      line.availableVariants.length === 0 &&
                                      line.selectedProduct
                                        ? "Sin variantes"
                                        : ""
                                    }
                                  />
                                )}
                              />
                            </Grid2>
                            <Grid2 size={{ xs: 6, md: 3 }}>
                              <TextField
                                label="Cant."
                                type="number"
                                value={line.quantity || 1}
                                onChange={(e) =>
                                  handleQuantityChange(line.tempId, e)
                                }
                                required
                                fullWidth
                                size="small"
                                disabled={isSubmitting}
                                inputProps={{ min: 1 }}
                              />
                            </Grid2>
                            <Grid2
                              size={{ xs: 6, md: 3 }}
                              sx={{ textAlign: "right" }}
                            >
                              {permissions?.area === "Master" ? (
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  type="text"
                                  label="Precio unitario"
                                  // defaultValue={(line.pricePerUnit || 0).toFixed(2)}
                                  value={(line.pricePerUnit || 0).toFixed(2)}
                                  onChange={(e) =>
                                    handlePricePerUnitChange(e, line)
                                  }
                                  onKeyDown={allowNumericWithDecimal}
                                  sx={{
                                    mb: 1,
                                    "& .MuiInputBase-input": {
                                      textAlign: "right",
                                    },
                                  }}
                                  slotProps={{
                                    input: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          $
                                        </InputAdornment>
                                      ),
                                    },
                                  }}
                                />
                              ) : (
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
                              )}
                              <Typography
                                variant="subtitle2"
                                color="primary.main"
                              >
                                $
                                {(
                                  (line.quantity || 0) *
                                  (line?.pricePerUnit
                                    ? Number(line?.pricePerUnit)
                                    : 0)
                                ).toFixed(2)}
                              </Typography>
                            </Grid2>
                          </Grid2>
                        </Grid2>
                      </Grid2>
                      <Box sx={{ mt: 2, borderTop: "1px solid #eee", pt: 2 }}>
                        <Grid2 container spacing={2}>
                          <Grid2 size={{ xs: 12, md: 6 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              gutterBottom
                            >
                              Historial de Estado del Item:
                            </Typography>
                            {line.status && line.status.length > 0 ? (
                              <Timeline
                                position="right"
                                sx={{
                                  p: 0,
                                  "& .MuiTimelineOppositeContent-root": {
                                    flex: "0 0 120px",
                                    minWidth: 120,
                                    pr: 1,
                                  },
                                  "& .MuiTimelineContent-root": { pl: 1 },
                                }}
                              >
                                {line.status
                                  .slice()
                                  .sort(
                                    (a, b) =>
                                      new Date(a[1]).getTime() -
                                      new Date(b[1]).getTime()
                                  )
                                  .map(([st, date], idx, arr) => {
                                    const chip = getStatusChipProps(st)
                                    return (
                                      <TimelineItem
                                        key={idx}
                                        sx={{
                                          minHeight: "auto",
                                          mt: idx === 0 ? 0.5 : 0,
                                        }}
                                      >
                                        <TimelineOppositeContent
                                          sx={{ py: 0.2 }}
                                        >
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            {formatDate(date, true)}
                                          </Typography>
                                        </TimelineOppositeContent>
                                        <TimelineSeparator>
                                          <Tooltip title={chip.label}>
                                            <TimelineDot
                                              variant="outlined"
                                              color={chip.color as any}
                                              sx={{ p: 0.3 }}
                                            >
                                              {React.cloneElement(
                                                chip.icon || <InfoIcon />,
                                                { sx: { fontSize: "0.8rem" } }
                                              )}
                                            </TimelineDot>
                                          </Tooltip>
                                          {idx < arr.length - 1 && (
                                            <TimelineConnector
                                              sx={{ minHeight: "10px" }}
                                            />
                                          )}
                                        </TimelineSeparator>
                                        <TimelineContent sx={{ py: 0.2 }}>
                                          <Typography variant="caption">
                                            {chip.label}
                                          </Typography>
                                        </TimelineContent>
                                      </TimelineItem>
                                    )
                                  })}
                              </Timeline>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Sin historial
                              </Typography>
                            )}
                          </Grid2>
                          <Grid2
                            size={{ xs: 12, md: 6 }}
                            sx={{ mt: { xs: 1, md: 0 } }}
                          >
                            <FormControl
                              size="small"
                              fullWidth
                              disabled={isSubmitting}
                            >
                              <InputLabel>Estado Actual Item</InputLabel>
                              <Select
                                value={lineStatus}
                                label="Estado Actual Item"
                                onChange={(e) =>
                                  handleStatusChange(line.tempId, e)
                                }
                              >
                                {Object.values(OrderStatus)
                                  .filter((v) => typeof v === "number")
                                  .map((statusValue) => {
                                    const props = getStatusChipProps(
                                      statusValue as OrderStatus
                                    )
                                    return (
                                      <MenuItem
                                        key={statusValue}
                                        value={statusValue}
                                      >
                                        <Chip
                                          icon={props.icon}
                                          label={props.label}
                                          color={props.color as any}
                                          size="small"
                                          variant="outlined"
                                          sx={{
                                            mr: 1,
                                            borderRadius: "4px",
                                            fontSize: "0.75rem",
                                          }}
                                        />
                                        {props.label}
                                      </MenuItem>
                                    )
                                  })}
                              </Select>
                              {line.status && line.status.length > 0 && (
                                <FormHelperText sx={{ textAlign: "right" }}>
                                  Últ. act:
                                  {formatDate(
                                    line.status[line.status.length - 1][1]
                                  )}
                                </FormHelperText>
                              )}
                            </FormControl>
                          </Grid2>
                        </Grid2>
                      </Box>
                    </CardContent>
                  </Card>
                )
              })}
              <Button
                type="button"
                variant="outlined"
                onClick={handleAddOrderLine}
                disabled={isSubmitting}
                sx={{ mt: 1, mb: 2 }}
              >
                Agregar Item
              </Button>
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
                    `$${(displayTotals?.subTotal ?? order.subTotal).toFixed(2)}`
                  )}
                  {(displayTotals?.discount ?? order.discount)
                    ? renderBasicInfoItem(
                        "summary-discount",
                        null,
                        "Descuento:",
                        <Typography color="error.main">
                          -$
                          {(displayTotals?.discount ?? order.discount)?.toFixed(
                            2
                          )}
                        </Typography>
                      )
                    : null}
                  {(displayTotals?.shippingCost ?? order.shippingCost)
                    ? renderBasicInfoItem(
                        "summary-shipping",
                        null,
                        "Costo de Envío:",
                        `$${(displayTotals?.shippingCost ?? order.shippingCost)?.toFixed(2)}`
                      )
                    : null}
                  {(displayTotals?.taxes ?? order.tax).map((t, idx) =>
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
                      ${(displayTotals?.total ?? order.total).toFixed(2)}
                    </Typography>
                  </ListItem>
                  <ListItem sx={{ px: 0, justifyContent: "space-between" }}>
                    <Typography variant="body2">Items Totales:</Typography>
                    <Typography variant="body2">
                      {displayTotals?.totalUnits ?? order.totalUnits}
                    </Typography>
                  </ListItem>
                </List>
              </Paper>
              {order.consumerDetails && (
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
                    Detalles del Cliente
                  </Typography>
                  {editableClientInfo && (
                    <Stack spacing={2}>
                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                          <TextField
                            name="name"
                            label="Nombre Cliente"
                            value={editableClientInfo.name}
                            onChange={handleClientInfoChange}
                            variant="outlined"
                            size="small"
                            fullWidth
                            disabled={isSubmitting}
                            required
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                          <TextField
                            name="lastName"
                            label="Apellido Cliente"
                            value={editableClientInfo.lastName}
                            onChange={handleClientInfoChange}
                            variant="outlined"
                            size="small"
                            fullWidth
                            disabled={isSubmitting}
                            required
                          />
                        </Grid2>
                      </Grid2>
                      <TextField
                        name="email"
                        label="Email Cliente"
                        type="email"
                        value={editableClientInfo.email || ""}
                        onChange={handleClientInfoChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={isSubmitting}
                      />
                      <TextField
                        name="phone"
                        label="Teléfono Cliente"
                        value={editableClientInfo.phone}
                        onChange={handleClientInfoChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={isSubmitting}
                        required
                      />
                    </Stack>
                  )}
                </Paper>
              )}
              <Paper
                elevation={1}
                sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5, borderRadius: 2 }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                >
                  <LocalShippingOutlined
                    sx={{ mr: 1, color: "primary.main" }}
                  />
                  Envío y Facturación
                </Typography>
                <Autocomplete
                  fullWidth
                  sx={{ mb: 2 }}
                  options={shippingMethodOptions}
                  value={selectedShippingMethod}
                  onChange={handleShippingChange}
                  getOptionLabel={(o) => o.label}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  loading={isLoading && shippingMethodOptions.length === 0}
                  disabled={isSubmitting}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Método de Envío *"
                      required
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoading && !shippingMethodOptions.length ? (
                              <CircularProgress size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="es"
                >
                  <DatePicker
                    sx={{ width: "100%" }}
                    label="Fecha estimada de entrega"
                    value={prefDate}
                    format="DD/MM/YYYY"
                    onChange={(newValue) => setPrefDate(dayjs(newValue))}
                  />
                </LocalizationProvider>
                {!isPickupSelected && (
                  <>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 500, mt: 1, mb: 1 }}
                    >
                      Dirección de Envío *
                    </Typography>
                    {editableShippingAddress && (
                      <EditableAddressForm
                        address={editableShippingAddress}
                        onAddressChange={handleShippingAddressChange}
                        isDisabled={isSubmitting}
                      />
                    )}
                    {!editableShippingAddress?.address?.line1 &&
                      !isPickupSelected && (
                        <FormHelperText error sx={{ mb: 1 }}>
                          La dirección de envío es requerida y debe estar
                          completa.
                        </FormHelperText>
                      )}
                  </>
                )}
                {isPickupSelected && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    El método de envío seleccionado es Recogida en Tienda. No se
                    requiere dirección de envío.
                  </Alert>
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useShippingForBilling}
                      onChange={handleUseShippingForBillingChange}
                      name="useShippingForBilling"
                      disabled={
                        isSubmitting ||
                        isPickupSelected ||
                        !editableShippingAddress?.address?.line1
                      }
                    />
                  }
                  label="Usar para Facturación"
                  sx={{ mt: 1, mb: useShippingForBilling ? 0 : 1 }}
                />
                {!useShippingForBilling && (
                  <>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 500, mt: 2, mb: 1 }}
                    >
                      Dirección de Facturación *
                    </Typography>
                    {editableBillingAddress && (
                      <EditableAddressForm
                        address={editableBillingAddress}
                        onAddressChange={handleBillingAddressChange}
                        isDisabled={isSubmitting}
                      />
                    )}
                    {!editableBillingAddress?.address?.line1 && (
                      <FormHelperText error>
                        La dirección de facturación es requerida y debe estar
                        completa.
                      </FormHelperText>
                    )}
                  </>
                )}
                <Divider sx={{ my: 2 }} />
                <Autocomplete
                  fullWidth
                  sx={{ mb: 1 }}
                  options={paymentMethodOptions}
                  value={selectedPaymentMethod}
                  onChange={handlePaymentChange}
                  getOptionLabel={(o) => o.label}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  loading={isLoading && paymentMethodOptions.length === 0}
                  disabled={isSubmitting}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Método de Pago *"
                      required
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoading && !paymentMethodOptions.length ? (
                              <CircularProgress size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                {selectedPaymentMethod &&
                  (selectedPaymentMethod.fullMethod as PaymentMethod)
                    .instructions && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ ml: 0.5, mb: 1 }}
                    >
                      {
                        (selectedPaymentMethod.fullMethod as PaymentMethod)
                          .instructions
                      }
                    </Typography>
                  )}
              </Paper>

              <Paper
                elevation={1}
                sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5, borderRadius: 2 }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <InfoOutlined sx={{ mr: 1, color: "primary.main" }} />
                  Observaciones del Cliente
                </Typography>
                <TextField
                  name="observations"
                  value={observations}
                  onChange={handleObservationsChange}
                  fullWidth
                  multiline
                  rows={observations.length > 0 ? 8 : 3}
                  disabled={isSubmitting}
                  placeholder="Observaciones ingresadas por el cliente"
                  variant="outlined"
                />
              </Paper>
              {order.seller && (
                <Paper
                  elevation={1}
                  sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", mb: 1 }}
                  >
                    <StorefrontOutlined sx={{ mr: 1, color: "primary.main" }} />
                    Información del Vendedor
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {order.seller}
                  </Typography>
                </Paper>
              )}
            </Grid2>
          </Grid2>
        </CustomTabPanel>
        <CustomTabPanel value={activeStep} index={1}>
          <Box sx={{ mt: 3 }}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: prevPayments.length > 0 ? 1 : 2,
                    minHeight: prevPayments.length > 0 ? "auto" : 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      prevPayments.length > 0 ? "flex-start" : "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {prevPayments.length > 0 ? (
                    prevPayments.map((pay) => (
                      <Box key={pay.id} className={classes.imageGridItem}>
                        {/* Usar clase para tamaño responsivo */}
                        <Box className={classes.imagePreviewItem}>
                          {pay.voucher ? (
                            <img src={pay.voucher} alt="Comprobante" />
                          ) : (
                            <Box
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "grey.200",
                              }}
                            >
                              <BrokenImageIcon
                                sx={{ fontSize: 30, color: "grey.400" }}
                              />
                            </Box>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveVoucherImage(pay.id)}
                            disabled={isSubmitting}
                            sx={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                              backgroundColor: "rgba(255,255,255,0.8)",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,1)",
                              },
                              p: 0.2,
                            }}
                            color="error"
                          >
                            <DeleteIcon sx={{ fontSize: "1rem" }} />
                          </IconButton>
                          <Grid2 size={{ xs: 12 }}>
                            <Typography color="secondary">
                              Método de pago: {pay.method?.name}
                            </Typography>
                            <Typography color="secondary">
                              Monto: {pay.amount}
                            </Typography>
                            <Typography color="secondary">
                              Descripción: {pay.description}
                            </Typography>
                          </Grid2>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      sx={{ color: "text.secondary", fontStyle: "italic" }}
                    >
                      No se han cargado comprobantes de pago aún.
                    </Typography>
                  )}
                </Paper>
                {paymentVouchers.length < 6 && ( // Solo mostrar si no se ha alcanzado el límite
                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ margin: 2 }}
                      color="secondary"
                    >
                      Añadir Nuevo Comprobante
                    </Typography>
                    <Grid2 container spacing={3}>
                      {/* Columna para la carga de imagen */}
                      <Grid2 size={{ xs: 12, md: 4 }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            minHeight: 200,
                          }}
                        >
                          {currentVoucherImage ? (
                            <Box
                              sx={{ mb: 2, width: "100%", textAlign: "center" }}
                            >
                              <img
                                src={currentVoucherImage.url}
                                alt="Previsualización"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: 150,
                                  objectFit: "contain",
                                }}
                              />
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ mt: 0.5 }}
                              >
                                {currentVoucherImage?.file?.name.slice(12)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              sx={{
                                color: "text.secondary",
                                fontStyle: "italic",
                                mb: 2,
                              }}
                            >
                              Sube una imagen del comprobante.
                            </Typography>
                          )}
                          <Grid2 size={{ xs: 12 }} sx={{ margin: "40px auto" }}>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={handleVoucherImageSelect}
                              style={{ display: "none" }}
                              id="voucher-image-input"
                              disabled={
                                isSubmitting || paymentVouchers.length >= 6
                              }
                            />
                            <label htmlFor="voucher-image-input">
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={<PhotoCameraBackIcon />}
                                disabled={
                                  isSubmitting || paymentVouchers.length >= 6
                                }
                                fullWidth
                              >
                                Añadir Comprobante
                              </Button>
                            </label>
                            {/* {paymentVouchers.length >= 6 && (
                    <FormHelperText sx={{ textAlign: "center" }}>
                      Límite alcanzado
                    </FormHelperText>
                  )}*/}
                          </Grid2>
                          {/* <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleNewVoucherImageSelect} // Nueva función para la imagen actual
                style={{ display: 'none' }}
                id="new-voucher-image-input"
                disabled={isSubmitting}
              />
              <label htmlFor="new-voucher-image-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraBackIcon />}
                  disabled={isSubmitting}
                  fullWidth
                >
                  {currentVoucherImage ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                </Button>
              </label> */}
                        </Paper>
                      </Grid2>

                      {/* Columna para los inputs de descripción, monto y método */}
                      <Grid2 size={{ xs: 12, md: 8 }}>
                        <Stack spacing={2}>
                          <TextField
                            label="Descripción"
                            variant="outlined"
                            fullWidth
                            value={currentDescription}
                            onChange={(e) =>
                              setCurrentDescription(e.target.value)
                            }
                            disabled={isSubmitting}
                          />
                          <TextField
                            label="Monto (ej. 150.00)"
                            variant="outlined"
                            fullWidth
                            type="number"
                            value={currentAmount}
                            onChange={(e) =>
                              setCurrentAmount(Number(e.target.value))
                            }
                            disabled={isSubmitting}
                            // InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} // Opcional
                          />
                          <FormControl
                            fullWidth
                            variant="outlined"
                            disabled={isSubmitting}
                          >
                            <InputLabel id="payment-method-label">
                              Método de Pago
                            </InputLabel>
                            <Select
                              labelId="payment-method-label"
                              value={currentMethod}
                              onChange={(e) =>
                                handleSelectedMethod(e.target.value)
                              }
                              label="Método de Pago"
                            >
                              {paymentMethodOptions.map((method) => (
                                <MenuItem key={method.id} value={method.id}>
                                  {method.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddCircleOutline />}
                            onClick={handleAddPaymentVoucher} // Nueva función para añadir el comprobante actual a la lista paymentVouchers
                            disabled={
                              isSubmitting ||
                              !currentVoucherImage ||
                              !currentDescription ||
                              !currentAmount ||
                              !currentMethod
                            }
                            sx={{ alignSelf: "flex-start" }} // Para que el botón no ocupe todo el ancho
                          >
                            Añadir este Comprobante
                          </Button>
                        </Stack>
                      </Grid2>
                    </Grid2>
                  </Box>
                )}
                {paymentVouchers.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      textAlign: "right",
                      width: "100%",
                      display: "block",
                      pr: 1,
                      mt: 0.5,
                    }}
                  >
                    {paymentVouchers.length}/6
                  </Typography>
                )}
              </Grid2>
            </Grid2>
          </Box>
        </CustomTabPanel>
        <CustomTabPanel value={activeStep} index={2}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead
                sx={{ backgroundColor: (theme) => theme.palette.action.hover }}
              >
                <TableRow>
                  <TableCell align="center">Fecha</TableCell>
                  <TableCell align="center">Descripción</TableCell>
                  <TableCell align="center">Autor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order?.history &&
                  order?.history.length > 0 &&
                  order.history.map((mov) => (
                    <TableRow
                    // style={{
                    //   display: "flex",
                    //   justifyContent: "space-between",
                    // }}
                    >
                      <TableCell align="center">
                        <Typography style={{ fontSize: "14px" }}>
                          {new Date(mov.timestamp)
                            .toLocaleString("en-GB", {
                              timeZone: "UTC",
                            })
                            .slice(0, 10)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography style={{ fontSize: "14px" }}>
                          <div data-color-mode="light">
                            <MDEditor.Markdown source={mov.description} />
                          </div>
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography
                          style={{
                            fontSize: "14px",
                          }}
                        >
                          {mov.user}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>

        {errorSubmit && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errorSubmit}
          </Alert>
        )}
      </form>

      {imageSrcForCropper &&
        imageToCropDetails &&
        imageToCropDetails.targetType === "paymentVoucher" && (
          <Dialog
            open={cropModalOpen}
            onClose={closeAndResetCropper}
            maxWidth="lg"
            PaperProps={{
              sx: { minWidth: { xs: "90vw", sm: "70vw", md: "50vw" } },
            }}
          >
            <DialogTitle>
              Recortar Comprobante (Aspecto
              {VOUCHER_IMAGE_ASPECT === 0 ? "Libre" : "Definido"})
            </DialogTitle>
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: { xs: 1, sm: 2 },
              }}
            >
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={
                  VOUCHER_IMAGE_ASPECT > 0 ? VOUCHER_IMAGE_ASPECT : undefined
                }
                minWidth={100}
                minHeight={100}
                keepSelection
              >
                <img
                  alt="Recortar Comprobante"
                  src={imageSrcForCropper}
                  onLoad={onVoucherImageLoadInCropper}
                  style={{
                    maxHeight: "70vh",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                />
              </ReactCrop>
              <canvas ref={previewCanvasRef} style={{ display: "none" }} />
            </DialogContent>
            <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
              <Button onClick={closeAndResetCropper} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmVoucherCropAndUpload}
                variant="contained"
                disabled={
                  !completedCrop?.width ||
                  !completedCrop?.height ||
                  isSubmitting
                }
              >
                Confirmar y Subir Comprobante
              </Button>
            </DialogActions>
          </Dialog>
        )}
    </Container>
  )
}
