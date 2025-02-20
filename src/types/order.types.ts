import { Item } from "./item.types";
export interface Order {
  _id: string;
  basicData: object;
  billingData: object;
  comissions: string[];
  completionDate: Date;
  consumerData: object;
  createdBy: object;
  createdOn: Date;
  dollarValue: number;
  generalProductionStatus: string;
  isSaleByPrixer: boolean;
  observations: string;
  orderId: string;
  orderType: string;
  payDate: Date;
  paymentVoucher: string;
  payStatus: string;
  requests: Item[];
  shippingCost: number;
  shippingData: object;
  shippingStatus: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
}
