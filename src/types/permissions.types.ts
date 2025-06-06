import { ObjectId } from "mongodb";

export interface Permissions {
  _id?: ObjectId;
  area: string;
  createDiscount: boolean;
  createOrder: boolean;
  createPaymentMethod: boolean;
  createProduct: boolean;
  createShippingMethod: boolean;
  createTestimonial: boolean;
  deleteDiscount: boolean;
  deletePaymentMethod: boolean;
  deleteProduct: boolean;
  deleteShippingMethod: boolean;
  deleteTestimonial: boolean;
  detailOrder: boolean;
  detailPay: boolean;
  modifyAdmins: boolean;
  modifyBanners: boolean;
  modifyDollar: boolean;
  modifyTermsAndCo: boolean;
  orderStatus: boolean;
  prixerBan: boolean;
  readMovements: boolean;
  setPrixerBalance: boolean;
  createConsumer: boolean;
  readConsumers: boolean;
  deleteConsumer: boolean;
  artBan: boolean;
  modifyBestSellers: boolean;
  modifyArtBestSellers: boolean;
}