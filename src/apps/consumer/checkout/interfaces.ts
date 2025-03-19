import { Cart, Item } from "apps/consumer/cart/interfaces";
export type { Cart };

export interface CheckoutState {
  billing: any;
  activeStep: number;
  order: Order;
  dataLists: DataLists;
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
}

export interface DataLists {
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  countries: {
    code2: string;
    code3: string;
    name: string;
    capital: string;
    region: string;
    active?: boolean;
    subregion: string;
    states: {
      code: string;
      name: string;
      subdivision: string;
    }[]
  }[];
  billingStates?: string[];
  shippingStates?: string[];
  sellers: string[];
};

export interface Order {
  id: string; // id  (orderId)
  lines: OrderLine[]; // requests
  createdOn: Date;
  createdBy: string;
  // updates: [Date, string]; // updates when and by whom
  status: Status; // ship status

  consumerDetails?: ConsumerDetails; // consumer details (consumerData)
  payment?: PaymentDetails;
  shipping: ShippingDetails;
  billing: BillingDetails;

  totalUnits: number;

  subTotal: number;
  discount?: number;
  shippingCost?: number;
  tax: Tax[];
  totalWithoutTax: number; // Base Imponible
  total: number; // Final order total (subTotal + tax + shipping - discount)

  seller?: string;
  paymentVoucher?: File;
  observations?: string;
}

export interface ConsumerDetails {
  basic: BasicInfo;
  selectedAddress: BasicAddress;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
}

export interface PaymentDetails {
  method?: PaymentMethod;
  payer?: BasicInfo;
  address?: Address;
}

// Shipping-related details
export interface ShippingDetails {
  method?: ShippingMethod;
  country?: string;
  address?: Address;
  preferredDeliveryDate?: Date;
  estimatedShippingDate?: Date;
  estimatedDeliveryDate?: Date;
}

//TODO : Estandarizar campos fijos como socialReason, countries, states, cities, etc.
export interface BillingDetails {
  method?: string;
  billTo?: BasicInfo;
  address?: Address;
  paymentMethod?: string;
}

export interface Address {
  recepient: BasicInfo;
  address: BasicAddress;
}

export interface BasicAddress {
  line1: string;
  line2?: string;
  reference?: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
}

export interface BasicInfo {
  id?: string;
  name: string;
  lastName: string;
  email?: string;
  phone: string;
  shortAddress?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
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
  id: string; // Unique identifier for the payment method
  name: string; // Display name (e.g., 'Credit Card', 'PayPal')
  type?: PaymentMethodType; // Type of payment
  provider?: string; // Optional, name of the payment provider (e.g., Visa, PayPal)
  token?: string; // Encrypted token from the payment gateway (instead of card details)
  lastFourDigits?: string; // Optional, last four digits of a card
  metadata?: string;
}

export enum PaymentMethodType {
  CreditCard = 'credit_card',
  PayPal = 'paypal',
  BankTransfer = 'bank_transfer',
  Cash = 'cash',
  Crypto = 'crypto',
  Cashea = 'cashea',
  Other = 'other',
}

interface Status {
  id: OrderStatus;
  name: string;
}

export interface Tax {
  id: string;
  name: string; // Nombre del impuesto (e.g. IVA)
  value: number; // Porcentaje
  amount: number; // Monto en fiat
}

export interface OrderLine {
  id: string; // Unique identifier, same as CartLine
  item: Item; // The purchased item, same as CartLine
  quantity: number; // Quantity purchased
  pricePerUnit: number; // The price of one unit at the time of purchase
  discount: number; // Discount applied to the line
  subtotal: number; // Total for the line (quantity * pricePerUnit - discount)
}

//Reducer actions
export type CheckoutAction =
  | { type: 'SET_ACTIVE_STEP'; payload: number | 'back' | 'next' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SHIPPING_METHODS'; payload: ShippingMethod[] }
  | { type: 'SET_PAYMENT_METHODS'; payload: PaymentMethod[] }
  | { type: 'SET_SELLERS'; payload: string[] }
  | { type: 'SET_EXPANDED_SECTION'; payload: string | false }
  | { type: 'ADD_ORDER_LINE'; payload: OrderLine }
  | { type: 'REMOVE_ORDER_LINE'; payload: string } // payload is line ID
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod | PaymentMethod[] }
  | { type: 'SET_SHIPPING_METHOD'; payload: { method: string } }
  | { type: 'SET_SHIPPING_DETAILS'; payload: Partial<ShippingDetails> }
  | { type: 'SET_BILLING_DETAILS'; payload: Partial<BillingDetails> }
  | { type: 'SET_PAYMENT_VOUCHER'; payload: File }
  | { type: 'SET_SELLER'; payload: string }
  | { type: 'REMOVE_PAYMENT_METHOD'; payload: string } // ID of the method to remove
  | { type: 'SET_OBSERVATIONS'; payload: string } // Observations as a simple string
  | { type: 'UPDATE_ORDER'; payload: Partial<Order> }
  | { type: 'SET_CONSUMER_DETAILS'; payload: Partial<ConsumerDetails> }
  | { type: 'SET_SELLER'; payload: string }
  | { type: 'SET_CONSUMER_BASIC'; payload: Partial<ConsumerDetails['basic']> }
  | { type: 'SET_CONSUMER_ADDRESS'; payload: BasicAddress }
  | { type: 'SET_CONSUMER_PAYMENT_METHODS'; payload: ConsumerDetails['paymentMethods'] }
  | { type: 'OTHER_ACTIONS'; payload?: any };


// Type for the errorCheck function used in form fields
export type FormFieldErrorCheck = (value: any, data?: any) => boolean;

export type OnConditionChangeHandler = (
  conditionValue: any,
  helpers: {
    getValues: (path?: string) => any;
    setValue: (path: string, value: any) => void;
  }
) => {
  disabled?: boolean;
  value?: any;
};

export interface FormFieldConfig {
  label: string;
  errorCheck?: FormFieldErrorCheck;
  helperText?: string;
  width?: number;
  adornment?: React.ReactNode;
  multiline?: boolean;
  minRows?: number;
  required?: boolean;
  type?: string; // e.g., 'dropdown', 'date'
  options?: string[];
  actionType?: CheckoutAction['type'];
  renderKey?: string;
  dataKey?: string;
  tooltip?: string;
  [key: string]: any;

  conditionedBy?: string | string[];
  onConditionChange?: OnConditionChangeHandler;
}

export interface CheckboxConfig {
  label: string;
  type: string;
  activeFields: string[];
  checked?: boolean;
}

export interface FormSectionConfig {
  title: string;
  fieldsTitle?: string;
  fields: { [fieldKey: string]: FormFieldConfig };
  actionType?: CheckoutAction['type'];
  additionalFieldsPosition?: string;
  additional?: { [fieldKey: string]: FormFieldConfig };
  checkboxes?: CheckboxConfig[];
  defaultCheckbox?: string;
  headerLabel?: string;
  headerValue?: string[];
  [key: string]: any;
}

export interface FormConfig {
  [sectionKey: string]: FormSectionConfig;
}