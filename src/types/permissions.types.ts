import { ObjectId } from "mongodb";

export interface Permissions {
  _id?: ObjectId;
  area: string;
  artBan: boolean;
  createConsumer: boolean;
  createDiscount: boolean;
  createOrder: boolean;
  createPaymentMethod: boolean;
  createProduct: boolean;
  createShippingMethod: boolean;
  createTestimonial: boolean;
  deleteConsumer: boolean;
  deleteDiscount: boolean;
  deletePaymentMethod: boolean;
  deleteProduct: boolean;
  deleteShippingMethod: boolean;
  deleteTestimonial: boolean;
  detailOrder: boolean;
  detailPay: boolean;
  modifyAdmins: boolean;
  modifyArtBestSellers: boolean;
  modifyBanners: boolean;
  modifyBestSellers: boolean;
  modifyDollar: boolean;
  modifyTermsAndCo: boolean;
  orderStatus: boolean;
  prixerBan: boolean;
  readConsumers: boolean;
  readMovements: boolean;
  setPrixerBalance: boolean;
}