import { ObjectId } from "mongodb"

export interface Permissions {
  _id?: ObjectId
  area: string
  artBan: boolean
  createConsumer: boolean
  createDiscount: boolean
  createOrder: boolean
  createPaymentMethod: boolean
  createProduct: boolean
  createShippingMethod: boolean
  createTestimonial: boolean
  deleteConsumer: boolean
  deleteDiscount: boolean
  deletePaymentMethod: boolean
  deleteProduct: boolean
  deleteShippingMethod: boolean
  deleteTestimonial: boolean
  detailOrder: boolean
  detailPay: boolean
  modifyAdmins: boolean
  modifyArtBestSellers: boolean
  modifyBanners: boolean
  modifyBestSellers: boolean
  modifyDollar: boolean
  modifyTermsAndCo: boolean
  orderStatus: boolean
  prixerBan: boolean
  readConsumers: boolean
  readMovements: boolean
  setPrixerBalance: boolean
  updateAdmins: boolean
  updateArtBestSellers: boolean
  updateBanners: boolean
  updateBestSellers: boolean
  updateDollar: boolean
  updateTermsAndCo: boolean
}

interface PermissionsV2 {
  _id?: ObjectId
  area: string
  admins: {
    createAdmin: boolean
    createAdminRole: boolean
    readAdminRoles: boolean
    readAdmins: boolean
    updateAdmin: boolean
    updateAdminRole: boolean
  }
  art: {
    artBan: boolean
    createArt: boolean
    readAllArts: boolean
    updateArt: boolean
  }
  discounts: {
    createDiscount: boolean
    deleteDiscount: boolean
    readAllDiscounts: boolean
    updateDiscount: boolean
  }
  movements: {
    createMovement: boolean
    deleteMovement: boolean
    readAllMovements: boolean
    readMovementsByPrixer: boolean
    updateMovement: boolean
  }
  orders: {
    create: boolean
    deleteOrders: boolean
    downloadData: boolean
    readOrderDetails: boolean
    readPayDetails: boolean
    updateDetails: boolean
    updateGeneralStatus: boolean
    updateItemPrice: boolean
    updateItemStatus: boolean
    updatePayDetails: boolean
    updatePayStatus: boolean
  }
  paymentMethods: {
    createPaymentMethod: boolean
    deletePaymentMethod: boolean
    readAllPaymentMethod: boolean
    updatePaymentMethod: boolean
  }
  preferences: {
    createBanner: boolean
    deleteBanner: boolean
    readAllBanners: boolean
    updateArtBestSellers: boolean
    updateBanner: boolean
    updateBestSellers: boolean
    updateDollar: boolean
    updateTermsAndCo: boolean
  }
  products: {
    createProduct: boolean
    deleteProduct: boolean
    downloadData: boolean
    loadData: boolean
    readAllProducts: boolean
    updateProduct: boolean
  }
  shippingMethod: {
    createShippingMethod: boolean
    deleteShippingMethod: boolean
    readAllShippingMethod: boolean
    updateShippingMethod: boolean
  }
  testimonials: {
    createTestimonial: boolean
    deleteTestimonial: boolean
    readTestimonials: boolean
    updateTestimonial: boolean
  }
  users: {
    banConsumer: boolean
    banPrixer: boolean
    banUser: boolean
    createConsumer: boolean
    deleteConsumer: boolean
    readAllUsers: boolean
    readPrixerBalance: boolean
    setPrixerBalance: boolean
  }
}
