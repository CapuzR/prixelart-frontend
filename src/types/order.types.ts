import { ObjectId } from "mongodb"
import { PickedArt } from "./art.types"
import { PickedProduct } from "./product.types"

export interface Order {
  _id?: ObjectId
  number?: number
  lines: OrderLine[] // requests
  createdOn: Date
  createdBy: string
  updates?: [Date, string][] // updates when and by whom
  consumerDetails?: ConsumerDetails
  payment: PaymentDetails
  shipping: ShippingDetails
  billing: BillingDetails
  totalUnits: number
  status: [OrderStatus, Date][]
  paymentStatus: [GlobalPaymentStatus, Date][]
  subTotal: number
  discount?: number
  surcharge?: number
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
  paymentMethods: PaymentMethod[]
}

export interface Payment {
  id: string;
  description: string;
  voucher?: string; // IMG ***
  metadata?: string;
  amount?: string;
  lastFourDigits?: string;
  method: PaymentMethod;
}
export interface PaymentDetails {
  total: number;
  installments: Payment[];
}

// Shipping-related details
export interface ShippingDetails {
  method: ShippingMethod
  country: string
  address: Address
  preferredDeliveryDate?: Date
  estimatedShippingDate?: Date
  estimatedDeliveryDate?: Date
}

export interface BillingDetails {
  billTo?: BasicInfo
  address?: Address
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
  phone: string
  shortAddress?: string
}

export interface ShippingMethod {
  _id?: ObjectId
  active: boolean
  name: string
  createdOn: Date
  createdBy: String
  price: string
}

export enum OrderStatus {
  Pending = 0, // Order submitted, awaiting payment confirmation for this item's order
  Impression = 1, // Payment attempt was unsuccessful for this item's order
  Production = 2, // Payment successful, ready for processing this item
  ReadyToShip = 3, // This item is produced, packed, and waiting for carrier pickup
  Delivered = 4, // Carrier confirmed delivery of this item
  Finished = 5, // This item was canceled from the order
  Paused = 6, // Processing for this item is temporarily paused (e.g., stock issue for this item)
  Canceled = 7, // Customer has requested a return for this item
}

export enum GlobalPaymentStatus {
  Pending = 0, // Order submitted, awaiting payment confirmation for this item's order
  Paid = 1, // Payment attempt was unsuccessful for this item's order
  Credited = 2, // Payment successful, ready for processing this item
  // Giftcard = 3, // This item is produced, packed, and waiting for carrier pickup
  // Gift = 4, // Carrier confirmed delivery of this item
  Cancelled = 2, // Customer has requested a return for this item
}

export interface PaymentMethod {
  _id?: ObjectId;
  active: boolean;
  createdBy: string;
  createdOn: Date;
  name: string;
  instructions?: string;
  // lastFourDigits?: string; // Optional, last four digits of a card
  // voucher?: Payment; // Optional, voucher for bank transfer or task payment
  // metadata?: string;
  // amount?: string;
}

export interface Tax {
  id?: string
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
  surcharge?: number // Surcharge applied to the line
  subtotal: number // Total for the line (quantity * pricePerUnit - discount)
  status: [OrderStatus, Date][]
}

export interface Item {
  sku: string
  art?: PickedArt
  product: PickedProduct
  price: string
  discount?: number
  surcharge?: number
}

export interface CheckoutState {
  activeStep: number
  basic: any
  billing: any
  dataLists: DataLists
  general: any
  order: any
  discount: any
  surcharge: any
  paymentMethods: any
  shipping: any
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

//Reducer actions
type CheckoutAction =
  | { type: "SET_ACTIVE_STEP"; payload: number | "back" | "next" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SHIPPING_METHODS"; payload: ShippingMethod[] }
  | { type: "SET_PAYMENT_METHODS"; payload: PaymentMethod[] }
  | { type: "SET_SELLERS"; payload: string[] }
  | { type: "SET_EXPANDED_SECTION"; payload: string | false }
  | { type: "ADD_ORDER_LINE"; payload: OrderLine }
  | { type: "REMOVE_ORDER_LINE"; payload: string } // payload is line ID
  | { type: "SET_PAYMENT_METHOD"; payload: PaymentMethod | PaymentMethod[] }
  | { type: "SET_SHIPPING_METHOD"; payload: { method: string } }
  | { type: "SET_SHIPPING_DETAILS"; payload: Partial<ShippingDetails> }
  | { type: "SET_BILLING_DETAILS"; payload: Partial<BillingDetails> }
  | { type: "SET_PAYMENT_VOUCHER"; payload: File }
  | { type: "SET_SELLER"; payload: string }
  | { type: "REMOVE_PAYMENT_METHOD"; payload: string } // ID of the method to remove
  | { type: "SET_OBSERVATIONS"; payload: string } // Observations as a simple string
  | { type: "UPDATE_ORDER"; payload: Partial<Order> }
  | { type: "SET_CONSUMER_DETAILS"; payload: Partial<ConsumerDetails> }
  | { type: "SET_SELLER"; payload: string }
  | { type: "SET_CONSUMER_BASIC"; payload: Partial<ConsumerDetails["basic"]> }
  | { type: "SET_CONSUMER_ADDRESS"; payload: BasicAddress }
  | {
      type: "SET_CONSUMER_PAYMENT_METHODS"
      payload: ConsumerDetails["paymentMethods"]
    }
  | { type: "OTHER_ACTIONS"; payload?: any }

// Type for the errorCheck function used in form fields
type FormFieldErrorCheck = (value: any, data?: any) => boolean

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

interface FormFieldConfig {
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

interface CheckboxConfig {
  label: string
  type: string
  activeFields: string[]
  checked?: boolean
}

interface FormSectionConfig {
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
