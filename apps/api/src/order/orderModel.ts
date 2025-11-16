import { ObjectId } from "mongodb";
import { Art } from "../art/artModel.ts";
import { Product, VariantAttribute } from "../product/productModel.ts";

// Main Order interface
export interface Order {
  _id?: ObjectId;
  number?: number;
  lines: OrderLine[]; // requests
  createdOn: Date;
  createdBy: string;
  history?: HistoryEntry[];
  updates?: [Date, string][]; // updates when and by whom
  consumerDetails?: ConsumerDetails;
  payment: PaymentDetails;
  shipping: ShippingDetails;
  billing: BillingDetails;

  totalUnits: number;
  status: [OrderStatus, Date][]
  // paymentStatus: [GlobalPaymentStatus, Date][]

  subTotal: number;
  discount?: number;
  surcharge?: number;
  shippingCost?: number;
  tax: Tax[];
  totalWithoutTax: number; // Base Imponible
  total: number; // Final order total (subTotal + tax + shipping - discount)

  seller?: string;
  observations?: string;

  commissionsProcessed?: boolean; // Flag to indicate if commissions have been processed
}

export interface HistoryEntry {
  timestamp: Date;
  user: string;
  description: string;
}

interface PickedArt
  extends Pick<
    Art,
    'artId' | 'title' | 'largeThumbUrl' | 'prixerUsername' | 'exclusive' | '_id'
  > { }

export interface CustomImage {
  url: string
  title: string
  description?: string
  prixerUsername?: string
}
interface PickedProduct
  extends Pick<
    Product,
    | '_id'
    | 'name'
    | 'productionTime'
    | 'sources'
    | 'variants'
  > {
  selection?: VariantAttribute[];
}

interface Item {
  sku: string;
  art?: PickedArt | CustomImage;
  product: PickedProduct;
  price: string;
  discount?: number;
  surcharge?: number;
}

export interface OrderLine {
  id: string; // Unique identifier, same as CartLine
  item: Item; // The purchased item, same as CartLine
  quantity: number; // Quantity purchased
  pricePerUnit: number; // The price of one unit at the time of purchase
  discount?: number; // Discount applied to the line
  surcharge?: number; // Surcharge applied to the line
  subtotal: number; // Total for the line (quantity * pricePerUnit - discount)
  status: [OrderStatus, Date][];
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
  Credited = 2, // Payment successful, ready for processing this item
  Paid = 1, // Payment attempt was unsuccessful for this item's order

  Cancelled = 3, // Customer has requested a return for this item
  // Giftcard = 3, // This item is produced, packed, and waiting for carrier pickup
  // Gift = 4, // Carrier confirmed delivery of this item
}
export interface ConsumerDetails {
  basic?: BasicInfo;
  selectedAddress?: BasicAddress;
  addresses?: BasicAddress[];
  paymentMethods?: PaymentMethod[];
}

interface BasicAddress {
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
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  shortAddress?: string;
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

interface Payment {
  id: string;
  description: string;
  voucher?: string;
  metadata?: string;
  amount?: string;
  createdOn: Date;
  lastFourDigits?: string; // Optional, last four digits of a card
  method: PaymentMethod;
}
interface PaymentDetails {
  total: number;
  payment: Payment[];
  status: [GlobalPaymentStatus, Date][]
}

interface ShippingDetails {
  method: ShippingMethod;
  country: string;
  address: BasicAddress;
  preferredDeliveryDate?: Date;
  estimatedShippingDate?: Date;
  estimatedDeliveryDate?: Date;
}

interface BillingDetails {
  billTo?: BasicInfo;
  address?: Address;
}

interface Address {
  recepient: BasicInfo;
  address: BasicAddress;
}

export interface Tax {
  id?: string;
  name: string;
  value: number;
  amount: number;
}

export interface ShippingMethod {
  _id?: ObjectId;
  active: boolean;
  name: string;
  createdOn: Date;
  createdBy: String;
  price: string;
}
