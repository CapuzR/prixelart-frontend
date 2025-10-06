import React, {
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"
import Grid2 from "@mui/material/Grid"
import { v4 as uuidv4 } from "uuid"
import favicon from "../../../../../images/favicon.png"

import { useSnackBar } from "context/GlobalContext"
import {
  fetchShippingMethods,
  readAllPaymentMethods,
  createOrder,
} from "@api/order.api"
import { fetchActiveProducts } from "@api/product.api"
import { getArts } from "@api/art.api"

import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { createFilterOptions } from "@mui/material/Autocomplete"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import DeleteIcon from "@mui/icons-material/Delete"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined"
import ReceiptOutlined from "@mui/icons-material/ReceiptOutlined"
import PersonOutline from "@mui/icons-material/PersonOutline"
import InfoOutlined from "@mui/icons-material/InfoOutlined"

import EditableAddressForm from "./components/EditableAddressForm"
import Title from "@apps/admin/components/Title"

// Types
import {
  Address,
  BasicInfo,
  BillingDetails,
  ConsumerDetails,
  CustomImage,
  GlobalPaymentStatus,
  Order,
  OrderLine,
  OrderStatus,
  Payment,
  PaymentDetails,
  PaymentMethod,
  ShippingDetails,
  ShippingMethod,
  Tax,
} from "types/order.types"
import { Product, Variant } from "types/product.types"
import { Art } from "types/art.types"
import { UserOptions } from "types/user.types"
import dayjs, { Dayjs } from "dayjs"
import "dayjs/locale/es"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { getUsers } from "@api/user.api"
// --- Helper Interfaces ---
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
interface PrixerOption {
  id: string
  label: string
  username: string
  // fullData: Prixer
}
interface VariantOption {
  id: string
  label: string
  fullVariant: Variant
}

interface OrderLineFormState extends Partial<OrderLine> {
  tempId: string
  selectedPrixer: PrixerOption | null
  selectedArt: ArtOption | null
  selectedProduct: ProductOption | null
  selectedVariant: VariantOption | null
  availableVariants: VariantOption[]
  quantity: number
  pricePerUnit: number
}

interface EditablePriceFieldsProps {
  line: OrderLineFormState
  updateLine: (tempId: string, values: Partial<OrderLineFormState>) => void
}

dayjs.locale("es")

const initialLine: Omit<OrderLineFormState, "tempId"> = {
  selectedPrixer: null,
  selectedArt: null,
  selectedProduct: null,
  selectedVariant: null,
  availableVariants: [],
  quantity: 1,
  pricePerUnit: 0,
}

const formatDate = (
  date: Date | string | undefined,
  includeTime: boolean = true
) => {
  if (!date) return "N/A"
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  if (includeTime) {
    opts.hour = "2-digit"
    opts.minute = "2-digit"
  }
  return new Date(date).toLocaleDateString("es-ES", opts)
}

const CreateOrder: React.FC = () => {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()

  // --- Form State ---
  const [observations, setObservations] = useState<string>("")
  const [editableClientInfo, setEditableClientInfo] = useState<BasicInfo>({
    name: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [shippingMethod, setShippingMethod] = useState<MethodOption | null>(
    null
  )
  const [paymentMethod, setPaymentMethod] = useState<MethodOption | null>(null)
  const [useBasicForShipping, setUseBasicForShipping] = useState<boolean>(false)
  const [useShippingForBilling, setUseShippingForBilling] =
    useState<boolean>(true)

  const [shippingMethodOptions, setShippingMethodOptions] = useState<
    MethodOption[]
  >([])
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<
    MethodOption[]
  >([])

  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [artOptions, setArtOptions] = useState<ArtOption[]>([])
  const [prixerOptions, setPrixerOptions] = useState<PrixerOption[]>([])
  const [userOptions, setUserOptions] = useState<UserOptions[]>([])
  const [orderLines, setOrderLines] = useState<OrderLineFormState[]>([
    { ...initialLine, tempId: uuidv4() },
  ])
  const [prefDate, setPrefDate] = useState<Dayjs>(dayjs())

  const [editableShippingAddress, setEditableShippingAddress] =
    useState<Address | null>(null)
  const [editableBillingAddress, setEditableBillingAddress] =
    useState<Address | null>(null)

  const [displayTotals, setDisplayTotals] = useState<{
    subTotal: number
    discount: number
    shippingCost: number
    taxes: Tax[]
    total: number
    totalUnits: number
  } | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorFetch, setErrorFetch] = useState<string | null>(null)
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null)

  const handleAutocompleteChange = (
    event: React.SyntheticEvent,
    newValue: UserOptions | string | null
  ) => {
    if (typeof newValue === "string") {
      setEditableClientInfo({
        name: newValue,
        lastName: "",
        email: "",
        phone: "",
      })
    } else if (newValue) {
      setEditableClientInfo({
        name: newValue.firstName || "",
        lastName: newValue.lastName || "",
        email: newValue.email || "",
        phone: newValue.phone || "",
      })
      const shippingAddr: Address | null = newValue.shippingAddress
        ? {
            recepient: {
              name: newValue.firstName || "",
              lastName: newValue.lastName || "",
              email: newValue.email || "",
              phone: newValue.phone || "",
            },
            address: {
              line1: newValue.shippingAddress,
              line2: "",
              reference: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
          }
        : createBlankAddress()

      const billingAddr: Address | null = newValue.billingAddress
        ? {
            recepient: {
              name: newValue.firstName || "",
              lastName: newValue.lastName || "",
              email: newValue.email || "",
              phone: newValue.phone || "",
            },
            address: {
              line1: newValue.billingAddress,
              line2: "",
              reference: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
          }
        : createBlankAddress()

      setEditableShippingAddress(shippingAddr)
      setEditableBillingAddress(billingAddr)
    } else {
      setEditableClientInfo({ name: "", lastName: "", email: "", phone: "" })
      setEditableShippingAddress(createBlankAddress())
      setEditableBillingAddress(createBlankAddress())
    }
  }

  const filter = createFilterOptions<UserOptions>()

  const handleInputChange = (
    event: React.SyntheticEvent,
    newInputValue: string
  ) => {
    setEditableClientInfo((prev) => ({
      ...prev,
      name: newInputValue,
    }))
  }

  const isPickupSelected = useMemo(() => {
    if (!shippingMethod) return false
    const name =
      (shippingMethod.fullMethod as ShippingMethod).name?.toLowerCase() || ""
    return name.includes("pickup") || name.includes("recoger")
  }, [shippingMethod])

  useEffect(() => {
    if (isPickupSelected) {
      setUseShippingForBilling(false)
    }
  }, [isPickupSelected])

  // --- Create Blank Address Helper ---
  const createBlankAddress = useCallback(
    (): Address => ({
      recepient: { ...editableClientInfo },
      address: {
        line1: "",
        line2: "",
        reference: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      },
    }),
    [editableClientInfo]
  )

  // --- Load Options ---
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorFetch(null)
    try {
      const [shippingMethods, paymentMethods, products, arts, clients] =
        await Promise.all([
          fetchShippingMethods(),
          readAllPaymentMethods(),
          fetchActiveProducts("A-Z"),
          getArts(),
          getUsers(),
        ])

      setShippingMethodOptions(
        shippingMethods
          .filter((s) => s.active)
          .map((s) => ({
            id: s._id!.toString(),
            label: `${s.name} ($${s.price})`,
            fullMethod: s,
          }))
      )
      setPaymentMethodOptions(
        paymentMethods
          .filter((p) => p.active)
          .map((p) => ({ id: p._id!.toString(), label: p.name, fullMethod: p }))
      )
      setProductOptions(
        products.map((p) => ({
          id: p._id!.toString(),
          label: p.name,
          fullProduct: p,
        }))
      )

      const reducedUsers: UserOptions[] = clients.map((user) => ({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        shippingAddress: user.shippingAddress,
        billingAddress: user.billingAddress,
      }))

      setUserOptions(reducedUsers)

      const existingArts = arts.map((a) => ({
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
      customImageOptions.unshift(genericCustom)
      setArtOptions([...existingArts, ...customImageOptions])

      const onlyPrixersv2: PrixerOption[] = onlyPrixers.map((prixer, i) => {
        return {
          id: (1000 + i).toString(),
          label: prixer,
          username: prixer,
        }
      })
      setPrixerOptions(onlyPrixersv2)

      setEditableShippingAddress(createBlankAddress())
      setEditableBillingAddress(createBlankAddress())
    } catch (err: any) {
      console.error(err)
      setErrorFetch("Error cargando datos.")
      showSnackBar("Error cargando datos.")
    } finally {
      setIsLoading(false)
    }
  }, [showSnackBar])

  useEffect(() => {
    loadData()
  }, [])

  // --- Totals Calculation ---
  useEffect(() => {
    const sub = orderLines.reduce(
      (sum, l) => sum + (l.pricePerUnit || 0) * (l.quantity || 0),
      0
    )
    const ship = shippingMethod
      ? parseFloat((shippingMethod.fullMethod as ShippingMethod).price)
      : 0
    const disc = 0
    const base = sub - disc + ship
    const taxes: Tax[] = []
    const computed: Tax[] = taxes.map((t) => ({
      ...t,
      amount: base > 0 ? parseFloat((base * (t.value / 100)).toFixed(2)) : 0,
    }))
    const totalTax = computed.reduce((s, t) => s + t.amount, 0)
    setDisplayTotals({
      subTotal: sub,
      discount: disc,
      shippingCost: ship,
      taxes: computed,
      total: sub - disc + ship + totalTax,
      totalUnits: orderLines.reduce((u, l) => u + (l.quantity || 0), 0),
    })

    const newPrefDate = calculatePreferredDate(orderLines)
    setPrefDate(newPrefDate)
  }, [orderLines, shippingMethod])

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

  useEffect(() => {
    const sub = orderLines.reduce(
      (sum, l) => sum + (l.pricePerUnit || 0) * (l.quantity || 0),
      0
    )
    const ship = shippingMethod
      ? parseFloat((shippingMethod.fullMethod as ShippingMethod).price)
      : 0
    const disc = 0
    const base = sub - disc + ship

    // — build the two taxes we always need —
    const taxesToApply: Tax[] = [{ name: "IVA", value: 16, amount: 0 }]

    // — compute each tax amount off the same base —
    const computedTaxes = taxesToApply.map((t) => ({
      ...t,
      amount: base > 0 ? parseFloat(((base * t.value) / 100).toFixed(2)) : 0,
    }))

    const totalTax = computedTaxes.reduce((sum, t) => sum + t.amount, 0)

    setDisplayTotals({
      subTotal: sub,
      discount: disc,
      shippingCost: ship,
      taxes: computedTaxes,
      total: base + totalTax,
      totalUnits: orderLines.reduce((u, l) => u + (l.quantity || 0), 0),
    })
  }, [orderLines, shippingMethod, paymentMethod])

  // --- Line Handlers ---
  const handleAddLine = () =>
    setOrderLines((prev) => [...prev, { ...initialLine, tempId: uuidv4() }])

  const handleRemoveLine = (tempId: string) =>
    setOrderLines((prev) => prev.filter((l) => l.tempId !== tempId))

  const updateLine = (tempId: string, values: Partial<OrderLineFormState>) => {
    setOrderLines((prev) =>
      prev.map((l) => (l.tempId === tempId ? { ...l, ...values } : l))
    )
  }

  const handlePrixer = (tempId: string, v: PrixerOption | null) => {
    updateLine(tempId, { selectedPrixer: v })
    if (v !== null) filterArts(v.username)
  }

  const filterArts = (prixer: string) => {
    const artsV1 = artOptions.filter(
      (art) => art.fullArt.prixerUsername === prixer
    )
    return artsV1
  }

  const handleArt = (tempId: string, v: ArtOption | null) =>
    updateLine(tempId, { selectedArt: v })

  const handleProduct = (tempId: string, v: ProductOption | null) => {
    const variants = v?.fullProduct.variants || []
    const opts = variants.map((vt) => ({
      id: vt._id!,
      label: vt.name,
      fullVariant: vt,
    }))
    const price = parseFloat(v?.fullProduct.cost || "0")
    updateLine(tempId, {
      selectedProduct: v,
      availableVariants: opts,
      selectedVariant: null,
      pricePerUnit: price,
    })
  }

  const handleVariant = (tempId: string, v: VariantOption | null) => {
    const price = parseFloat(v?.fullVariant.publicPrice || "0")
    updateLine(tempId, { selectedVariant: v, pricePerUnit: price })
  }
  const handleQty = (
    lineTempId: string,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const q = parseInt(event.target.value, 10) || 1
    updateLine(lineTempId, { quantity: q })
  }

  // --- Other Handlers ---
  const handleShipChange = (_: SyntheticEvent, v: MethodOption | null) =>
    setShippingMethod(v)
  const handlePayChange = (_: SyntheticEvent, v: MethodOption | null) =>
    setPaymentMethod(v)
  const handleObs = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setObservations(e.target.value)
  const handleClientChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditableClientInfo((prev) => ({ ...prev, [name]: value }))
  }
  const handleShipAddrChange = (addr: Address) =>
    setEditableShippingAddress(addr)
  const handleBillAddrChange = (addr: Address) =>
    setEditableBillingAddress(addr)
  const handleUseShipBill = (e: ChangeEvent<HTMLInputElement>) => {
    setUseShippingForBilling(e.target.checked)
    if (e.target.checked && editableShippingAddress)
      setEditableBillingAddress(editableShippingAddress)
  }
  const handleUseBasicShip = (e: ChangeEvent<HTMLInputElement>) => {
    setUseBasicForShipping(e.target.checked)
    if (e.target.checked && editableShippingAddress) {
      setEditableShippingAddress((prevState) =>
        !prevState
          ? prevState
          : {
              ...prevState,
              recepient: {
                ...prevState.recepient,
                name: editableClientInfo.name,
                lastName: editableClientInfo.lastName,
                email: editableClientInfo.email,
                phone: editableClientInfo.phone,
              },
            }
      )
    } else if (!e.target.checked) {
      setEditableShippingAddress((prevState) =>
        !prevState
          ? prevState
          : {
              ...prevState,
              recepient: {
                ...prevState.recepient,
                name: "",
                lastName: "",
                email: "",
                phone: "",
              },
            }
      )
    }
  }

  const handlePricePerUnitChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    line: any
  ) => {
    updateLine(line.tempId, { pricePerUnit: parseFloat(event.target.value) })
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
  // --- Validation ---
  const validateForm = (): boolean => {
    if (!shippingMethod) {
      showSnackBar("Método envío requerido.")
      return false
    }
    if (!paymentMethod) {
      showSnackBar("Método pago requerido.")
      return false
    }
    if (!useShippingForBilling && !editableBillingAddress?.address.line1) {
      showSnackBar("Dirección facturación incompleta.")
      return false
    }
    if (!isPickupSelected && !editableShippingAddress?.address.line1) {
      showSnackBar("Dirección envío incompleta.")
      return false
    }
    for (const [i, line] of orderLines.entries()) {
      if (!line.selectedProduct) {
        showSnackBar(`Item #${i + 1}: producto requerido.`)
        return false
      }
      if (
        line.selectedProduct.fullProduct.variants!.length > 0 &&
        !line.selectedVariant
      ) {
        showSnackBar(`Item #${i + 1}: variante requerida.`)
        return false
      }
      if (!line.quantity || line.quantity < 1) {
        showSnackBar(`Item #${i + 1}: cantidad inválida.`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    setErrorSubmit(null)
    if (
      !editableClientInfo ||
      !shippingMethod ||
      !paymentMethod ||
      !displayTotals ||
      !editableShippingAddress
    ) {
      showSnackBar(
        "Error: Faltan datos esenciales (cliente, envío, pago, dirección o totales)."
      )
      setIsSubmitting(false)
      return
    }

    if (!isPickupSelected && !editableShippingAddress?.address?.line1) {
      showSnackBar("Error: Dirección de envío requerida.")
      setIsSubmitting(false)
      return
    }

    if (!useShippingForBilling && !editableBillingAddress?.address?.line1) {
      showSnackBar("Error: Dirección de facturación requerida.")
      setIsSubmitting(false)
      return
    }

    try {
      const consumerDetails: ConsumerDetails = {
        basic: editableClientInfo,
        selectedAddress: editableShippingAddress.address,
        addresses: [editableShippingAddress],
        paymentMethods: [paymentMethod.fullMethod as PaymentMethod],
      }

      const mainPayment: Payment = {
        id: uuidv4(),
        createdOn: new Date(),
        description: paymentMethod.label || "Pago Principal",
        method: paymentMethod.fullMethod as PaymentMethod,
        amount: displayTotals.total.toString(),
        voucher: undefined,
      }

      const paymentDetails: PaymentDetails = {
        status: [[GlobalPaymentStatus.Pending, new Date()]],
        total: displayTotals.total,
        payment: [],
      }

      const finalShippingAddress = isPickupSelected
        ? createBlankAddress()
        : editableShippingAddress

      const shippingDetails: ShippingDetails = {
        method: shippingMethod.fullMethod as ShippingMethod,
        country: finalShippingAddress.address.country,
        address: finalShippingAddress,
        preferredDeliveryDate: prefDate ? prefDate.toDate() : new Date(),
      }

      const billingDetails: BillingDetails = {
        billTo: useShippingForBilling
          ? finalShippingAddress.recepient
          : editableBillingAddress
            ? editableBillingAddress.recepient
            : editableClientInfo,
        address: useShippingForBilling
          ? finalShippingAddress
          : editableBillingAddress || createBlankAddress(),
      }

      const lines: OrderLine[] = orderLines.map((l) => {
        if (!l.selectedProduct) {
          throw new Error(
            "Error interno: Producto no seleccionado en una línea."
          )
        }

        return {
          id: uuidv4(),
          item: {
            sku: `${l.selectedProduct.id}-${l.selectedVariant?.id || "novar"}-${l.selectedArt?.id || "noart"}`,
            art: l.selectedArt
              ? (() => {
                  const fullArt = l.selectedArt.fullArt
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
              _id: l.selectedProduct.fullProduct._id,
              name: l.selectedProduct.fullProduct.name,
              productionTime: l.selectedProduct.fullProduct.productionTime,
              sources: l.selectedProduct.fullProduct.sources,
              variants: l.selectedProduct.fullProduct.variants,
              selection: l.selectedVariant?.fullVariant.attributes || [],
              mockUp: l.selectedProduct.fullProduct.mockUp,
            },
            price: l.pricePerUnit.toString(),
          },
          quantity: l.quantity,
          pricePerUnit: l.pricePerUnit,
          subtotal: l.pricePerUnit * l.quantity,
          status: [[OrderStatus.Pending, new Date()]],
        }
      })

      const payload: Order = {
        lines,
        consumerDetails,
        payment: paymentDetails,
        shipping: shippingDetails,
        billing: billingDetails,
        createdOn: new Date(),
        createdBy: "Admin Panel", // O el usuario logueado
        totalUnits: displayTotals.totalUnits,
        status: [[OrderStatus.Pending, new Date()]],
        // paymentStatus: [[0, new Date()]], // Asumiendo que GlobalPaymentStatus.Pending es 0
        subTotal: displayTotals.subTotal,
        shippingCost: displayTotals.shippingCost,
        tax: displayTotals.taxes,
        totalWithoutTax: displayTotals.subTotal,
        total: displayTotals.total,
        observations: observations || undefined,
      }

      await createOrder(payload as Order)
      showSnackBar("Orden creada exitosamente.")
      navigate("/admin/orders/read")
    } catch (err: any) {
      console.error("Error al crear la orden:", err)
      const errorMsg = err.message || "Error al crear la orden."
      setErrorSubmit(errorMsg)
      showSnackBar(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => navigate("/admin/orders/read")

  // --- Render ---
  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    )
  if (errorFetch)
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {errorFetch}
        <Button onClick={loadData} size="small">
          Reintentar
        </Button>
      </Alert>
    )

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Title title="Crear Nueva Orden" />
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={{ xs: 2, md: 3 }}>
          {/* Left pane: Order Lines */}
          <Grid2 size={{ xs: 12, lg: 7 }}>
            <Typography variant="h5" gutterBottom>
              Artículos del Pedido
            </Typography>
            {orderLines.map((line, index) => (
              <Card
                key={line.tempId}
                sx={{ mb: 2.5, borderRadius: 2, boxShadow: 2 }}
              >
                <CardHeader
                  title={`Item #${index + 1}`}
                  action={
                    <IconButton
                      onClick={() => handleRemoveLine(line.tempId)}
                      disabled={isSubmitting || orderLines.length <= 1}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                />
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Grid2 container spacing={2} alignItems="flex-start">
                    <Grid2
                      size={{ xs: 12, sm: "auto" }}
                      sx={{ textAlign: "center", mb: { xs: 1, sm: 0 } }}
                    >
                      <Avatar
                        variant="rounded"
                        src={
                          line.selectedProduct?.fullProduct.sources?.images?.[0]
                            ?.url
                        }
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

                    <Grid2 size={{ xs: 12, sm: 10 }}>
                      <Grid2 container spacing={1.5} alignItems="center">
                        <Grid2 size={{ xs: 12 }}>
                          <Grid2
                            container
                            spacing={1}
                            alignItems="center"
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              alignItems: "top",
                            }}
                          >
                            <Autocomplete
                              options={productOptions}
                              value={line.selectedProduct}
                              onChange={(e, v) => handleProduct(line.tempId, v)}
                              disabled={isSubmitting}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  label="Producto"
                                />
                              )}
                            />
                            <Autocomplete
                              options={line.availableVariants}
                              value={line.selectedVariant}
                              onChange={(e, v) => handleVariant(line.tempId, v)}
                              disabled={
                                !line.availableVariants.length || isSubmitting
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  label="Variante"
                                  helperText={
                                    !line.availableVariants.length
                                      ? "Sin variantes"
                                      : ""
                                  }
                                />
                              )}
                            />
                          </Grid2>
                        </Grid2>
                        {/* Arte */}
                        <Grid2 size={{ xs: 12 }}>
                          <Grid2
                            container
                            spacing={1}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              alignItems: "top",
                            }}
                          >
                            <Autocomplete
                              fullWidth
                              options={prixerOptions}
                              value={line.selectedPrixer}
                              onChange={(e, v) => handlePrixer(line.tempId, v)}
                              disabled={isSubmitting}
                              renderOption={(props, op) => (
                                <Box component="li" {...props}>
                                  <Avatar
                                    variant="rounded"
                                    src={line?.selectedArt?.thumb}
                                    sx={{
                                      mr: 1,
                                      width: 24,
                                      height: 24,
                                      border: "1px solid lightgrey",
                                    }}
                                  />
                                  {op.label}
                                </Box>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  label="Prixer"
                                />
                              )}
                            />
                            <Autocomplete
                              fullWidth
                              options={
                                line.selectedPrixer !== null
                                  ? filterArts(line.selectedPrixer.username)
                                  : artOptions
                              }
                              value={line.selectedArt}
                              onChange={(e, v) => handleArt(line.tempId, v)}
                              disabled={isSubmitting}
                              renderOption={(props, op) => (
                                <Box component="li" {...props} key={op.id}>
                                  <Avatar
                                    variant="rounded"
                                    src={op.thumb}
                                    sx={{
                                      mr: 1,
                                      width: 24,
                                      height: 24,
                                      border: "1px solid lightgrey",
                                    }}
                                  />
                                  {op.label}
                                </Box>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  label="Arte"
                                />
                              )}
                            />
                          </Grid2>
                        </Grid2>
                        <Grid2
                          size={{ xs: 6 }}
                          sx={{ display: "flex", flexDirection: "row" }}
                        >
                          <Grid2
                            container
                            spacing={1}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              alignItems: "top",
                            }}
                          >
                            <TextField
                              label="Cant."
                              type="number"
                              value={line.quantity}
                              onChange={(e) => handleQty(line.tempId, e)}
                              fullWidth
                              size="small"
                              disabled={isSubmitting}
                              inputProps={{ min: 1 }}
                            />
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
                          </Grid2>
                        </Grid2>
                      </Grid2>
                    </Grid2>
                  </Grid2>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddLine}
              disabled={isSubmitting}
              sx={{ mt: 1, mb: 2 }}
            >
              Agregar Item
            </Button>
          </Grid2>

          {/* Right pane: Summary, Shipping & Billing, Client, Observations */}
          <Grid2 size={{ xs: 12, lg: 5 }}>
            <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 2 }} elevation={1}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
              >
                <ReceiptOutlined sx={{ mr: 1 }} />
                Resumen
              </Typography>
              <List dense disablePadding>
                {/* Subtotal */}
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Subtotal:" />
                  <Typography>${displayTotals?.subTotal.toFixed(2)}</Typography>
                </ListItem>

                {/* IVA, IGTF, etc. */}
                {displayTotals?.taxes.map((t, idx) => (
                  <ListItem
                    key={idx}
                    sx={{ px: 0, justifyContent: "space-between" }}
                  >
                    <ListItemText primary={`${t.name} (${t.value}%)`} />
                    <Typography>${t.amount.toFixed(2)}</Typography>
                  </ListItem>
                ))}
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Envío:" />
                  <Typography>${displayTotals?.shippingCost.toFixed(2)}</Typography>
                </ListItem>

                <Divider sx={{ my: 1 }} />

                <ListItem sx={{ px: 0, justifyContent: "space-between" }}>
                  <Typography fontWeight="bold">Total:</Typography>
                  <Typography fontWeight="bold">
                    ${displayTotals?.total.toFixed(2)}
                  </Typography>
                </ListItem>
              </List>
            </Paper>
            <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 2 }} elevation={1}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
              >
                <PersonOutline sx={{ mr: 1 }} />
                Detalles Cliente
              </Typography>
              <Stack spacing={2}>
                <Autocomplete
                  fullWidth
                  freeSolo
                  options={userOptions}
                  value={editableClientInfo.name}
                  onChange={handleAutocompleteChange}
                  onInputChange={handleInputChange}
                  disabled={isSubmitting}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.firstName || ""
                  }
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params)
                    const { inputValue } = params
                    const isExisting = options.some(
                      (option) => inputValue === option.firstName
                    )
                    return filtered
                  }}
                  renderOption={(props, option) => (
                    <li
                      {...props}
                      key={option._id?.toString() || option.firstName}
                    >
                      {option.lastName
                        ? `${option.firstName} ${option.lastName}`
                        : option.firstName}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="name"
                      label="Nombre" // El label ahora es solo "Nombre"
                      size="small"
                      fullWidth
                      required
                      disabled={isSubmitting}
                    />
                  )}
                />
                <TextField
                  name="lastName"
                  label="Apellido"
                  value={editableClientInfo.lastName}
                  onChange={handleClientChange}
                  size="small"
                  fullWidth
                  required
                  disabled={isSubmitting}
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={editableClientInfo.email}
                  onChange={handleClientChange}
                  size="small"
                  fullWidth
                  disabled={isSubmitting}
                />
                <TextField
                  name="phone"
                  label="Teléfono"
                  value={editableClientInfo.phone}
                  onChange={handleClientChange}
                  size="small"
                  fullWidth
                  required
                  disabled={isSubmitting}
                />
              </Stack>
            </Paper>
            <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 2 }} elevation={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useBasicForShipping}
                    onChange={handleUseBasicShip}
                    disabled={isSubmitting}
                  />
                }
                label="Usar Datos Básicos para Envío"
                sx={{ mt: 1, mb: useShippingForBilling ? 0 : 1 }}
              />
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
              >
                <LocalShippingOutlined sx={{ mr: 1 }} />
                Envío
              </Typography>
              <Autocomplete
                fullWidth
                options={shippingMethodOptions}
                value={shippingMethod}
                onChange={handleShipChange}
                disabled={isSubmitting}
                renderInput={(params) => (
                  <TextField {...params} label="Método Envío *" />
                )}
                sx={{ mb: 2 }}
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
              {!isPickupSelected ? (
                <>
                  {editableShippingAddress && (
                    <EditableAddressForm
                      address={editableShippingAddress}
                      onAddressChange={handleShipAddrChange}
                      isDisabled={isSubmitting}
                      basicDisabled={useBasicForShipping}
                    />
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={useShippingForBilling}
                        onChange={handleUseShipBill}
                        disabled={isSubmitting}
                      />
                    }
                    label="Usar Datos de Envío para Facturación"
                    sx={{ mt: 1, mb: useShippingForBilling ? 0 : 1 }}
                  />

                  {!useShippingForBilling && (
                    <>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                      >
                        <ReceiptLongIcon sx={{ mr: 1 }} />
                        Facturación
                      </Typography>
                      {editableBillingAddress && (
                        <EditableAddressForm
                          address={editableBillingAddress}
                          onAddressChange={handleBillAddrChange}
                          isDisabled={isSubmitting}
                        />
                      )}
                    </>
                  )}
                </>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  El método seleccionado es <strong>Recogida en Tienda</strong>.
                  No se requiere dirección de envío, ni facturación.
                </Alert>
              )}
              {/* <FormControlLabel
                control={
                  <Checkbox
                    checked={useShippingForBilling}
                    onChange={handleUseShipBill}
                  />
                }
                label="Usar para Facturación"
                sx={{ mt: 1, mb: useShippingForBilling ? 0 : 1 }}
              />
              {!useShippingForBilling && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Dirección Facturación *
                  </Typography>
                  {editableBillingAddress && (
                    <EditableAddressForm
                      title="Dirección de Facturación"
                      address={editableBillingAddress}
                      onAddressChange={handleBillAddrChange}
                      isDisabled={isSubmitting}
                    />
                  )}
                </>
              )} */}
              <Divider sx={{ my: 2 }} />
              <Autocomplete
                fullWidth
                options={paymentMethodOptions}
                value={paymentMethod}
                onChange={handlePayChange}
                disabled={isSubmitting}
                renderInput={(params) => (
                  <TextField {...params} label="Método Pago *" />
                )}
                sx={{ mb: 1 }}
              />
            </Paper>

            <Paper sx={{ p: 2.5, borderRadius: 2 }} elevation={1}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
              >
                <InfoOutlined sx={{ mr: 1 }} />
                Observaciones
              </Typography>
              <TextField
                name="observations"
                value={observations}
                onChange={handleObs}
                fullWidth
                multiline
                rows={3}
                disabled={isSubmitting}
                placeholder="Observaciones"
              />
            </Paper>
          </Grid2>
        </Grid2>

        {/* Action Buttons */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={2}
          sx={{ mt: 3, mb: 2 }}
        >
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
            startIcon={<CancelIcon />}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
          >
            {isSubmitting ? "Creando Orden..." : "Crear Orden"}
          </Button>
        </Stack>
        {errorSubmit && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errorSubmit}
          </Alert>
        )}
      </form>
    </Container>
  )
}

export default CreateOrder
