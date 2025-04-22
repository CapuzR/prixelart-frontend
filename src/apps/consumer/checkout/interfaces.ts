import { Prixer } from "../../../types/prixer.types"
import { Consumer } from "../../../types/consumer.types"
import { Discount } from "../../../types/discount.types"
import { Organization } from "../../../types/organization.types"
import { Surcharge } from "../../../types/surcharge.types"
import { Cart, Item } from "apps/consumer/cart/interfaces"
export type { Cart }

// Context de Checkout (!)
export interface CheckoutState {
  // billing: any // ???
  activeStep: number
  order: Order
  dataLists: DataLists
  shippingMethods: ShippingMethod[]
  paymentMethods: PaymentMethod[]
  discounts: Discount[]
  surcharges: Surcharge[]
  organizations: Organization[]
  consumers: Consumer[]
  prixers: Prixer[]
  selectedPrixer?: Prixer
  selectedConsumer?: Consumer
}

export interface DataLists {
  shippingMethods: ShippingMethod[]
  paymentMethods: PaymentMethod[]
  countries: {
    code2: string
    code3: string
    name: string
    capital: string
    region: string
    active?: boolean
    subregion: string
    states: {
      code: string
      name: string
      subdivision: string
    }[]
  }[]
  billingStates?: string[]
  shippingStates?: string[]
  sellers: string[]
}

export interface Order {
  _id: string // id  (orderId)
  orderId: string // a simple id for public display
  lines: OrderLine[] // requests
  createdOn: Date
  createdBy: string
  // updates: [Date, string]; // updates when and by whom
  // comissions: Comission[] // TODO: Guardaremos registro en el pedido?
  status: Status // status

  consumerDetails: ConsumerDetails // consumer details (consumerData)
  payment: PaymentDetails
  shipping: ShippingDetails
  billing: BillingDetails

  totalUnits: number

  subTotal: number
  discount?: number
  shippingCost?: number
  tax: Tax[]
  totalWithoutTax: number // Base Imponible
  total: number // Final order total (subTotal + tax + shipping - discount)

  seller?: string
  observations?: string
}

export interface ConsumerDetails {
  basic: BasicInfo
  selectedAddress: BasicAddress
  addresses: Address[]
  type: string
  id?: string
  // paymentMethods?: PaymentMethod[]
}

export interface PaymentDetails {
  methods?: PaymentMethod[]
  payer?: BasicInfo
  address?: Address
  conversionRate?: number
  voucher: string[]
}

// Shipping-related details
export interface ShippingDetails {
  method?: ShippingMethod | string
  basic: BasicInfo
  country?: string
  address?: Address
  shippingDate?: string
  preferredDeliveryDate?: Date
  estimatedShippingDate?: Date
  estimatedDeliveryDate?: Date
}

//TODO : Estandarizar campos fijos como socialReason, countries, states, cities, etc.
export interface BillingDetails {
  method?: string
  basic: BasicInfo
  company?: string
  billTo?: BasicInfo
  address?: Address
  // paymentMethod?: string
}

export interface Address {
  recepient: BasicInfo
  address: BasicAddress
}

export interface BasicAddress {
  line1: string
  line2?: string
  reference?: string
  city: string
  state: string
  country: string
  zipCode?: string
}

export interface BasicInfo {
  id?: string
  name: string
  lastName: string
  email?: string
  phone?: string
  ci?: string
  shortAddress?: string
}

export interface ShippingMethod {
  id: string
  name: string
  price: number
}

enum OrderStatus {
  Pending = 1,
  Processing = 2,
  Shipped = 3,
  Delivered = 4,
  Canceled = 5,
  Returned = 6,
}

export interface PaymentMethod {
  id: string // Unique identifier for the payment method
  name: string // Display name (e.g., 'Credit Card', 'PayPal')
  type?: PaymentMethodType // Type of payment
  provider?: string // Optional, name of the payment provider (e.g., Visa, PayPal)
  token?: string // Encrypted token from the payment gateway (instead of card details)
  lastFourDigits?: string // Optional, last four digits of a card
  metadata?: string
  voucher?: string
}

export enum PaymentMethodType {
  CreditCard = "credit_card",
  PayPal = "paypal",
  BankTransfer = "bank_transfer",
  Cash = "cash",
  Crypto = "crypto",
  Cashea = "cashea",
  Other = "other",
}

interface Status {
  id?: OrderStatus
  name: string
}

export interface Tax {
  id: string
  name: string // Nombre del impuesto (e.g. IVA)
  value: number // Porcentaje
  amount: number // Monto en fiat
}

