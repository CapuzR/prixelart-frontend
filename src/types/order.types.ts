import { BillingDetails, ShippingDetails } from "@apps/consumer/checkout/interfaces"
import { Item } from "./item.types"
export interface Order {
  _id: string
  basicData: basicData
  billingData: BillingDetails
  comissions: string[]
  completionDate: Date
  consumerData: any
  createdBy: { username: string }
  createdOn: Date
  dollarValue: number
  generalProductionStatus: string
  isSaleByPrixer: boolean
  observations: string
  orderId: string
  orderType: string
  payDate: Date
  paymentVoucher: string
  payStatus: string
  requests: Item[]
  shippingCost: number
  shippingData: ShippingDetails
  shippingStatus: string
  status: string
  subtotal: number
  tax: number
  total: number
  consumerId?: string
}

export interface basicData {
  name: string
  firstname?: string
  lastname: string
  phone: string
  email: string
  address: string
  ci: string
}