export interface OrderLine {
  id: string // Unique identifier, same as CartLine
  item: Item // The purchased item, same as CartLine
  quantity: number // Quantity purchased
  pricePerUnit: number // The price of one unit at the time of purchase
  discount?: number // Discount applied to the line
  surcharge?: number
  subtotal: number // Total for the line (quantity * pricePerUnit - discount)
}

//Reducer actions
export type CheckoutAction =
  | { type: "SET_ACTIVE_STEP"; payload: number | "back" | "next" }
  | { type: "RESET_ORDER" }
  // | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SHIPPING_METHODS"; payload: ShippingMethod[] }
  | { type: "SET_PAYMENT_METHODS"; payload: PaymentMethod[] }
  | { type: "SET_CONSUMERS"; payload: Consumer[] }
  | { type: "SET_PRIXERS"; payload: Prixer[] }
  | { type: "SET_SELLERS"; payload: string[] }

  | { type: "SET_EXPANDED_SECTION"; payload: string | false }
  | { type: "ADD_ORDER_LINE"; payload: OrderLine }
  | { type: "REMOVE_ORDER_LINE"; payload: string }
  | { type: "UPDATE_ORDER_LINE"; payload: OrderLine }
  | { type: "DUPLICATE_ORDER_LINE"; payload: string}
  | { type: "SET_PAYMENT_METHOD"; payload: PaymentMethod | PaymentMethod[] }
  | { type: "SET_SHIPPING_METHOD"; payload: { method: string } }
  | { type: "SET_PAYMENT_VOUCHER"; payload: File }
  | { type: "SET_SELLER"; payload: string }
  | { type: "REMOVE_PAYMENT_METHOD"; payload: string } // ID of the method to remove
  | { type: "SET_OBSERVATIONS"; payload: string } // Observations as a simple string
  | { type: "UPDATE_ORDER"; payload: Partial<Order> }
  | { type: "SET_CONSUMER_DETAILS"; payload: Partial<ConsumerDetails> }
  | { type: "SET_SELLER"; payload: string }
  | { type: "SET_CONSUMER_BASIC"; payload: Partial<ConsumerDetails["basic"]> }
  | { type: "SET_SHIPPING_DETAILS"; payload: Partial<ShippingDetails> }
  | { type: "SET_SHIPPING_BASIC"; payload: Partial<ShippingDetails["basic"]> }
  | { type: "SET_BILLING_DETAILS"; payload: Partial<BillingDetails> }
  | { type: "SET_BILLING_BASIC"; payload: Partial<BillingDetails["basic"]> }
  | { type: "SET_CONSUMER_ADDRESS"; payload: BasicAddress } // Don't used yet
  | { type: "RESET_BASIC_DATA"; payload: Partial<Order> }
  | { type: "OTHER_ACTIONS"; payload?: any }
  | { type: "SET_SELECTED_PRIXER"; payload: Prixer | undefined }
  | { type: "SET_SELECTED_CONSUMER"; payload: Consumer | undefined }

// Type for the errorCheck function used in form fields
export type FormFieldErrorCheck = (value: any, data?: any) => boolean

export type OnConditionChangeHandler = (
  conditionValue: any,
  helpers: {
    getValues: (path?: string) => any
    setValue: (path: string, value: any) => void
  }
) => {
  disabled?: boolean
  value?: any
}

export interface FormFieldConfig {
  label: string
  errorCheck?: FormFieldErrorCheck
  helperText?: string
  width?: number
  adornment?: React.ReactNode
  multiline?: boolean
  minRows?: number
  required?: boolean
  type?: string // e.g., 'dropdown', 'date'
  options?: string[]
  actionType?: CheckoutAction["type"]
  renderKey?: string
  dataKey?: string
  tooltip?: string
  [key: string]: any

  conditionedBy?: string | string[]
  onConditionChange?: OnConditionChangeHandler
}

export interface CheckboxConfig {
  label: string
  type: string
  activeFields: string[]
  checked?: boolean
}

export interface FormSectionConfig {
  title: string
  fieldsTitle?: string
  fields: { [fieldKey: string]: FormFieldConfig }
  actionType?: CheckoutAction["type"]
  additionalFieldsPosition?: string
  additional?: { [fieldKey: string]: FormFieldConfig }
  checkboxes?: CheckboxConfig[]
  defaultCheckbox?: string
  headerLabel?: string
  headerValue?: string[]
  [key: string]: any
}

export interface FormConfig {
  [sectionKey: string]: FormSectionConfig
}
